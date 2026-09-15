import os
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .config import settings
from .models.fhir import (
    PGxReport,
    DrugRiskAssessment,
    RiskLevel,
    AnalyzeVcfUrlRequest,
    AnalyzeVcfRawRequest
)
from .parser.vcf_parser import parse_vcf_stream
from .engine.rules import run_pgx_rules_engine, evaluate_dpyd
from .rag.gemini_explainer import generate_clinical_explanation
from .utils.download import download_vcf_from_url

app = FastAPI(
    title="Pharmacogenomics (PGx) Clinical Decision Support API",
    description="Deterministic CPIC rules engine and RAG intelligence layer for genomic VCF interpretation.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon versatility; settings.cors_origin_list can restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _process_and_generate_report(
    vcf_text: str,
    patient_id: Optional[str] = None,
    file_name: Optional[str] = "input.vcf"
) -> PGxReport:
    """
    Parses VCF, evaluates CPIC rules engine, and executes Gemini RAG explanation layer.
    """
    # Parse VCF records
    parsed = parse_vcf_stream(vcf_text)
    if patient_id and patient_id != "PATIENT_UNKNOWN":
        actual_patient_id = patient_id
    else:
        actual_patient_id = parsed.patient_id or "PATIENT_001"

    # Run deterministic rules engine
    assessments = run_pgx_rules_engine(parsed)

    # Run Gemini RAG explanation for each assessment asynchronously
    for assessment in assessments:
        primary_gene = assessment.genes[0] if assessment.genes else "GENE"
        gene_str = " / ".join(assessment.genes)
        
        explanation = await generate_clinical_explanation(
            drug=assessment.drug,
            gene=gene_str,
            diplotype=assessment.diplotype,
            phenotype=assessment.phenotype
        )
        assessment.llm_generated_explanation = explanation

    # Count risk categories
    high_risk = sum(1 for a in assessments if a.risk_color == RiskLevel.RED)
    adjust_dosage = sum(1 for a in assessments if a.risk_color == RiskLevel.YELLOW)
    safe = sum(1 for a in assessments if a.risk_color == RiskLevel.GREEN)

    report = PGxReport(
        report_id=f"PGX-{uuid.uuid4().hex[:8].upper()}",
        patient_id=actual_patient_id,
        effective_date_time=datetime.now(timezone.utc).isoformat(),
        file_name=file_name,
        total_drugs_evaluated=len(assessments),
        high_risk_count=high_risk,
        adjust_dosage_count=adjust_dosage,
        safe_count=safe,
        assessments=assessments,
        meta={
            "engine": "Deterministic-CPIC-Rules-v2024",
            "rag_provider": "Google-Gemini-1.5-Flash + Pinecone",
            "cyp2d6_cnv_analyzed": parsed.cyp2d6_has_cnv_markers,
            "variants_parsed": parsed.record_count
        }
    )
    return report


@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "pgx-bioinformatics-engine",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "pinecone_configured": bool(settings.PINECONE_API_KEY)
    }


@app.post("/api/analyze-vcf", response_model=PGxReport)
async def analyze_vcf_url(payload: AnalyzeVcfUrlRequest):
    """
    Accepts a Firebase Cloud Storage download URL, fetches the VCF, and executes the PGx pipeline.
    """
    try:
        vcf_content = await download_vcf_from_url(payload.firebase_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch VCF file from provided URL: {str(e)}")
        
    try:
        report = await _process_and_generate_report(
            vcf_text=vcf_content,
            patient_id=payload.patient_id,
            file_name=payload.file_name
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bioinformatics engine analysis error: {str(e)}")


@app.post("/api/analyze-raw", response_model=PGxReport)
async def analyze_vcf_raw(payload: AnalyzeVcfRawRequest):
    """
    Accepts raw VCF text directly (used for direct client streaming and offline testing).
    """
    try:
        report = await _process_and_generate_report(
            vcf_text=payload.vcf_content,
            patient_id=payload.patient_id,
            file_name=payload.file_name
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bioinformatics engine analysis error: {str(e)}")


@app.post("/api/upload-file", response_model=PGxReport)
async def analyze_vcf_file(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Form("PATIENT_001")
):
    """
    Direct multi-part file upload endpoint.
    """
    try:
        content_bytes = await file.read()
        vcf_text = content_bytes.decode("utf-8", errors="replace")
        return await _process_and_generate_report(
            vcf_text=vcf_text,
            patient_id=patient_id,
            file_name=file.filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File parsing error: {str(e)}")


@app.get("/api/demo-dpyd", response_model=PGxReport)
async def get_demo_dpyd():
    """
    Returns hardcoded DPYD *1/*2A Intermediate Metabolizer case for instant 1-click UI demos.
    """
    sample_vcf = (
        "##fileformat=VCFv4.2\n"
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tPATIENT_DEMO_DPYD\n"
        "chr1\t97544241\trs3918290\tC\tT\t99\tPASS\tGENE=DPYD;RS=rs3918290;STAR=*2A;FUNCTION=no_function\tGT:DP:GQ\t0|1:45:99\n"
        "chr10\t94781859\trs1057910\tA\tA\t99\tPASS\tGENE=CYP2C9;RS=rs1057910;STAR=*1;FUNCTION=normal\tGT:DP:GQ\t0/0:50:99\n"
        "chr16\t31102334\trs9923231\tC\tC\t99\tPASS\tGENE=VKORC1;RS=rs9923231;STAR=wt;FUNCTION=normal\tGT:DP:GQ\t0/0:52:99\n"
        "chr12\t21178615\trs4149056\tT\tT\t99\tPASS\tGENE=SLCO1B1;RS=rs4149056;STAR=*1;FUNCTION=normal\tGT:DP:GQ\t0/0:48:99\n"
        "chr22\t42128945\trs3892097\tC\tC\t99\tPASS\tGENE=CYP2D6;RS=rs3892097;STAR=*1;FUNCTION=normal;CNV=DIPLOID_CN2\tGT:DP:GQ\t0/0:40:99\n"
    )
    return await _process_and_generate_report(sample_vcf, patient_id="PATIENT_DEMO_DPYD", file_name="demo_dpyd_1_2a.vcf")
