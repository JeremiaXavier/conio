// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkN2Jv3Ctyu8i1JZu3_BNXUAywZSBO-wE",
  authDomain: "conioai.firebaseapp.com",
  projectId: "conioai",
  storageBucket: "conioai.firebasestorage.app",
  messagingSenderId: "265135223779",
  appId: "1:265135223779:web:3c44a20d4a10b9aeaaa6d6",
  measurementId: "G-V7CMG9FPQ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
