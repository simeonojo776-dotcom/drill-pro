"use client";

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// 1. Corrected Imports
import { auth, db } from '@repo/ui/firebase'; 
import AuthScreen from './AuthScreen';
import ExamMode from '@repo/ui/ExamMode'; 
import { Dashboard } from './Dashboard';

export default function MainAppContainer() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track the current screen: 'dashboard' or 'exam' (Setup is GONE)
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.uid);
      } else {
        setUserData(null);
        setIsLoading(false);
        setCurrentScreen('dashboard'); 
      }
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div style={{ height: '100vh', backgroundColor: '#020617' }}></div>; 
  }

  // GATE 1: Login
  if (!user) {
    return <AuthScreen />;
  }

  // GATE 2: INTERNAL ROUTING (Directly from Dashboard to your custom ExamMode)
  
  if (currentScreen === 'dashboard') {
    return (
      <Dashboard 
        userData={userData} 
        onStartNewSession={() => setCurrentScreen('exam')} 
      />
    );
  }

  if (currentScreen === 'exam') {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#020617' }}>
        <ExamMode 
          user={user}
          userData={userData}
          closeExamMode={() => setCurrentScreen('dashboard')} 
        />
      </div>
    );
  }
}