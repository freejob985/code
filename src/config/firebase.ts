import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAMY3KIBzkVgbwRlHSdwPFUQ0NAp13P8EM",
  authDomain: "bank-code-eb7d0.firebaseapp.com",
  databaseURL: "https://bank-code-eb7d0-default-rtdb.firebaseio.com",
  projectId: "bank-code-eb7d0",
  storageBucket: "bank-code-eb7d0.firebasestorage.app",
  messagingSenderId: "51462460383",
  appId: "1:51462460383:web:37bc8a302ca8e6a6d62a6a",
  measurementId: "G-HX428DN9NL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);

// Enable Firebase network for proper connectivity
try {
  enableNetwork(db).then(() => {
    console.log('🔥 Firebase Firestore network enabled successfully');
  }).catch((error) => {
    console.warn('⚠️ Firebase network enable failed:', error);
  });
} catch (error) {
  console.warn('Firebase network configuration failed:', error);
}

// Initialize Firebase Cloud Messaging
let messaging: any = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging not available:', error);
  }
}

// Updated unique project slug for complete data isolation  
export const PROJECT_SLUG = 'code-vault-pro-441988mm-bank-system-v5';

// Collection names with project slug
export const COLLECTIONS = {
  SNIPPETS: `${PROJECT_SLUG}-snippets`,
  TAGS: `${PROJECT_SLUG}-tags`,
  CATEGORIES: `${PROJECT_SLUG}-categories`,
  COMMENTS: `${PROJECT_SLUG}-comments`,
  REVIEWS: `${PROJECT_SLUG}-reviews`,
  SETTINGS: `${PROJECT_SLUG}-settings`,
  USERS: `${PROJECT_SLUG}-users`
};

// FCM Token management
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) return null;
  
  try {
    const token = await getToken(messaging, {
      vapidKey: 'BJv9WEEHB8-Kt_eWSnR75nkuDUk1LxQFnDJGTwsppJEyGgSHs9oRiEqe8SZoTFadJM_iDYlg4qx6kFV1Nlisvos'
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen for FCM messages
export const onMessageListener = () => {
  if (!messaging) return Promise.reject('Messaging not available');
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export default app;