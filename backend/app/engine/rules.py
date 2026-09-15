from typing import List, Dict, Tuple
from ..models.fhir import DrugRiskAssessment, RiskLevel, GenotypeCall
from .cpic_data import ALLELE_ACTIVITY_VALUES, CPIC_RECOMMENDATIONS
from .warfarin import evaluate_warfarin_multigene
from ..parser.vcf_parser import ParsedVcfResult


def _extract_diplotype_and_as(gene: str, variants: List[GenotypeCall]) -> Tuple[str, float, List[GenotypeCall]]:
    """
    Computes diplotype and CPIC Activity Score for a single gene.
    Defaults to *1/*1 (AS 2.0) if no variant allele detected.
    """
    gene_variants = [v for v in variants if v.gene.upper() == gene.upper()]
    allele_table = ALLELE_ACTIVITY_VALUES.get(gene.upper(), {"*1": 1.0})
    
    if not gene_variants:
        return "*1/*1", 2.0, []
        
    detected_alleles = []
    for call in gene_variants:
        gt = call.genotype
        star = call.star_allele
        if gt in ["0|1", "1|0", "0/1"]:
            detected_alleles.append(star)
        elif gt in ["1|1", "1/1"]:
            detected_alleles.extend([star, star])
            
    if not detected_alleles:
        return "*1/*1", 2.0, gene_variants
    elif len(detected_alleles) == 1:
        diplotype = f"*1/{detected_alleles[0]}"
        as_val = allele_table.get("*1", 1.0) + allele_table.get(detected_alleles[0], 0.5)
        return diplotype, as_val, gene_variants
    else:
        diplotype = f"{detected_alleles[0]}/{detected_alleles[1]}"
        as_val = allele_table.get(detected_alleles[0], 0.5) + allele_table.get(detected_alleles[1], 0.5)
        return diplotype, as_val, gene_variants


def evaluate_dpyd(variants: List[GenotypeCall]) -> DrugRiskAssessment:
    """
    Evaluates DPYD for Fluorouracil (5-FU) and Capecitabine.
    DPYD *1/*2A (rs3918290) -> AS 1.0 -> Intermediate Metabolizer -> Adjust Dosage (reduce by 25-50%).
    DPYD *2A/*2A or AS 0.0 -> Poor Metabolizer -> Toxic / Ineffective (Avoid).
    """
    diplotype, as_score, calls = _extract_diplotype_and_as("DPYD", variants)
    warnings = []
    
    if as_score == 0.0:
        risk_color = RiskLevel.RED
        phenotype = "Poor Metabolizer (Complete DPD Deficiency)"
        recommendation = CPIC_RECOMMENDATIONS["DPYD_POOR"]
        confidence = 0.98
        warnings.append("Critical Hazard: Complete loss of DPD activity. Fluoropyrimidines cause life-threatening cytopenia and neurotoxicity.")
    elif as_score <= 1.0:
        risk_color = RiskLevel.YELLOW  # High caution / adjust dose
        phenotype = "Intermediate Metabolizer"
        recommendation = CPIC_RECOMMENDATIONS["DPYD_INTERMEDIATE"]
        confidence = 0.97
        warnings.append("Reduced DPD enzymatic clearance (AS 1.0). CPIC guidelines mandate starting dose reduction by 25% to 50%.")
    elif as_score < 2.0:
        risk_color = RiskLevel.YELLOW
        phenotype = "Intermediate Metabolizer (Decreased Function)"
        recommendation = CPIC_RECOMMENDATIONS["DPYD_INTERMEDIATE"]
        confidence = 0.95
        warnings.append("Moderate reduction in DPD enzyme clearance.")
    else:
        risk_color = RiskLevel.GREEN
        phenotype = "Normal Metabolizer"
        recommendation = CPIC_RECOMMENDATIONS["DPYD_NORMAL"]
        confidence = 0.98

    # Highlight phasing status if heterozygous
    for c in calls:
        if c.is_phased and c.genotype in ["0|1", "1|0"]:
            warnings.append(f"Variant {c.rsid} ({c.star_allele}) is confirmed phased on alternate chromosome ({c.genotype}).")

    return DrugRiskAssessment(
        drug="Fluorouracil (5-FU) / Capecitabine",
        genes=["DPYD"],
        diplotype=diplotype,
        activity_score=as_score,
        phenotype=phenotype,
        risk_color=risk_color,
        cpic_recommendation=recommendation,
        confidence_score=confidence,
        warnings=warnings,
        llm_generated_explanation=None,
        retrieved_citations=["CPIC Guideline for Dihydropyrimidine Dehydrogenase (DPYD) and Fluoropyrimidine Dosing"],
        genotype_calls=calls
    )


