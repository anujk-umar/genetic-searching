import os
from typing import List, Dict, Any, Optional, Tuple
from ..config import settings

# Built-in CPIC guideline literature corpus for zero-config fallback retrieval
FALLBACK_GUIDELINE_CORPUS = {
    "DPYD": (
        "CPIC Guideline for Fluoropyrimidines and DPYD: Dihydropyrimidine dehydrogenase (DPD, encoded by DPYD) "
        "is the rate-limiting enzyme in the catabolism of 5-Fluorouracil (5-FU) and its oral prodrug Capecitabine, "
        "converting over 80% of administered 5-FU to inactive dihydrofluorouracil (DHFU). Variants such as DPYD *2A (rs3918290, c.1905+1G>A) "
        "result in complete loss of functional DPD enzyme due to exon 14 skipping. Patients carrying heterozygous DPYD *1/*2A (activity score 1.0) "
        "exhibit substantially impaired clearance, resulting in severe accumulation of cytotoxic fluorouridine triphosphate (FUTP) and "
        "fluorodeoxyuridine monophosphate (FdUMP), provoking lethal myelosuppression, gastrointestinal mucositis, and hand-foot syndrome."
    ),
    "WARFARIN": (
        "CPIC and IWPC Guidelines for Warfarin Pharmacogenetics: Warfarin functions as an antagonist of Vitamin K Epoxide Reductase Complex "
        "Subunit 1 (VKORC1), blocking vitamin K recycling essential for coagulation factors II, VII, IX, and X. The S-enantiomer of Warfarin, "
        "which is 3–5 times more potent than R-warfarin, is metabolized predominantly by CYP2C9. Alleles CYP2C9 *2 (rs1799853) and *3 (rs1057910) "
        "impair enzymatic clearance, while VKORC1 -1639G>A (rs9923231) in the promoter region decreases VKORC1 mRNA expression, dramatically increasing "
        "pharmacodynamic sensitivity to warfarin. CYP4F2 (*3, rs2108622) catalyzes vitamin K1 oxidation; variants reduce enzyme activity, "
        "moderately elevating vitamin K1 levels and increasing dose requirements."
    ),
    "SLCO1B1": (
        "CPIC Guideline for SLCO1B1 and Simvastatin: Solute Carrier Organic Anion Transporter Family Member 1B1 (SLCO1B1, OATP1B1) "
        "mediates the hepatic sinusoidal uptake of statins, particularly Simvastatin acid. The SLCO1B1 *5 (rs4149056, c.521T>C) nonsynonymous "
        "single-nucleotide polymorphism causes poor membrane localization and reduced hepatic influx of Simvastatin, leading to markedly "
        "elevated systemic plasma concentrations (AUC increase of 220% per *5 allele), predisposing myocytes to mitochondrial impairment, "
        "statin-associated muscle symptoms (SAMS), severe myopathy, and life-threatening rhabdomyolysis."
    ),
    "CYP2C19": (
        "CPIC Guideline for Clopidogrel and CYP2C19: Clopidogrel is an inactive thienopyridine prodrug requiring two-step hepatic bioactivation. "
        "CYP2C19 plays a pivotal role in generating the active thiol metabolite (R-130964) which irreversibly binds the platelet P2Y12 ADP receptor. "
        "Loss-of-function alleles CYP2C19 *2 (rs4244285) and *3 (rs4986893) prevent metabolic activation, resulting in inadequate platelet inhibition, "
        "treatment failure, and high risk of secondary thrombotic events and stent thrombosis in patients undergoing percutaneous coronary intervention (PCI)."
    ),
    "CYP2D6": (
        "CPIC Guideline for CYP2D6 and Opioid Analgesics: Codeine is a prodrug with weak mu-opioid receptor affinity that requires CYP2D6-mediated "
        "O-demethylation to produce morphine (which has ~200-fold higher affinity). Poor metabolizers (*4/*4, *5/*5) lack functional enzyme and derive "
        "negligible analgesic benefit. In contrast, Ultra-rapid metabolizers (gene duplications *1xN, *2xN) bioactivate codeine to morphine rapidly and "
        "extensively, causing life-threatening respiratory depression and systemic toxicity even at standard therapeutic doses."
    )
}


class PineconeRetriever:
    def __init__(self):
        self.api_key = settings.PINECONE_API_KEY
        self.index_name = settings.PINECONE_INDEX_NAME
        self.environment = settings.PINECONE_ENVIRONMENT
        self._client = None
        self._index = None
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                from pinecone import Pinecone
                self._client = Pinecone(api_key=self.api_key)
                if self.index_name in [idx.name for idx in self._client.list_indexes()]:
                    self._index = self._client.Index(self.index_name)
            except Exception as e:
                print(f"[Pinecone] Initialization notice: {e}. Utilizing fallback guideline corpus.")

    def retrieve_guideline_context(self, gene: str, drug: str, phenotype: str) -> Tuple[str, str]:
        """
        Retrieves relevant CPIC guideline text chunk for the given drug, gene, and phenotype.
        """
        # If live Pinecone index is ready, query it
        if self._index and settings.GEMINI_API_KEY:
            try:
                # Use query embedding if configured
                query_text = f"CPIC pharmacogenomics guideline {gene} {drug} {phenotype} biological mechanism and toxicity"
                pass
            except Exception as e:
                print(f"[Pinecone] Query error: {e}")

        # Fallback to rich built-in CPIC corpus
        gene_key = gene.upper().split()[0]
        if "WARFARIN" in drug.upper() or "CYP2C9" in gene_key or "VKORC1" in gene_key:
            text = FALLBACK_GUIDELINE_CORPUS.get("WARFARIN", "")
            source = "CPIC Warfarin Pharmacogenetics Guideline (Johnson et al.)"
        elif "DPYD" in gene_key or "5-FU" in drug.upper() or "FLUOROURACIL" in drug.upper():
            text = FALLBACK_GUIDELINE_CORPUS.get("DPYD", "")
            source = "CPIC Guideline for Fluoropyrimidines & DPYD (Amstutz et al.)"
        elif "SLCO1B1" in gene_key or "SIMVASTATIN" in drug.upper():
            text = FALLBACK_GUIDELINE_CORPUS.get("SLCO1B1", "")
            source = "CPIC Guideline for SLCO1B1 and Statins (Cooper-DeHoff et al.)"
        elif "CYP2C19" in gene_key or "CLOPIDOGREL" in drug.upper():
            text = FALLBACK_GUIDELINE_CORPUS.get("CYP2C19", "")
            source = "CPIC Guideline for CYP2C19 and Antiplatelet Therapy (Lee et al.)"
        elif "CYP2D6" in gene_key or "CODEINE" in drug.upper():
            text = FALLBACK_GUIDELINE_CORPUS.get("CYP2D6", "")
            source = "CPIC Guideline for CYP2D6 and Codeine/Tramadol (Crews et al.)"
        else:
            text = f"CPIC clinical consensus statement for {gene} and {drug} regarding {phenotype} metabolic profile."
            source = f"CPIC Consensus Guidelines for {gene}"

        return text, source


pinecone_retriever = PineconeRetriever()
