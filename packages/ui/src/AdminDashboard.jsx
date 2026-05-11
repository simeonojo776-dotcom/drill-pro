import React, { useState } from 'react';
import { Zap, Users, PenTool, Trash2, CheckCircle, XCircle, AlertTriangle, Filter, Search, MessageSquare  } from 'lucide-react';
import { query, collection, where, getDocs, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
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
  const [feedbackInbox, setFeedbackInbox] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userExamHistory, setUserExamHistory] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [globalExamName, setGlobalExamName] = useState("");
  const [globalExamDate, setGlobalExamDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [reportedQuestions, setReportedQuestions] = useState([]);
  const [isFetchingReports, setIsFetchingReports] = useState(false);

  const [questionFilter, setQuestionFilter] = useState('all');
  const [questionSearchTerm, setQuestionSearchTerm] = useState("");

  // 👉 NEW: THE BUG BOUNTY REWARD SYSTEM
  const rewardBugHunter = async (userId, userName) => {
    if (!userId) {
      alert("⚠️ Legacy feedback detected: No user ID attached to this message.");
      return;
    }
    const confirmReward = window.confirm(`Give 1-Month Premium to ${userName} for their bug report?`);
    if (!confirmReward) return;

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isPremium: true,
        accountTier: "Premium", // Keep synced with your other systems
        notifications: arrayUnion({
          id: Date.now().toString(),
          title: "Bug Bounty Rewarded! 🐛🏆",
          message: "Your recent bug report was verified by the developers! As a massive thank you for helping improve the app, you've been granted Brilliance Pro status.",
          date: new Date().toISOString(),
          read: false
        })
      });
      alert(`✅ Successfully granted Premium to ${userName} and sent them a notification!`);
    } catch (error) {
      console.error("Reward Error:", error);
      alert("❌ Failed to reward user. Check your connection.");
    }
  };

  const fetchReportedQuestions = async () => {
    setIsFetchingReports(true);
    try {
      const q = query(collection(db, "reported_questions"));
      const snapshot = await getDocs(q);
      const reports = [];
      snapshot.forEach(document => reports.push({ id: document.id, ...document.data() }));
      setReportedQuestions(reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsFetchingReports(false);
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      await deleteDoc(doc(db, "reported_questions", reportId));
      setReportedQuestions(prev => prev.filter(r => r.id !== reportId));
    } catch (e) {
      alert("❌ Failed to dismiss report.");
    }
  };

  const handleDeleteReportedQuestion = async (reportId, questionId) => {
    if(!window.confirm("⚠️ DANGER: Delete this question from the official bank AND dismiss the report?")) return;
    try {
      if(questionId && questionId !== "ID_MISSING" && questionId !== "unknown") {
         await deleteDoc(doc(db, "official_cbt_bank", questionId));
      }
      await deleteDoc(doc(db, "reported_questions", reportId));
      setReportedQuestions(prev => prev.filter(r => r.id !== reportId));
      alert("🗑️ Question permanently deleted from bank.");
    } catch(e) {
      alert("❌ Failed to delete question.");
    }
  };

  const fetchFeedback = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "user_feedback"));
      const fetched = [];
      querySnapshot.forEach((doc) => { fetched.push({ id: doc.id, ...doc.data() }); });
      // Sort newest first
      setFeedbackInbox(fetched.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) { 
      console.error("Failed to fetch feedback:", error); 
    }
  };

  const handleBroadcastGlobalExam = async () => {
    if (!globalExamName || !globalExamDate) {
      alert("Please enter a name and date for the global exam.");
      return;
    }
    
    if (!window.confirm(`⚠️ Broadcast "${globalExamName}" to EVERY user on the app?`)) return;

    try {
      for (const u of allAppUsers) {
        const userRef = doc(db, "users", u.id);
        await updateDoc(userRef, {
          examSchedule: arrayUnion({
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            name: globalExamName,
            date: globalExamDate,
            subjectFocus: "GENERAL"
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

  const handleSelectUser = async (userRecord) => {
    setSelectedUser(userRecord);
    try {
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
      setSelectedUser(null);
    } catch (err) { alert("Failed to reset"); }
  };

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

  const handleMakePremium = async () => {
    const isCurrentlyPremium = selectedUser.isPremium || false;
    const confirmMsg = isCurrentlyPremium 
      ? "Revoke Premium status? They will be returned to the Free tier." 
      : "⭐ GRANT PREMIUM? They will bypass Paystack and get full access.";
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await updateDoc(doc(db, "users", selectedUser.id), { 
        isPremium: !isCurrentlyPremium,
        accountTier: !isCurrentlyPremium ? "Premium" : "Free"
      });
      setSelectedUser({ 
        ...selectedUser, 
        isPremium: !isCurrentlyPremium,
        accountTier: !isCurrentlyPremium ? "Premium" : "Free" 
      });
      alert(isCurrentlyPremium ? "Premium Revoked." : "User is now Premium! ⭐");
    } catch (err) { alert("Action failed"); }
  };

  const filteredUsers = allAppUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const emailMatch = user.email && user.email.toLowerCase().includes(searchLower);
    const nameMatch = user.displayName && user.displayName.toLowerCase().includes(searchLower);
    return emailMatch || nameMatch;
  });

  const displayedQuestions = liveQuestions.filter(q => {
    if (questionFilter === 'bot' && !q.isAiGenerated) return false;
    if (questionFilter === 'user' && q.isAiGenerated) return false;

    if (questionSearchTerm) {
      const searchLower = questionSearchTerm.toLowerCase();
      const qTextMatch = q.q && q.q.toLowerCase().includes(searchLower);
      const qSubjectMatch = q.subject && q.subject.toLowerCase().includes(searchLower);
      const qSubTopicMatch = q.subTopic && q.subTopic.toLowerCase().includes(searchLower);
      
      if (!qTextMatch && !qSubjectMatch && !qSubTopicMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto 100px auto', width: '100%', padding: '0 20px' }}>
      
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
        <button onClick={() => { setAdminTab('reports'); fetchReportedQuestions(); }} style={{ background: adminTab === 'reports' ? '#ef4444' : 'transparent', color: adminTab === 'reports' ? '#0f172a' : '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <AlertTriangle size={18} /> REPORTED ISSUES
        </button>
        <button onClick={() => { setAdminTab('feedback'); fetchFeedback(); }} style={{ background: adminTab === 'feedback' ? '#8b5cf6' : 'transparent', color: adminTab === 'feedback' ? '#0f172a' : '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <MessageSquare size={18} /> FEEDBACK INBOX
        </button>
      </div>

      {/* 1. QUESTION BANK TAB */}
      {adminTab === 'database' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          
          {liveQuestions.length > 0 && (
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>{liveQuestions.length}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '1px', marginTop: '5px' }}>TOTAL VAULTED</div>
              </div>
              <div style={{ flex: '1', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #c084fc', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c084fc' }}>{liveQuestions.filter(q => q.isAiGenerated).length}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '1px', marginTop: '5px' }}>🤖 DRILL AI QUESTIONS</div>
              </div>
              <div style={{ flex: '1', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{liveQuestions.filter(q => !q.isAiGenerated).length}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '1px', marginTop: '5px' }}>👤 USER UPLOADS</div>
              </div>
            </div>
          )}

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
            <button onClick={exportDatabaseLocal} style={{ marginTop: '15px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              EXPORT ENTIRE DB
            </button>
          </div>

          <div style={{ marginTop: '40px', borderTop: '2px dashed #334155', paddingTop: '40px', paddingBottom: '50px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
              <h3 style={{ color: '#38bdf8', margin: 0 }}>Live Editor</h3>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {liveQuestions.length > 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0 10px', minWidth: '220px' }}>
                      <Search size={16} color="#94a3b8" />
                      <input 
                        type="text" 
                        placeholder="Search subjects or questions..." 
                        value={questionSearchTerm}
                        onChange={(e) => { setQuestionSearchTerm(e.target.value); setCurrentPage(1); }}
                        style={{ background: 'transparent', color: '#fff', border: 'none', padding: '10px', outline: 'none', width: '100%' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0 10px' }}>
                      <Filter size={16} color="#94a3b8" />
                      <select value={questionFilter} onChange={(e) => { setQuestionFilter(e.target.value); setCurrentPage(1); }} style={{ background: 'transparent', color: '#fff', border: 'none', padding: '10px', outline: 'none', cursor: 'pointer' }}>
                        <option value="all">View All Vaults</option>
                        <option value="bot">🤖 Drill AI Only</option>
                        <option value="user">👤 User Uploads Only</option>
                      </select>
                    </div>
                  </>
                )}
                <button onClick={fetchLiveQuestions} disabled={isFetchingLive} style={{ background: '#334155', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isFetchingLive ? 'PULLING...' : 'PULL LATEST'}
                </button>
              </div>
            </div>

            {liveQuestions.length > 0 && (
              <>
                <div style={{ overflowX: 'auto', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff', minWidth: '700px' }}>
                    <thead style={{ background: '#1e293b' }}>
                      <tr>
                        <th style={{ padding: '15px', borderBottom: '1px solid #334155', width: '45%' }}>Question</th>
                        <th style={{ padding: '15px', borderBottom: '1px solid #334155' }}>Subject</th>
                        <th style={{ padding: '15px', borderBottom: '1px solid #334155' }}>Sub-Topic</th>
                        <th style={{ padding: '15px', borderBottom: '1px solid #334155' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedQuestions.slice((currentPage - 1) * 10, currentPage * 10).map((q) => (
                        <tr key={q.id} style={{ borderBottom: '1px solid #1e293b' }}>
                          <td style={{ padding: '15px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                            <span style={{ display: 'inline-block', marginBottom: '8px', fontSize: '0.65rem', background: q.isAiGenerated ? 'rgba(139, 92, 246, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: q.isAiGenerated ? '#c084fc' : '#38bdf8', padding: '2px 8px', borderRadius: '10px', border: `1px solid ${q.isAiGenerated ? '#c084fc' : '#38bdf8'}` }}>
                              {q.isAiGenerated ? '🤖 AI' : '👤 User'}
                            </span>
                            <br />
                            {q.q.substring(0, 60)}...
                          </td>
                          <td style={{ padding: '15px' }}><input type="text" value={q.subject || ""} onChange={(e) => handleLocalEdit(q.id, 'subject', e.target.value)} style={{ padding: '6px', background: '#020617', color: '#fff', border: '1px solid #334155', width: '100%' }} /></td>
                          <td style={{ padding: '15px' }}><input type="text" value={q.subTopic || ""} onChange={(e) => handleLocalEdit(q.id, 'subTopic', e.target.value)} style={{ padding: '6px', background: '#020617', color: '#fff', border: '1px solid #334155', width: '100%' }} /></td>
                          <td style={{ padding: '15px' }}><button onClick={() => saveClassificationUpdate(q.id, q.subject, q.subTopic)} disabled={updatingId === q.id} style={{ padding: '6px 12px', background: '#10b981', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>{updatingId === q.id ? '...' : 'SAVE'}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {displayedQuestions.length === 0 && (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No questions found matching your search.</div>
                  )}
                </div>
                
                {displayedQuestions.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '8px 15px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>PREV</button>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Page {currentPage} of {Math.ceil(displayedQuestions.length / 10)}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(displayedQuestions.length / 10), p + 1))} disabled={currentPage === Math.ceil(displayedQuestions.length / 10)} style={{ padding: '8px 15px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>NEXT</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. USER DIRECTORY TAB */}
      {adminTab === 'users' && (
          <div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button onClick={fetchAllAppUsers} disabled={isFetchingUsers} style={{ flex: '1 1 200px', padding: '15px', background: '#1e293b', border: '1px solid #3b82f6', color: '#fff', borderRadius: '12px', cursor: 'pointer' }}>
                {isFetchingUsers ? 'SCANNING...' : 'LOAD ALL USERS'}
              </button>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: '2 1 300px', padding: '15px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '12px', outline: 'none' }}
              />
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <h4 style={{ color: '#f59e0b', margin: '0 0 10px 0' }}>Broadcast Global Exam</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Exam Name (e.g. PHY101 Mock)" value={globalExamName} onChange={(e) => setGlobalExamName(e.target.value)} style={{ flex: '1 1 200px', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
              <input type="date" value={globalExamDate} onChange={(e) => setGlobalExamDate(e.target.value)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
              <button onClick={handleBroadcastGlobalExam} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>PUSH</button>
            </div>
          </div>

            {selectedUser ? (
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
                <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', marginBottom: '15px' }}>← Back to List</button>
                <h3 style={{ color: '#fff', margin: '0 0 5px 0' }}>{selectedUser.displayName || selectedUser.email}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px 0' }}>Status: {selectedUser.isPremium ? 'Premium ⭐' : 'Standard'} | Locked: {selectedUser.isLocked ? 'YES 🔒' : 'NO'}</p>

                <div style={{ marginBottom: '20px' }}>
                  <input type="text" placeholder="Type a direct message to this user..." value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px', marginBottom: '10px' }} />
                  <button onClick={handleSendDirectMessage} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>Send Alert</button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <button onClick={handleToggleAdmin} style={{ background: selectedUser.isAdmin ? '#334155' : '#a855f7', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {selectedUser.isAdmin ? 'REVOKE ADMIN' : 'MAKE ADMIN 👑'}
                  </button>

                  <button onClick={handleMakePremium} style={{ background: selectedUser.isPremium ? '#334155' : '#10b981', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {selectedUser.isPremium ? 'REVOKE PREMIUM' : 'GRANT PREMIUM ⭐'}
                  </button>

                  <button onClick={handleToggleLock} style={{ background: selectedUser.isLocked ? '#10b981' : '#f59e0b', color: '#000', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {selectedUser.isLocked ? 'UNLOCK ACCOUNT' : 'LOCK ACCOUNT'}
                  </button>
                  <button onClick={handleResetAccount} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>WIPE DATA</button>
                </div>

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {filteredUsers.length === 0 && searchTerm ? (
                  <p style={{ color: '#94a3b8' }}>No users found matching "{searchTerm}"</p>
                ) : (
                  filteredUsers.map(u => (
                    <div key={u.id} onClick={() => handleSelectUser(u)} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', borderLeft: `4px solid ${u.isPremium ? '#10b981' : '#334155'}`, cursor: 'pointer' }}>
                      <p style={{ margin: '0 0 5px 0', color: '#fff', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                        {u.displayName || u.email || 'Unknown Scholar'}
                        {u.isPremium && <span style={{color: '#10b981', fontSize: '0.8rem'}}>⭐</span>}
                      </p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>Exams Taken: {u.totalExamsTaken || 0}</p>
                      {u.isLocked && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '5px 0 0 0', fontWeight: 'bold' }}>🔒 LOCKED</p>}
                    </div>
                  ))
                )}
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

      {/* 4. REPORTED ISSUES TAB */}
      {adminTab === 'reports' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ color: '#ef4444', margin: 0, fontSize: '1.5rem' }}>Reported Questions</h3>
              <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Review issues flagged by users during exams.</p>
            </div>
            <button onClick={fetchReportedQuestions} disabled={isFetchingReports} style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isFetchingReports ? 'SCANNING...' : 'REFRESH REPORTS'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reportedQuestions.length === 0 && !isFetchingReports ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#0f172a', borderRadius: '12px', border: '1px dashed #334155', color: '#64748b' }}>
                Clean dashboard! No active reports right now.
              </div>
            ) : (
              reportedQuestions.map(report => (
                <div key={report.id} style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #ef4444', position: 'relative' }}>
                  
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                    <p style={{ margin: 0, color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>User Reason:</p>
                    <p style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '1rem' }}>"{report.reason}"</p>
                  </div>

                  <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                    {report.subject} • {report.subTopic}
                  </div>
                  
                  <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: '0 0 20px 0', padding: '15px', background: '#020617', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    {report.questionText}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #1e293b', paddingTop: '15px' }}>
                    <button onClick={() => handleDismissReport(report.id)} style={{ flex: '1 1 200px', padding: '10px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      DISMISS REPORT (IGNORE)
                    </button>
                    <button onClick={() => handleDeleteReportedQuestion(report.id, report.questionId)} style={{ flex: '1 1 200px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Trash2 size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      DELETE QUESTION FROM VAULT
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* 5. FEEDBACK TAB */}
      {adminTab === 'feedback' && (
        <div style={{ padding: '20px' }}>
          <h3 style={{ color: '#fff' }}>User Feedback & Bug Reports</h3>
          {feedbackInbox.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No feedback submitted yet.</p>
          ) : (
            feedbackInbox.map((msg) => (
              <div key={msg.id} style={{ background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                     <strong style={{ color: '#38bdf8' }}>{msg.userName}</strong>
                     <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '10px' }}>({msg.userEmail})</span>
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <p style={{ color: '#e2e8f0', margin: '0 0 15px 0' }}>{msg.message}</p>
                
                {/* 👉 NEW: REWARD BUTTON */}
                <button 
                   onClick={() => rewardBugHunter(msg.userId, msg.userName)}
                   style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                >
                   Give Premium Reward 🏆
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;