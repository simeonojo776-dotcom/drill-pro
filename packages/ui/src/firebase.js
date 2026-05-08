import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// 1. Import the new offline cache modules
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyAaiS045-iMLfx8blwbly2rdVw03RWiWFA",
  authDomain: "brilliance-717cc.firebaseapp.com",
  databaseURL: "https://brilliance-717cc-default-rtdb.firebaseio.com",
  projectId: "brilliance-717cc",
  storageBucket: "brilliance-717cc.firebasestorage.app",
  messagingSenderId: "540896387046",
  appId: "1:540896387046:web:7584c300cfc5ae39270027",
  measurementId: "G-B4TY4BZWV0"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Auth
export const auth = getAuth(app);

// 2. INITIALIZE FIRESTORE WITH OFFLINE VAULT ENABLED
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Safely Initialize Analytics ONLY if we are in a browser
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}