// src/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyD1BJeehCrDqeyRTN4NCsx5sSgrH6-dcW4",
  authDomain: "farmacia-ad684.firebaseapp.com",
  projectId: "farmacia-ad684",
  storageBucket: "farmacia-ad684.firebasestorage.app",
  messagingSenderId: "1024282036794",
  appId: "1:1024282036794:web:cb33d89928b43e8d42c303",
  measurementId: "G-8J9ED4DHYY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// sua função criarUsuario
export async function criarUsuario(uid: string, displayName: string, photoURL: string, email: string) {
  await setDoc(doc(db, 'users', uid), {
    displayName,
    photoURL,
    email,
    createdAt: new Date()
  });
}
