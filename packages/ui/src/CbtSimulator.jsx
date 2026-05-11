import React, { useState } from 'react';
import { Share2, Calculator, Flag, Timer, BookOpen, AlertTriangle, ShieldAlert } from 'lucide-react';

const CbtSimulator = ({
  cbtFinished, setCbtFinished, activeExamQuestions, cbtIndex, setCbtIndex,
  cbtAnswers, setCbtAnswers, flaggedQuestions, toggleFlag, isCalculatorOpen, setIsCalculatorOpen,
  cbtTimeLeft, formatTime, calcDisplay, handleCalcClick, handleShareExam,
  handleSelectOption, handleSubmitCBT, cbtScore, isReviewing, setIsReviewing, setActiveModule,
  strictMode = true,
  instantFeedback = false,
  shuffleOptions = false,
  isAdmin = false,
  handleReportQuestion 
}) => {

  // 👉 BUG FIX: We removed the `useMemo` double-shuffle. 
  // We now trust the exactly array sent by ExamMode!
  const currentOptionsToDisplay = activeExamQuestions[cbtIndex]?.options || [];

  const handleOptionClick = (option) => {
    if (cbtFinished) return;
    if (instantFeedback && cbtAnswers[cbtIndex]) return; 
    handleSelectOption(option);
  };

  const [localCalcDisplay, setLocalCalcDisplay] = useState('');
  
  const handleScientificCalc = (val) => {
    if (val === 'C') { 
      setLocalCalcDisplay(''); 
    } else if (val === 'DEL') {
      setLocalCalcDisplay(prev => prev !== 'Err' ? prev.slice(0, -1) : '');
    } else if (val === '=') {
      try {
        let expression = localCalcDisplay
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/pi/g, 'Math.PI')
          .replace(/\^/g, '**'); 
        
        // eslint-disable-next-line
        const result = eval(expression);
        if (result === undefined || isNaN(result)) throw new Error("Invalid");
        setLocalCalcDisplay(Number.isInteger(result) ? result.toString() : parseFloat(result).toFixed(4).toString());
      } catch (e) { 
        setLocalCalcDisplay('Err'); 
      }
    } else { 
      setLocalCalcDisplay(prev => (prev === 'Err' ? val : prev + val)); 
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', minHeight: '100vh', paddingBottom: '150px', paddingLeft: '20px', paddingRight: '20px' }}>
      {!cbtFinished && activeExamQuestions.length > 0 ? (
        <>
          <div style={{ position: 'sticky', top: '60px', zIndex: 50, backgroundColor: '#020617', padding: '15px 0', display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ color: '#94a3b8', letterSpacing: '1px', fontWeight: 'bold' }}>
              Q {cbtIndex + 1} / {activeExamQuestions.length}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              <button 
                onClick={() => {
                  const reason = window.prompt("Why are you reporting this question? (e.g., Wrong answer, Typo, Out of Syllabus)");
                  if (reason) handleReportQuestion(activeExamQuestions[cbtIndex], reason);
                }} 
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}
              >
                <AlertTriangle size={16} /> REPORT
              </button>

              <button onClick={handleShareExam} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', border: '1px solid #ec4899', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                <Share2 size={16} /> SHARE
              </button>
              
              <button onClick={() => setIsCalculatorOpen(!isCalculatorOpen)} style={{ background: isCalculatorOpen ? '#38bdf8' : 'rgba(56,189,248,0.1)', color: isCalculatorOpen ? '#000' : '#38bdf8', border: '1px solid #38bdf8', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                <Calculator size={16} /> {isCalculatorOpen ? 'CLOSE' : 'CALC'}
              </button>
              
              <button onClick={() => toggleFlag(cbtIndex)} style={{ background: flaggedQuestions.has(cbtIndex) ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${flaggedQuestions.has(cbtIndex) ? '#f59e0b' : 'transparent'}`, color: flaggedQuestions.has(cbtIndex) ? '#f59e0b' : '#cbd5e1', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                <Flag size={16} fill={flaggedQuestions.has(cbtIndex) ? '#f59e0b' : 'none'} /> {flaggedQuestions.has(cbtIndex) ? 'FLAGGED' : 'FLAG'}
              </button>
              
              <div style={{ color: (cbtTimeLeft !== 'untimed' && cbtTimeLeft < 60) ? '#ef4444' : '#f59e0b', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '6px' }}>
                <Timer size={18} /> {cbtTimeLeft === 'untimed' ? '∞' : formatTime(cbtTimeLeft)}
              </div>

            </div>
          </div>

          {/* JAMB SCIENTIFIC CALCULATOR */}
          {isCalculatorOpen && (
            <div style={{ background: '#0f172a', border: '2px solid #38bdf8', borderRadius: '12px', padding: '15px', marginBottom: '20px', maxWidth: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
              <div style={{ background: '#dbf4ff', color: '#000', padding: '10px', textAlign: 'right', fontSize: '1.5rem', fontFamily: 'monospace', borderRadius: '6px', marginBottom: '15px', minHeight: '45px', overflow: 'hidden' }}>
                {localCalcDisplay || '0'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <button onClick={() => handleScientificCalc('sin(')} style={{ padding: '8px 0', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>sin</button>
                <button onClick={() => handleScientificCalc('cos(')} style={{ padding: '8px 0', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>cos</button>
                <button onClick={() => handleScientificCalc('tan(')} style={{ padding: '8px 0', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>tan</button>
                <button onClick={() => handleScientificCalc('DEL')} style={{ padding: '8px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>DEL</button>
                <button onClick={() => handleScientificCalc('log(')} style={{ padding: '8px 0', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>log</button>
                <button onClick={() => handleScientificCalc('sqrt(')} style={{ padding: '8px 0', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>√</button>
                <button onClick={() => handleScientificCalc('^')} style={{ padding: '8px 0', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>x^y</button>
                <button onClick={() => handleScientificCalc('/')} style={{ padding: '8px 0', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.2rem' }}>/</button>
                {['7','8','9','*','4','5','6','-','1','2','3','+'].map((btn, idx) => (
                  <button key={idx} onClick={() => handleScientificCalc(btn)} style={{ padding: '12px 0', background: ['*','-','+'].includes(btn) ? '#334155' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>{btn}</button>
                ))}
                <button onClick={() => handleScientificCalc('C')} style={{ padding: '12px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>C</button>
                <button onClick={() => handleScientificCalc('0')} style={{ padding: '12px 0', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>0</button>
                <button onClick={() => handleScientificCalc('.')} style={{ padding: '12px 0', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>.</button>
                <button onClick={() => handleScientificCalc('=')} style={{ padding: '12px 0', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>=</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {activeExamQuestions[cbtIndex].subTopic || activeExamQuestions[cbtIndex].subject}
            </div>
            {isAdmin && (
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', background: activeExamQuestions[cbtIndex].isAiGenerated ? 'rgba(139, 92, 246, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: activeExamQuestions[cbtIndex].isAiGenerated ? '#c084fc' : '#38bdf8', padding: '4px 10px', borderRadius: '12px', border: `1px solid ${activeExamQuestions[cbtIndex].isAiGenerated ? '#c084fc' : '#38bdf8'}` }}>
                {activeExamQuestions[cbtIndex].isAiGenerated ? '🤖 Ghost Admin' : '👤 User Upload'}
              </span>
            )}
          </div>
          <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {activeExamQuestions.map((_, i) => {
                let btnColor = '#1e293b'; 
                if (cbtIndex === i) btnColor = '#3b82f6'; 
                if (flaggedQuestions.has(i)) btnColor = '#f59e0b'; 
                else if (cbtAnswers[i]) btnColor = '#10b981'; 
                return (
                  <button key={i} onClick={() => setCbtIndex(i)} style={{ flex: '1 1 calc(20% - 8px)', minWidth: '40px', padding: '8px 0', background: btnColor, color: '#fff', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>{i + 1}</button>
                );
              })}
            </div>
          </div>
          
          <h2 style={{ color: '#fff', fontSize: '1.5rem', lineHeight: '1.5', marginBottom: '30px', fontWeight: 'normal', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {activeExamQuestions[cbtIndex].q}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentOptionsToDisplay.map((option, idx) => {
              const isSelected = cbtAnswers[cbtIndex] === option;
              const isCorrectAnswer = activeExamQuestions[cbtIndex].answer === option;
              
              let bgStyle = isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.6)';
              let borderStyle = `2px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`;
              let iconBg = isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)';
              let iconColor = isSelected ? '#000' : '#fff';

              if (instantFeedback && cbtAnswers[cbtIndex]) {
                if (isCorrectAnswer) {
                  bgStyle = 'rgba(16, 185, 129, 0.15)';
                  borderStyle = '2px solid #10b981';
                  iconBg = '#10b981';
                  iconColor = '#000';
                } else if (isSelected && !isCorrectAnswer) {
                  bgStyle = 'rgba(239, 68, 68, 0.15)';
                  borderStyle = '2px solid #ef4444';
                  iconBg = '#ef4444';
                  iconColor = '#fff';
                } else {
                  bgStyle = 'rgba(15, 23, 42, 0.3)';
                  borderStyle = '2px solid rgba(255,255,255,0.05)';
                  iconBg = 'rgba(255,255,255,0.05)';
                  iconColor = '#64748b';
                }
              }

              const letters = ["A", "B", "C", "D"];
              
              return (
                <div key={idx} onClick={() => handleOptionClick(option)} style={{ background: bgStyle, border: borderStyle, padding: '15px', borderRadius: '12px', cursor: (instantFeedback && cbtAnswers[cbtIndex]) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s' }}>
                  <div style={{ background: iconBg, color: iconColor, width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}>
                    {letters[idx]}
                  </div>
                  <span style={{ color: (instantFeedback && cbtAnswers[cbtIndex] && !isSelected && !isCorrectAnswer) ? '#64748b' : '#fff', fontSize: '1rem' }}>
                    {option}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setCbtIndex(p => Math.max(0, p - 1))} disabled={cbtIndex === 0} style={{ flex: '1 1 150px', padding: '15px 30px', background: 'transparent', color: cbtIndex === 0 ? '#334155' : '#fff', border: `1px solid ${cbtIndex === 0 ? '#334155' : 'rgba(255,255,255,0.2)'}`, borderRadius: '8px', cursor: cbtIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>PREVIOUS</button>
            {cbtIndex === activeExamQuestions.length - 1 ? (
              <button onClick={handleSubmitCBT} style={{ flex: '1 1 150px', padding: '15px 40px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>SUBMIT EXAM</button>
            ) : (
              <button onClick={() => setCbtIndex(p => Math.min(activeExamQuestions.length - 1, p + 1))} style={{ flex: '1 1 150px', padding: '15px 40px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>NEXT</button>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: 'block', width: '100%', paddingBottom: '100px' }}>
          {(() => {
            const topicStats = {};
            activeExamQuestions.forEach((q, idx) => {
              const topic = q.subTopic || q.subject || "General";
              if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
              topicStats[topic].total += 1;
              if (cbtAnswers[idx] === q.answer) topicStats[topic].correct += 1;
            });
            const masteryArray = Object.keys(topicStats).map(topic => ({ topic, percentage: Math.round((topicStats[topic].correct / topicStats[topic].total) * 100), ...topicStats[topic] })).sort((a, b) => a.percentage - b.percentage); 

            return (
              <>
                {!isReviewing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', marginTop: '40px' }}>
                    
                    {strictMode && cbtTimeLeft === 0 && (
                       <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontWeight: 'bold' }}>
                         <ShieldAlert size={20} /> STRICT MODE: Exam automatically submitted due to timeout.
                       </div>
                    )}

                    <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: '1.8rem' }}>EXAM CONCLUDED</h2>
                    <div style={{ width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(15, 23, 42, 0.8)', border: `8px solid ${(cbtScore / activeExamQuestions.length) >= 0.7 ? '#10b981' : ((cbtScore / activeExamQuestions.length) >= 0.4 ? '#f59e0b' : '#ef4444')}`, margin: '20px 0 30px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', lineHeight: '1' }}>{Math.round((cbtScore / activeExamQuestions.length) * 100)}%</span>
                        <span style={{ color: '#94a3b8', letterSpacing: '2px', fontSize: '0.7rem', marginTop: '5px' }}>SCORE</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '15px 25px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>{cbtScore}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '1px' }}>CORRECT</div>
                      </div>
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '15px 25px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 'bold' }}>{activeExamQuestions.length - cbtScore}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '1px' }}>INCORRECT</div>
                      </div>
                    </div>
                    <div style={{ width: '100%', maxWidth: '600px', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden', marginBottom: '40px' }}>
                      <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#e2e8f0', fontSize: '1.2rem' }}>Topic Breakdown</h3>
                      </div>
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {masteryArray.map((stat, i) => (
                            <div key={i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                                <span style={{ color: '#cbd5e1' }}>{stat.topic}</span>
                                <span style={{ fontWeight: 'bold', color: stat.percentage >= 70 ? '#10b981' : (stat.percentage >= 40 ? '#f59e0b' : '#ef4444') }}>{stat.percentage}% ({stat.correct}/{stat.total})</span>
                              </div>
                              <div style={{ width: '100%', background: '#1e293b', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${stat.percentage}%`, background: stat.percentage >= 70 ? '#10b981' : (stat.percentage >= 40 ? '#f59e0b' : '#ef4444'), height: '100%', borderRadius: '4px' }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '40px', width: '100%', justifyContent: 'center' }}>
                      <button onClick={() => { setIsReviewing(true); window.scrollTo(0,0); }} style={{ flex: '1', minWidth: '200px', padding: '12px 25px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <BookOpen size={18} /> REVIEW ERRORS
                      </button>
                      <button onClick={() => { setActiveModule('hub'); setCbtFinished(false); setCbtIndex(0); setCbtAnswers({}); }} style={{ flex: '1', minWidth: '200px', padding: '12px 25px', background: 'transparent', color: '#94a3b8', border: '2px solid #334155', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                        EXIT TO MENU
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '20px' }}>
                    <button onClick={() => setIsReviewing(false)} style={{ padding: '8px 15px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>BACK TO SCORE</button>
                    {activeExamQuestions.map((q, idx) => {
                      const userAnswer = cbtAnswers[idx];
                      const isCorrect = userAnswer === q.answer;
                      return (
                        <div key={idx} style={{ background: 'rgba(15,23,42,0.8)', padding: '20px', borderRadius: '12px', marginBottom: '15px', borderLeft: `5px solid ${isCorrect ? '#10b981' : '#ef4444'}`, border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
                              {q.subTopic || q.subject}
                            </p>
                            {isAdmin && (
                              <span style={{ fontSize: '0.65rem', background: q.isAiGenerated ? 'rgba(139, 92, 246, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: q.isAiGenerated ? '#c084fc' : '#38bdf8', padding: '2px 8px', borderRadius: '10px', border: `1px solid ${q.isAiGenerated ? '#c084fc' : '#38bdf8'}` }}>
                                {q.isAiGenerated ? '🤖 Ghost Admin' : '👤 User Upload'}
                              </span>
                            )}
                          </div>

                          <p style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.4', margin: '0 0 15px 0' }}>{idx + 1}. {q.q}</p>
                          <div style={{ background: '#020617', padding: '12px', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 5px 0', color: isCorrect ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>Your Answer: <span style={{ color: '#cbd5e1' }}>{userAnswer || "Skipped"}</span></p>
                            {!isCorrect && <p style={{ margin: 0, color: '#10b981', fontSize: '0.9rem' }}>Correct Answer: <span style={{ color: '#cbd5e1' }}>{q.answer}</span></p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default CbtSimulator;