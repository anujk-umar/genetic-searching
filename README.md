# 🧬 HelixRx • Pharmacogenomics (PGx) Clinical Decision Support System

A high-performance, decoupled, cloud-first **Pharmacogenomics (PGx) Clinical Decision Support App** built for clinical geneticists and oncologists to prevent severe adverse drug events (ADEs).

---

## 🏛️ System Architecture

```
                                    +------------------------------------------+
                                    |         Next.js App Router (Vercel)      |
                                    |  - Client-side VCF validation (≤5MB)     |
                                    |  - Firebase Auth & Cloud Storage         |
                                    |  - Traffic Light UI / Progressive Accordion|
                                    +---------------------+--------------------+
                                                          |
                                                          | HTTP / JSON (HL7 FHIR)
                                                          v
                                    +------------------------------------------+
                                    |        Python FastAPI Engine (Docker)    |
                                    |  - VCF Parser (cyvcf2 / Phasing 0|1)     |
                                    |  - Deterministic CPIC Star-Allele Engine |
                                    |  - Warfarin Multi-Gene Algorithm (IWPC)  |
                                    |  - CYP2D6 Structural Variant / CNV Scan  |
                                    +---------+--------------------+-----------+
                                              |                    |
                         Pinecone Similarity  |                    | Gemini 1.5 Flash
                         Vector Search (RAG)  |                    | (Zero-Dosage Guardrail)
                                              v                    v
                                    +------------------+  +--------------------+
                                    | Pinecone Index   |  | Google Gemini API  |
                                    | (CPIC Guidelines)|  | (Clinical Explan.) |
                                    +------------------+  +--------------------+
```

---

## 🚀 Quick Start (Local Run)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and `npm`

### 2. Backend Setup & Run

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Copy .env.example to .env and fill in API keys:
cp .env.example .env

# Run FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```

> **Note on Zero-Config Demo Mode:**
> If `GEMINI_API_KEY` or `PINECONE_API_KEY` are not set, the backend seamlessly falls back to high-fidelity built-in CPIC clinical literature retrieval and deterministic clinical explanations.

### 3. Frontend Setup & Run

```bash
cd frontend

# Install npm dependencies
npm install

# Run Next.js development server on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Hackathon Demo Walkthrough (1-Click & VCF Files)

Four ready-to-test scenarios are provided in the `/sample_data` folder and via 1-click preset buttons on the UI dashboard:

| Scenario | Target Genes / Variant | Expected Risk | Clinical Recommendation |
|---|---|---|---|
| **1. 5-FU Toxicity (Starter)** | `DPYD *1/*2A` (rs3918290 `0\|1`) | ⚠️ **YELLOW / RED** | Reduce starting dose by 25–50% due to impaired DPD clearance |
| **2. Warfarin Complex** | `CYP2C9 *3` + `VKORC1 -1639A` + `CYP4F2` | 🚨 **RED (High Sens.)** | Initiate at lower dose (≤1.5–3mg/day) with intensive INR surveillance |
| **3. CYP2D6 CNV Missing** | `CYP2D6 *4` (No CNV tags in VCF) | ⚠️ **Confidence 75%** | Attaches warning: Whole-gene deletions (*5) may not be detected |
| **4. Normal Wild-type** | Wildtype `*1/*1` across panels | 🟢 **GREEN (Safe)** | Standard dosing protocols appropriate |

---

## 🔑 Environment Variables & API Key Configuration

### Backend (`backend/.env`)
| Variable | Description | Default / Fallback |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key for literature mechanism generation | Optional (Uses CPIC guideline explanation fallback) |
| `PINECONE_API_KEY` | Pinecone API key for vector store retrieval | Optional (Uses built-in guideline corpus) |
| `PINECONE_INDEX_NAME` | Pinecone index name | `pgx-guidelines` |
| `PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:3000,http://127.0.0.1:3000` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Default / Fallback |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key | Optional (Demo Clinician mode active) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Optional |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Optional (Direct file streaming fallback) |

---

## 🤖 RAG Pipeline & Gemini System Prompt

When RAG is invoked, the backend executes the following verbatim prompt:

```
"You are an expert clinical pharmacogenomics consultant. You must ONLY use the provided retrieved literature. Explicitly cite the patient's specific diplotype. Under NO circumstances are you to recommend a specific numerical dosage. If the retrieved literature does not explain the biological mechanism, state 'Mechanism unclear in available guidelines'."
```

To ingest custom CPIC guideline documents or PDFs into Pinecone:
```bash
python backend/scripts/ingest_cpic.py
```

---

## ☁️ Production Deployment

### Backend (Render)
1. Link repository to Render as a **Web Service**.
2. Select **Docker** environment (the included `backend/Dockerfile` builds `cyvcf2` and runtime dependencies automatically).
3. Add `GEMINI_API_KEY` and `PINECONE_API_KEY` to Render Environment Variables.

### Frontend (Vercel)
1. Import repository on Vercel and set the Root Directory to `frontend`.
2. Add `NEXT_PUBLIC_BACKEND_URL` pointing to your deployed Render URL.
3. Deploy!
