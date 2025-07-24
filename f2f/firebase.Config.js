// firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCj_qAZZGKSVqkreJfpKZg5b7njzkqIm1E",
  authDomain: "firstapp-333db.firebaseapp.com",
  projectId: "firstapp-333db",
  storageBucket: "firstapp-333db.appspot.com",
  messagingSenderId: "112738692856",
  appId: "1:112738692856:web:bae4bcb02954fe1165550d",
  measurementId: "G-TSG9JKDHGF"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 👇 Correct way to initialize auth in React Native (Expo SDK 53+)
const auth = getApps().length === 0
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    })
  : getAuth(app);

const db = getFirestore(app);

export { app, auth, db };
