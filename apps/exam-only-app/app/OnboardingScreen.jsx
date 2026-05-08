import React, { useState } from 'react';
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@repo/ui/firebase";

// A set of sci-fi/academic icons for the user to choose from
const AVATARS = ['🚀', '⚡', '🧠', '🔬', '🔥', '💻', '🪐', '🧬'];

export const OnboardingScreen = ({ onComplete }) => {
  const [displayName, setDisplayName] = useState('');
  const [primaryFocus, setPrimaryFocus] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    // Prevent saving if they haven't filled it out
    if (!displayName || !primaryFocus) {
      alert("Please enter a name and select a focus track.");
      return;
    }

    setIsSaving(true);
    try {
      // Point directly to this user's profile in the database
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      // Save their choices and permanently flag onboarding as complete
      await updateDoc(userRef, {
        displayName: displayName,
        focusTrack: primaryFocus,
        avatar: selectedAvatar,
        onboardingComplete: true
      });

      // Trigger the switchboard to let them into the main app
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please check your connection.");
      setIsSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        <h1 style={{ fontSize: '28px', margin: '0 0 10px 0', color: '#f8fafc', textAlign: 'center', letterSpacing: '1px' }}>
          WELCOME TO DRILL
        </h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '30px', fontSize: '14px' }}>
          Initialize your operative profile.
        </p>

        {/* AVATAR SELECTOR */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '10px', color: '#cbd5e1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Operative Icon
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedAvatar(emoji)}
                style={{
                  fontSize: '24px',
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  border: selectedAvatar === emoji ? '2px solid #38bdf8' : '2px solid transparent',
                  backgroundColor: selectedAvatar === emoji ? 'rgba(56, 189, 248, 0.1)' : '#0f172a',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* NAME INPUT */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Display Name
          </label>
          <input 
            type="text" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. John Doe or 'Vector'"
            style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '16px', outline: 'none' }}
          />
        </div>

        {/* FOCUS TRACK SELECTOR */}
        <div style={{ marginBottom: '35px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Primary Focus
          </label>
          <select 
            value={primaryFocus}
            onChange={(e) => setPrimaryFocus(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '16px', outline: 'none' }}
          >
           // Replace the old options in OnboardingScreen.jsx with these:
<option value="">Select a discipline...</option>
<option value="physics">Advanced Physics</option>
<option value="chemistry">Chemistry</option>
<option value="biology">Biology</option>
<option value="mathematics">Mathematics</option>
<option value="general">General CBT</option>
          </select>
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          onClick={handleSaveProfile}
          disabled={isSaving}
          style={{ width: '100%', padding: '16px', borderRadius: '8px', background: isSaving ? '#475569' : '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '16px', letterSpacing: '1px' }}
        >
          {isSaving ? 'SYNCING...' : 'INITIALIZE PROFILE'}
        </button>

      </div>
    </div>
  );
};