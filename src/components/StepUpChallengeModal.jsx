import React, { useState } from 'react';

export default function StepUpChallengeModal({ isOpen, onClose, transaction, onChallengeResolved }) {
  if (!isOpen || !transaction) return null;

  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleVerifyOtp = async (codeToUse = otpCode) => {
    setIsVerifying(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/challenge/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.transactionId,
          otpCode: codeToUse || '849201'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Step-Up Authentication successfully satisfied! Transaction Approved.');
        setTimeout(() => {
          onChallengeResolved(data.transaction);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.message || 'Verification failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBiometricFaceVerify = async () => {
    setIsVerifying(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/challenge/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.transactionId,
          biometricConfirmed: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Biometric 3D Liveness passed! Transaction Cleared.');
        setTimeout(() => {
          onChallengeResolved(data.transaction);
          onClose();
        }, 1200);
      } else {
        setErrorMsg('Biometric verification failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="modal-overlay" id="step-up-modal-overlay">
      <div className="modal-content" id="step-up-modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <div>
              <div className="modal-title">Step-Up Authentication Required</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Transaction Score: <strong style={{ color: 'var(--neon-challenge)' }}>{transaction.scoring?.totalRiskScore}/100</strong> (Threshold: 50-89)
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ background: 'hsla(38, 95%, 52%, 0.1)', border: '1px solid var(--neon-challenge)', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Because this transaction exhibits elevated risk flags, the policy engine requires secondary cardholder confirmation before funds can be released.
        </div>

        {errorMsg && (
          <div style={{ background: 'hsla(350, 89%, 60%, 0.15)', border: '1px solid var(--neon-block)', color: 'var(--neon-block)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'hsla(158, 85%, 45%, 0.15)', border: '1px solid var(--neon-safe)', color: 'var(--neon-safe)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
            {successMsg}
          </div>
        )}

        {/* Verification Option 1: OTP SMS */}
        <div className="form-group">
          <label className="form-label">Method A: SMS / Authenticator OTP (6-Digits)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input mono"
              placeholder="e.g. 849201"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              style={{ letterSpacing: '4px', fontSize: '18px', textAlign: 'center', flex: 1 }}
            />
            <button
              className="btn btn-primary"
              disabled={isVerifying}
              onClick={() => handleVerifyOtp()}
            >
              Verify OTP
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setOtpCode('849201');
                handleVerifyOtp('849201');
              }}
            >
              Auto-Fill Demo Code (849201)
            </button>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sent to registered phone</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', position: 'relative' }}>
          <span>— OR —</span>
        </div>

        {/* Verification Option 2: Live Biometric */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="form-label">Method B: Instant Biometric Facial Scan</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <img 
              src="/assets/selfie_alex_match.jpg" 
              alt="Biometric camera" 
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Webcam 3D Liveness Detection</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Corroborate identity using active micro-gaze verification</div>
            </div>
            <button
              className="btn btn-secondary"
              disabled={isVerifying}
              onClick={handleBiometricFaceVerify}
            >
              Verify Face
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
