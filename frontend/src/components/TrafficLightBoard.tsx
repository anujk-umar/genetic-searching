'use client';

import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, Filter, User, Calendar, FileText, Flame, Zap } from 'lucide-react';
import { PGxReport, RiskLevel } from '../lib/types';

interface TrafficLightBoardProps {
  report: PGxReport;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export default function TrafficLightBoard({ report, selectedFilter, onSelectFilter }: TrafficLightBoardProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Patient Header Card */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <User size={16} color="var(--neon-cyan)" />
              <span>Patient: <strong style={{ color: '#ffffff', letterSpacing: '0.02em' }}>{report.patient_id}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <FileText size={16} color="var(--neon-blue)" />
              <span>Source: <strong style={{ color: '#ffffff' }}>{report.file_name || 'VCF Stream'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Calendar size={16} color="var(--neon-purple)" />
              <span>Timestamp: <strong style={{ color: '#ffffff' }}>{new Date(report.effective_date_time).toLocaleTimeString()} UTC</strong></span>
            </div>
          </div>

          <div className="badge badge-neutral" style={{ 
            fontSize: '0.74rem',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            Report ID: <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>{report.report_id}</span>
          </div>
        </div>
      </div>

      {/* Traffic Light Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 18,
        marginBottom: '20px'
      }}>
        {/* RED / Toxic / Ineffective Card */}
        <div 
          onClick={() => onSelectFilter(selectedFilter === 'RED' ? 'ALL' : 'RED')}
          className={`glass-panel transition-card ${report.high_risk_count > 0 ? 'pulse-red' : ''}`}
          style={{
            padding: '22px 24px',
            border: `2px solid ${selectedFilter === 'RED' ? '#ff3366' : 'rgba(255, 51, 102, 0.45)'}`,
            background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.15) 0%, rgba(13, 20, 38, 0.8) 100%)',
            cursor: 'pointer',
            boxShadow: selectedFilter === 'RED' ? '0 0 30px rgba(255, 51, 102, 0.4)' : '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ff6b8b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Toxic / Ineffective
            </span>
            <Flame size={24} color="#ff3366" style={{ filter: 'drop-shadow(0 0 8px #ff3366)' }} />
          </div>
          <div style={{ 
            fontFamily: 'var(--font-display)',
            fontSize: '2.6rem', 
            fontWeight: 800, 
            color: '#ff3366', 
            marginTop: 6,
            textShadow: '0 0 20px rgba(255, 51, 102, 0.5)'
          }}>
            {report.high_risk_count}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
            Critical risk of severe toxicity or therapeutic failure. Action required.
          </p>
        </div>

        {/* YELLOW / Adjust Dosage Card */}
        <div 
          onClick={() => onSelectFilter(selectedFilter === 'YELLOW' ? 'ALL' : 'YELLOW')}
          className="glass-panel transition-card"
          style={{
            padding: '22px 24px',
            border: `2px solid ${selectedFilter === 'YELLOW' ? '#fbbf24' : 'rgba(251, 191, 36, 0.45)'}`,
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(13, 20, 38, 0.8) 100%)',
            cursor: 'pointer',
            boxShadow: selectedFilter === 'YELLOW' ? '0 0 30px rgba(251, 191, 36, 0.35)' : '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Adjust Dosage
            </span>
            <Zap size={24} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 8px #fbbf24)' }} />
          </div>
          <div style={{ 
            fontFamily: 'var(--font-display)',
            fontSize: '2.6rem', 
            fontWeight: 800, 
            color: '#fbbf24', 
            marginTop: 6,
            textShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
          }}>
            {report.adjust_dosage_count}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
            Moderate risk. Clinical dose reduction or active drug monitoring required.
          </p>
        </div>

        {/* GREEN / Safe Card */}
        <div 
          onClick={() => onSelectFilter(selectedFilter === 'GREEN' ? 'ALL' : 'GREEN')}
          className="glass-panel transition-card"
          style={{
            padding: '22px 24px',
            border: `2px solid ${selectedFilter === 'GREEN' ? '#00ff87' : 'rgba(0, 255, 135, 0.35)'}`,
            background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.12) 0%, rgba(13, 20, 38, 0.8) 100%)',
            cursor: 'pointer',
            boxShadow: selectedFilter === 'GREEN' ? '0 0 30px rgba(0, 255, 135, 0.3)' : '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Safe / Standard
            </span>
            <CheckCircle2 size={24} color="#00ff87" style={{ filter: 'drop-shadow(0 0 8px #00ff87)' }} />
          </div>
          <div style={{ 
            fontFamily: 'var(--font-display)',
            fontSize: '2.6rem', 
            fontWeight: 800, 
            color: '#00ff87', 
            marginTop: 6,
            textShadow: '0 0 20px rgba(0, 255, 135, 0.35)'
          }}>
            {report.safe_count}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
            Normal metabolic function. Standard prescribing protocols indicated.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="var(--neon-cyan)" /> Filter View:
        </span>
        <button
          onClick={() => onSelectFilter('ALL')}
          className={`btn ${selectedFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
        >
          All Drugs ({report.total_drugs_evaluated})
        </button>
        <button
          onClick={() => onSelectFilter('RED')}
          className={`btn ${selectedFilter === 'RED' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ 
            padding: '6px 14px', 
            fontSize: '0.78rem', 
            borderColor: selectedFilter === 'RED' ? '#ff3366' : 'rgba(255, 51, 102, 0.4)',
            color: selectedFilter === 'RED' ? '#040914' : '#ff6b8b'
          }}
        >
          Red Only ({report.high_risk_count})
        </button>
        <button
          onClick={() => onSelectFilter('YELLOW')}
          className={`btn ${selectedFilter === 'YELLOW' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ 
            padding: '6px 14px', 
            fontSize: '0.78rem', 
            borderColor: selectedFilter === 'YELLOW' ? '#fbbf24' : 'rgba(251, 191, 36, 0.4)',
            color: selectedFilter === 'YELLOW' ? '#040914' : '#fde047'
          }}
        >
          Yellow Only ({report.adjust_dosage_count})
        </button>
        <button
          onClick={() => onSelectFilter('GREEN')}
          className={`btn ${selectedFilter === 'GREEN' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ 
            padding: '6px 14px', 
            fontSize: '0.78rem', 
            borderColor: selectedFilter === 'GREEN' ? '#00ff87' : 'rgba(0, 255, 135, 0.4)',
            color: selectedFilter === 'GREEN' ? '#040914' : '#4ade80'
          }}
        >
          Green Only ({report.safe_count})
        </button>
      </div>
    </div>
  );
}
