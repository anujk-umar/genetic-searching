'use client';

import React, { useState } from 'react';
import { ShieldCheck, Activity, Dna, FileCode, LogIn, LogOut, Sparkles, Terminal } from 'lucide-react';
import { AuthUser, PGxReport } from '../lib/types';
import { signInWithGoogle, logoutUser } from '../lib/firebase';

interface HeaderProps {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  report: PGxReport | null;
  onOpenFhirModal: () => void;
}

export default function Header({ user, setUser, report, onOpenFhirModal }: HeaderProps) {
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      const authUser = await signInWithGoogle();
      setUser(authUser);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <header style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(5, 7, 14, 0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '14px 28px'
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand with Cyber Aura */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #00f2fe 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(0, 242, 254, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            position: 'relative'
          }}>
            <Dna size={24} color="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ 
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem', 
                fontWeight: 800, 
                letterSpacing: '-0.03em', 
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                HelixRx <span className="text-gradient-cyan" style={{ fontWeight: 800 }}>PGx</span>
              </h1>
              <span className="badge badge-blue" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                CPIC v2024
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>
              Precision Pharmacogenomics Clinical Decision Support
            </p>
          </div>
        </div>

        {/* System & Cloud Stack Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="badge badge-neutral" style={{ 
            fontSize: '0.72rem', 
            background: 'rgba(0, 242, 254, 0.06)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            color: '#38bdf8'
          }}>
            <Activity size={13} color="var(--neon-cyan)" />
            <span>FastAPI Rules Engine</span>
          </div>
          <div className="badge badge-neutral" style={{ 
            fontSize: '0.72rem',
            background: 'rgba(192, 132, 252, 0.08)',
            border: '1px solid rgba(192, 132, 252, 0.3)',
            color: '#c084fc'
          }}>
            <Sparkles size={13} color="var(--neon-purple)" />
            <span>Gemini RAG</span>
          </div>
          <div className="badge badge-neutral" style={{ 
            fontSize: '0.72rem',
            background: 'rgba(0, 255, 135, 0.06)',
            border: '1px solid rgba(0, 255, 135, 0.25)',
            color: '#4ade80'
          }}>
            <ShieldCheck size={13} color="var(--risk-green)" />
            <span>HL7 FHIR</span>
          </div>
        </div>

        {/* Actions & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {report && (
            <button 
              onClick={onOpenFhirModal}
              className="btn btn-secondary" 
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              title="Inspect HL7 FHIR DiagnosticReport JSON"
            >
              <FileCode size={16} color="var(--neon-cyan)" />
              <span>Inspect HL7 FHIR</span>
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f2fe, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#040914'
                }}>
                  {user.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
                    {user.displayName || 'Clinician'}
                  </span>
                  {user.isDemo && (
                    <span style={{ fontSize: '0.62rem', color: 'var(--neon-cyan)' }}>Demo Mode</span>
                  )}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '7px 10px', fontSize: '0.75rem' }}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              disabled={authLoading}
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <LogIn size={15} />
              <span>{authLoading ? 'Signing in...' : 'Sign In with Google'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
