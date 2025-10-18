// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAMY3KIBzkVgbwRlHSdwPFUQ0NAp13P8EM",
  authDomain: "bank-code-eb7d0.firebaseapp.com",
  projectId: "bank-code-eb7d0",
  storageBucket: "bank-code-eb7d0.firebasestorage.app",
  messagingSenderId: "51462460383",
  appId: "1:51462460383:web:37bc8a302ca8e6a6d62a6a",
  measurementId: "G-HX428DN9NL"
});

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg',
    badge: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});