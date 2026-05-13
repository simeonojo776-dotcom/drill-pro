import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const RapidFire = ({ 
  flashcardFilter, setFlashcardFilter, availableSubjects, 
  cardsToTest, currentCardIndex, isFlipped, setIsFlipped, 
  handlePrevCard, handleNextCard 
}) => {
  const [startX, setStartX] = useState(null);
  const [offsetX, setOffsetX] = useState(0);

  const currentCard = cardsToTest[currentCardIndex];

  const triggerHaptic = async (style) => {
    try { await Haptics.impact({ style }); } catch (e) { }
  };

  const handleTouchStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleTouchMove = (e) => {
    if (startX === null) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setOffsetX(clientX - startX);
  };

  const handleTouchEnd = () => {
    if (startX === null) return;
    if (offsetX > 120 && currentCardIndex < cardsToTest.length - 1) {
      triggerHaptic(ImpactStyle.Light);
      handleNextCard();
    } else if (offsetX < -120 && currentCardIndex < cardsToTest.length - 1) {
      triggerHaptic(ImpactStyle.Heavy);
      handleNextCard();
    }
    setStartX(null);
    setOffsetX(0);
  };

  const cardTransform = `translateX(${offsetX}px) rotate(${offsetX * 0.05}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`;
  const rightOpacity = Math.min(offsetX / 100, 1);
  const leftOpacity = Math.min(Math.abs(offsetX) / 100, 1) * (offsetX < 0 ? 1 : 0);

  const animationStyles = `
    .flashcard-inner { position: relative; width: 100%; height: 100%; text-align: center; transform-style: preserve-3d; }
    .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; padding: 30px; border-radius: 16px; border: 1px solid #1e293b; }
    .flashcard-front { background-color: #0f172a; color: #f8fafc; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .flashcard-back { background-color: #1e293b; color: #38bdf8; transform: rotateY(180deg); box-shadow: 0 10px 40px rgba(59, 130, 246, 0.2); }
  `;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px', fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
      <style>{animationStyles}</style>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ margin: 0, color: '#3b82f6', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Zap color="#3b82f6" size={28} /> Rapid Fire Override
        </h2>
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
          {currentCard?.subject || 'SYSTEM'}
        </span>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Card {currentCardIndex + 1} / {cardsToTest.length}
        </span>
      </div>

      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        style={{ width: '100%', height: '350px', perspective: '1000px', cursor: startX ? 'grabbing' : 'grab', marginBottom: '40px' }}
      >
        <div 
          className="flashcard-inner" 
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ transform: cardTransform, transition: startX ? 'none' : 'transform 0.4s ease-out' }}
        >
          <div className="flashcard-front">
            <div style={{ position: 'absolute', top: '30px', left: '30px', opacity: leftOpacity, color: '#ef4444', border: '4px solid #ef4444', padding: '8px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.2rem', transform: 'rotate(-15deg)', zIndex: 10 }}>
              REVIEW
            </div>
            <div style={{ position: 'absolute', top: '30px', right: '30px', opacity: rightOpacity > 0 ? rightOpacity : 0, color: '#10b981', border: '4px solid #10b981', padding: '8px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.2rem', transform: 'rotate(15deg)', zIndex: 10 }}>
              MASTERED
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 1, padding: '0 20px' }}>
              <p style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc', lineHeight: '1.5' }}>{currentCard?.front}</p>
            </div>
            <div style={{ position: 'absolute', bottom: '20px', color: '#64748b', fontSize: '0.8rem', letterSpacing: '1px', zIndex: 1 }}>TAP TO FLIP OR SWIPE</div>
          </div>

          <div className="flashcard-back">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '0 20px' }}>
               <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Answer</span>
               <p style={{ margin: 0, fontSize: '1.6rem', color: '#38bdf8', lineHeight: '1.4', fontWeight: 'bold' }}>{currentCard?.back}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
        <button onClick={handlePrevCard} disabled={currentCardIndex === 0} style={{ flex: '1', padding: '15px 30px', background: 'transparent', color: currentCardIndex === 0 ? '#334155' : '#cbd5e1', border: `1px solid ${currentCardIndex === 0 ? '#334155' : '#3b82f6'}`, borderRadius: '8px', cursor: currentCardIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
          PREVIOUS
        </button>
        <button onClick={handleNextCard} disabled={currentCardIndex === cardsToTest.length - 1} style={{ flex: '1', padding: '15px 40px', background: currentCardIndex === cardsToTest.length - 1 ? '#334155' : '#3b82f6', color: currentCardIndex === cardsToTest.length - 1 ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', cursor: currentCardIndex === cardsToTest.length - 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
          NEXT CARD
        </button>
      </div>
    </div>
  );
};

export default RapidFire;