def evaluate_slco1b1(variants: List[GenotypeCall]) -> DrugRiskAssessment:
    """
    Evaluates SLCO1B1 for Simvastatin.
    SLCO1B1 *5 (rs4149056) -> Decreased / Poor Function -> Statin-induced myopathy risk.
    """
    diplotype, as_score, calls = _extract_diplotype_and_as("SLCO1B1", variants)
    warnings = []
    
    if as_score == 0.0:
        risk_color = RiskLevel.RED
        phenotype = "Poor Function"
        recommendation = CPIC_RECOMMENDATIONS["SLCO1B1_POOR"]
        confidence = 0.96
        warnings.append("Marked elevation of Simvastatin plasma AUC. Severe risk of myopathy, rhabdomyolysis, and acute renal failure.")
    elif as_score <= 1.0:
        risk_color = RiskLevel.YELLOW
        phenotype = "Decreased / Intermediate Function"
        recommendation = CPIC_RECOMMENDATIONS["SLCO1B1_INTERMEDIATE"]
        confidence = 0.95
        warnings.append("Moderately elevated Simvastatin systemic exposure. Limit Simvastatin to ≤20mg daily or switch to alternative statin.")
    else:
        risk_color = RiskLevel.GREEN
        phenotype = "Normal Function"
        recommendation = CPIC_RECOMMENDATIONS["SLCO1B1_NORMAL"]
        confidence = 0.97

    return DrugRiskAssessment(
        drug="Simvastatin",
        genes=["SLCO1B1"],
        diplotype=diplotype,
        activity_score=as_score,
        phenotype=phenotype,
        risk_color=risk_color,
        cpic_recommendation=recommendation,
        confidence_score=confidence,
        warnings=warnings,
        llm_generated_explanation=None,
        retrieved_citations=["CPIC Guideline for SLCO1B1 and Statin-Induced Myopathy"],
        genotype_calls=calls
    )


def evaluate_cyp2c19(variants: List[GenotypeCall]) -> DrugRiskAssessment:
    """
    Evaluates CYP2C19 for Clopidogrel.
    CYP2C19 *2, *3 (Loss of function) -> Poor Metabolizer -> Ineffective / Risk of stent thrombosis.
    """
    diplotype, as_score, calls = _extract_diplotype_and_as("CYP2C19", variants)
    warnings = []
    
    if as_score == 0.0:
        risk_color = RiskLevel.RED
        phenotype = "Poor Metabolizer"
        recommendation = CPIC_RECOMMENDATIONS["CYP2C19_POOR"]
        confidence = 0.96
        warnings.append("Zero CYP2C19 bioactivation capacity. Clopidogrel is ineffective; high risk of recurrent ischemic events.")
    elif as_score <= 1.0:
        risk_color = RiskLevel.YELLOW
        phenotype = "Intermediate Metabolizer"
        recommendation = CPIC_RECOMMENDATIONS["CYP2C19_INTERMEDIATE"]
        confidence = 0.94
        warnings.append("Reduced antiplatelet efficacy with standard Clopidogrel dosing.")
    else:
        risk_color = RiskLevel.GREEN
        phenotype = "Normal / Rapid Metabolizer"
        recommendation = CPIC_RECOMMENDATIONS["CYP2C19_NORMAL"]
        confidence = 0.97

    return DrugRiskAssessment(
        drug="Clopidogrel",
        genes=["CYP2C19"],
        diplotype=diplotype,
        activity_score=as_score,
        phenotype=phenotype,
        risk_color=risk_color,
        cpic_recommendation=recommendation,
        confidence_score=confidence,
        warnings=warnings,
        llm_generated_explanation=None,
        retrieved_citations=["CPIC Guideline for CYP2C19 Genotype and Clopidogrel Therapy"],
        genotype_calls=calls
    )


