import React from 'react';
import { RefreshCcw } from 'lucide-react';

const ExamSetup = ({
  handleGlobalRefresh, isRefreshing, subjectHierarchy, expandedFolder,
  setExpandedFolder, selectedSubTopics, toggleEntireFolder, toggleSubTopic,
  examDuration, setExamDuration, questionCount, setQuestionCount,
  handleStartOfficialExam, isFetchingExam
}) => {
  return (
    <div style={{ maxWidth: '800px', margin: '20px auto 80px auto', width: '100%', padding: '0 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem' }}>Configure CBT</h2>
        <button onClick={handleGlobalRefresh} disabled={isRefreshing} style={{ padding: '8px 15px', background: 'rgba(59, 130, 246, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '8px', cursor: isRefreshing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <RefreshCcw size={16} /> {isRefreshing ? 'SYNCING...' : 'REFRESH'}
        </button>
      </div>
      
      {/* FOLDERS */}
      <div style={{ width: '100%', marginBottom: '40px' }}>
        <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '15px' }}>1. Select Subjects</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px' }}>
            {Object.keys(subjectHierarchy).length === 0 ? ( <p style={{ color: '#64748b', fontStyle: 'italic' }}>No official questions injected yet.</p> ) : (
               Object.keys(subjectHierarchy).map(mainSubject => {
                 const subTopicsArray = subjectHierarchy[mainSubject];
                 const isExpanded = expandedFolder === mainSubject;
                 const allSelected = subTopicsArray.every(sub => selectedSubTopics.includes(sub));

                 return (
                   <div key={mainSubject} style={{ background: '#0f172a', border: `1px solid ${isExpanded ? '#38bdf8' : '#334155'}`, borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                     <div onClick={() => setExpandedFolder(isExpanded ? null : mainSubject)} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <span style={{ fontSize: '1.2rem' }}>📂</span>
                         <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isExpanded ? '#38bdf8' : '#fff' }}>{mainSubject}</span>
                       </div>
                       <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold' }}>{allSelected && <span style={{ color: '#10b981' }}>ALL</span>}</div>
                     </div>
                     {isExpanded && (
                       <div style={{ padding: '20px', background: '#1e293b', borderTop: '1px solid #334155' }}>
                         <button onClick={() => toggleEntireFolder(subTopicsArray)} style={{ marginBottom: '15px', padding: '8px 15px', background: 'transparent', border: '1px dashed #64748b', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                           {allSelected ? 'DESELECT ALL' : 'SELECT ALL'}
                         </button>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                           {subTopicsArray.map(sub => (
                             <button key={sub} onClick={() => toggleSubTopic(sub)} style={{ padding: '10px 15px', background: selectedSubTopics.includes(sub) ? '#38bdf8' : '#0f172a', color: selectedSubTopics.includes(sub) ? '#000' : '#cbd5e1', border: `1px solid ${selectedSubTopics.includes(sub) ? '#38bdf8' : '#334155'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                               {selectedSubTopics.includes(sub) ? '✅' : '⬜'} {sub}
                             </button>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 )
               })
            )}
        </div>
      </div>
      
      {/* FLEXIBLE CONFIG BLOCKS (ANDROID OPTIMIZED) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        <div style={{ flex: '1 1 250px', background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px' }}>DURATION</p>
          <select value={examDuration} onChange={(e) => setExamDuration(Number(e.target.value))} style={{ width: '100%', background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '12px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
            <option value={300}>5 Minutes</option>
            <option value={600}>10 Minutes</option>
            <option value={1800}>30 Minutes</option>
            <option value={3600}>1 Hour</option>
          </select>
        </div>
        <div style={{ flex: '1 1 250px', background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px' }}>QUESTIONS</p>
          <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value === 'all' ? 'all' : Number(e.target.value))} style={{ width: '100%', padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={40}>40 Questions</option>
              <option value={50}>50 Questions</option>
              <option value="all">Max Available</option>
          </select>
        </div>
      </div>
      <button onClick={handleStartOfficialExam} disabled={isFetchingExam || selectedSubTopics.length === 0} style={{ width: '100%', padding: '20px', background: selectedSubTopics.length === 0 ? '#334155' : 'linear-gradient(135deg, #f59e0b, #ea580c)', color: selectedSubTopics.length === 0 ? '#94a3b8' : '#fff', border: 'none', borderRadius: '12px', cursor: selectedSubTopics.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
        {isFetchingExam ? 'CONNECTING...' : 'LAUNCH SIMULATOR'}
      </button>
    </div>
  );
};

export default ExamSetup;