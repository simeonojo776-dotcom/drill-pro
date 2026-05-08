import React from 'react';
import { Users } from 'lucide-react';

const SharedArena = ({ joinCode, setJoinCode, handleJoinSharedExam, isJoining }) => {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', marginBottom: '15px' }}>
          <Users size={32} color="#ec4899" />
        </div>
        <h2 style={{ margin: 0, color: '#ec4899', letterSpacing: '1px', fontSize: '1.8rem' }}>Shared Arena</h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '10px' }}>Did a friend challenge you? Paste their exam code below to take their exact test.</p>
      </div>

      <div style={{ background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #1e293b' }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Exam Code / Link</label>
        <input 
          type="text" 
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="e.g. 5xYz9AqP..."
          style={{ WebkitUserSelect: 'text', userSelect: 'text', width: '100%', background: '#020617', border: '1px solid #334155', color: '#fff', padding: '15px', borderRadius: '8px', fontSize: '1.2rem', outline: 'none', marginBottom: '20px', textAlign: 'center', letterSpacing: '2px' }}
        />
        
        <button 
          onClick={handleJoinSharedExam}
          disabled={isJoining || !joinCode}
          style={{ width: '100%', background: '#ec4899', color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: (isJoining || !joinCode) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: (isJoining || !joinCode) ? 0.5 : 1 }}
        >
          {isJoining ? 'LOCATING EXAM...' : 'JOIN ARENA'}
        </button>
      </div>
    </div>
  );
};

export default SharedArena;