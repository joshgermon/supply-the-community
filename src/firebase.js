// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";

var firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.FB_DOMAIN,
  databaseURL: process.env.DB_URL,
  projectId: process.env.API_KEY.FB_PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MSG_ID,
  appId: process.env.APP_ID,
  measurementId: "G-53LJCQ5WVT"
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export default firebase;
