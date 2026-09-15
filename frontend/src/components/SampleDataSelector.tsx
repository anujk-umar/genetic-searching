'use client';

import React from 'react';
import { AlertOctagon, HeartPulse, ShieldAlert, CheckCircle, Flame, Zap } from 'lucide-react';
import { PGxReport } from '../lib/types';
import { fetchDemoDpyd, analyzeVcfRaw } from '../lib/api';

interface SampleDataSelectorProps {
  onReportGenerated: (report: PGxReport) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function SampleDataSelector({ onReportGenerated, isLoading, setIsLoading }: SampleDataSelectorProps) {

  // Preset 1: DPYD *1/*2A (rs3918290)
  const handleLoadDpydDemo = async () => {
    try {
      setIsLoading(true);
      const report = await fetchDemoDpyd();
      onReportGenerated(report);
    } catch (err: any) {
      console.error('Failed to load DPYD demo:', err);
      alert('Error loading DPYD demo from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Preset 2: Warfarin Multi-Gene Complex
  const handleLoadWarfarinDemo = async () => {
    const warfarinVcf = `##fileformat=VCFv4.2
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO	FORMAT	PATIENT_WARFARIN_002
chr10	94781859	rs1057910	A	C	99	PASS	GENE=CYP2C9;RS=rs1057910;STAR=*3;FUNCTION=no_function	GT:DP:GQ	0|1:55:99
chr16	31102334	rs9923231	C	T	99	PASS	GENE=VKORC1;RS=rs9923231;STAR=-1639A;FUNCTION=high_sensitivity	GT:DP:GQ	1|1:60:99
chr19	15990431	rs2108622	C	T	99	PASS	GENE=CYP4F2;RS=rs2108622;STAR=*3;FUNCTION=decreased_function	GT:DP:GQ	0|1:44:99
chr1	97544241	rs3918290	C	C	99	PASS	GENE=DPYD;RS=rs3918290;STAR=*1;FUNCTION=normal	GT:DP:GQ	0/0:50:99
chr12	21178615	rs4149056	T	C	99	PASS	GENE=SLCO1B1;RS=rs4149056;STAR=*5;FUNCTION=decreased_function	GT:DP:GQ	0|1:42:99
chr22	42128945	rs3892097	C	T	99	PASS	GENE=CYP2D6;RS=rs3892097;STAR=*4;FUNCTION=no_function	GT:DP:GQ	0/1:38:99`;

    try {
      setIsLoading(true);
      const report = await analyzeVcfRaw(warfarinVcf, 'PATIENT_WARFARIN_002', 'sample_warfarin_complex.vcf');
      onReportGenerated(report);
    } catch (err: any) {
      console.error('Failed to load Warfarin demo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset 3: CYP2D6 CNV Missing
  const handleLoadCyp2d6Demo = async () => {
    const cyp2d6Vcf = `##fileformat=VCFv4.2
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO	FORMAT	PATIENT_CYP2D6_TEST
chr22	42128945	rs3892097	C	T	99	PASS	GENE=CYP2D6;RS=rs3892097;STAR=*4;FUNCTION=no_function	GT:DP:GQ	0|1:40:99
chr1	97544241	rs3918290	C	C	99	PASS	GENE=DPYD;RS=rs3918290;STAR=*1;FUNCTION=normal	GT:DP:GQ	0/0:50:99
chr10	94781859	rs1057910	A	A	99	PASS	GENE=CYP2C9;RS=rs1057910;STAR=*1;FUNCTION=normal	GT:DP:GQ	0/0:50:99
chr16	31102334	rs9923231	C	C	99	PASS	GENE=VKORC1;RS=rs9923231;STAR=wt;FUNCTION=normal	GT:DP:GQ	0/0:52:99
chr12	21178615	rs4149056	T	T	99	PASS	GENE=SLCO1B1;RS=rs4149056;STAR=*1;FUNCTION=normal	GT:DP:GQ	0/0:48:99`;

    try {
      setIsLoading(true);
      const report = await analyzeVcfRaw(cyp2d6Vcf, 'PATIENT_CYP2D6_TEST', 'sample_cyp2d6_cnv_missing.vcf');
      onReportGenerated(report);
    } catch (err: any) {
      console.error('Failed to load CYP2D6 demo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset 4: Normal Wildtype
  const handleLoadNormalDemo = async () => {
    const normalVcf = `##fileformat=VCFv4.2
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO	FORMAT	PATIENT_NORMAL_001
chr1	97544241	rs3918290	C	C	99	PASS	GENE=DPYD;RS=rs3918290;STAR=*1;FUNCTION=normal	GT:DP:GQ	0/0:60:99
chr10	94781859	rs1057910	A	A	99	PASS	GENE=CYP2C9;RS=rs1057910;STAR=*1;FUNCTION=normal	GT:DP:GQ	0/0:55:99
chr16	31102334	rs9923231	C	C	99	PASS	GENE=VKORC1;RS=rs9923231;STAR=wt;FUNCTION=normal	GT:DP:GQ	0/0:62:99
chr12	21178615	rs4149056	T	T	99	PASS	GENE=SLCO1B1;RS=rs4149056;STAR=*1;FUNCTION=normal	GT:DP:GQ	0/0:58:99
chr22	42128945	rs3892097	C	C	99	PASS	GENE=CYP2D6;RS=rs3892097;STAR=*1;FUNCTION=normal;CNV=DIPLOID_CN2	GT:DP:GQ	0/0:50:99`;

    try {
      setIsLoading(true);
      const report = await analyzeVcfRaw(normalVcf, 'PATIENT_NORMAL_001', 'sample_normal_safe.vcf');
      onReportGenerated(report);
    } catch (err: any) {
      console.error('Failed to load Normal demo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ 
          fontSize: '0.82rem', 
          fontWeight: 800, 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          ⚡ Instant Hackathon Demo Presets (1-Click Run)
        </span>
        <span style={{ fontSize: '0.74rem', color: 'var(--neon-cyan)' }}>
          Click to load & evaluate instantly
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 14
      }}>
        {/* Preset 1: DPYD *1/*2A */}
        <button
          onClick={handleLoadDpydDemo}
          disabled={isLoading}
          className="btn btn-preset transition-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
            borderLeft: '4px solid #fbbf24',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(13, 20, 38, 0.9) 100%)'
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(251, 191, 36, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={18} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#ffffff' }}>DPYD *1/*2A (5-FU)</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Intermediate • Reduce dose 50%</div>
          </div>
        </button>

        {/* Preset 2: Warfarin Multi-Gene */}
        <button
          onClick={handleLoadWarfarinDemo}
          disabled={isLoading}
          className="btn btn-preset transition-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
            borderLeft: '4px solid #ff3366',
            background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.08) 0%, rgba(13, 20, 38, 0.9) 100%)'
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 51, 102, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={18} color="#ff3366" style={{ filter: 'drop-shadow(0 0 6px #ff3366)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#ffffff' }}>Warfarin Multi-Gene</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>CYP2C9 *3 + VKORC1 A/A</div>
          </div>
        </button>

        {/* Preset 3: CYP2D6 CNV Missing */}
        <button
          onClick={handleLoadCyp2d6Demo}
          disabled={isLoading}
          className="btn btn-preset transition-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
            borderLeft: '4px solid var(--neon-cyan)',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(13, 20, 38, 0.9) 100%)'
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(0, 242, 254, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={18} color="var(--neon-cyan)" style={{ filter: 'drop-shadow(0 0 6px var(--neon-cyan))' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#ffffff' }}>CYP2D6 CNV Missing</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Triggers confidence warning</div>
          </div>
        </button>

        {/* Preset 4: Normal Wildtype */}
        <button
          onClick={handleLoadNormalDemo}
          disabled={isLoading}
          className="btn btn-preset transition-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
            borderLeft: '4px solid #00ff87',
            background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.08) 0%, rgba(13, 20, 38, 0.9) 100%)'
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(0, 255, 135, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={18} color="#00ff87" style={{ filter: 'drop-shadow(0 0 6px #00ff87)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#ffffff' }}>Normal Wildtype *1/*1</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>All panel medications safe</div>
          </div>
        </button>
      </div>
    </div>
  );
}
