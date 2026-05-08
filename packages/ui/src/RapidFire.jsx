import React from 'react';

const RapidFire = ({ 
  flashcardFilter, setFlashcardFilter, availableSubjects, 
  cardsToTest, currentCardIndex, isFlipped, setIsFlipped, 
  handlePrevCard, handleNextCard 
}) => {
  const animationStyles = `
    .flashcard-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; }
    .flashcard-flipped .flashcard-inner { transform: rotateY(180deg); }
    .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; padding: 30px; border-radius: 16px; border: 1px solid #1e293b; }
    .flashcard-front { background-color: #0f172a; color: #f8fafc; }
    .flashcard-back { background-color: #1e293b; color: #38bdf8; transform: rotateY(180deg); }
  `;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px' }}>
      <style>{animationStyles}</style>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ margin: 0, color: '#3b82f6', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '1.8rem' }}>Rapid Fire Override</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>Questions you fail are automatically vaulted here for neural reinforcement.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', background: 'rgba(15, 23, 42, 0.8)', padding: '10px 20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Focus Area:</label>
          <select 
              value={flashcardFilter} 
              onChange={(e) => setFlashcardFilter(e.target.value)}
              style={{ padding: '8px 15px', background: '#020617', color: '#fff', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', outline: 'none', fontWeight: 'bold' }}
          >
              {availableSubjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
              ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#3b82f6', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            {cardsToTest[currentCardIndex]?.subject || 'SYSTEM'}
          </span>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Card {currentCardIndex + 1} / {cardsToTest.length}
          </span>
      </div>

      <div 
        className={`flashcard-container ${isFlipped ? 'flashcard-flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ width: '100%', height: '350px', perspective: '1000px', cursor: 'pointer', marginBottom: '40px' }}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'normal', lineHeight: '1.5', margin: 0 }}>{cardsToTest[currentCardIndex]?.front}</h2>
            <div style={{ position: 'absolute', bottom: '20px', color: '#64748b', fontSize: '0.8rem', letterSpacing: '1px' }}>TAP TO FLIP</div>
          </div>
          <div className="flashcard-back">
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: '1.4', margin: 0 }}>{cardsToTest[currentCardIndex]?.back}</h2>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
          <button onClick={handlePrevCard} disabled={currentCardIndex === 0} style={{ flex: '1', padding: '15px 30px', background: 'transparent', color: currentCardIndex === 0 ? '#334155' : '#cbd5e1', border: `1px solid ${currentCardIndex === 0 ? '#334155' : '#3b82f6'}`, borderRadius: '8px', cursor: currentCardIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            PREVIOUS
          </button>
          <button onClick={handleNextCard} disabled={currentCardIndex === cardsToTest.length - 1} style={{ flex: '1', padding: '15px 40px', background: currentCardIndex === cardsToTest.length - 1 ? '#334155' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: currentCardIndex === cardsToTest.length - 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            NEXT CARD
          </button>
      </div>
    </div>
  );
};

export default RapidFire;