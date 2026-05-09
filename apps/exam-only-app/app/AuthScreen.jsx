"use client";
import React, { useState } from "react";
import { auth, db } from "@repo/ui/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Standard Professional Error Messages
  const getFriendlyError = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found': return "We couldn't find an account with that email.";
      case 'auth/wrong-password': return "Incorrect password. Please try again.";
      case 'auth/email-already-in-use': return "An account with this email already exists.";
      case 'auth/weak-password': return "Password must be at least 6 characters long.";
      case 'auth/invalid-credential': return "Invalid email or password combination.";
      default: return "An error occurred. Please try again.";
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // I REMOVED the router.push here so it stays on the same page!
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: new Date().toISOString(),
          totalExamsTaken: 0,
          onboardingComplete: false,
          isPremium: false,
          accountTier: "Free"
        });
        
        // I REMOVED the router.push here too!
      }
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError("Please enter your email address first to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(getFriendlyError(err.code));
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', backgroundColor: '#020617', 
      backgroundImage: 'radial-gradient(circle at 50% -20%, #1e293b, #020617)',
      color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      <div style={{ 
        padding: '50px 40px', borderRadius: '16px', backgroundColor: 'rgba(15, 23, 42, 0.6)', 
        backdropFilter: 'blur(12px)', border: '1px solid rgba(56, 189, 248, 0.2)', 
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.1)',
        width: '100%', maxWidth: '400px', transition: 'all 0.3s ease'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Image 
            src="/Drill (1).png" alt="DRILL Logo" width={64} height={64} 
            style={{ margin: '0 auto 15px', borderRadius: '12px', display: 'block' }} priority
          />
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', letterSpacing: '0.5px', color: '#f8fafc' }}>
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>
            {isLogin ? "Please log in to your account." : "Register to access the platform."}
          </p>
        </div>
        
        {error && (
          <div style={{ 
            padding: '10px 15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', 
            color: '#fca5a5', fontSize: '13px', marginBottom: '20px', borderRadius: '0 4px 4px 0'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
              Email Address
            </label>
            <input 
              type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: 'rgba(2, 6, 23, 0.5)', color: 'white', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'} onBlur={(e) => e.target.style.borderColor = '#334155'} required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                Password
              </label>
              {isLogin && (
                <span onClick={handleReset} style={{ fontSize: '12px', color: '#38bdf8', cursor: 'pointer', opacity: 0.9 }}
                  onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.9}>
                  Forgot Password?
                </span>
              )}
            </div>
            <input 
              type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: 'rgba(2, 6, 23, 0.5)', color: 'white', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'} onBlur={(e) => e.target.style.borderColor = '#334155'} required
            />
          </div>

          <button 
            type="submit" disabled={isLoading} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
            style={{ 
              marginTop: '10px', padding: '14px', borderRadius: '8px', border: 'none', 
              backgroundColor: isLoading ? '#334155' : (isHovered ? '#0ea5e9' : '#0284c7'), 
              color: isLoading ? '#94a3b8' : 'white', fontWeight: '600', 
              cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
              boxShadow: (isHovered && !isLoading) ? '0 0 15px rgba(14, 165, 233, 0.5)' : 'none'
            }}
          >
            {isLoading ? "Please wait..." : (isLogin ? "Log In" : "Create Account")}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
          <p style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer', margin: 0, transition: 'color 0.2s' }} 
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            {isLogin ? "Don't have an account? Sign up." : "Already have an account? Log in."}
          </p>
        </div>

      </div>
    </div>
  );
}