def evaluate_cyp2d6(variants: List[GenotypeCall], has_cnv_markers: bool) -> DrugRiskAssessment:
    """
    Evaluates CYP2D6 for Codeine / Tramadol.
    Applies structural-variant / CNV checks:
    If no CNV markers are detected, decreases confidence_score and attaches clinical warning.
    """
    diplotype, as_score, calls = _extract_diplotype_and_as("CYP2D6", variants)
    warnings = []
    base_confidence = 0.96
    
    # CNV / Structural variant check
    if not has_cnv_markers:
        base_confidence = 0.75  # Lowered confidence score
        warnings.append("Warning: CYP2D6 structural-variant/CNV markers missing in VCF. Whole-gene deletions (*5) or gene duplications (xN) may not be detected.")
    else:
        warnings.append("CYP2D6 CNV/structural variation analysis confirmed present in VCF metadata.")
        
    if as_score >= 2.5:
        risk_color = RiskLevel.RED
        phenotype = "Ultra-rapid Metabolizer"
        recommendation = CPIC_RECOMMENDATIONS["CYP2D6_ULTRARAPID"]
        warnings.append("Excessive conversion of codeine to morphine. Risk of fatal respiratory depression.")
    elif as_score == 0.0 or "*4/*4" in diplotype:
        risk_color = RiskLevel.RED
        phenotype = "Poor Metabolizer"
        recommendation = CPIC_RECOMMENDATIONS["CYP2D6_POOR"]
        warnings.append("Lack of bioactivation into active analgesic metabolite morphine. Ineffective analgesia.")
    elif as_score <= 1.0:
        risk_color = RiskLevel.YELLOW
        phenotype = "Intermediate Metabolizer"
        recommendation = "Adjust Dosage: Reduced analgesic response. Monitor pain control and adjust dosing if needed."
    else:
        risk_color = RiskLevel.GREEN
        phenotype = "Normal Metabolizer"
        recommendation = CPIC_RECOMMENDATIONS["CYP2D6_NORMAL"]

    return DrugRiskAssessment(
        drug="Codeine / Tramadol",
        genes=["CYP2D6"],
        diplotype=diplotype,
        activity_score=as_score,
        phenotype=phenotype,
        risk_color=risk_color,
        cpic_recommendation=recommendation,
        confidence_score=base_confidence,
        warnings=warnings,
        llm_generated_explanation=None,
        retrieved_citations=["CPIC Guideline for CYP2D6 and Codeine Therapy"],
        genotype_calls=calls
    )


def run_pgx_rules_engine(parsed_vcf: ParsedVcfResult) -> List[DrugRiskAssessment]:
    """
    Executes all deterministic rules against the parsed VCF variant records.
    """
    variants = parsed_vcf.variants
    has_cnv = parsed_vcf.cyp2d6_has_cnv_markers
    
    assessments = [
        evaluate_dpyd(variants),
        evaluate_warfarin_multigene(variants),
        evaluate_slco1b1(variants),
        evaluate_cyp2c19(variants),
        evaluate_cyp2d6(variants, has_cnv)
    ]
    
    # Sort order: RED (High Risk) -> YELLOW (Adjust Dosage) -> GREEN (Safe)
    risk_rank = {RiskLevel.RED: 0, RiskLevel.YELLOW: 1, RiskLevel.GREEN: 2}
    assessments.sort(key=lambda a: (risk_rank.get(a.risk_color, 3), a.drug))
    
    return assessments
