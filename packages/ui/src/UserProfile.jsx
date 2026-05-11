import React from 'react';
import { User, Camera, Shield, Bell, Trash2 } from 'lucide-react';

const UserProfile = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* HEADER OVERVIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: '#334155', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Camera size={28} color="#94a3b8" />
        </div>
        <h2 style={{ margin: '15px 0 5px 0', fontSize: '1.8rem', fontWeight: 'bold' }}>Profile Settings</h2>
        <p style={{ color: '#94a3b8', margin: 0 }}>Manage your personal information and preferences.</p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        
        {/* SECTION 1: BASIC INFO */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#f8fafc', fontWeight: '600', fontSize: '1.1rem' }}>
            <User size={20} color="#3b82f6" /> Personal Information
          </div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '500', marginBottom: '8px' }}>Full Name</label>
          <input type="text" defaultValue="admin" style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '8px', marginBottom: '20px', outline: 'none', fontSize: '1rem' }} />
          
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '500', marginBottom: '8px' }}>Bio</label>
          <textarea defaultValue="To prosper" rows="3" style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '8px', outline: 'none', resize: 'none', fontSize: '1rem' }} />
          
          <button style={{ marginTop: '20px', background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>Save Changes</button>
        </div>

        {/* SECTION 2: PREFERENCES */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#f8fafc', fontWeight: '600', fontSize: '1.1rem' }}>
            <Bell size={20} color="#10b981" /> App Preferences
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155' }}>
            <div>
              <p style={{ margin: 0, fontWeight: '500', color: '#f8fafc' }}>Study Reminders</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Receive daily push notifications to keep your streak.</p>
            </div>
            <input type="checkbox" style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
            <div>
              <p style={{ margin: 0, fontWeight: '500', color: '#f8fafc' }}>Sound Effects</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Play sounds when answering questions correctly.</p>
            </div>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }} />
          </div>
        </div>

        {/* SECTION 3: SECURITY & DANGER ZONE */}
        <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: '12px', padding: '25px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#ef4444', fontWeight: '600', fontSize: '1.1rem' }}>
            <Shield size={20} /> Danger Zone
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <p style={{ margin: 0, fontWeight: '500', color: '#f8fafc' }}>Delete Account</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Permanently wipe all your exam history and data.</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;