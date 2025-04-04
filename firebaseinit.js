// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
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

/// ✅ Initialize Firebase FIRST
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Initialize Firebase services AFTER app is created
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const storage = getStorage(app);

// ✅ Initialize Analytics only if supported
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { auth, db, realtimeDb, storage };
