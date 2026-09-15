from typing import List, Dict, Tuple
from ..models.fhir import DrugRiskAssessment, RiskLevel, GenotypeCall
from .cpic_data import CPIC_RECOMMENDATIONS


def evaluate_warfarin_multigene(variants: List[GenotypeCall]) -> DrugRiskAssessment:
    """
    IWPC / CPIC Multi-gene evaluation for Warfarin combining:
    - CYP2C9 (*2 rs1799853, *3 rs1057910)
    - VKORC1 (-1639G>A rs9923231)
    - CYP4F2 (*3 rs2108622)
    """
    # Extract variants for each gene
    cyp2c9_calls = [v for v in variants if v.gene == "CYP2C9"]
    vkorc1_calls = [v for v in variants if v.gene == "VKORC1"]
    cyp4f2_calls = [v for v in variants if v.gene == "CYP4F2"]
    
    # Determine CYP2C9 diplotype
    cyp2c9_diplo = "*1/*1"
    cyp2c9_as = 2.0
    for call in cyp2c9_calls:
        if call.genotype in ["0|1", "1|0", "0/1"]:
            cyp2c9_diplo = f"*1/{call.star_allele}"
            cyp2c9_as = 1.0 if call.star_allele == "*3" else 1.5
        elif call.genotype in ["1|1", "1/1"]:
            cyp2c9_diplo = f"{call.star_allele}/{call.star_allele}"
            cyp2c9_as = 0.0
            
    # Determine VKORC1 genotype (-1639 G>A)
    # rs9923231: G = normal, A = high sensitivity (lower dose requirement)
    vkorc1_status = "G/G (Normal)"
    vkorc1_sensitivity = "NORMAL"
    for call in vkorc1_calls:
        if call.genotype in ["1|1", "1/1"]:
            vkorc1_status = "-1639A/A (High Sensitivity)"
            vkorc1_sensitivity = "HIGH"
        elif call.genotype in ["0|1", "1|0", "0/1"]:
            vkorc1_status = "-1639G/A (Moderate Sensitivity)"
            vkorc1_sensitivity = "MODERATE"
            
    # Determine CYP4F2 (*3 / rs2108622)
    # CYP4F2 *3 increases dose requirement slightly (~1 mg/day)
    cyp4f2_status = "*1/*1 (Normal)"
    for call in cyp4f2_calls:
        if call.genotype in ["0|1", "1|0", "0/1"]:
            cyp4f2_status = "*1/*3 (Moderately Increased Dose Requirement)"
        elif call.genotype in ["1|1", "1/1"]:
            cyp4f2_status = "*3/*3 (Increased Dose Requirement)"

    # Combined IWPC assessment
    warnings = []
    combined_diplotype = f"CYP2C9 {cyp2c9_diplo} + VKORC1 {vkorc1_status} + CYP4F2 {cyp4f2_status}"
    
    # High sensitivity condition: CYP2C9 Poor/Intermediate + VKORC1 A/A or G/A
    if vkorc1_sensitivity == "HIGH" or cyp2c9_as <= 0.5:
        risk_color = RiskLevel.RED
        phenotype = "Very High Warfarin Sensitivity / High Bleeding Risk"
        recommendation = CPIC_RECOMMENDATIONS["WARFARIN_VERY_HIGH_SENSITIVITY"]
        confidence = 0.95
        warnings.append("Multi-gene combination (CYP2C9 + VKORC1 -1639 A/A) predicts severe reduction in clearance and high bleeding propensity.")
    elif vkorc1_sensitivity == "MODERATE" or cyp2c9_as <= 1.0:
        risk_color = RiskLevel.YELLOW
        phenotype = "High Warfarin Sensitivity"
        recommendation = CPIC_RECOMMENDATIONS["WARFARIN_HIGH_SENSITIVITY"]
        confidence = 0.94
        warnings.append("CYP2C9 and/or VKORC1 variant detected: Expected daily maintenance dose is reduced by 30–50%.")
    else:
        risk_color = RiskLevel.GREEN
        phenotype = "Normal Warfarin Sensitivity"
        recommendation = CPIC_RECOMMENDATIONS["WARFARIN_NORMAL"]
        confidence = 0.96

    if "CYP4F2 *3" in cyp4f2_status:
        warnings.append("CYP4F2 *3 variant partially offsets VKORC1/CYP2C9 effect, moderately increasing vitamin K1 metabolism.")

    all_warfarin_calls = cyp2c9_calls + vkorc1_calls + cyp4f2_calls
    
    return DrugRiskAssessment(
        drug="Warfarin",
        genes=["CYP2C9", "VKORC1", "CYP4F2"],
        diplotype=combined_diplotype,
        activity_score=cyp2c9_as,
        phenotype=phenotype,
        risk_color=risk_color,
        cpic_recommendation=recommendation,
        confidence_score=confidence,
        warnings=warnings,
        llm_generated_explanation=None,
        retrieved_citations=["CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing (Clinical Pharmacology & Therapeutics)"],
        genotype_calls=all_warfarin_calls
    )
