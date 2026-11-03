import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCt4Y0K_E5OmEiqZvRb8UELose64hm0htE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kalendarz-d284f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kalendarz-d284f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kalendarz-d284f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "55700214296",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:55700214296:web:f826375ffa5ddf9796296d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FNEGJ3D1KZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Authentication helper methods
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
};
export const logoutUser = () => signOut(auth);

export { onAuthStateChanged };
export default app;
