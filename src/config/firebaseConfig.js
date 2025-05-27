// src/config/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Create React App, environment variables must start with REACT_APP_
const firebaseConfigValues = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  // measurementId is optional for Firestore/Auth focus
  // measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// This logic to prefer __firebase_config remains the same
const finalFirebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : firebaseConfigValues;

let appInstance;
let authInstance;
let dbInstance;

try {
  appInstance = initializeApp(finalFirebaseConfig);
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
} catch (error) {
  console.error("Error initializing Firebase from firebaseConfig.js:", error);
  // You might want to throw the error or handle it in a way that App.js can display a message
}

export const firebaseApp = appInstance;
export const auth = authInstance; // Auth instance
export const db = dbInstance; // Firestore instance

// This logic for currentAppId also remains the same
export const currentAppId =
  typeof __app_id !== "undefined" ? __app_id : "default-kanban-app";

// Export Google Auth provider and specific auth functions
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut }; // Export for use in App.js or other auth-related files
