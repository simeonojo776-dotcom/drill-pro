import React from 'react';
import { PenTool, Sparkles } from 'lucide-react';

const CommunityForge = ({ 
  forgeData, 
  setForgeData, 
  subjectHierarchy, 
  handleUserForgeSubmit, 
  isSubmittingForge, 
  generateAiQuestion, 
  isAiGenerating 
}) => {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
            <h2 style={{ margin: 0, color: '#f59e0b', letterSpacing: '1px', fontSize: '1.8rem' }}>The Knowledge Forge</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '5px' }}>Submit a question. Approved submissions get 1hr Premium.</p>
        </div>
        <button onClick={generateAiQuestion} disabled={isAiGenerating} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <Sparkles size={18}/> {isAiGenerating ? 'THINKING...' : 'AI ASSIST'}
        </button>
      </div>

      <div style={{ background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Subject Area</label>
          <select value={forgeData.subject} onChange={e => setForgeData({...forgeData, subject: e.target.value})} style={{ width: '100%', background: '#020617', color: '#fff', border: '1px solid #334155', padding: '12px', borderRadius: '8px', outline: 'none' }}>
            <option value="GENERAL">General</option>
            {Object.keys(subjectHierarchy).map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>The Question</label>
          <textarea rows="3" value={forgeData.q} onChange={e => setForgeData({...forgeData, q: e.target.value})} placeholder="Type your question here..." style={{ WebkitUserSelect: 'text', userSelect: 'text', width: '100%', background: '#020617', color: '#fff', border: '1px solid #334155', padding: '12px', borderRadius: '8px', outline: 'none', resize: 'vertical' }}></textarea>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '200px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Option A</label>
            <input type="text" value={forgeData.optA} onChange={e => setForgeData({...forgeData, optA: e.target.value})} style={{ width: '100%', background: '#020617', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px', outline: 'none' }} />
          </div>
          <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '200px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Option B</label>
            <input type="text" value={forgeData.optB} onChange={e => setForgeData({...forgeData, optB: e.target.value})} style={{ width: '100%', background: '#020617', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px', outline: 'none' }} />
          </div>
          <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '200px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Option C</label>
            <input type="text" value={forgeData.optC} onChange={e => setForgeData({...forgeData, optC: e.target.value})} style={{ width: '100%', background: '#020617', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px', outline: 'none' }} />
          </div>
          <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '200px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Option D</label>
            <input type="text" value={forgeData.optD} onChange={e => setForgeData({...forgeData, optD: e.target.value})} style={{ width: '100%', background: '#020617', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px', outline: 'none' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Correct Answer (Must match an option exactly)</label>
          <input type="text" value={forgeData.answer} onChange={e => setForgeData({...forgeData, answer: e.target.value})} placeholder="e.g. Option text exactly" style={{ WebkitUserSelect: 'text', userSelect: 'text', width: '100%', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', border: '1px solid #10b981', padding: '12px', borderRadius: '8px', outline: 'none' }} />
        </div>

        <button onClick={handleUserForgeSubmit} disabled={isSubmittingForge} style={{ width: '100%', padding: '15px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isSubmittingForge ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
          {isSubmittingForge ? 'FORGING...' : 'SUBMIT FOR APPROVAL'}
        </button>
      </div>
    </div>
  );
};

export default CommunityForge;