import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Check if all required environment variables are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: '***' // Hide API key in logs
});

let app;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  console.log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  console.log('Initializing Firebase Auth...');
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully:', auth);
  
  console.log('Initializing Firestore...');
  db = getFirestore(app);
  console.log('Firestore initialized successfully');
  
  console.log('Initializing Firebase Storage...');
  storage = getStorage(app);
  console.log('Firebase Storage initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  if (error instanceof Error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
  throw error;
}

export { auth, db, storage };
export default app;
