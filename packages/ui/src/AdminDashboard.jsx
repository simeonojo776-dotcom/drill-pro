import React, { useState } from 'react';
import { Zap, Users, PenTool, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { query, collection, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

const AdminDashboard = ({
  adminTab, setAdminTab,
  fetchAllAppUsers, isFetchingUsers, allAppUsers, exportDatabaseLocal,
  fetchPendingQuestions, isFetchingPending, pendingQuestions, approveQuestion, rejectQuestion,
  subjectHierarchy, handleDeleteSubject, isDeleting,
  handleBulkUpload, isBulkUploading,
  fetchLiveQuestions, isFetchingLive, liveQuestions, currentPage, setCurrentPage,
  handleLocalEdit, saveClassificationUpdate, updatingId
}) => {
  
  // ==========================================
  // ALL STATES MUST BE INSIDE THE COMPONENT
  // ==========================================
  const [selectedUser, setSelectedUser] = useState(null);
  const [userExamHistory, setUserExamHistory] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [globalExamName, setGlobalExamName] = useState("");
  const [globalExamDate, setGlobalExamDate] = useState("");

  // ==========================================
  // ALL FUNCTIONS MUST BE INSIDE THE COMPONENT
  // ==========================================
  
  const handleBroadcastGlobalExam = async () => {
    if (!globalExamName || !globalExamDate) {
      alert("Please enter a name and date for the global exam.");
      return;
    }
    
    if (!window.confirm(`⚠️ Broadcast "${globalExamName}" to EVERY user on the app?`)) return;

    try {
      // Loop through every user and update their document
      for (const u of allAppUsers) {
        const userRef = doc(db, "users", u.id);
        await updateDoc(userRef, {
          examSchedule: arrayUnion({
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            name: globalExamName,
            date: globalExamDate,
            subjectFocus: "GENERAL" // Or let the admin pick this too
          })
        });
      }
      alert("📡 Global Exam successfully broadcasted to all users!");
      setGlobalExamName("");
      setGlobalExamDate("");
    } catch (error) {
      alert("❌ Failed to broadcast global exam.");
    }
  };

  // 1. View User Scores
  const handleSelectUser = async (userRecord) => {
    setSelectedUser(userRecord);
    try {
      // Fetch their specific exam results
      const q = query(collection(db, "examResults"), where("userId", "==", userRecord.id));
      const snap = await getDocs(q);
      const history = [];
      snap.forEach(document => history.push({ id: document.id, ...document.data() }));
      setUserExamHistory(history.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)));
   } catch (err) {
      console.error("Failed to load scores:", err.message);
      alert(`Error loading scores: ${err.message}`);
    }
  };

  // 2. Direct Message User
  const handleSendDirectMessage = async () => {
    if (!adminMessage.trim()) return;
    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        notifications: arrayUnion({
          id: Date.now().toString(),
          title: "Admin Broadcast ⚠️",
          message: adminMessage,
          date: new Date().toISOString(),
          read: false
        })
      });
      alert("✅ Message sent directly to user's Hub!");
      setAdminMessage("");
    } catch (err) { alert("Failed to send message"); }
  };

  // 3. Lock/Unlock Account
  const handleToggleLock = async () => {
    const isCurrentlyLocked = selectedUser.isLocked || false;
    const confirmMsg = isCurrentlyLocked ? "Unlock this account?" : "LOCK this account? They will be unable to use the app.";
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await updateDoc(doc(db, "users", selectedUser.id), { isLocked: !isCurrentlyLocked });
      setSelectedUser({ ...selectedUser, isLocked: !isCurrentlyLocked });
      alert(isCurrentlyLocked ? "Account Unlocked" : "Account Locked 🔒");
    } catch (err) { alert("Action failed"); }
  };

  // 4. Reset User Account
  const handleResetAccount = async () => {
    if (!window.confirm("⚠️ DANGER: Completely wipe this user's stats and history?")) return;
    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        totalExamsTaken: 0,
        totalQuestionsAnswered: 0,
        topicStats: {},
        isPremium: false
      });
      alert("User record wiped clean.");
      setSelectedUser(null); // Close dossier
    } catch (err) { alert("Failed to reset"); }
  };
  // 5. Promote/Revoke Admin Status
  const handleToggleAdmin = async () => {
    const isCurrentlyAdmin = selectedUser.isAdmin || false;
    const confirmMsg = isCurrentlyAdmin 
      ? "Revoke Admin rights? They will become a normal user." 
      : "👑 PROMOTE to Admin? They will have full access to the database and dashboards.";
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await updateDoc(doc(db, "users", selectedUser.id), { isAdmin: !isCurrentlyAdmin });
      setSelectedUser({ ...selectedUser, isAdmin: !isCurrentlyAdmin });
      alert(isCurrentlyAdmin ? "Admin rights revoked." : "User is now an Admin! 👑");
    } catch (err) { alert("Action failed"); }
  };

  // ==========================================
  // UI RENDERING STARTS HERE
  // ==========================================
  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto 100px auto', width: '100%', padding: '0 20px' }}>
      
      {/* MOBILE-FRIENDLY SCROLLABLE TABS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '15px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <button onClick={() => setAdminTab('database')} style={{ background: adminTab === 'database' ? '#38bdf8' : 'transparent', color: adminTab === 'database' ? '#0f172a' : '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <Zap size={18} /> QUESTION BANK
        </button>
        <button onClick={() => { setAdminTab('users'); fetchAllAppUsers(); }} style={{ background: adminTab === 'users' ? '#10b981' : 'transparent', color: adminTab === 'users' ? '#0f172a' : '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <Users size={18} /> USER DIRECTORY
        </button>
        <button onClick={() => { setAdminTab('forge'); fetchPendingQuestions(); }} style={{ background: adminTab === 'forge' ? '#f59e0b' : 'transparent', color: adminTab === 'forge' ? '#0f172a' : '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <PenTool size={18} /> APPROVAL QUEUE
        </button>
      </div>

      {/* 1. QUESTION BANK TAB */}
      {adminTab === 'database' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '40px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ color: '#ef4444', marginTop: 0, width: '100%' }}>Delete Subjects</h3>
            {Object.keys(subjectHierarchy).length === 0 ? <p style={{ color: '#64748b' }}>Empty database.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                {Object.keys(subjectHierarchy).map((mainSub) => (
                  <div key={mainSub} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #1e293b', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#cbd5e1' }}>{mainSub}</span>
                    <button onClick={() => handleDeleteSubject(mainSub)} disabled={isDeleting} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Trash2 size={16} /> DELETE
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed #10b981', borderRadius: '12px', padding: '20px', marginBottom: '40px', textAlign: 'center' }}>
            <h3 style={{ color: '#10b981', margin: '0 0 10px 0' }}>Bulk Import JSON</h3>
            <input type="file" accept=".json" onChange={handleBulkUpload} disabled={isBulkUploading} style={{ display: 'none' }} id="bulk-upload-input" />
            <label htmlFor="bulk-upload-input" style={{ background: '#10b981', color: '#000', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>
              {isBulkUploading ? 'INJECTING...' : 'SELECT FILE'}
            </label>
            <br />
            {/* Added your requested export button here */}
            <button onClick={exportDatabaseLocal} style={{ marginTop: '15px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              EXPORT ENTIRE DB
            </button>
          </div>

          <div style={{ marginTop: '40px', borderTop: '2px dashed #334155', paddingTop: '40px', paddingBottom: '50px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
              <h3 style={{ color: '#38bdf8', margin: 0 }}>Live Editor</h3>
              <button onClick={fetchLiveQuestions} disabled={isFetchingLive} style={{ background: '#334155', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isFetchingLive ? 'PULLING...' : 'PULL LATEST'}
              </button>
            </div>

            {liveQuestions.length > 0 && (
              <>
                <div style={{ overflowX: 'auto', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff', minWidth: '600px' }}>
                    <thead style={{ background: '#1e293b' }}>
                      <tr>
                        <th style={{ padding: '15px', borderBottom: '1px solid #334155', width: '45%' }}>Question</th>
                        <th style={{ padding: '15px', borderBottom: '1px solid #334155' }}>Subject</th>
                        <th style={{ padding: '15px', borderBottom: '1px solid #334155' }}>Sub-Topic</th>
                        <th style={{ padding: '15px', borderBottom: '1px solid #334155' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveQuestions.slice((currentPage - 1) * 10, currentPage * 10).map((q) => (
                        <tr key={q.id} style={{ borderBottom: '1px solid #1e293b' }}>
                          <td style={{ padding: '15px', fontSize: '0.85rem', color: '#cbd5e1' }}>{q.q.substring(0, 60)}...</td>
                          <td style={{ padding: '15px' }}><input type="text" value={q.subject || ""} onChange={(e) => handleLocalEdit(q.id, 'subject', e.target.value)} style={{ padding: '6px', background: '#020617', color: '#fff', border: '1px solid #334155', width: '100%' }} /></td>
                          <td style={{ padding: '15px' }}><input type="text" value={q.subTopic || ""} onChange={(e) => handleLocalEdit(q.id, 'subTopic', e.target.value)} style={{ padding: '6px', background: '#020617', color: '#fff', border: '1px solid #334155', width: '100%' }} /></td>
                          <td style={{ padding: '15px' }}><button onClick={() => saveClassificationUpdate(q.id, q.subject, q.subTopic)} disabled={updatingId === q.id} style={{ padding: '6px 12px', background: '#10b981', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>{updatingId === q.id ? '...' : 'SAVE'}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '8px 15px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>PREV</button>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Page {currentPage} of {Math.ceil(liveQuestions.length / 10)}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(liveQuestions.length / 10), p + 1))} disabled={currentPage === Math.ceil(liveQuestions.length / 10)} style={{ padding: '8px 15px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>NEXT</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. USER DIRECTORY TAB */}
      {adminTab === 'users' && (
          <div>
            <button onClick={fetchAllAppUsers} disabled={isFetchingUsers} style={{ width: '100%', padding: '15px', background: '#1e293b', border: '1px solid #3b82f6', color: '#fff', borderRadius: '12px', cursor: 'pointer', marginBottom: '20px' }}>
              {isFetchingUsers ? 'SCANNING...' : 'LOAD ALL USERS'}
            </button>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <h4 style={{ color: '#f59e0b', margin: '0 0 10px 0' }}>Broadcast Global Exam</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Exam Name (e.g. PHY101 Mock)" value={globalExamName} onChange={(e) => setGlobalExamName(e.target.value)} style={{ flex: '1 1 200px', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
              <input type="date" value={globalExamDate} onChange={(e) => setGlobalExamDate(e.target.value)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
              <button onClick={handleBroadcastGlobalExam} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>PUSH</button>
            </div>
          </div>

            {/* If a user is clicked, show the Dossier */}
            {selectedUser ? (
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
                <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', marginBottom: '15px' }}>← Back to List</button>
                <h3 style={{ color: '#fff', margin: '0 0 5px 0' }}>{selectedUser.displayName || selectedUser.email}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px 0' }}>Status: {selectedUser.isPremium ? 'Premium' : 'Standard'} | Locked: {selectedUser.isLocked ? 'YES 🔒' : 'NO'}</p>

                {/* Direct Message */}
                <div style={{ marginBottom: '20px' }}>
                  <input type="text" placeholder="Type a direct message to this user..." value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px', marginBottom: '10px' }} />
                  <button onClick={handleSendDirectMessage} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>Send Alert</button>
                </div>

                {/* God Mode Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {/* 👉 NEW ADMIN BUTTON */}
                  <button onClick={handleToggleAdmin} style={{ background: selectedUser.isAdmin ? '#334155' : '#a855f7', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {selectedUser.isAdmin ? 'REVOKE ADMIN' : 'MAKE ADMIN 👑'}
                  </button>

                  <button onClick={handleToggleLock} style={{ background: selectedUser.isLocked ? '#10b981' : '#f59e0b', color: '#000', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {selectedUser.isLocked ? 'UNLOCK ACCOUNT' : 'LOCK ACCOUNT'}
                  </button>
                  <button onClick={handleResetAccount} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>WIPE DATA</button>
                
                  
                </div>

                {/* Exam Scores */}
                <h4 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>Recent Exam Scores</h4>
                {userExamHistory.length === 0 ? <p style={{ color: '#64748b' }}>No exams taken yet.</p> : (
                  userExamHistory.map(exam => (
                    <div key={exam.id} style={{ padding: '10px 0', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#cbd5e1' }}>{new Date(exam.completedAt).toLocaleDateString()}</span>
                      <strong style={{ color: exam.percentage >= 50 ? '#10b981' : '#ef4444' }}>{exam.score}/{exam.totalQuestions} ({exam.percentage}%)</strong>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* The User List */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {allAppUsers.map(u => (
                  <div key={u.id} onClick={() => handleSelectUser(u)} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', borderLeft: `4px solid ${u.isPremium ? '#f59e0b' : '#334155'}`, cursor: 'pointer' }}>
                    <p style={{ margin: '0 0 5px 0', color: '#fff', fontWeight: 'bold' }}>{u.displayName || u.email || 'Unknown Scholar'}</p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>Exams Taken: {u.totalExamsTaken || 0}</p>
                    {u.isLocked && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '5px 0 0 0', fontWeight: 'bold' }}>🔒 LOCKED</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* 3. APPROVAL QUEUE TAB */}
      {adminTab === 'forge' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ color: '#f59e0b', margin: 0, fontSize: '1.5rem' }}>Community Approval Queue</h3>
              <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Approve valid questions to grant users Premium.</p>
            </div>
            <button onClick={fetchPendingQuestions} disabled={isFetchingPending} style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isFetchingPending ? 'SCANNING...' : 'REFRESH QUEUE'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {pendingQuestions.length === 0 && !isFetchingPending ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#0f172a', borderRadius: '12px', border: '1px dashed #334155', color: '#64748b' }}>
                No pending questions in the queue.
              </div>
            ) : (
              pendingQuestions.map(pq => (
                <div key={pq.id} style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', position: 'relative' }}>
                   <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                     {pq.subject} • SUBMITTED BY: {pq.userName}
                   </div>
                   <p style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 15px 0' }}>{pq.q}</p>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                     {pq.options.map((o, i) => (
                       <div key={i} style={{ background: '#020617', padding: '10px', borderRadius: '6px', color: '#cbd5e1', border: o === pq.answer ? '1px solid #10b981' : '1px solid #334155' }}>
                         {o} {o === pq.answer && <span style={{ color: '#10b981', fontWeight: 'bold', marginLeft: '5px' }}>(CORRECT)</span>}
                       </div>
                     ))}
                   </div>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', borderTop: '1px solid #1e293b', paddingTop: '15px' }}>
                     <button onClick={() => approveQuestion(pq)} style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                       <CheckCircle size={18} /> APPROVE (+1 HR PREMIUM)
                     </button>
                    <button onClick={() => rejectQuestion(pq)} style={{ flex: '1 1 200px' , display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                       <XCircle size={18} /> REJECT & DELETE
                     </button>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;