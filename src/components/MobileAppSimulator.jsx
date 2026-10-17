import React, { useState, useRef, useEffect } from 'react';
import './MobileAppSimulator.css';

export default function MobileAppSimulator({ isOpen, onClose, onTransactionSubmit }) {
  const [step, setStep] = useState('login'); // login -> dashboard -> transfer -> capture -> review_capture -> processing -> debiasing -> aborted_saved -> success/challenge/blocked
  const [user, setUser] = useState({ id: 'usr_alex_chen', name: 'Alex Chen', balance: 14850.00 });
  const [transferAmount, setTransferAmount] = useState('14500.00');
  const [transferMemo, setTransferMemo] = useState('SAFE HOLDING RECOVERY VAULT - CLEARANCE');
  const [beneficiary, setBeneficiary] = useState('ACC_NEW_RECIPIENT_391');
  const [capturedImage, setCapturedImage] = useState(null);

  // Scam Telemetry Simulation State
  const [isCallActive, setIsCallActive] = useState(true);
  const [callDuration, setCallDuration] = useState(18.0);
  const [isClipboardPasted, setIsClipboardPasted] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('scam_police');

  // De-Biasing Conversation State
  const [debiasMessages, setDebiasMessages] = useState([]);
  const [debiasLoading, setDebiasLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (step === 'capture') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  const handleSelectPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    if (presetKey === 'scam_police') {
      setTransferAmount('14500.00');
      setTransferMemo('SAFE HOLDING RECOVERY VAULT - CLEARANCE');
      setBeneficiary('ACC_NEW_RECIPIENT_391');
      setIsCallActive(true);
      setCallDuration(18.5);
      setIsClipboardPasted(true);
    } else if (presetKey === 'scam_crypto') {
      setTransferAmount('8500.00');
      setTransferMemo('APEX-YIELD VIP USDT ALLOCATION 450% GUARANTEED');
      setBeneficiary('ACC_NEW_RECIPIENT_391');
      setIsCallActive(true);
      setCallDuration(24.0);
      setIsClipboardPasted(true);
    } else if (presetKey === 'scam_tax') {
      setTransferAmount('5200.00');
      setTransferMemo('URGENT TAX AUDIT PENALTY WAIVER SETTLEMENT');
      setBeneficiary('ACC_NEW_RECIPIENT_391');
      setIsCallActive(true);
      setCallDuration(12.0);
      setIsClipboardPasted(true);
    } else {
      setTransferAmount('650.00');
      setTransferMemo('Monthly Apartment Rent');
      setBeneficiary('MERCHANT_COFFEE_BEANS');
      setIsCallActive(false);
      setCallDuration(0);
      setIsClipboardPasted(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      // Fallback: allow continuing even without physical webcam
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const base64Image = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(base64Image);
      stopCamera();
      setStep('review_capture');
    } else {
      // Dummy selfie if webcam unavailable
      setCapturedImage('/assets/authentic_alex_selfie.png');
      setStep('review_capture');
    }
  };

  const submitTransaction = async () => {
    setStep('processing');
    
    const payload = {
      userId: user.id,
      amount: parseFloat(transferAmount),
      currency: "USD",
      memo: transferMemo,
      timestamp: new Date().toISOString(),
      location: { lat: 25.0330, lng: 121.5654, city: "Taipei", country: "TW" },
      activeCallInProgress: isCallActive,
      callDurationMinutes: isCallActive ? callDuration : 0,
      clipboardPasted: isClipboardPasted,
      clipboardDwellTimeSeconds: isClipboardPasted ? 1.4 : 12.0,
      device: {
        fingerprintId: "dev_fp_iphone15_alex_tw",
        model: "iPhone 15 Pro",
        isRootedOrJailbroken: false,
        isVpnOrProxy: false,
        activeCallInProgress: isCallActive,
        callDurationMinutes: isCallActive ? callDuration : 0,
        clipboardPasted: isClipboardPasted,
        clipboardDwellTimeSeconds: isClipboardPasted ? 1.4 : 12.0
      },
      beneficiary: {
        id: beneficiary,
        name: beneficiary === "ACC_NEW_RECIPIENT_391" ? "Liam Vance (Unverified)" : (beneficiary === "ACC_MULE_HUB_99" ? "Mule Aggregator #99" : "Artisan Coffee Co"),
        accountNumber: beneficiary,
        isNewBeneficiary: beneficiary !== "MERCHANT_COFFEE_BEANS"
      },
      biometric: {
        selfieType: "verified_live",
        documentType: "authentic_id",
        hasGlareOrBlur: false,
        skipped: false,
        selfieBase64: capturedImage
      },
      recentMpinResetTimestamp: null,
      failedLoginsInPast24h: 0,
      simSwapReported: false
    };

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onTransactionSubmit(data.data);
        setEvalResult(data.data);

        const scoring = data.data.scoring;
        const agent5 = data.data.agentResults?.agent5;

        // Check for Coercion / De-Biasing Trigger
        if (scoring?.actionRequired === 'DEBIASING_INTERVENTION' || agent5?.isCoercionDetected) {
          setDebiasMessages([
            {
              sender: 'ai',
              text: `Alex, we paused this $${parseFloat(transferAmount).toLocaleString()} transfer for 60 seconds. Our AI detected you are sending funds to an unverified recipient while currently on an active ${callDuration.toFixed(0)}-minute phone call with an urgent memo.`
            }
          ]);
          setStep('debiasing');
        } else if (scoring.decision === 'BLOCK') {
          setStep('blocked');
        } else if (scoring.decision === 'CHALLENGE') {
          setStep('challenge');
        } else {
          setUser(prev => ({ ...prev, balance: prev.balance - parseFloat(transferAmount) }));
          setStep('success');
        }
      } else {
        alert("Error submitting transaction");
        setStep('dashboard');
      }
    } catch (err) {
      console.error(err);
      setStep('dashboard');
    }
  };

  const handleDebiasAnswer = async (answerText) => {
    const updatedMessages = [...debiasMessages, { sender: 'user', text: answerText }];
    setDebiasMessages(updatedMessages);
    setDebiasLoading(true);

    try {
      const res = await fetch('/api/debias-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: answerText,
          transactionContext: {
            amount: parseFloat(transferAmount),
            memo: transferMemo
          }
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setDebiasMessages([...updatedMessages, { sender: 'ai', text: data.reply }]);
      }
    } catch (err) {
      setDebiasMessages([
        ...updatedMessages,
        {
          sender: 'ai',
          text: "🚨 SCAM CONFIRMED: Alex, please HANG UP immediately! Real police and bank security NEVER ask you to wire funds to a 'safe haven' account. Your money is completely safe in your current account."
        }
      ]);
    } finally {
      setDebiasLoading(false);
    }
  };

  const handleAbortTransfer = () => {
    // User saves their money!
    setStep('aborted_saved');
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-simulator-overlay">
      <div className="mobile-phone-frame">
        <div className="mobile-notch"></div>
        <button className="mobile-close-btn" onClick={onClose}>&times;</button>

        <div className="mobile-screen">
          
          {/* 1. LOGIN */}
          {step === 'login' && (
            <div className="mobile-view mobile-login">
              <h2>Aegis Bank</h2>
              <div className="input-group">
                <label>User ID</label>
                <input type="text" value={user.id} readOnly />
              </div>
              <div className="input-group">
                <label>MPIN</label>
                <input type="password" value="******" readOnly />
              </div>
              <button className="mobile-primary-btn" onClick={() => setStep('dashboard')}>Login securely</button>
            </div>
          )}

          {/* 2. DASHBOARD */}
          {step === 'dashboard' && (
            <div className="mobile-view mobile-dashboard">
              <div className="mobile-header">
                <h3>Welcome, {user.name}</h3>
              </div>
              <div className="mobile-balance-card">
                <p>Available Balance</p>
                <h1>${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
              </div>
              <div className="mobile-actions">
                <button className="mobile-action-btn" onClick={() => setStep('transfer')}>
                  <span className="icon">💸</span> Send Money
                </button>
              </div>
            </div>
          )}

          {/* 3. TRANSFER WITH SCAM SIMULATION CONTROLS */}
          {step === 'transfer' && (
            <div className="mobile-view mobile-transfer" style={{ overflowY: 'auto' }}>
              <div className="mobile-header">
                <button className="mobile-back-btn" onClick={() => setStep('dashboard')}>&larr;</button>
                <h3>Transfer Funds</h3>
              </div>

              {/* Threat Preset Selector */}
              <div className="scam-simulation-box">
                <div className="scam-simulation-title">
                  <span>⚡ Quick Threat Presets</span>
                  <span style={{ fontSize: '10px', color: '#38bdf8' }}>AI Coercion Demo</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button 
                    type="button"
                    onClick={() => handleSelectPreset('scam_police')}
                    style={{
                      background: selectedPreset === 'scam_police' ? 'hsla(0, 80%, 40%, 0.4)' : '#1f2937',
                      border: selectedPreset === 'scam_police' ? '1px solid #ef4444' : '1px solid #374151',
                      color: selectedPreset === 'scam_police' ? '#fca5a5' : '#cbd5e1',
                      padding: '6px', borderRadius: '8px', fontSize: '10px', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    🚨 Fake Police Scam
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSelectPreset('scam_crypto')}
                    style={{
                      background: selectedPreset === 'scam_crypto' ? 'hsla(280, 80%, 40%, 0.4)' : '#1f2937',
                      border: selectedPreset === 'scam_crypto' ? '1px solid #a855f7' : '1px solid #374151',
                      color: selectedPreset === 'scam_crypto' ? '#d8b4fe' : '#cbd5e1',
                      padding: '6px', borderRadius: '8px', fontSize: '10px', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    💎 450% Crypto Scam
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSelectPreset('scam_tax')}
                    style={{
                      background: selectedPreset === 'scam_tax' ? 'hsla(38, 90%, 40%, 0.4)' : '#1f2937',
                      border: selectedPreset === 'scam_tax' ? '1px solid #f59e0b' : '1px solid #374151',
                      color: selectedPreset === 'scam_tax' ? '#fcd34d' : '#cbd5e1',
                      padding: '6px', borderRadius: '8px', fontSize: '10px', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    ⚖️ IRS Tax Penalty
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSelectPreset('normal_rent')}
                    style={{
                      background: selectedPreset === 'normal_rent' ? 'hsla(150, 80%, 40%, 0.3)' : '#1f2937',
                      border: selectedPreset === 'normal_rent' ? '1px solid #10b981' : '1px solid #374151',
                      color: selectedPreset === 'normal_rent' ? '#86efac' : '#cbd5e1',
                      padding: '6px', borderRadius: '8px', fontSize: '10px', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    🟢 Normal Rent
                  </button>
                </div>

                <div className="scam-toggle-row" style={{ marginTop: '4px' }}>
                  <span>📞 Active Call in Progress ({callDuration}m):</span>
                  <label className="scam-toggle-switch">
                    <input type="checkbox" checked={isCallActive} onChange={e => setIsCallActive(e.target.checked)} />
                    <span className="scam-toggle-slider"></span>
                  </label>
                </div>

                <div className="scam-toggle-row">
                  <span>📋 Pasted from Telegram/WhatsApp:</span>
                  <label className="scam-toggle-switch">
                    <input type="checkbox" checked={isClipboardPasted} onChange={e => setIsClipboardPasted(e.target.checked)} />
                    <span className="scam-toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="mobile-form">
                <div className="input-group">
                  <label>Amount (USD)</label>
                  <input type="number" placeholder="0.00" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Beneficiary ID</label>
                  <select value={beneficiary} onChange={e => setBeneficiary(e.target.value)}>
                    <option value="ACC_NEW_RECIPIENT_391">Liam Vance (New & Unverified)</option>
                    <option value="MERCHANT_COFFEE_BEANS">Artisan Coffee Co (Trusted)</option>
                    <option value="ACC_MULE_HUB_99">Mule Aggregator #99 (High Risk)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Payment Memo / Narration</label>
                  <input type="text" value={transferMemo} onChange={e => setTransferMemo(e.target.value)} />
                </div>
                
                <button 
                  className="mobile-primary-btn" 
                  disabled={!transferAmount || transferAmount <= 0}
                  onClick={() => setStep('capture')}
                  style={{ marginTop: '10px' }}
                >
                  Continue to Biometric Verification
                </button>
              </div>
            </div>
          )}

          {/* 4. LIVE CAMERA CAPTURE */}
          {step === 'capture' && (
            <div className="mobile-view mobile-capture">
              <div className="mobile-header">
                <button className="mobile-back-btn" onClick={() => setStep('transfer')}>&larr;</button>
                <h3>Security Check</h3>
              </div>
              <p className="mobile-instruction">Please take a selfie to verify your identity for this transfer.</p>
              <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline muted></video>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              </div>
              <button className="mobile-capture-btn" onClick={capturePhoto}>📸 Capture Selfie</button>
            </div>
          )}

          {/* 5. REVIEW CAPTURE */}
          {step === 'review_capture' && (
            <div className="mobile-view mobile-review-capture">
              <div className="mobile-header">
                <h3>Review Selfie</h3>
              </div>
              <img src={capturedImage} alt="Captured Selfie" className="captured-preview" />
              <div className="mobile-btn-group">
                <button className="mobile-secondary-btn" onClick={() => setStep('capture')}>Retake</button>
                <button className="mobile-primary-btn" onClick={submitTransaction}>Verify & Send</button>
              </div>
            </div>
          )}

          {/* 6. PROCESSING */}
          {step === 'processing' && (
            <div className="mobile-view mobile-processing">
              <div className="spinner"></div>
              <h3>LangGraph 5-Agent Analysis...</h3>
              <p>Evaluating telemetry, RAG security, facial biometrics, mule graph, and Google Search Grounding coercion signals.</p>
            </div>
          )}

          {/* 7. INTERACTIVE AI "DE-BIASING" SCAM INTERCEPTOR */}
          {step === 'debiasing' && (
            <div className="mobile-view mobile-debiasing">
              <div>
                <div className="debiasing-shield-pulse">
                  🛡️
                </div>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#f87171' }}>AegisGuard Scam Interceptor</h3>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Powered by Google Gemini Conversational AI</div>
                </div>

                {/* Dialog Messages */}
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {debiasMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className="debiasing-chat-bubble"
                      style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.sender === 'user' ? 'hsla(220, 60%, 25%, 0.9)' : 'hsla(220, 30%, 14%, 0.9)',
                        borderColor: msg.sender === 'user' ? 'hsla(210, 80%, 50%, 0.4)' : '#ef4444'
                      }}
                    >
                      <div style={{ fontSize: '10px', color: msg.sender === 'user' ? '#93c5fd' : '#fca5a5', fontWeight: '700', marginBottom: '2px' }}>
                        {msg.sender === 'user' ? 'Alex Chen' : '🤖 AegisGuard Fraud Interceptor'}
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  ))}
                  {debiasLoading && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', padding: '6px' }}>
                      Gemini is analyzing your response...
                    </div>
                  )}
                </div>

                {/* Interactive Diagnostic Options */}
                <div className="debiasing-options-list" style={{ marginTop: '12px' }}>
                  <button 
                    type="button"
                    className="debiasing-option-btn"
                    onClick={() => handleDebiasAnswer("Yes! The caller claimed to be police and said my account is frozen!")}
                  >
                    📞 "Yes! The caller told me to wire money to a safe account!"
                  </button>
                  <button 
                    type="button"
                    className="debiasing-option-btn"
                    onClick={() => handleDebiasAnswer("Yes! A crypto manager promised 450% guaranteed returns on Telegram!")}
                  >
                    💰 "Yes! Promised 450% crypto returns over chat!"
                  </button>
                  <button 
                    type="button"
                    className="debiasing-option-btn"
                    onClick={() => handleDebiasAnswer("No, this is my own idea. I know the recipient personally.")}
                  >
                    👤 "No, this is my personal transfer."
                  </button>
                </div>
              </div>

              {/* Safety Action Buttons */}
              <div className="debiasing-emergency-actions">
                <button className="btn-cancel-scam" onClick={handleAbortTransfer}>
                  🛑 Hang Up & Cancel Transfer (Save Funds)
                </button>
                <button className="btn-hotline" onClick={() => alert("Connecting to AegisGuard Fraud Hotline: 1-800-AEGIS-GUARD (24/7 Priority Support)")}>
                  📞 Call Official Bank Fraud Hotline
                </button>
              </div>
            </div>
          )}

          {/* 8. ABORTED & SAVED SCREEN */}
          {step === 'aborted_saved' && (
            <div className="mobile-view mobile-success">
              <div className="success-icon" style={{ fontSize: '72px' }}>🛡️</div>
              <h2 style={{ color: '#10b981' }}>Scam Intercepted!</h2>
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                You safely cancelled the transfer before any money left the bank.
                Your <strong>${user.balance.toLocaleString()}</strong> remains secure.
              </p>
              <div style={{ background: 'hsla(150, 80%, 20%, 0.2)', border: '1px solid #10b981', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#86efac', textAlign: 'left', margin: '10px 0' }}>
                ✓ Impersonation caller disconnected<br />
                ✓ Account protected from liquidation<br />
                ✓ Incident logged in Admin Operations Portal
              </div>
              <button className="mobile-primary-btn" onClick={() => setStep('dashboard')}>Return to Home</button>
            </div>
          )}

          {/* 9. SUCCESS */}
          {step === 'success' && (
            <div className="mobile-view mobile-success">
              <div className="success-icon">✅</div>
              <h2>Transfer Successful</h2>
              <p>Your identity was verified and the transaction was approved.</p>
              <button className="mobile-primary-btn" onClick={() => setStep('dashboard')}>Back to Home</button>
            </div>
          )}

          {/* 10. CHALLENGE */}
          {step === 'challenge' && (
            <div className="mobile-view mobile-challenge">
              <div className="warning-icon">⚠️</div>
              <h2>Additional Verification Required</h2>
              <p>AegisGuard flagged this transaction. Please resolve via the Admin Dashboard.</p>
              <button className="mobile-primary-btn" onClick={() => setStep('dashboard')}>Back to Home</button>
            </div>
          )}

          {/* 11. BLOCKED */}
          {step === 'blocked' && (
            <div className="mobile-view mobile-blocked">
              <div className="error-icon">❌</div>
              <h2>Transaction Blocked</h2>
              <p>Critical fraud risk or identity mismatch detected. Your account has been temporarily restricted.</p>
              <button className="mobile-primary-btn" onClick={() => setStep('dashboard')}>Back to Home</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
