import React, { useState } from 'react';

export const ExamSetup = ({ onCancel, onBegin }) => {
  const [subject, setSubject] = useState('physics');
  const [questionCount, setQuestionCount] = useState(10);
  const [isTimed, setIsTimed] = useState(false);

  const handleStart = () => {
    // Pass the selected configuration to the actual exam engine
    onBegin({ subject, questionCount, isTimed });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '500px', width: '100%', backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', border: '1px solid #334155' }}>
        
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Configure Session</h2>
        <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '14px' }}>Set your parameters for this practice run.</p>

        {/* Subject Selection */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e1' }}>Discipline</label>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '16px' }}
          >
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="mathematics">Mathematics</option>
          </select>
        </div>

        {/* Question Count */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e1' }}>Number of Questions</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[10, 20, 50].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: questionCount === num ? '2px solid #38bdf8' : '1px solid #334155', backgroundColor: questionCount === num ? 'rgba(56, 189, 248, 0.1)' : '#0f172a', color: 'white', cursor: 'pointer' }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
          <button 
            onClick={onCancel}
            style={{ flex: 1, padding: '14px', borderRadius: '8px', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', fontWeight: '600', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleStart}
            style={{ flex: 2, padding: '14px', borderRadius: '8px', background: '#38bdf8', border: 'none', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
          >
            Begin Exam
          </button>
        </div>

      </div>
    </div>
  );
};