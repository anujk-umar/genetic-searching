'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import VcfUploader from '../components/VcfUploader';
import SampleDataSelector from '../components/SampleDataSelector';
import TrafficLightBoard from '../components/TrafficLightBoard';
import DrugCard from '../components/DrugCard';
import FhirJsonModal from '../components/FhirJsonModal';
import { AuthUser, PGxReport } from '../lib/types';
import { fetchDemoDpyd, checkBackendHealth } from '../lib/api';
import { Dna, ShieldCheck, Sparkles, CheckCircle2, Zap, Lock } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>({
    uid: 'demo-clinician-001',
    displayName: 'Dr. Sarah Lin, MD (Hackathon Demo)',
    email: 'sarah.lin@genomics.hospital.org',
    photoURL: null,
    isDemo: true
  });
  
  const [report, setReport] = useState<PGxReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isFhirModalOpen, setIsFhirModalOpen] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<{ status: string; gemini_configured: boolean; pinecone_configured: boolean } | null>(null);

  // Auto-load DPYD starter demo on mount so the dashboard immediately renders rich data
  useEffect(() => {
    async function init() {
      try {
        const health = await checkBackendHealth();
        setBackendStatus(health);
        
        // Auto-load DPYD demo so UI is never empty on launch
        const demoReport = await fetchDemoDpyd();
        setReport(demoReport);
      } catch (e) {
        console.warn('Initial demo fetch note:', e);
      }
    }
    init();
  }, []);

  const filteredAssessments = report?.assessments.filter(a => {
    if (selectedFilter === 'ALL') return true;
    return a.risk_color === selectedFilter;
  }) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Top Navigation */}
      <Header 
        user={user} 
        setUser={setUser} 
        report={report} 
        onOpenFhirModal={() => setIsFhirModalOpen(true)} 
      />

      {/* Main Clinical Workspace */}
      <main style={{
        maxWidth: 1440,
        width: '100%',
        margin: '0 auto',
        padding: '30px 24px 70px 24px',
        flex: 1
      }}>
        {/* Cyber Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(13, 20, 38, 0.9) 0%, rgba(18, 27, 49, 0.75) 100%)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 242, 254, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Ambient Radial Glow inside banner */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ maxWidth: 820, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>
                <Zap size={12} /> CPIC Level A/B Decision Support
              </span>
              <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                <Lock size={12} /> Zero-Dosage Guardrails
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                HL7 FHIR Interoperable
              </span>
            </div>

            <h2 style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '1.65rem', 
              fontWeight: 800, 
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.25
            }}>
              Precision Pharmacogenomics & <span className="text-gradient-cyan">Adverse Drug Event Prevention</span>
            </h2>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
              Deterministic CPIC Star-Allele / Activity Score engine paired with Google Gemini RAG literature grounding.
              Designed for clinical geneticists and oncologists to optimize drug safety in seconds.
            </p>
          </div>

          <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            {backendStatus && (
              <div style={{
                fontSize: '0.75rem',
                color: backendStatus.status === 'healthy' ? 'var(--risk-green)' : 'var(--risk-yellow)',
                background: 'rgba(0, 0, 0, 0.45)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${backendStatus.status === 'healthy' ? 'rgba(0, 255, 135, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                boxShadow: backendStatus.status === 'healthy' ? '0 0 15px rgba(0, 255, 135, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: backendStatus.status === 'healthy' ? 'var(--risk-green)' : 'var(--risk-yellow)',
                  boxShadow: backendStatus.status === 'healthy' ? '0 0 8px var(--risk-green)' : 'none'
                }} />
                <span style={{ fontWeight: 600 }}>FastAPI Engine: {backendStatus.status === 'healthy' ? 'Live & Connected' : 'Connecting...'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 1-Click Quick Demo Presets */}
        <SampleDataSelector 
          onReportGenerated={setReport} 
          isLoading={isLoading} 
          setIsLoading={setIsLoading} 
        />

        {/* VCF Ingestion & Client Validation Card */}
        <VcfUploader 
          onReportGenerated={setReport} 
          isLoading={isLoading} 
          setIsLoading={setIsLoading} 
        />

        {/* Results Section */}
        {report && (
          <section style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ 
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.35rem', 
                  fontWeight: 800, 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10 
                }}>
                  <ShieldCheck size={22} color="var(--neon-cyan)" />
                  Pharmacogenomics Traffic Light Evaluation
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Visual risk categorization with progressive disclosure accordions
                </p>
              </div>
            </div>

            {/* Traffic Light Metrics & Filter Tabs */}
            <TrafficLightBoard 
              report={report} 
              selectedFilter={selectedFilter} 
              onSelectFilter={setSelectedFilter} 
            />

            {/* Drug Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((assessment, index) => (
                  <DrugCard 
                    key={`${assessment.drug}-${index}`} 
                    assessment={assessment} 
                    defaultExpanded={assessment.risk_color === 'RED'} 
                  />
                ))
              ) : (
                <div className="glass-panel" style={{ padding: '44px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={36} color="var(--risk-green)" style={{ margin: '0 auto 12px auto' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>No medications match the selected filter ({selectedFilter}).</p>
                  <button 
                    onClick={() => setSelectedFilter('ALL')}
                    className="btn btn-secondary"
                    style={{ marginTop: 14, fontSize: '0.82rem' }}
                  >
                    View All Medications
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* HL7 FHIR Inspection Modal */}
      {report && (
        <FhirJsonModal 
          report={report} 
          isOpen={isFhirModalOpen} 
          onClose={() => setIsFhirModalOpen(false)} 
        />
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '22px 28px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.78rem',
        background: 'rgba(5, 7, 14, 0.95)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>HelixRx PGx</span>
            <span>•</span>
            <span>Clinical Pharmacogenomics Decision Support Prototype</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
            <span className="code-tag">Next.js 14 App Router</span>
            <span className="code-tag">FastAPI Docker</span>
            <span className="code-tag">Gemini 1.5 RAG</span>
            <span className="code-tag">Pinecone Free Tier</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
