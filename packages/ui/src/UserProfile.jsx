import React from 'react';
import { User, Camera, Shield, Bell, Trash2, Activity, Award, BookOpen } from 'lucide-react';

const UserProfile = ({ 
  fileInputRef, handleImageUpload, profilePic, 
  profileName, setProfileName, profileBio, setProfileBio, 
  handleSaveProfile, isSavingProfile, handleWipeData,
  totalExamsTaken, isPremium, coreSubjects, setCoreSubjects, subjectHierarchy 
}) => {

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* HEADER OVERVIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
        <div onClick={() => fileInputRef.current.click()} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: '#1e293b', border: '2px dashed #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
          {profilePic ? (
            <img src={profilePic} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Camera size={28} color="#3b82f6" />
          )}
        </div>
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
        
        <h2 style={{ margin: '15px 0 5px 0', fontSize: '1.8rem', fontWeight: 'bold' }}>{profileName || "Scholar Profile"}</h2>
        <p style={{ color: '#94a3b8', margin: 0 }}>Manage your personal information</p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>

        {/* THE LIVE STATS ROW */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '10px' }}><Activity color="#38bdf8" size={24} /></div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Exams Taken</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{totalExamsTaken || 0}</p>
            </div>
          </div>
          <div style={{ flex: '1', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px' }}><Award color="#10b981" size={24} /></div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Account Tier</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold', color: isPremium ? '#10b981' : '#f8fafc' }}>
                {isPremium ? 'Premium ⭐' : 'Free Plan'}
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
          <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="e.g. John Doe" style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '8px', marginBottom: '20px', outline: 'none' }} />
          
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Bio</label>
          <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)} placeholder="What are your study goals?" rows="3" style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '8px', outline: 'none', resize: 'none' }} />
        </div>

        {/* 👉 NEW SECTION: MY SUBJECT COMBO */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#f59e0b', fontWeight: 'bold' }}>
            <BookOpen size={18} /> MY SUBJECT COMBO
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>Select the specific subjects you are studying for. We'll filter the rest out of your dashboard.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.keys(subjectHierarchy).map((subjectName) => {
              // Safely handle coreSubjects just in case it is undefined initially
              const safeCoreSubjects = coreSubjects || [];
              const isChecked = safeCoreSubjects.includes(subjectName);
              
              return (
                <label 
                  key={subjectName} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isChecked ? 'rgba(245, 158, 11, 0.15)' : '#020617', padding: '10px 15px', borderRadius: '8px', border: `1px solid ${isChecked ? '#f59e0b' : '#334155'}`, cursor: 'pointer', color: isChecked ? '#fff' : '#cbd5e1', fontSize: '0.9rem', transition: 'all 0.2s' }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCoreSubjects([...safeCoreSubjects, subjectName]);
                      } else {
                        setCoreSubjects(safeCoreSubjects.filter(s => s !== subjectName));
                      }
                    }}
                    style={{ accentColor: '#f59e0b', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  {subjectName}
                </label>
              )
            })}
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button onClick={handleSaveProfile} disabled={isSavingProfile} style={{ width: '100%', background: '#38bdf8', color: '#000', border: 'none', padding: '15px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isSavingProfile ? 'wait' : 'pointer', transition: 'all 0.2s', marginTop: '10px' }}>
          {isSavingProfile ? 'SAVING CHANGES...' : 'SAVE ALL CHANGES'}
        </button>

        {/* SECTION 2: PREFERENCES */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '25px', marginTop: '20px' }}>
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
            <button onClick={handleWipeData} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              <Trash2 size={16} /> DELETE ACCOUNT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;