'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      // Important! initializeApp() is called with the config object.
      // This is because we are ensuring this only runs on the client.
      const firebaseApp = initializeApp(firebaseConfig);
      return getSdks(firebaseApp);
    }
    // If already initialized, return the SDKs with the already initialized App
    return getSdks(getApp());
  }
  return null;
}

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);

  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    const services = initializeFirebase();
    if (!services) {
      return { firebaseApp: null, auth: null, firestore: null };
    }
    return services;
  }, []);

  useEffect(() => {
    if (firebaseServices.firebaseApp) {
      setIsFirebaseInitialized(true);
    }
  }, [firebaseServices]);

  if (!isFirebaseInitialized || !firebaseServices.firebaseApp || !firebaseServices.auth || !firebaseServices.firestore) {
    // Return null while Firebase is initializing on the client.
    // This prevents rendering content that depends on Firebase before it's ready, avoiding hydration mismatch.
    return null;
  }
  
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
