import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// Interface for Firebase configuration
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

// Your Firebase configuration with type annotation
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Add type annotations for Firebase services
const auth: firebase.auth.Auth = firebase.auth();
const firestore: firebase.firestore.Firestore = firebase.firestore();
const storage: firebase.storage.Storage = firebase.storage();

export { auth, firestore, storage };

// Optionally, you can also export types that might be useful elsewhere in your app
export type FirebaseAuth = firebase.auth.Auth;
export type FirebaseFirestore = firebase.firestore.Firestore;
export type FirebaseStorage = firebase.storage.Storage;
export type FirebaseUser = firebase.User;
export type FirebaseDocument = firebase.firestore.DocumentData;
