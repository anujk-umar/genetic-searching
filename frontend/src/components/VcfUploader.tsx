'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, AlertTriangle, CheckCircle2, FileText, Loader2, Sparkles, Database, FileCode2 } from 'lucide-react';
import { VcfValidationResult, PGxReport } from '../lib/types';
import { uploadVcfToFirebaseStorage } from '../lib/firebase';
import { analyzeVcfUrl, analyzeVcfRaw } from '../lib/api';

interface VcfUploaderProps {
  onReportGenerated: (report: PGxReport) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function VcfUploader({ onReportGenerated, isLoading, setIsLoading }: VcfUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Client-side validation using native FileReader and File.slice(0, 4096)
   */
  const validateVcfClientSide = async (file: File): Promise<VcfValidationResult> => {
    const maxBytes = 5 * 1024 * 1024;
    const fileSizeMb = file.size / (1024 * 1024);
    
    if (file.size > maxBytes) {
      return {
        valid: false,
        error: `File size (${fileSizeMb.toFixed(2)} MB) exceeds the 5 MB maximum limit.`,
        details: { fileSizeMb, hasVcf42Format: false, hasHeaderColumns: false }
      };
    }

    const slice = file.slice(0, 4096);
    const chunkText = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file slice.'));
      reader.readAsText(slice);
    });

