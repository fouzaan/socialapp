// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZ3wxLg4UHIcUUs_qpm3x37x6KFOvkWGs",
  authDomain: "shop-b2f6c.firebaseapp.com",
  projectId: "shop-b2f6c",
  storageBucket: "shop-b2f6c.firebasestorage.app",
  messagingSenderId: "137346274937",
  appId: "1:137346274937:web:7b5639d052d2e976e1e6a8",
  measurementId: "G-BPEXX8H56S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);
