// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "estate-vista.firebaseapp.com",
  projectId: "estate-vista",
  storageBucket: "estate-vista.appspot.com",
  messagingSenderId: "501726272786",
  appId: "1:501726272786:web:79fb59c133d19849a8e7cb"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);