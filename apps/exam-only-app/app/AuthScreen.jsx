"use client";
import React, { useState } from "react";
import { auth, db } from "@repo/ui/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Image from 'next/image';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // UPDATED: Added the onboardingComplete flag to trigger the Gatekeeper
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: new Date(),
          totalExamsTaken: 0,
          onboardingComplete: false 
        });
      }
    } catch (err) {
      // Clean up Firebase error messages to look more professional
      setError(err.message.replace("Firebase: ", "").replace(/\(auth.*\)\./, ""));
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#020617', // Deep space background
      backgroundImage: 'radial-gradient(circle at 50% -20%, #1e293b, #020617)',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* The "Frosted Glass" Panel */}
      <div style={{ 
        padding: '50px 40px', 
        borderRadius: '16px', 
        backgroundColor: 'rgba(15, 23, 42, 0.6)', 
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56, 189, 248, 0.2)', // Subtle cyan border
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.1)',
        width: '100%',
        maxWidth: '400px',
        transition: 'all 0.3s ease'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Image 
            src="/Drill (1).png" 
            alt="DRILL Logo" 
            width={64} 
            height={64} 
            style={{ 
              margin: '0 auto 15px', 
              borderRadius: '12px',
              display: 'block' 
            }} 
            priority
          />
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', letterSpacing: '1px', color: '#f8fafc' }}>
            {isLogin ? "SYSTEM ACCESS" : "CREATE PROFILE"}
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>
            {isLogin ? "Enter credentials to access the terminal." : "Register for a secure candidate ID."}
          </p>
        </div>
        
        {error && (
          <div style={{ 
            padding: '10px 15px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            borderLeft: '4px solid #ef4444', 
            color: '#fca5a5', 
            fontSize: '13px', 
            marginBottom: '20px',
            borderRadius: '0 4px 4px 0'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Identification
            </label>
            <input 
              type="email" 
              placeholder="Candidate Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                borderRadius: '8px', 
                border: '1px solid #334155', 
                backgroundColor: 'rgba(2, 6, 23, 0.5)', 
                color: 'white',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Security Key
            </label>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                borderRadius: '8px', 
                border: '1px solid #334155', 
                backgroundColor: 'rgba(2, 6, 23, 0.5)', 
                color: 'white',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
              required
            />
          </div>

          <button 
            type="submit" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
              marginTop: '10px',
              padding: '14px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: isHovered ? '#0ea5e9' : '#0284c7', 
              color: 'white', 
              fontWeight: '600', 
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isHovered ? '0 0 15px rgba(14, 165, 233, 0.5)' : 'none'
            }}
          >
            {isLogin ? "AUTHENTICATE" : "ESTABLISH CONNECTION"}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
          <p 
            style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer', margin: 0, transition: 'color 0.2s' }} 
            onClick={() => setIsLogin(!isLogin)}
            onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            {isLogin ? "No profile detected. Request access here." : "Profile established? Return to login."}
          </p>
        </div>

      </div>
    </div>
  );
}