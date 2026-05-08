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

  // REAL-TIME DATABASE CONNECTION
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    
    // onSnapshot listens for live changes. When the database updates, the dashboard updates instantly.
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 1. Get total stats (default to 0 if they haven't taken any yet)
        const totalExams = data.totalExamsTaken || 0;
        const totalQuestions = data.totalQuestionsAnswered || 0;
        const globalAccuracy = data.globalAccuracy || 0;

        // 2. Process Topic Stats to find weaknesses automatically
        let weakTopicsArray = [];
        if (data.topicStats) {
          // Convert the topicStats object into an array we can sort
          const topics = Object.entries(data.topicStats).map(([name, stats]) => {
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            return { name, accuracy, total: stats.total };
          });

          // Filter for topics with at least 3 attempts and accuracy below 60%, then grab the 3 worst ones
          weakTopicsArray = topics
            .filter(t => t.total >= 3 && t.accuracy < 60)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 3);
        }

        // 3. Push the live data to the UI
        setLiveStats({
          totalExams,
          totalQuestions,
          averageScore: globalAccuracy,
          weakestTopics: weakTopicsArray
        });
      }
    });

    // Cleanup the listener when they leave the dashboard
    return () => unsubscribe();
  }, []);

  // Daily goal calculation (resets daily logic would go in your backend, but this calculates the bar)
  const dailyGoal = 50;
  const progressPercentage = Math.min((liveStats.totalQuestions / dailyGoal) * 100, 100);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* TOP NAVIGATION BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', borderBottom: '1px solid #1e293b', backgroundColor: '#020617' }}>
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
        
        {/* Header Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontFamily: 'Georgia, serif' }}>
              Candidate Overview
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>
              Welcome back, {userData?.displayName || 'Candidate'}. Here is your live performance matrix.
            </p>
          </div>
          
          <button 
            onClick={onStartNewSession}
            style={{ padding: '12px 24px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '14px', letterSpacing: '1px', cursor: 'pointer' }}
          >
            LAUNCH CBT MODULE
          </button>
        </div>

        {/* Top Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
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

        {/* Lower Grid: Weaknesses vs Daily Goal */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* Actionable Weakness Targeting */}
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc', fontSize: '18px', fontWeight: '600' }}>
              Critical Weaknesses (Live Data)
            </h3>
            
            {liveStats.weakestTopics.length === 0 ? (
              <div style={{ padding: '20px', backgroundColor: 'rgba(56, 189, 248, 0.05)', borderRadius: '8px', border: '1px dashed #334155', color: '#94a3b8', textAlign: 'center' }}>
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
            <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '14px' }}>
              Solve {dailyGoal} questions daily to maintain neural retention.
            </p>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', marginBottom: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#fbbf24', borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
              <span>{liveStats.totalQuestions} Completed</span>
              <span>{dailyGoal} Target</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};