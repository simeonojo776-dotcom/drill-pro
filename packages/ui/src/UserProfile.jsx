import React from 'react';
import { Camera, Trash2 } from 'lucide-react';

const UserProfile = ({ 
  fileInputRef, handleImageUpload, profilePic, 
  profileName, setProfileName, profileBio, setProfileBio, 
  handleSaveProfile, isSavingProfile, handleWipeData 
}) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #1e293b' }}>
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
        <div 
          onClick={() => fileInputRef.current.click()}
          style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', border: '2px dashed #38bdf8', marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          {profilePic ? <img src={profilePic} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={32} color="#38bdf8" />}
          <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.6rem', textAlign: 'center', padding: '4px 0', fontWeight: 'bold' }}>EDIT</div>
        </div>
        <h2 style={{ margin: 0, color: '#f8fafc', fontWeight: '600', fontSize: '1.8rem' }}>Identity Protocol</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>Configure your operational presence.</p>
      </div>

      <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden', marginBottom: '30px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Scholar Designation (Name)</label>
          <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Enter your handle" style={{ WebkitUserSelect: 'text', userSelect: 'text', width: '100%', background: '#020617', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '1rem', outline: 'none' }} />
        </div>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Mission Statement (Bio)</label>
          <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)} placeholder="What are your academic goals?" rows={3} style={{ WebkitUserSelect: 'text', userSelect: 'text', width: '100%', background: '#020617', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '1rem', outline: 'none', resize: 'vertical' }} />
        </div>
        <div style={{ padding: '15px 20px', background: 'rgba(56, 189, 248, 0.05)' }}>
           <button onClick={handleSaveProfile} disabled={isSavingProfile} style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: isSavingProfile ? 'not-allowed' : 'pointer' }}>
            {isSavingProfile ? 'SYNCING...' : 'SAVE IDENTITY'}
          </button>
        </div>
      </div>

      <div>
         <label style={{ display: 'block', color: '#ef4444', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', marginLeft: '5px' }}>Danger Zone</label>
         <button onClick={handleWipeData} disabled={isSavingProfile} style={{ width: '100%', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: isSavingProfile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.2s' }}>
          <Trash2 size={16} /> RESET ACADEMIC RECORD
        </button>
      </div>
    </div>
  );
};

export default UserProfile;