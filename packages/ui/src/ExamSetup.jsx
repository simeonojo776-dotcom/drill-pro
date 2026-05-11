import React, { useState, useRef, useEffect } from 'react';
import { RefreshCcw, User, Settings2, Clock, Activity, ShieldCheck, Camera, Zap } from 'lucide-react';

const ExamSetup = ({
  handleGlobalRefresh, isRefreshing, subjectHierarchy, expandedFolder,
  setExpandedFolder, selectedSubTopics, toggleEntireFolder, toggleSubTopic,
  examDuration, setExamDuration, questionCount, setQuestionCount,
  handleStartOfficialExam, isFetchingExam,
  shuffleQuestions, setShuffleQuestions, shuffleOptions, setShuffleOptions,
  strictMode = true, setStrictMode,
  instantFeedback = false, setInstantFeedback,
  userData, isAdmin
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState("CANDIDATE");
  const [localDP, setLocalDP] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData) {
      if (userData.username || userData.displayName) setLocalName(userData.username || userData.displayName);
      if (userData.photoURL) setLocalDP(userData.photoURL);
    }
  }, [userData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLocalDP(imageUrl);
    }
  };
  
  const panelStyle = { background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 30px rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', height: '500px', display: 'flex', flexDirection: 'column' };
  const labelStyle = { display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none', cursor: 'pointer' };

  const isAllSelected = expandedFolder && subjectHierarchy[expandedFolder] && subjectHierarchy[expandedFolder].every(sub => selectedSubTopics.includes(sub));

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto 80px auto', width: '100%', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Settings2 color="#38bdf8" /> Configure CBT</h2>
        <button onClick={handleGlobalRefresh} disabled={isRefreshing} style={{ padding: '8px 15px', background: 'rgba(59, 130, 246, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '8px', cursor: isRefreshing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <RefreshCcw size={16} /> {isRefreshing ? 'SYNCING...' : 'REFRESH BANK'}
        </button>
      </div>

      <div style={{ ...panelStyle, height: 'auto', marginBottom: '20px', padding: '15px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {Object.keys(subjectHierarchy).map(mainSubject => {
            const allSelected = subjectHierarchy[mainSubject].every(sub => selectedSubTopics.includes(sub));
            const isExpanded = expandedFolder === mainSubject;
            return (
              <div key={mainSubject} onClick={() => setExpandedFolder(mainSubject)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', borderRadius: '8px', background: isExpanded ? 'rgba(56, 189, 248, 0.1)' : '#0f172a', border: `1px solid ${isExpanded ? '#38bdf8' : '#1e293b'}` }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: `2px solid ${allSelected ? '#10b981' : '#334155'}`, background: allSelected ? '#10b981' : 'transparent' }} />
                <span style={{ color: isExpanded ? '#38bdf8' : '#e2e8f0', fontSize: '0.85rem', fontWeight: 'bold' }}>{mainSubject}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={panelStyle}>
           <label style={labelStyle}>Topic Filtering</label>
           <div style={{ flex: 1, overflowY: 'auto', background: '#020617', borderRadius: '8px', padding: '10px', border: '1px solid #1e293b', marginBottom: '15px' }}>
              {expandedFolder ? (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#38bdf8', padding: '8px 5px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', cursor: 'pointer', fontWeight: 'bold', marginBottom: '5px' }}>
                    <input type="checkbox" checked={isAllSelected} onChange={() => toggleEntireFolder(expandedFolder)} style={{ accentColor: '#38bdf8', width: '16px', height: '16px' }} /> Select All {expandedFolder}
                  </label>
                  {subjectHierarchy[expandedFolder].map(sub => (
                    <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#cbd5e1', padding: '8px 5px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedSubTopics.includes(sub)} onChange={() => toggleSubTopic(sub)} style={{ accentColor: '#38bdf8', width: '16px', height: '16px' }} /> {sub}
                    </label>
                  ))}
                </>
              ) : <p style={{ color: '#475569', textAlign: 'center', marginTop: '100px' }}>Select a subject above</p>}
           </div>

           <div>
            <label style={labelStyle}>Question Volume</label>
            <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value === 'all' ? 'all' : Number(e.target.value))} style={inputStyle}>
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={40}>40 Questions</option>
              <option value={50}>50 Questions</option>
              <option value="all">Max Available</option>
            </select>
          </div>
        </div>

        <div style={{ ...panelStyle, justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <div onClick={() => fileInputRef.current.click()} style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #38bdf8', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
              {localDP ? <img src={localDP} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="DP" /> : <User size={40} color="#64748b" />}
              <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}><Camera size={24} color="white" /></div>
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
            
            <div style={{ width: '100%', textAlign: 'center' }}>
              {isEditingName ? (
                <input autoFocus value={localName} onChange={(e) => setLocalName(e.target.value)} onBlur={() => setIsEditingName(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #38bdf8', backgroundColor: '#020617', color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', outline: 'none' }} />
              ) : (
                <div onClick={() => setIsEditingName(true)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }}>{localName}</div>
              )}
              <p style={{ color: '#64748b', fontSize: '11px', marginTop: '5px', textTransform: 'lowercase' }}>{userData?.email || "No Email"}</p>
            </div>

            <div style={{ width: '100%', background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px' }}><Activity size={16} /> SESSION ANALYTICS</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>
                <span>Est. Pacing:</span> <strong>{examDuration === 0 ? "Untimed" : (questionCount === 'all' ? "Variable" : Math.round((examDuration / questionCount) / 60 * 10) / 10 + " min/Q")}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <span>Active Topics:</span> <strong>{selectedSubTopics.length} Loaded</strong>
              </div>
            </div>

            <button onClick={handleStartOfficialExam} disabled={isFetchingExam || selectedSubTopics.length === 0} style={{ width: '100%', padding: '16px', borderRadius: '10px', border: 'none', background: selectedSubTopics.length === 0 ? '#334155' : 'linear-gradient(135deg, #0284c7, #0ea5e9)', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              {isFetchingExam ? 'INITIALIZING...' : 'INITIATE EXAM'}
            </button>
          </div>
        </div>

        <div style={panelStyle}>
          <label style={labelStyle}>Global Parameters</label>
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Timer Allocation</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={22} color="#94a3b8" />
              <select value={examDuration} onChange={(e) => setExamDuration(Number(e.target.value))} style={inputStyle}>
                <option value={0}>∞ Untimed (No Limit)</option>
                <option value={300}>05:00 (5 Minutes)</option>
                <option value={600}>10:00 (10 Minutes)</option>
                <option value={1800}>30:00 (30 Minutes)</option>
                <option value={3600}>01:00:00 (1 Hour)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '0' }}>
            <label style={labelStyle}>Test Behavior</label>
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '10px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} style={{ accentColor: '#38bdf8' }} /> Shuffle Q's</label>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={shuffleOptions} onChange={(e) => setShuffleOptions(e.target.checked)} style={{ accentColor: '#38bdf8' }} /> Shuffle Opts</label>
              </div>
              <hr style={{ borderTop: '1px solid #1e293b', borderBottom: 'none', margin: '0' }} />
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={strictMode} onChange={(e) => setStrictMode && setStrictMode(e.target.checked)} disabled={examDuration === 0} style={{ accentColor: '#ef4444' }} /> Strict Mode {examDuration === 0 && "(Disabled in Untimed)"}</label>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={instantFeedback} onChange={(e) => setInstantFeedback && setInstantFeedback(e.target.checked)} style={{ accentColor: '#10b981' }} /> <Zap size={14} color="#10b981" /> Show Instant Feedback</label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExamSetup;