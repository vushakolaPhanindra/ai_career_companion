import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// These values should be placed in your root .env.local file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBpdeC5F_csG4DTpHSo0HLa1_RX2EBC2UU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aicareercompanion-d4bd1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aicareercompanion-d4bd1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aicareercompanion-d4bd1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "874225936427",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:874225936427:web:7809be3b8f92482dcea26e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
