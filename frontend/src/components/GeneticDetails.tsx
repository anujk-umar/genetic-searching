'use client';

import React from 'react';
import { Dna, ShieldAlert, CheckCircle2, GitCommit, Layers, Activity } from 'lucide-react';
import { DrugRiskAssessment } from '../lib/types';

interface GeneticDetailsProps {
  assessment: DrugRiskAssessment;
}

export default function GeneticDetails({ assessment }: GeneticDetailsProps) {
  return (
    <div style={{
      background: 'rgba(5, 7, 14, 0.45)',
      borderRadius: 'var(--radius-md)',
      padding: '18px 20px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      marginBottom: '18px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <h4 style={{ 
          fontFamily: 'var(--font-display)',
          fontSize: '0.92rem', 
          fontWeight: 800, 
          color: '#ffffff', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8 
        }}>
          <Dna size={18} color="var(--neon-cyan)" style={{ filter: 'drop-shadow(0 0 5px var(--neon-cyan))' }} />
          Genetic Diplotype & Activity Score Engine
        </h4>

        {/* Confidence Gauge with Neon Aura */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Confidence Score:</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            background: assessment.confidence_score >= 0.9 ? 'rgba(0, 255, 135, 0.15)' : 'rgba(251, 191, 36, 0.15)',
            border: `1px solid ${assessment.confidence_score >= 0.9 ? 'rgba(0, 255, 135, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`,
            boxShadow: assessment.confidence_score >= 0.9 ? '0 0 12px rgba(0, 255, 135, 0.25)' : '0 0 12px rgba(251, 191, 36, 0.25)',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: assessment.confidence_score >= 0.9 ? '#00ff87' : '#fbbf24'
          }}>
            <span>{(assessment.confidence_score * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Genetic Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 14
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          padding: '12px 14px', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid rgba(255, 255, 255, 0.06)' 
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Gene(s)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: 3 }}>
            {assessment.genes.join(', ')}
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          padding: '12px 14px', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid rgba(0, 242, 254, 0.2)',
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.08)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Diplotype</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--neon-cyan)', marginTop: 3 }}>
            {assessment.diplotype}
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          padding: '12px 14px', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid rgba(255, 255, 255, 0.06)' 
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Score (AS)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: 3 }}>
            {assessment.activity_score !== null ? assessment.activity_score.toFixed(1) : 'Multi-gene / Algorithmic'}
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          padding: '12px 14px', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid rgba(255, 255, 255, 0.06)' 
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metabolizer Phenotype</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', marginTop: 3 }}>
            {assessment.phenotype}
          </div>
        </div>
      </div>

      {/* Genotype Calls & Phasing List */}
      {assessment.genotype_calls && assessment.genotype_calls.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Detected Variants & Chromosomal Phasing
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {assessment.genotype_calls.map((call, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  border: '1px solid rgba(255, 255, 255, 0.07)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <GitCommit size={15} color="var(--neon-blue)" />
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{call.gene}</span>
                  <span className="code-tag">{call.rsid}</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>{call.star_allele}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: call.is_phased ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: call.is_phased ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                    border: `1px solid ${call.is_phased ? 'rgba(0, 242, 254, 0.4)' : 'var(--border-subtle)'}`,
                    boxShadow: call.is_phased ? '0 0 10px rgba(0, 242, 254, 0.2)' : 'none'
                  }}>
                    {call.is_phased ? `Phased (${call.genotype})` : `Unphased (${call.genotype})`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings & Alerts */}
      {assessment.warnings && assessment.warnings.length > 0 && (
        <div style={{ marginTop: 14 }}>
          {assessment.warnings.map((w, i) => (
            <div 
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.35)',
                boxShadow: '0 0 15px rgba(251, 191, 36, 0.15)',
                borderRadius: 'var(--radius-sm)',
                color: '#fef08a',
                fontSize: '0.78rem',
                lineHeight: 1.45,
                marginTop: 6
              }}
            >
              <ShieldAlert size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
