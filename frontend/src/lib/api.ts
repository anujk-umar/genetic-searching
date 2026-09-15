import { PGxReport } from './types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<{ status: string; gemini_configured: boolean; pinecone_configured: boolean }> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      gemini_configured: false,
      pinecone_configured: false,
    };
  }
}

export async function analyzeVcfUrl(
  firebaseUrl: string, 
  patientId: string = 'PATIENT_001', 
  fileName: string = 'sample.vcf'
): Promise<PGxReport> {
  const res = await fetch(`${BACKEND_URL}/api/analyze-vcf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      firebase_url: firebaseUrl,
      patient_id: patientId,
      file_name: fileName,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errorData.detail || 'Failed to analyze VCF via backend URL');
  }

  return await res.json();
}

export async function analyzeVcfRaw(
  vcfContent: string, 
  patientId: string = 'PATIENT_001', 
  fileName: string = 'uploaded.vcf'
): Promise<PGxReport> {
  const res = await fetch(`${BACKEND_URL}/api/analyze-raw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      vcf_content: vcfContent,
      patient_id: patientId,
      file_name: fileName,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errorData.detail || 'Failed to analyze raw VCF');
  }

  return await res.json();
}

export async function fetchDemoDpyd(): Promise<PGxReport> {
  const res = await fetch(`${BACKEND_URL}/api/demo-dpyd`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Failed to load demo DPYD data from backend');
  }

  return await res.json();
}
