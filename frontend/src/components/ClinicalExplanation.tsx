'use client';

import React from 'react';
import { Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { DrugRiskAssessment } from '../lib/types';

interface ClinicalExplanationProps {
  assessment: DrugRiskAssessment;
}

export default function ClinicalExplanation({ assessment }: ClinicalExplanationProps) {
  const explanationText = assessment.llm_generated_explanation || 
    'Biological mechanism explanation currently unavailable for this variant combination.';

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.07) 0%, rgba(13, 20, 38, 0.6) 100%)',
      border: '1px solid rgba(192, 132, 252, 0.3)',
      boxShadow: '0 0 25px rgba(192, 132, 252, 0.1)',
      borderRadius: 'var(--radius-md)',
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
            boxShadow: '0 0 12px rgba(192, 132, 252, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={15} color="#ffffff" />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-display)',
            fontSize: '0.92rem', 
            fontWeight: 800, 
            color: '#ffffff',
            letterSpacing: '-0.01em'
          }}>
            Biological Mechanism & Clinical RAG Explanation (Google Gemini)
          </span>
        </div>

        <span className="badge badge-neutral" style={{ 
          fontSize: '0.68rem',
          background: 'rgba(192, 132, 252, 0.1)',
          border: '1px solid rgba(192, 132, 252, 0.3)',
          color: '#e879f9'
        }}>
          Strict Zero-Dosage Guardrail
        </span>
      </div>

      {/* Formatted Explanation Content */}
      <div style={{
        fontSize: '0.85rem',
        color: '#f1f5f9',
        lineHeight: 1.65,
        whiteSpace: 'pre-line',
        background: 'rgba(5, 7, 14, 0.55)',
        padding: '14px 18px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
      }}>
        {explanationText}
      </div>

      {/* Retrieved Citations */}
      {assessment.retrieved_citations && assessment.retrieved_citations.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <BookOpen size={13} color="var(--neon-purple)" /> Cited Guidelines:
          </span>
          {assessment.retrieved_citations.map((cite, i) => (
            <span 
              key={i} 
              className="badge badge-neutral"
              style={{ 
                fontSize: '0.7rem', 
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1'
              }}
            >
              {cite}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
