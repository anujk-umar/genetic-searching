export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface GenotypeCall {
  gene: string;
  rsid: string;
  star_allele: string;
  genotype: string; // e.g. "0|1", "1/1", "0/0"
  is_phased: boolean;
  functional_effect: string;
  cnv_detected?: boolean | null;
  cnv_details?: string | null;
}

export interface DrugRiskAssessment {
  drug: string;
  genes: string[];
  diplotype: string;
  activity_score: number | null;
  phenotype: string;
  risk_color: RiskLevel;
  cpic_recommendation: string;
  confidence_score: number;
  warnings: string[];
  llm_generated_explanation?: string | null;
  retrieved_citations: string[];
  genotype_calls: GenotypeCall[];
}

export interface PGxReport {
  resource_type: string;
  report_id: string;
  status: string;
  code: string;
  patient_id: string;
  effective_date_time: string;
  file_name?: string;
  total_drugs_evaluated: number;
  high_risk_count: number;
  adjust_dosage_count: number;
  safe_count: number;
  assessments: DrugRiskAssessment[];
  meta: Record<string, any>;
}

export interface VcfValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    fileSizeMb: number;
    hasVcf42Format: boolean;
    hasHeaderColumns: boolean;
    detectedSampleId?: string;
  };
}

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}
