import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';

const CommandCenter = ({
  liveStats, examSchedule, isAddingExam, setIsAddingExam,
  newExamName, setNewExamName, newExamDate, setNewExamDate,
  newExamSubject, setNewExamSubject, subjectHierarchy,
  handleAddExam, calculateDaysLeft, triggerTargetDrill, handleDeleteExam, setActiveModule
}) => {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '40px auto 100px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '1.8rem' }}>Command Center</h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>Live performance matrix.</p>
        </div>
        <button onClick={() => setActiveModule('examSetup')} style={{ padding: '12px 24px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '14px', letterSpacing: '1px', cursor: 'pointer', width: '100%', maxWidth: '250px' }}>
          LAUNCH CBT MODULE
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
        <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '140px', backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Total Done</p>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#f8fafc' }}>{liveStats.totalQuestions}</h2>
        </div>
        <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '140px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <p style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Total Passed</p>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#10b981' }}>{liveStats.totalPassed || 0}</h2>
        </div>
        <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '140px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <p style={{ margin: '0 0 10px 0', color: '#ef4444', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Total Failed</p>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#ef4444' }}>{liveStats.totalFailed || 0}</h2>
        </div>
        <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '140px', backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Global Accuracy</p>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#38bdf8' }}>{liveStats.averageScore}%</h2>
        </div>
      </div>

      <div style={{ width: '100%', backgroundColor: '#0f172a', padding: '30px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="#38bdf8" /> Strategic Timetable
          </h3>
          <button 
            onClick={() => setIsAddingExam(!isAddingExam)}
            style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {isAddingExam ? 'CANCEL' : '+ ADD EXAM'}
          </button>
        </div>

        {isAddingExam && (
          <div style={{ background: '#020617', padding: '20px', borderRadius: '12px', border: '1px dashed #334155', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
             <div style={{ flex: '1 1 200px' }}>
               <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px', fontWeight: 'bold' }}>Exam Title</label>
               <input type="text" value={newExamName} onChange={e => setNewExamName(e.target.value)} placeholder="e.g. Physics Finals" style={{ WebkitUserSelect: 'text', userSelect: 'text', width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '6px', outline: 'none' }} />
             </div>
             <div style={{ flex: '1 1 150px' }}>
               <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
               <input type="date" value={newExamDate} onChange={e => setNewExamDate(e.target.value)} style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '6px', outline: 'none' }} />
             </div>
             <div style={{ flex: '1 1 150px' }}>
               <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px', fontWeight: 'bold' }}>Focus Subject</label>
               <select value={newExamSubject} onChange={e => setNewExamSubject(e.target.value)} style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}>
                  <option value="GENERAL">General</option>
                  {Object.keys(subjectHierarchy).map(sub => <option key={sub} value={sub}>{sub}</option>)}
               </select>
             </div>
             <button onClick={handleAddExam} style={{ padding: '10px 20px', background: '#10b981', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', height: '40px' }}>SAVE</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {examSchedule.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontStyle: 'italic', border: '1px dashed #1e293b', borderRadius: '8px' }}>No upcoming exams tracked.</div>
          ) : (
             examSchedule.map(exam => {
                const daysLeft = calculateDaysLeft(exam.date);
                if (daysLeft < 0) return null; 
                
                let urgencyColor = '#10b981'; 
                if (daysLeft <= 3) urgencyColor = '#ef4444'; 
                else if (daysLeft <= 7) urgencyColor = '#f59e0b'; 

                return (
                  <div key={exam.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020617', padding: '15px 20px', borderRadius: '8px', borderLeft: `4px solid ${urgencyColor}`, borderRight: '1px solid #1e293b', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', flexWrap: 'wrap', gap: '15px' }}>
                     <div>
                       <h4 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1.1rem' }}>{exam.name}</h4>
                       <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '0.85rem' }}>
                          <span>{new Date(exam.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span style={{ color: '#38bdf8' }}>{exam.subjectFocus} Focus</span>
                       </div>
                     </div>
                     
                     <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                       <div style={{ textAlign: 'right' }}>
                         <div style={{ color: urgencyColor, fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '1' }}>{daysLeft}</div>
                         <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>{daysLeft === 1 ? 'Day Left' : 'Days Left'}</div>
                       </div>
                       
                       <div style={{ display: 'flex', gap: '10px' }}>
                         <button onClick={() => triggerTargetDrill(exam.subjectFocus)} style={{ background: 'transparent', border: `1px solid ${urgencyColor}`, color: urgencyColor, padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
                           DRILL
                         </button>
                         <button onClick={() => handleDeleteExam(exam.id)} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                  </div>
                )
             })
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;