import React, { useEffect } from 'react';
import { Users, Mic, MicOff, Play, ShieldAlert, BookOpen, Copy } from 'lucide-react';
import { useAgoraRoom } from './useAgoraRoom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase'; // Ensure your path to firebase is correct

const LiveClassroom = ({ 
  joinCode, setJoinCode, handleLocateClassroom, isJoining, 
  roomDetails, currentUser, handleCommenceExam 
}) => {
  
  const { isConnected, activePeers, isMicMuted, toggleMic, localUid } = useAgoraRoom(
    roomDetails?.id || null, 
    currentUser?.displayName || 'Scholar',
    roomDetails?.mode || 'collaborate'
  );

  // 👉 THE NAME ENGINE: Register the user's integer UID and real name to the Firebase Room
  useEffect(() => {
    if (localUid && roomDetails?.id && currentUser) {
      const registerUser = async () => {
        try {
          await updateDoc(doc(db, "sharedExams", roomDetails.id), {
            participants: arrayUnion({
              uid: localUid,
              name: currentUser.displayName || 'Scholar',
              firebaseId: currentUser.uid
            })
          });
        } catch (error) { console.error("Failed to register name in lobby"); }
      };
      registerUser();
    }
    // eslint-disable-next-line
  }, [localUid, roomDetails?.id]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomDetails.id);
    alert(`✅ Access Code Copied: ${roomDetails.id}`);
  };

  // ==========================================
  // VIEW 1: JOIN SCREEN (Unchanged)
  // ==========================================
  if (!roomDetails) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '15px' }}>
            <Users size={32} color="#3b82f6" />
          </div>
          <h2 style={{ margin: 0, color: '#3b82f6', letterSpacing: '1px', fontSize: '1.8rem' }}>Live Classroom</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '10px' }}>Join a peer-hosted study session or create your own.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #1e293b' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Join with Access Code</label>
            <input 
              type="text" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="e.g. 5xYz9AqP..."
              style={{ width: '100%', background: '#020617', border: '1px solid #334155', color: '#fff', padding: '15px', borderRadius: '8px', fontSize: '1.2rem', outline: 'none', marginBottom: '20px', textAlign: 'center', letterSpacing: '2px' }}
            />
            <button 
              onClick={handleLocateClassroom}
              disabled={isJoining || !joinCode}
              style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: (isJoining || !joinCode) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: (isJoining || !joinCode) ? 0.5 : 1 }}
            >
              {isJoining ? 'LOCATING SESSION...' : 'ENTER CLASSROOM'}
            </button>
          </div>

          <div style={{ textAlign: 'center', position: 'relative', margin: '10px 0' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#1e293b', zIndex: 1 }}></div>
            <span style={{ position: 'relative', background: '#020617', padding: '0 15px', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold', zIndex: 2 }}>OR</span>
          </div>

          <button 
            onClick={() => handleCommenceExam('create')} 
            style={{ width: '100%', background: 'transparent', color: '#38bdf8', border: '2px solid #38bdf8', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            HOST A NEW SESSION
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE WAITING LOBBY
  // ==========================================
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* ACCESS CODE BANNER FOR HOST */}
      <div style={{ background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))', border: '1px solid #3b82f6', borderRadius: '12px', padding: '15px 25px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Session Access Code</span>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px' }}>{roomDetails.id}</div>
        </div>
        <button onClick={copyCode} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <Copy size={16} /> COPY
        </button>
      </div>

      {/* Lobby Header */}
      <div style={{ background: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.5rem' }}>{roomDetails.creatorName}'s Session</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                <BookOpen size={14} /> STUDY GROUP
            </span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{roomDetails.questions?.length || 0} Questions</span>
          </div>
        </div>

        {/* Audio Controls */}
        <button 
          onClick={toggleMic}
          disabled={!isConnected}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: isMicMuted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: isMicMuted ? '#ef4444' : '#3b82f6', border: `1px solid ${isMicMuted ? '#ef4444' : '#3b82f6'}`, borderRadius: '8px', cursor: isConnected ? 'pointer' : 'wait', fontWeight: 'bold', opacity: isConnected ? 1 : 0.5 }}
        >
          {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
          {isConnected ? (isMicMuted ? 'MIC MUTED' : 'MIC ACTIVE') : 'CONNECTING...'}
        </button>
      </div>

      {/* Connected Peers List */}
      <div style={{ background: '#020617', padding: '25px', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 0, marginBottom: '20px' }}>Participants</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          {/* Local User */}
          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isMicMuted ? '#ef4444' : '#10b981' }} />
            <span style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '0.9rem' }}>You</span>
          </div>

          {/* 👉 DYNAMIC REMOTE USERS */}
          {activePeers.map(peer => {
            // Check Firebase room details for this user's real name based on their Agora integer UID
            const participantData = roomDetails?.participants?.find(p => p.uid === peer.uid);
            const displayName = participantData ? participantData.name : `Connecting...`;

            return (
              <div key={peer.uid} style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Controls */}
      {currentUser?.uid === roomDetails.creatorId ? (
        <button 
          onClick={handleCommenceExam}
          style={{ width: '100%', background: '#10b981', color: '#000', border: 'none', padding: '18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }}
        >
          <Play fill="#000" size={20} /> COMMENCE EXAM FOR ALL
        </button>
      ) : (
        <div style={{ width: '100%', background: '#1e293b', color: '#94a3b8', padding: '18px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', border: '1px dashed #334155' }}>
          WAITING FOR HOST TO COMMENCE EXAM...
        </div>
      )}

    </div>
  );
};

export default LiveClassroom;