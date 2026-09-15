from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    GREEN = "GREEN"    # Safe / Normal Function (collapsed by default)
    YELLOW = "YELLOW"  # Adjust Dosage / Moderate Risk
    RED = "RED"        # Toxic / Ineffective / Critical Risk (visually prominent)


class GenotypeCall(BaseModel):
    gene: str
    rsid: str
    star_allele: str
    genotype: str  # e.g., "0|1", "1/1", "0/0"
    is_phased: bool
    functional_effect: str
    cnv_detected: Optional[bool] = None
    cnv_details: Optional[str] = None


class DrugRiskAssessment(BaseModel):
    """
    HL7 FHIR-flavored Clinical Decision Support Drug Risk Assessment
    """
    drug: str
    genes: List[str]
    diplotype: str
    activity_score: Optional[float] = None
    phenotype: str  # e.g., "Intermediate Metabolizer", "Poor Function"
    risk_color: RiskLevel
    cpic_recommendation: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    warnings: List[str] = Field(default_factory=list)
    llm_generated_explanation: Optional[str] = None
    retrieved_citations: List[str] = Field(default_factory=list)
    genotype_calls: List[GenotypeCall] = Field(default_factory=list)


class PGxReport(BaseModel):
    """
    HL7 FHIR DiagnosticReport / Genomic Study representation
    """
    resource_type: str = "DiagnosticReport"
    report_id: str
    status: str = "final"
    code: str = "HL7-PGX-CDS-v1"
    patient_id: str
    effective_date_time: str
    file_name: Optional[str] = None
    total_drugs_evaluated: int
    high_risk_count: int
    adjust_dosage_count: int
    safe_count: int
    assessments: List[DrugRiskAssessment]
    meta: Dict[str, Any] = Field(default_factory=dict)


class AnalyzeVcfUrlRequest(BaseModel):
    firebase_url: str
    patient_id: Optional[str] = "PATIENT_DEMO_001"
    file_name: Optional[str] = "sample.vcf"


class AnalyzeVcfRawRequest(BaseModel):
    vcf_content: str
    patient_id: Optional[str] = "PATIENT_DEMO_001"
    file_name: Optional[str] = "uploaded.vcf"
