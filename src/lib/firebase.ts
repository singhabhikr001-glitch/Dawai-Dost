import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, GoogleAuthProvider, getAuth } from 'firebase/auth';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyB2xGwYF69STaEE5B95F3iG2maRt4WVq2U',
  authDomain: 'dawaildost.firebaseapp.com',
  projectId: 'dawaildost',
  storageBucket: 'dawaildost.firebasestorage.app',
  messagingSenderId: '49560904796',
  appId: '1:49560904796:web:4074ef836ae5c768caf299',
  measurementId: 'G-BZ9VX0F61C',
};

const envConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY?.trim() || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ||
    DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ||
    DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ||
    DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ||
    DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID?.trim() || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim() ||
    DEFAULT_FIREBASE_CONFIG.measurementId,
};

const REQUIRED_ENV_ENTRIES: [keyof typeof envConfig, string][] = [
  ['apiKey', 'VITE_FIREBASE_API_KEY'],
  ['authDomain', 'VITE_FIREBASE_AUTH_DOMAIN'],
  ['projectId', 'VITE_FIREBASE_PROJECT_ID'],
  ['storageBucket', 'VITE_FIREBASE_STORAGE_BUCKET'],
  ['messagingSenderId', 'VITE_FIREBASE_MESSAGING_SENDER_ID'],
  ['appId', 'VITE_FIREBASE_APP_ID'],
];

export const missingFirebaseEnvVars: string[] = REQUIRED_ENV_ENTRIES.filter(
  ([key]) => !envConfig[key]
).map(([, envName]) => envName);

export const isFirebaseConfigured = missingFirebaseEnvVars.length === 0;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(envConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });
}

export { app, auth, googleProvider };
