from typing import Dict, Any

# Allele activity value mapping according to CPIC guidelines
ALLELE_ACTIVITY_VALUES = {
    # DPYD alleles
    "DPYD": {
        "*1": 1.0,       # Normal function
        "*2A": 0.0,      # c.1905+1G>A / IVS14+1G>A / rs3918290 (No function)
        "*13": 0.0,      # c.1679T>G / rs55704559 (No function)
        "*2846A": 0.5,   # c.2846A>T / rs67376798 (Decreased function)
        "HapB3": 0.5,    # c.1129-5923C>G / rs56038477 (Decreased function)
    },
    # CYP2C9 alleles
    "CYP2C9": {
        "*1": 1.0,
        "*2": 0.5,       # rs1799853
        "*3": 0.0,       # rs1057910
        "*5": 0.0,
        "*6": 0.0,
    },
    # CYP2C19 alleles
    "CYP2C19": {
        "*1": 1.0,
        "*2": 0.0,       # Loss of function
        "*3": 0.0,       # Loss of function
        "*17": 1.5,      # Increased function
    },
    # CYP2D6 alleles
    "CYP2D6": {
        "*1": 1.0,
        "*2": 1.0,
        "*4": 0.0,       # No function
        "*5": 0.0,       # Whole gene deletion
        "*10": 0.25,     # Decreased function
        "*41": 0.5,      # Decreased function
        "*1xN": 2.0,     # Gene duplication (Ultra-rapid)
        "*2xN": 2.0,
    },
    # SLCO1B1 alleles
    "SLCO1B1": {
        "*1": 1.0,       # Normal function
        "*5": 0.0,       # rs4149056 (c.521T>C) - Decreased / poor function
        "*15": 0.0,
        "*17": 0.0,
    }
}

# Standard CPIC Guidelines and clinical recommendations
CPIC_RECOMMENDATIONS = {
    "DPYD_INTERMEDIATE": (
        "Adjust Dosage: Reduce starting dose of 5-Fluorouracil (5-FU) or Capecitabine by 25% to 50% "
        "due to decreased DPD enzyme clearance and elevated risk of severe/fatal myelosuppression and mucositis. "
        "Titrate dose based on toxicity monitoring or therapeutic drug monitoring (TDM)."
    ),
    "DPYD_POOR": (
        "Toxic / Ineffective: Avoid 5-Fluorouracil (5-FU), Capecitabine, and Tegafur entirely. "
        "Near-total DPD enzyme deficiency leads to life-threatening toxicities. Select alternative non-fluoropyrimidine regimen."
    ),
    "DPYD_NORMAL": (
        "Safe: Standard dosage of 5-Fluorouracil or Capecitabine as indicated by clinical oncology protocols."
    ),
    "SLCO1B1_POOR": (
        "Adjust Dosage / High Risk: Increased risk of statin-induced myopathy and rhabdomyolysis. "
        "Avoid high-dose Simvastatin (>20 mg/day). Strongly consider alternative statin (e.g., Rosuvastatin, Pravastatin) "
        "or lower starting dose."
    ),
    "SLCO1B1_INTERMEDIATE": (
        "Adjust Dosage: Moderate risk of myopathy with Simvastatin. Consider starting at lower dose or monitor CK levels."
    ),
    "SLCO1B1_NORMAL": (
        "Safe: Prescribe standard recommended starting dose of Simvastatin according to lipid management guidelines."
    ),
    "CYP2C19_POOR": (
        "Toxic / Ineffective: Avoid Clopidogrel due to significantly reduced active metabolite formation and increased "
        "risk of major adverse cardiovascular events (MACE) and stent thrombosis. Alternative antiplatelet therapy "
        "recommended (e.g., Prasugrel or Ticagrelor), unless contraindicated."
    ),
    "CYP2C19_INTERMEDIATE": (
        "Adjust Dosage: Consider alternative antiplatelet (Prasugrel/Ticagrelor) in ACS/PCI settings."
    ),
    "CYP2C19_NORMAL": (
        "Safe: Standard dosing of Clopidogrel (75 mg daily)."
    ),
    "CYP2D6_POOR": (
        "Toxic / Ineffective: Avoid Codeine and Tramadol due to lack of efficacy resulting from inadequate conversion to morphine/active metabolite. "
        "Use alternative non-CYP2D6 metabolized analgesics (e.g., Morphine, Hydromorphone, Non-opioids)."
    ),
    "CYP2D6_ULTRARAPID": (
        "Toxic / Ineffective: Avoid Codeine and Tramadol due to potential life-threatening opioid toxicity from rapid bioactivation to morphine. "
        "Select alternative non-CYP2D6 opioid or non-opioid analgesic."
    ),
    "CYP2D6_NORMAL": (
        "Safe: Standard weight/age-appropriate dosing of Codeine/Tramadol."
    ),
    "WARFARIN_HIGH_SENSITIVITY": (
        "Adjust Dosage: High sensitivity to Warfarin. Expected maintenance dose is significantly lower (typically 1.5–3 mg/day). "
        "High risk of supratherapeutic INR and major bleeding. Initiate with reduced starting dose and perform frequent INR monitoring."
    ),
    "WARFARIN_VERY_HIGH_SENSITIVITY": (
        "Adjust Dosage / Critical Caution: Extreme sensitivity to Warfarin. Consider alternative non-vitamin K oral anticoagulant (DOAC) "
        "or initiate at ≤ 1.5 mg/day with intensive daily/bi-weekly INR surveillance."
    ),
    "WARFARIN_NORMAL": (
        "Safe: Standard Warfarin initiation protocol (typically 5 mg/day starting dose) guided by clinical INR response."
    )
}
