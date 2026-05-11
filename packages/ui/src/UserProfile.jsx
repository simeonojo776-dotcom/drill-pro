import React, { useState, useEffect } from 'react';
import { User, Camera, Shield, Bell, Trash2, Activity, Award } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust this path if your firebase.js is elsewhere

const UserProfile = ({ user, userData }) => {
  const [localName, setLocalName] = useState("");
  const [localBio, setLocalBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when userData loads
  useEffect(() => {
    if (userData) {
      setLocalName(userData.displayName || "");
      setLocalBio(userData.bio || "");
    }
  }, [userData]);

  const handleSaveChanges = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: localName,
        bio: localBio
      });
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("❌ Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* HEADER OVERVIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: '#1e293b', border: '2px dashed #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Camera size={28} color="#3b82f6" />
          )}
        </div>
        <h2 style={{ margin: '15px 0 5px 0', fontSize: '1.8rem', fontWeight: 'bold' }}>{localName || "Scholar Profile"}</h2>
        <p style={{ color: '#94a3b8', margin: 0 }}>{userData?.email}</p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        
        {/* 👉 NEW: STATS OVERVIEW CARD */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '10px' }}><Activity color="#38bdf8" size={24} /></div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Exams Taken</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{userData?.totalExamsTaken || 0}</p>
            </div>
          </div>
          <div style={{ flex: '1', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px' }}><Award color="#10b981" size={24} /></div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Account Tier</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold', color: userData?.isPremium ? '#10b981' : '#f8fafc' }}>
                {userData?.isPremium ? 'Premium ⭐' : 'Free Plan'}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: BASIC INFO */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#38bdf8', fontWeight: 'bold' }}>
            <User size={18} /> PERSONAL INFORMATION
          </div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Display Name</label>
          <input type="text" value={localName} onChange={(e) => setLocalName(e.target.value)} placeholder="e.g. John Doe" style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '8px', marginBottom: '20px', outline: 'none' }} />
          
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Bio</label>
          <textarea value={localBio} onChange={(e) => setLocalBio(e.target.value)} placeholder="What are your study goals?" rows="3" style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '8px', outline: 'none', resize: 'none' }} />
          
          <button onClick={handleSaveChanges} disabled={isSaving} style={{ marginTop: '20px', background: '#38bdf8', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: isSaving ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>

        {/* SECTION 2: PREFERENCES */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#10b981', fontWeight: 'bold' }}>
            <Bell size={18} /> APP PREFERENCES
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #1e293b' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Sound Effects</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Play sounds when interacting with the CBT.</p>
            </div>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }} />
          </div>
        </div>

        {/* SECTION 3: SECURITY & DANGER ZONE */}
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '25px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#ef4444', fontWeight: 'bold' }}>
            <Shield size={18} /> DANGER ZONE
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#e2e8f0' }}>Delete Account</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Permanently wipe all your exam history and data.</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              <Trash2 size={16} /> DELETE ACCOUNT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;