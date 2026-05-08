import React from 'react';

const NotificationCenter = ({ notifications, markAsRead }) => {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.8rem' }}>Command Briefings</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px', border: '1px dashed #1e293b', borderRadius: '12px' }}>No new briefings.</p>
        ) : (
          notifications.sort((a, b) => new Date(b.date) - new Date(a.date)).map(n => (
            <div 
              key={n.id} 
              onClick={() => markAsRead(n.id)}
              style={{ background: n.read ? '#0f172a' : '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${n.title.includes('Approved') ? '#10b981' : (n.title.includes('Rejected') ? '#ef4444' : '#38bdf8')}`, cursor: 'pointer', transition: '0.2s', borderTop: '1px solid #1e293b', borderRight: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: n.read ? '#64748b' : '#fff', fontSize: '1.1rem' }}>{n.title}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(n.date).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: n.read ? '#475569' : '#cbd5e1', lineHeight: '1.5' }}>{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;