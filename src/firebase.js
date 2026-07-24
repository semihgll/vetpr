import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";

// Firebase Configuration for Project 176236272832
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vetpr-176236272832.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vetpr-176236272832",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vetpr-176236272832.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "176236272832",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Email / Password Authentication Helpers
export const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    console.error("Email registration error:", error);
    let msg = error.message;
    if (error.code === 'auth/email-already-in-use') msg = 'Bu e-posta adresi zaten kullanımda.';
    if (error.code === 'auth/weak-password') msg = 'Şifre en az 6 karakter olmalıdır.';
    if (error.code === 'auth/invalid-email') msg = 'Geçersiz bir e-posta adresi girdiniz.';
    return { user: null, error: msg };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    console.error("Email login error:", error);
    let msg = error.message;
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      msg = 'E-posta adresi veya şifre hatalı.';
    }
    return { user: null, error: msg };
  }
};

// Google Auth Helper
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error("Google login error:", error);
    if (error.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { user: null, error: 'Tarayıcınız açılır pencereleri engellediği için sayfa yönlendiriliyor...' };
      } catch (redirectErr) {
        return { user: null, error: 'Açılır pencere engellendi. Lütfen tarayıcınızda pop-up engelleyicisini kapatın veya E-Posta / Şifre ile giriş yapın.' };
      }
    }
    let msg = error.message;
    if (error.code === 'auth/popup-closed-by-user') msg = 'Pencere kapatıldı. Lütfen tekrar deneyin.';
    return { user: null, error: msg };
  }
};

// Logout Helper
export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

export default app;