    const lines = chunkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return {
        valid: false,
        error: 'VCF file is completely empty.',
        details: { fileSizeMb, hasVcf42Format: false, hasHeaderColumns: false }
      };
    }

    const firstLine = lines[0];
    const hasVcf42Format = firstLine.startsWith('##fileformat=VCFv4.2');
    if (!hasVcf42Format) {
      return {
        valid: false,
        error: `Invalid format: First line must be '##fileformat=VCFv4.2' (Found: '${firstLine.slice(0, 30)}...').`,
        details: { fileSizeMb, hasVcf42Format: false, hasHeaderColumns: false }
      };
    }

    const headerLine = lines.find(l => l.startsWith('#CHROM'));
    const requiredCols = ['#CHROM', 'POS', 'ID', 'REF', 'ALT'];
    const hasHeaderColumns = Boolean(
      headerLine && requiredCols.every(col => headerLine.includes(col))
    );

    if (!hasHeaderColumns) {
      return {
        valid: false,
        error: "Missing required VCF columns: Header must include '#CHROM POS ID REF ALT'.",
        details: { fileSizeMb, hasVcf42Format: true, hasHeaderColumns: false }
      };
    }

    let detectedSampleId = 'PATIENT_001';
    if (headerLine) {
      const cols = headerLine.split('\t');
      if (cols.length > 9) {
        detectedSampleId = cols[9].trim();
      }
    }

    return {
      valid: true,
      details: {
        fileSizeMb,
        hasVcf42Format: true,
        hasHeaderColumns: true,
        detectedSampleId
      }
    };
  };

  const handleFileProcess = async (file: File) => {
    setValidationError(null);
    setValidationSuccess(null);
    setUploadProgressStatus('Stream-validating VCFv4.2 header via FileReader.slice...');

    try {
      const validation = await validateVcfClientSide(file);
      if (!validation.valid) {
        setValidationError(validation.error || 'Client-side VCF validation failed.');
        setUploadProgressStatus(null);
        return;
      }

      setValidationSuccess(
        `✓ Validated VCFv4.2 Header (${(file.size / 1024).toFixed(1)} KB • Sample: ${validation.details?.detectedSampleId})`
      );
      setIsLoading(true);

      setUploadProgressStatus('Uploading to Firebase Cloud Storage...');
      const storageResult = await uploadVcfToFirebaseStorage(file, validation.details?.detectedSampleId);

      let report: PGxReport;

      if (storageResult.downloadUrl.startsWith('mock-firebase://')) {
        setUploadProgressStatus('Executing CPIC Star-Allele rules engine & Gemini RAG...');
        const fullText = await file.text();
        report = await analyzeVcfRaw(fullText, validation.details?.detectedSampleId, file.name);
      } else {
        setUploadProgressStatus('Passing Firebase Storage download URL to FastAPI backend...');
        report = await analyzeVcfUrl(storageResult.downloadUrl, validation.details?.detectedSampleId, file.name);
      }

      setUploadProgressStatus(null);
      onReportGenerated(report);
    } catch (err: any) {
      console.error('VCF Pipeline Error:', err);
      setValidationError(err.message || 'An error occurred during VCF processing.');
      setUploadProgressStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem', 
            fontWeight: 800, 
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10 
          }}>
            <FileCode2 size={20} color="var(--neon-cyan)" />
            Patient Genomic VCF Ingestion
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Instant client-side stream validation (<code className="code-tag">FileReader.slice(0, 4096)</code> • ≤5MB • VCFv4.2)
          </p>
        </div>
        <span className="badge badge-neutral" style={{ 
          fontSize: '0.72rem', 
          background: 'rgba(0, 242, 254, 0.08)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          color: 'var(--neon-cyan)'
        }}>
          Zero-WASM Instant Parsing
        </span>
      </div>

      {/* Cyber Drag & Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--neon-cyan)' : 'rgba(255, 255, 255, 0.16)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '40px 24px',
          textAlign: 'center',
          background: isDragOver ? 'rgba(0, 242, 254, 0.08)' : 'rgba(5, 7, 14, 0.5)',
          boxShadow: isDragOver ? '0 0 35px rgba(0, 242, 254, 0.25), inset 0 0 20px rgba(0, 242, 254, 0.1)' : 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          position: 'relative'
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileInputChange} 
          accept=".vcf,.txt" 
          style={{ display: 'none' }} 
          disabled={isLoading}
        />

        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: isDragOver ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${isDragOver ? 'var(--neon-cyan)' : 'rgba(255, 255, 255, 0.12)'}`,
          boxShadow: isDragOver ? '0 0 25px rgba(0, 242, 254, 0.4)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDragOver ? 'var(--neon-cyan)' : 'var(--text-secondary)',
          transition: 'all 0.25s ease'
        }}>
          {isLoading ? (
            <Loader2 size={30} style={{ animation: 'spin 1.2s linear infinite', color: 'var(--neon-cyan)' }} />
          ) : (
            <UploadCloud size={30} />
          )}
        </div>

        <div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            {isLoading ? 'Processing Pharmacogenomics Pipeline...' : 'Drag & drop patient .VCF file here, or browse local files'}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Format must start with <code className="code-tag">##fileformat=VCFv4.2</code> (Max 5 MB)
          </p>
        </div>

        {uploadProgressStatus && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.25)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--neon-cyan)',
            marginTop: 4
          }}>
            <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            <span>{uploadProgressStatus}</span>
          </div>
        )}
      </div>

      {/* Validation Feedback */}
      {validationError && (
        <div style={{
          marginTop: 18,
          padding: '14px 18px',
          background: 'var(--risk-red-bg)',
          border: '1px solid var(--risk-red-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 0 20px rgba(255, 51, 102, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#ff6b8b',
          fontSize: '0.88rem'
        }}>
          <AlertTriangle size={20} color="#ff3366" />
          <div>
            <strong style={{ color: '#ffffff' }}>Client Validation Error:</strong> {validationError}
          </div>
        </div>
      )}

      {validationSuccess && !validationError && (
        <div style={{
          marginTop: 18,
          padding: '12px 18px',
          background: 'var(--risk-green-bg)',
          border: '1px solid var(--risk-green-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 0 20px rgba(0, 255, 135, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#4ade80',
          fontSize: '0.88rem'
        }}>
          <CheckCircle2 size={20} color="#00ff87" />
          <div style={{ fontWeight: 600 }}>{validationSuccess}</div>
        </div>
      )}
    </div>
  );
}
