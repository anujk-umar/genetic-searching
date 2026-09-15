'use client';

import React, { useState } from 'react';
import { X, Copy, Check, FileCode, ShieldCheck, Download, Terminal } from 'lucide-react';
import { PGxReport } from '../lib/types';

interface FhirJsonModalProps {
  report: PGxReport;
  isOpen: boolean;
  onClose: () => void;
}

export default function FhirJsonModal({ report, isOpen, onClose }: FhirJsonModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(report, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_PGX_${report.patient_id}_${report.report_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '28px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileCode size={20} color="var(--neon-cyan)" />
            </div>
            <div>
              <h3 style={{ 
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem', 
                fontWeight: 800, 
                color: '#ffffff' 
              }}>
                HL7 FHIR DiagnosticReport (Genomics)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Interoperability JSON schema conforming to HL7 FHIR Release 4 Genomics Implementation Guide
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cyber Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(5, 7, 14, 0.8)',
          padding: '10px 18px',
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
              Resource: DiagnosticReport
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
              Patient: {report.patient_id}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              {copied ? <Check size={14} color="#00ff87" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="btn btn-primary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <Download size={14} />
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        {/* JSON Code Viewer with Cyber Styling */}
        <pre style={{
          background: '#03050c',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          padding: '20px',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          color: '#38bdf8',
          maxHeight: '55vh',
          overflowY: 'auto',
          lineHeight: 1.55,
          boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.6)'
        }}>
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
}
