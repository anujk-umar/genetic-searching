import pytest
from app.parser.vcf_parser import parse_vcf_stream
from app.engine.rules import run_pgx_rules_engine, evaluate_dpyd
from app.engine.warfarin import evaluate_warfarin_multigene
from app.models.fhir import RiskLevel


def test_dpyd_intermediate_metabolizer():
    sample_vcf = (
        "##fileformat=VCFv4.2\n"
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tPATIENT_001\n"
        "chr1\t97544241\trs3918290\tC\tT\t99\tPASS\tGENE=DPYD;RS=rs3918290;STAR=*2A;FUNCTION=no_function\tGT:DP:GQ\t0|1:45:99\n"
    )
    parsed = parse_vcf_stream(sample_vcf)
    assert len(parsed.variants) == 1
    assert parsed.variants[0].gene == "DPYD"
    assert parsed.variants[0].is_phased is True
    assert parsed.variants[0].genotype == "0|1"
    
    assessment = evaluate_dpyd(parsed.variants)
    assert assessment.drug == "Fluorouracil (5-FU) / Capecitabine"
    assert assessment.activity_score == 1.0
    assert assessment.phenotype == "Intermediate Metabolizer"
    assert "25%" in assessment.cpic_recommendation or "50%" in assessment.cpic_recommendation
    assert assessment.risk_color in [RiskLevel.YELLOW, RiskLevel.RED]


def test_warfarin_multigene_evaluation():
    sample_vcf = (
        "##fileformat=VCFv4.2\n"
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tPATIENT_WARFARIN\n"
        "chr10\t94781859\trs1057910\tA\tC\t99\tPASS\tGENE=CYP2C9;RS=rs1057910;STAR=*3;FUNCTION=no_function\tGT:DP:GQ\t0|1:55:99\n"
        "chr16\t31102334\trs9923231\tC\tT\t99\tPASS\tGENE=VKORC1;RS=rs9923231;STAR=-1639A;FUNCTION=high_sensitivity\tGT:DP:GQ\t1|1:60:99\n"
        "chr19\t15990431\trs2108622\tC\tT\t99\tPASS\tGENE=CYP4F2;RS=rs2108622;STAR=*3;FUNCTION=decreased_function\tGT:DP:GQ\t0|1:44:99\n"
    )
    parsed = parse_vcf_stream(sample_vcf)
    assessment = evaluate_warfarin_multigene(parsed.variants)
    assert assessment.drug == "Warfarin"
    assert "CYP2C9" in assessment.genes
    assert "VKORC1" in assessment.genes
    assert "CYP4F2" in assessment.genes
    assert assessment.risk_color == RiskLevel.RED
    assert "High" in assessment.phenotype


def test_cyp2d6_cnv_missing_warning_and_confidence():
    sample_vcf = (
        "##fileformat=VCFv4.2\n"
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tPATIENT_CYP2D6\n"
        "chr22\t42128945\trs3892097\tC\tT\t99\tPASS\tGENE=CYP2D6;RS=rs3892097;STAR=*4;FUNCTION=no_function\tGT:DP:GQ\t0|1:40:99\n"
    )
    parsed = parse_vcf_stream(sample_vcf)
    assert parsed.cyp2d6_has_cnv_markers is False
    
    assessments = run_pgx_rules_engine(parsed)
    cyp2d6_assessment = next(a for a in assessments if a.drug == "Codeine / Tramadol")
    assert cyp2d6_assessment.confidence_score <= 0.80
    assert any("structural-variant" in w.lower() or "cnv" in w.lower() for w in cyp2d6_assessment.warnings)
