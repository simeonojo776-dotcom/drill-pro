import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@repo/ui/firebase';

export const Dashboard = ({ userData, onStartNewSession }) => {
  const [liveStats, setLiveStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    averageScore: 0,
    weakestTopics: []
  });

  // REAL-TIME DATABASE CONNECTION (Untouched)
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        const totalExams = data.totalExamsTaken || 0;
        const totalQuestions = data.totalQuestionsAnswered || 0;
        const globalAccuracy = data.globalAccuracy || 0;

        let weakTopicsArray = [];
        if (data.topicStats) {
          const topics = Object.entries(data.topicStats).map(([name, stats]) => {
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            return { name, accuracy, total: stats.total };
          });

          weakTopicsArray = topics
            .filter(t => t.total >= 3 && t.accuracy < 60)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 3);
        }

        setLiveStats({
          totalExams,
          totalQuestions,
          averageScore: globalAccuracy,
          weakestTopics: weakTopicsArray
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const dailyGoal = 50;
  const progressPercentage = Math.min((liveStats.totalQuestions / dailyGoal) * 100, 100);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* TOP NAVIGATION BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #1e293b', backgroundColor: '#020617', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '24px', height: '24px', backgroundColor: '#38bdf8', borderRadius: '4px' }}></div>
          <span style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Analytics Hub
          </span>
        </div>
        <button 
          onClick={() => signOut(auth)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          ✕ EXIT
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Header Area - ADDED flexWrap for mobile */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '40px' }}>
          <div style={{ flex: '1 1 min-content' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontFamily: 'Georgia, serif' }}>
              Candidate Overview
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
              Welcome back, {userData?.displayName || 'Candidate'}. Here is your live performance matrix.
            </p>
          </div>
          
          <button 
            onClick={onStartNewSession}
            style={{ padding: '14px 24px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '14px', letterSpacing: '1px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            LAUNCH CBT MODULE
          </button>
        </div>

        {/* Top Stats Grid - CHANGED to auto-fit so it stacks on phones */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Sessions Completed</p>
            <h2 style={{ margin: 0, fontSize: '36px', color: '#f8fafc' }}>{liveStats.totalExams}</h2>
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Questions Solved</p>
            <h2 style={{ margin: 0, fontSize: '36px', color: '#f8fafc' }}>{liveStats.totalQuestions}</h2>
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Accuracy</p>
            <h2 style={{ margin: 0, fontSize: '36px', color: '#38bdf8' }}>{liveStats.averageScore}%</h2>
          </div>
        </div>

        {/* Lower Grid: Weaknesses vs Daily Goal - CHANGED to auto-fit */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', paddingBottom: '40px' }}>
          
          {/* Actionable Weakness Targeting */}
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc', fontSize: '18px', fontWeight: '600' }}>
              Critical Weaknesses (Live Data)
            </h3>
            
            {liveStats.weakestTopics.length === 0 ? (
              <div style={{ padding: '30px 20px', backgroundColor: 'rgba(56, 189, 248, 0.05)', borderRadius: '12px', border: '1px dashed #334155', color: '#94a3b8', textAlign: 'center', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Insufficient data. Complete more CBT modules to generate targeting metrics.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {liveStats.weakestTopics.map((topic, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '18px' }}>{topic.accuracy}%</span>
                      <span style={{ fontWeight: '600', fontSize: '15px', color: '#e2e8f0', letterSpacing: '0.5px' }}>{topic.name}</span>
                    </div>
                    <button 
                      onClick={onStartNewSession}
                      style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                      Target Drill ↗
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Objective */}
          <div style={{ backgroundColor: '#0f172a', padding: '30px', borderRadius: '12px', border: '1px solid #1e293b', height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Daily Objective
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
              Solve {dailyGoal} questions daily to maintain neural retention.
            </p>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#fbbf24', borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>
              <span>{liveStats.totalQuestions} Completed</span>
              <span>{dailyGoal} Target</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};