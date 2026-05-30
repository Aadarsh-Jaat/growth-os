// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDovg4uCaMS5h4cLPx_hBhWhTwHtO2qNM8",
  authDomain: "growth-os-64701.firebaseapp.com",
  projectId: "growth-os-64701",
  storageBucket: "growth-os-64701.firebasestorage.app",
  messagingSenderId: "196210116800",
  appId: "1:196210116800:web:d1e782b9ceb8b4db85c525",
  measurementId: "G-WTM8D6VZ8E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;