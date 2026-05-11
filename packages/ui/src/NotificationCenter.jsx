import React, { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { BellRing, Bell } from 'lucide-react';

const NotificationCenter = ({ notifications, markAsRead }) => {
  
  useEffect(() => {
    // 1. Initialize quietly in the background. No pop-ups!
    OneSignal.init({
      appId: "15f1f97f-d972-4982-b3a6-9405b8841015", 
      allowLocalhostAsSecureOrigin: true,
    });
  }, []);

  const handleEnablePush = async () => {
    // 2. THE FIX: This triggers the quiet, native browser permission
    // only when they actually click the button. No spammy slide-down ad.
    await OneSignal.Notifications.requestPermission();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Bell size={28} color="#fff" />
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem' }}>Notifications</h2>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(59, 130, 246, 0.1))', border: '1px solid #38bdf8', padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h4 style={{ color: '#38bdf8', margin: '0 0 5px 0', fontSize: '1.1rem' }}>Study Reminders</h4>
          <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.9rem' }}>Enable push notifications to get reminded about upcoming exams.</p>
        </div>
        <button onClick={handleEnablePush} style={{ background: '#38bdf8', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BellRing size={18} /> ENABLE
        </button>
      </div>

      {/* ... your existing notification list code below ... */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px', border: '1px dashed #334155', borderRadius: '12px' }}>No new notifications.</p>
        ) : (
          notifications.sort((a, b) => new Date(b.date) - new Date(a.date)).map(n => (
            <div 
              key={n.id} 
              onClick={() => markAsRead(n.id)}
              style={{ background: n.read ? '#0f172a' : '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${n.title.includes('Approved') ? '#10b981' : (n.title.includes('Rejected') ? '#ef4444' : '#38bdf8')}`, cursor: 'pointer', transition: '0.2s', borderTop: '1px solid #1e293b', borderRight: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: n.read ? '#94a3b8' : '#f8fafc', fontSize: '1.05rem' }}>{n.title}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(n.date).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: n.read ? '#64748b' : '#cbd5e1', lineHeight: '1.5' }}>{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;