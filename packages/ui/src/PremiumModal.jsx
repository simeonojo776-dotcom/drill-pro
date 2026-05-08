import React, { useState } from 'react';
import { Crown, CheckCircle2, X, Zap, Shield, Loader2, ExternalLink } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase'; 

const PremiumModal = ({ onClose, user }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Notice how paymentLink is now perfectly accepted here
  const handlePaystackClick = async (planName, paymentLink) => {
    if (user && (user.email === "simeonojo776@gmail.com" || user.email === "friend.one@gmail.com")) {
      alert("👑 VIP Admin Recognized. Bypassing Paystack...");
      await grantVIP(planName);
      return; 
    }

    setIsProcessing(true);
    // Opens the specific link for Monthly or Yearly
    window.open(paymentLink, "_blank");
    
    setTimeout(() => {
      alert("Once your payment is successful, the Admin will activate your Drill Pro account within a few minutes! (You can close this tab and complete payment on the Paystack page).");
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  const grantVIP = async (planName) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        isPremium: true,
        accountTier: planName,
        premiumSince: new Date().toISOString(),
        notifications: arrayUnion({
          id: Date.now().toString(),
          title: "Premium Activated 🏆",
          message: `Welcome to the ${planName} plan! Your VIP Override was successful.`,
          date: new Date().toISOString(),
          read: false
        })
      });
      alert(`VIP Access Granted! Welcome to Drill Pro.`);
      onClose();
    } catch (error) {
      alert("Database update failed. Check console.");
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      <div style={{ background: 'linear-gradient(180deg, #1e293b, #0f172a)', border: '1px solid #eab308', borderRadius: '24px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 40px rgba(234, 179, 8, 0.15)', animation: 'slideUp 0.3s ease-out', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', zIndex: 10 }}>
          <X size={16} />
        </button>

        <div style={{ background: 'linear-gradient(135deg, #a855f7, #eab308)', padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
          <Crown size={48} color="#fff" style={{ marginBottom: '10px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Drill <span style={{ fontWeight: '300' }}>Pro</span></h2>
        </div>

        <div style={{ padding: '30px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f8fafc' }}>
              <Shield size={20} color="#eab308" />
              <span style={{ fontSize: '1rem' }}>Zero Advertisements</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f8fafc' }}>
              <Zap size={20} color="#eab308" />
              <span style={{ fontSize: '1rem' }}>Advanced AI Oracle Models</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f8fafc' }}>
              <CheckCircle2 size={20} color="#eab308" />
              <span style={{ fontSize: '1rem' }}>Unlimited PDF Storage</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* BUTTON 1: Monthly (Link injected here) */}
            <button 
              onClick={() => handlePaystackClick("Monthly Pro", "https://paystack.shop/pay/yo79yqvuye")}
              disabled={isProcessing}
              style={{ width: '100%', padding: '16px', background: '#1e293b', color: '#eab308', border: '1px solid #eab308', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              {isProcessing ? <Loader2 size={20} className="spin-animation" /> : <>₦500 / Month <ExternalLink size={18}/></>}
            </button>

            {/* BUTTON 2: Yearly (Link injected here) */}
            <button 
              onClick={() => handlePaystackClick("Yearly Elite", "https://paystack.shop/pay/10xy915v0b")}
              disabled={isProcessing}
              style={{ width: '100%', padding: '16px', background: 'linear-gradient(90deg, #eab308, #ca8a04)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(234, 179, 8, 0.4)' }}
            >
              {isProcessing ? <Loader2 size={20} className="spin-animation" /> : <>₦6,000 / Year <ExternalLink size={18}/></>}
            </button>
          </div>
          
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', marginTop: '15px' }}>
            Secure payment via Paystack. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;