import os
import sys
import uuid
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.config import settings


def chunk_text_by_paragraphs(text: str, min_chars: int = 80):
    """
    Splits guideline text into semantically cohesive paragraph chunks.
    """
    paragraphs = text.split("\n\n")
    chunks = []
    current_header = "General CPIC Guideline"
    
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if p.startswith("## ") or p.startswith("# "):
            current_header = p.lstrip("# ").strip()
            continue
        if len(p) >= min_chars:
            chunks.append({
                "id": str(uuid.uuid4()),
                "header": current_header,
                "text": p
            })
    return chunks


def ingest_guidelines_to_pinecone():
    """
    Ingestion pipeline:
    1. Read CPIC guideline texts
    2. Chunk into paragraphs
    3. Generate embeddings
    4. Upsert into Pinecone
    """
    corpus_file = Path(__file__).parent / "cpic_corpus" / "cpic_guidelines.txt"
    if not corpus_file.exists():
        print(f"[Error] Corpus file not found at {corpus_file}")
        return

    text = corpus_file.read_text(encoding="utf-8")
    chunks = chunk_text_by_paragraphs(text)
    print(f"[Ingestion] Extracted {len(chunks)} guideline paragraph chunks from corpus.")

    pinecone_key = settings.PINECONE_API_KEY or os.environ.get("PINECONE_API_KEY")
    gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")

    if not pinecone_key or not gemini_key:
        print("[Notice] PINECONE_API_KEY or GEMINI_API_KEY not configured in environment.")
        print("[Notice] Using local high-fidelity corpus inside backend/app/rag/pinecone_client.py.")
        print("[Success] Pipeline will run end-to-end with built-in CPIC literature retrieval.")
        return

    try:
        from pinecone import Pinecone, ServerlessSpec
        import google.generativeai as genai

        genai.configure(api_key=gemini_key)
        pc = Pinecone(api_key=pinecone_key)

        index_name = settings.PINECONE_INDEX_NAME
        existing_indexes = [idx.name for idx in pc.list_indexes()]

        # Create serverless index if not already present
        if index_name not in existing_indexes:
            print(f"[Pinecone] Creating index '{index_name}' (dimension 768)...")
            pc.create_index(
                name=index_name,
                dimension=768,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
            print(f"[Pinecone] Index '{index_name}' created successfully.")

        index = pc.Index(index_name)

        # Generate embeddings & upsert
        vectors_to_upsert = []
        for i, chunk in enumerate(chunks):
            print(f"[Embedding] Processing chunk {i+1}/{len(chunks)}: {chunk['header'][:40]}...")
            emb_res = genai.embed_content(
                model="models/text-embedding-004",
                content=chunk["text"],
                task_type="retrieval_document"
            )
            embedding_vector = emb_res["embedding"]
            
            vectors_to_upsert.append({
                "id": chunk["id"],
                "values": embedding_vector,
                "metadata": {
                    "header": chunk["header"],
                    "text": chunk["text"],
                    "source": "CPIC Guidelines v2024"
                }
            })

        index.upsert(vectors=vectors_to_upsert)
        print(f"[Success] Successfully ingested {len(vectors_to_upsert)} chunks into Pinecone index '{index_name}'!")

    except Exception as e:
        print(f"[Error] Pinecone/Gemini ingestion failed: {e}")
        print("[Notice] Fallback built-in corpus remains active for all API calls.")


if __name__ == "__main__":
    ingest_guidelines_to_pinecone()
