'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Pill, 
  Dna, 
  Sparkles,
  ShieldCheck,
  Flame,
  Zap
} from 'lucide-react';
import { DrugRiskAssessment, RiskLevel } from '../lib/types';
import GeneticDetails from './GeneticDetails';
import ClinicalExplanation from './ClinicalExplanation';

interface DrugCardProps {
  assessment: DrugRiskAssessment;
  defaultExpanded?: boolean;
}

export default function DrugCard({ assessment, defaultExpanded = false }: DrugCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isRed = assessment.risk_color === 'RED';
  const isYellow = assessment.risk_color === 'YELLOW';
  const isGreen = assessment.risk_color === 'GREEN';

  // Cyber border styling
  const getBorderColor = () => {
    if (isRed) return 'rgba(255, 51, 102, 0.55)';
    if (isYellow) return 'rgba(251, 191, 36, 0.5)';
    return 'rgba(0, 255, 135, 0.35)';
  };

  const getCardBg = () => {
    if (isRed) return 'linear-gradient(135deg, rgba(255, 51, 102, 0.08) 0%, rgba(13, 20, 38, 0.75) 100%)';
    if (isYellow) return 'linear-gradient(135deg, rgba(251, 191, 36, 0.07) 0%, rgba(13, 20, 38, 0.75) 100%)';
    return 'linear-gradient(135deg, rgba(0, 255, 135, 0.05) 0%, rgba(13, 20, 38, 0.75) 100%)';
  };

  const getRiskBadge = () => {
    if (isRed) {
      return (
        <span className="badge badge-red" style={{ fontSize: '0.74rem', padding: '5px 12px' }}>
          <Flame size={14} style={{ filter: 'drop-shadow(0 0 4px #ff3366)' }} />
          Toxic / Ineffective
        </span>
      );
    }
    if (isYellow) {
      return (
        <span className="badge badge-yellow" style={{ fontSize: '0.74rem', padding: '5px 12px' }}>
          <Zap size={14} style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
          Adjust Dosage
        </span>
      );
    }
    return (
      <span className="badge badge-green" style={{ fontSize: '0.74rem', padding: '5px 12px' }}>
        <CheckCircle2 size={14} style={{ filter: 'drop-shadow(0 0 4px #00ff87)' }} />
        Safe / Standard Dosing
      </span>
    );
  };

  return (
    <div 
      className={`glass-panel transition-card ${isRed ? 'pulse-red' : ''}`}
      style={{
        border: `1.5px solid ${getBorderColor()}`,
        background: getCardBg(),
        overflow: 'hidden',
        boxShadow: isRed 
          ? '0 12px 35px -10px rgba(255, 51, 102, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)' 
          : isYellow 
            ? '0 12px 35px -10px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)' 
            : '0 8px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Collapsed Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '20px 24px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          userSelect: 'none',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          {/* Drug Name & Target Genes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-sm)',
              background: isRed 
                ? 'rgba(255, 51, 102, 0.2)' 
                : isYellow 
                  ? 'rgba(251, 191, 36, 0.2)' 
                  : 'rgba(0, 255, 135, 0.18)',
              border: `1px solid ${isRed ? 'rgba(255, 51, 102, 0.4)' : isYellow ? 'rgba(251, 191, 36, 0.4)' : 'rgba(0, 255, 135, 0.3)'}`,
              boxShadow: isRed 
                ? '0 0 16px rgba(255, 51, 102, 0.3)' 
                : isYellow 
                  ? '0 0 16px rgba(251, 191, 36, 0.25)' 
                  : '0 0 16px rgba(0, 255, 135, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Pill size={22} color={isRed ? '#ff3366' : isYellow ? '#fbbf24' : '#00ff87'} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ 
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem', 
                  fontWeight: 800, 
                  color: '#ffffff',
                  letterSpacing: '-0.01em'
                }}>
                  {assessment.drug}
                </h3>
                <span className="code-tag" style={{ color: 'var(--neon-cyan)', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                  {assessment.genes.join(' + ')}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                Detected Phenotype: <strong style={{ color: '#ffffff' }}>{assessment.phenotype}</strong> ({assessment.diplotype})
              </p>
            </div>
          </div>

          {/* Color-coded Risk Label & Accordion Toggle Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {getRiskBadge()}
            
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}>
              {isExpanded ? <ChevronUp size={18} color="var(--neon-cyan)" /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>

        {/* CPIC Recommendation text */}
        <div style={{
          fontSize: '0.88rem',
          color: isRed ? '#fecdd3' : isYellow ? '#fef08a' : '#bbf7d0',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          borderLeft: `4px solid ${isRed ? '#ff3366' : isYellow ? '#fbbf24' : '#00ff87'}`,
          lineHeight: 1.5,
          backdropFilter: 'blur(8px)'
        }}>
          <strong style={{ color: '#ffffff', letterSpacing: '0.01em' }}>CPIC Recommendation:</strong> {assessment.cpic_recommendation}
        </div>
      </div>

      {/* Expandable Accordion Body (Progressive Disclosure) */}
      {isExpanded && (
        <div style={{
          padding: '0 24px 24px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '20px',
          animation: 'fadeIn 0.25s ease'
        }}>
          {/* Section 1: Genetic Diplotype & Activity Score */}
          <GeneticDetails assessment={assessment} />

          {/* Section 2: LLM Clinical Explanation & RAG Mechanism */}
          <ClinicalExplanation assessment={assessment} />
        </div>
      )}
    </div>
  );
}
