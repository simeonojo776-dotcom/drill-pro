import React from 'react';
import { Trophy, User } from 'lucide-react';

const Leaderboard = ({ leaderboardData, user }) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '2px solid rgba(16, 185, 129, 0.2)', paddingBottom: '20px', marginBottom: '30px' }}>
        <Trophy size={32} color="#10b981" />
        <div>
          <h2 style={{ margin: 0, color: '#10b981', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '1.8rem' }}>Global Leaderboard</h2>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Top 10 Scholars sorted by total effort.</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {leaderboardData.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No data available yet. Complete a CBT to initialize your rank!</div>
        ) : (
          leaderboardData.map((leader, index) => {
            
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
            
            let rankTitle = "Initiate";
            if (totalAnswered > 0) {
                if (overallAcc >= 80) rankTitle = "Elite Scholar";
                else if (overallAcc >= 60) rankTitle = "Adept";
                else rankTitle = "Novice";
            }
            let bestSubjectDisplay = bestSubj !== "N/A" ? bestSubj : "General";

            return (
              <div key={leader.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: index === 0 ? 'rgba(245, 158, 11, 0.1)' : '#0f172a', border: `1px solid ${index === 0 ? '#f59e0b' : '#1e293b'}`, padding: '20px', borderRadius: '12px', flexWrap: 'wrap', gap: '15px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: index === 0 ? '#f59e0b' : (index === 1 ? '#cbd5e1' : (index === 2 ? '#b45309' : '#64748b')), width: '30px' }}>
                    #{index + 1}
                  </div>
                  
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {leader.profilePic ? <img src={leader.profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <User size={20} color="#64748b" />}
                  </div>

                  <div>
                    <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 'bold' }}>
                      {leader.displayName || "Anonymous Scholar"}
                      {leader.id === user?.uid && <span style={{ marginLeft: '10px', fontSize: '0.7rem', background: '#38bdf8', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>YOU</span>}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px', letterSpacing: '0.5px' }}>
                      {totalAnswered === 0 ? "No Exams Logged" : <><span style={{ color: '#38bdf8' }}>{rankTitle}</span> • {bestSubjectDisplay} Focus</>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '1rem' }}>{totalAnswered}</div>
                     <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Qs Done</div>
                   </div>
                   <div style={{ textAlign: 'right', background: overallAcc >= 70 ? 'rgba(16, 185, 129, 0.1)' : (overallAcc >= 40 && totalAnswered > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'), padding: '10px 15px', borderRadius: '8px', border: `1px solid ${overallAcc >= 70 ? 'rgba(16, 185, 129, 0.3)' : (overallAcc >= 40 && totalAnswered > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)')}` }}>
                     <div style={{ color: overallAcc >= 70 ? '#10b981' : (overallAcc >= 40 && totalAnswered > 0 ? '#f59e0b' : '#ef4444'), fontWeight: 'bold', fontSize: '1.3rem', lineHeight: '1' }}>
                       {totalAnswered === 0 ? '--%' : `${overallAcc}%`}
                     </div>
                     <div style={{ color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>Accuracy</div>
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