import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoDummyApiKeyForBuildFallback',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hisabbook-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hisabbook-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hisabbook-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:1234567890',
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider()

export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const registerWithEmail = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password)
}

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider)
}

export const logoutUser = async () => {
  return await firebaseSignOut(auth)
}

export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback)
}
