import React, { useMemo } from 'react';
import { Trophy, User, Activity, Target } from 'lucide-react';

const Leaderboard = ({ leaderboardData, user }) => {
  
  // 👉 THE NEW ANALYTICS ENGINE: Recalculate, Filter, and Re-Sort
  const { sortedData, globalAverage, currentUserAcc } = useMemo(() => {
    let globalQs = 0;
    let globalCorrect = 0;
    let userAcc = null;

    const processed = leaderboardData.map(leader => {
      let totalCorrect = 0;
      let totalAnswered = 0;
      let bestSubj = "N/A";
      let bestSubjAcc = -1;

      if (leader.topicStats) {
        Object.entries(leader.topicStats).forEach(([name, stats]) => {
          totalCorrect += stats.correct || 0;
          totalAnswered += stats.total || 0;
          const acc = stats.total > 0 ? (stats.correct / stats.total) : 0;
          if (acc > bestSubjAcc && stats.total > 0) {
            bestSubjAcc = acc;
            bestSubj = name;
          }
        });
      }
      
      const overallAcc = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
      
      globalQs += totalAnswered;
      globalCorrect += totalCorrect;

      if (leader.id === user?.uid) {
        userAcc = overallAcc;
      }

      return { ...leader, totalCorrect, totalAnswered, bestSubj, overallAcc };
    });

    // Rigorous Sorting: Must have 50+ questions to qualify for Accuracy ranking.
    // Otherwise, they are pushed to the bottom and sorted by volume.
    const sorted = processed.sort((a, b) => {
      const aQualifies = a.totalAnswered >= 50;
      const bQualifies = b.totalAnswered >= 50;
      
      if (aQualifies && bQualifies) {
        if (b.overallAcc !== a.overallAcc) return b.overallAcc - a.overallAcc;
        return b.totalAnswered - a.totalAnswered;
      }
      if (aQualifies && !bQualifies) return -1;
      if (!aQualifies && bQualifies) return 1;
      return b.totalAnswered - a.totalAnswered;
    });

    const gAvg = globalQs > 0 ? Math.round((globalCorrect / globalQs) * 100) : 0;

    return { sortedData: sorted, globalAverage: gAvg, currentUserAcc: userAcc };
  }, [leaderboardData, user]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '10px' }}>
        <Trophy size={32} color="#10b981" />
        <div>
          <h2 style={{ margin: 0, color: '#10b981', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '1.8rem' }}>Global Leaderboard</h2>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Ranked by true accuracy. 50-question minimum to qualify.</span>
        </div>
      </div>

      {/* 👉 THE PERCENTILE BENCHMARK BANNER */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity color="#38bdf8" size={24} />
          <div>
            <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '1.1rem' }}>Global Average Benchmark</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>The median accuracy across all recorded exams.</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>{globalAverage}%</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>System Avg</div>
          </div>
          
          {currentUserAcc !== null && (
            <div style={{ paddingLeft: '20px', borderLeft: '1px solid #1e293b', textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: currentUserAcc >= globalAverage ? '#10b981' : '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {currentUserAcc >= globalAverage ? '▲ Above Average' : '▼ Below Average'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Your Score: <span style={{ color: '#fff', fontWeight: 'bold' }}>{currentUserAcc}%</span></div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedData.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No data available yet. Initialize the database.</div>
        ) : (
          sortedData.map((leader, index) => {
            const isQualified = leader.totalAnswered >= 50;
            const streak = leader.streak || 0;
            const isOnFire = streak >= 7;
            const nameColor = isOnFire ? '#f59e0b' : '#fff'; 
            
            // 👉 UNFORGIVING TITLES
            let rankTitle = "Unranked (Volume Too Low)";
            if (isQualified) {
                if (leader.overallAcc >= 85) rankTitle = "Apex Scholar";
                else if (leader.overallAcc >= 70) rankTitle = "Proficient";
                else if (leader.overallAcc >= 50) rankTitle = "Below Average";
                else rankTitle = "Failing - Immediate Review Required";
            }
            if (leader.isAdmin) rankTitle = "System Architect";

            let bestSubjectDisplay = leader.bestSubj !== "N/A" ? leader.bestSubj : "General";

            return (
              <div key={leader.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: index === 0 && isQualified ? 'rgba(245, 158, 11, 0.1)' : '#0f172a', border: `1px solid ${(index === 0 && isQualified) ? '#f59e0b' : '#1e293b'}`, padding: '20px', borderRadius: '12px', flexWrap: 'wrap', gap: '15px', opacity: isQualified ? 1 : 0.6 }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: !isQualified ? '#334155' : (index === 0 ? '#f59e0b' : (index === 1 ? '#cbd5e1' : (index === 2 ? '#b45309' : '#64748b'))), width: '30px', textAlign: 'center' }}>
                    {isQualified ? `#${index + 1}` : '-'}
                  </div>
                  
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {leader.profilePic ? <img src={leader.profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <User size={20} color="#64748b" />}
                  </div>

                  <div>
                    <div style={{ fontSize: '1.1rem', color: nameColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {leader.displayName || "Anonymous Scholar"}
                      {isOnFire && <span title={`${streak} Day Streak!`} style={{ fontSize: '1.1rem' }}>🔥</span>}
                      {leader.id === user?.uid && <span style={{ marginLeft: '5px', fontSize: '0.7rem', background: '#38bdf8', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', fontWeight: 'bold' }}>YOU</span>}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px', letterSpacing: '0.5px' }}>
                      {leader.totalAnswered === 0 ? "No Exams Logged" : <><span style={{ color: !isQualified ? '#64748b' : (leader.overallAcc >= 70 ? '#10b981' : (leader.overallAcc >= 50 ? '#f59e0b' : '#ef4444')), fontWeight: 'bold', textTransform: 'uppercase' }}>{rankTitle}</span> {isQualified && `• ${bestSubjectDisplay} Focus`}</>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '1rem' }}>{leader.totalAnswered}</div>
                     <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Qs Done</div>
                   </div>
                   <div style={{ textAlign: 'right', background: !isQualified ? '#1e293b' : (leader.overallAcc >= 70 ? 'rgba(16, 185, 129, 0.1)' : (leader.overallAcc >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)')), padding: '10px 15px', borderRadius: '8px', border: `1px solid ${!isQualified ? '#334155' : (leader.overallAcc >= 70 ? 'rgba(16, 185, 129, 0.3)' : (leader.overallAcc >= 50 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'))}` }}>
                     <div style={{ color: !isQualified ? '#64748b' : (leader.overallAcc >= 70 ? '#10b981' : (leader.overallAcc >= 50 ? '#f59e0b' : '#ef4444')), fontWeight: 'bold', fontSize: '1.3rem', lineHeight: '1' }}>
                       {leader.totalAnswered === 0 ? '--%' : `${leader.overallAcc}%`}
                     </div>
                     <div style={{ color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Target size={10} /> Accuracy
                     </div>
                   </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default Leaderboard;