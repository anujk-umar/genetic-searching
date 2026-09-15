import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  FirebaseStorage
} from 'firebase/storage';
import { AuthUser } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

if (typeof window !== 'undefined' && isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn('[Firebase] Initialization error:', err);
  }
}

export const googleProvider = new GoogleAuthProvider();

/**
 * Signs in user with Google OAuth popup.
 * If Firebase is not configured, provides a seamless demo clinician account.
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  if (auth && isFirebaseConfigured) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return {
        uid: user.uid,
        displayName: user.displayName || 'Clinical Geneticist',
        email: user.email,
        photoURL: user.photoURL,
        isDemo: false
      };
    } catch (error: any) {
      console.error('[Firebase Auth Error]', error);
      throw error;
    }
  }

  // Fallback demo user
  return {
    uid: 'demo-clinician-001',
    displayName: 'Dr. Sarah Lin, MD (Hackathon Demo)',
    email: 'sarah.lin@genomics.hospital.org',
    photoURL: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
    isDemo: true
  };
}

/**
 * Signs out current user.
 */
export async function logoutUser(): Promise<void> {
  if (auth && isFirebaseConfigured) {
    await firebaseSignOut(auth);
  }
}

/**
 * Uploads VCF file to Firebase Cloud Storage and returns the public download URL.
 * In demo mode (without Firebase storage), generates a local simulation URL.
 */
export async function uploadVcfToFirebaseStorage(file: File, patientId: string = 'PATIENT_001'): Promise<{ downloadUrl: string; path: string }> {
  if (storage && isFirebaseConfigured) {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `vcf_uploads/${patientId}/${timestamp}_${sanitizedName}`);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: 'text/plain',
      customMetadata: {
        originalName: file.name,
        patientId: patientId,
        uploadedAt: new Date().toISOString()
      }
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return {
      downloadUrl,
      path: snapshot.ref.fullPath
    };
  }

  // Demo mode fallback: return a simulated cloud URL identifier
  return {
    downloadUrl: `mock-firebase://vcf_uploads/${patientId}/${Date.now()}_${file.name}`,
    path: `vcf_uploads/${patientId}/${file.name}`
  };
}
