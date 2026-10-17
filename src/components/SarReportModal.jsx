import React, { useState } from 'react';

export default function SarReportModal({ isOpen, onClose, transaction }) {
  const [copied, setCopied] = useState(false);
  const [sarData, setSarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filedStatus, setFiledStatus] = useState(false);

  React.useEffect(() => {
    if (isOpen && transaction) {
      fetchSarReport();
    } else {
      setSarData(null);
      setFiledStatus(false);
    }
  }, [isOpen, transaction]);

  const fetchSarReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-sar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.transactionId,
          evaluation: transaction
        })
      });
      const data = await res.json();
      if (data.success && data.sarReport) {
        setSarData(data.sarReport);
      }
    } catch (err) {
      console.error('Failed to generate SAR report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    if (sarData?.narrative) {
      navigator.clipboard.writeText(sarData.narrative);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFile = () => {
    setFiledStatus(true);
  };

  return (
    <div className="modal-backdrop" id="sar-modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="glass-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, hsla(222, 35%, 12%, 0.98), hsla(222, 40%, 8%, 0.98))',
          border: '1px solid hsla(43, 90%, 55%, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px hsla(43, 90%, 55%, 0.15)',
          padding: '28px',
          color: 'var(--text-primary)'
        }}
      >
        {/* Treasury / FinCEN Official Seal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid hsla(43, 90%, 55%, 0.25)',
          paddingBottom: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, hsla(43, 90%, 50%, 0.2), hsla(43, 90%, 30%, 0.1))',
              border: '1px solid hsla(43, 90%, 55%, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px'
            }}>
              ⚖️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'hsla(43, 95%, 60%, 1)' }}>
                  United States Department of the Treasury • FinCEN
                </span>
                <span className="scenario-badge" style={{ fontSize: '10px', background: 'hsla(43, 90%, 50%, 0.15)', borderColor: 'hsla(43, 90%, 55%, 0.5)', color: 'hsla(43, 95%, 65%, 1)' }}>
                  BSA Form 111 (SAR)
                </span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0 0 0', color: '#fff' }}>
                Automated Suspicious Activity Report (AI Copilot)
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '22px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto', width: '36px', height: '36px' }}></div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--brand-cyan)' }}>
              Synthesizing Multi-Agent Forensic Dossier via Google Gemini 3.8 Flash...
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Extracting FinCEN regulatory codes and drafting statutory BSA narrative
            </div>
          </div>
        ) : sarData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Filing Meta Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              background: 'hsla(220, 30%, 14%, 0.6)',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid hsla(220, 30%, 25%, 0.5)'
            }}>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Filing Control ID</div>
                <div className="mono" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-cyan)' }}>{sarData.sarId}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Filing Date & Time</div>
                <div style={{ fontSize: '12px' }}>{sarData.filingDate}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Subject Account</div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>{sarData.subject?.name} ({sarData.subject?.accountNumber})</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: filedStatus ? 'var(--neon-approve)' : '#f59e0b' }}>
                  {filedStatus ? '✓ FILED WITH REGULATORY NETWORK' : 'DRAFT READY FOR FILING'}
                </div>
              </div>
            </div>

            {/* Regulatory Classification Codes */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'hsla(43, 90%, 65%, 1)', marginBottom: '8px' }}>
                Applicable Suspicious Activity Classification Codes (Field 31 / 35):
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(sarData.regulatoryCodes || []).map((codeItem, idx) => (
                  <div key={idx} style={{
                    background: 'hsla(43, 80%, 40%, 0.12)',
                    border: '1px solid hsla(43, 80%, 50%, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <strong style={{ color: 'hsla(43, 95%, 65%, 1)' }}>[{codeItem.code}]</strong>
                    <span>{codeItem.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction & Risk Snapshot */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              background: 'hsla(220, 25%, 11%, 0.7)',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid hsla(220, 25%, 20%, 0.5)',
              fontSize: '12px'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>Transaction Profile</div>
                <div>Amount: <strong className="mono" style={{ color: '#fff' }}>${Number(sarData.transaction?.amount || 0).toLocaleString()} {sarData.transaction?.currency}</strong></div>
                <div>Beneficiary: <strong>{sarData.transaction?.beneficiaryName}</strong> ({sarData.transaction?.beneficiaryAccount})</div>
                <div>Narration: <em style={{ color: 'var(--brand-cyan)' }}>"{sarData.transaction?.memo}"</em></div>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>Automated Risk Assessment</div>
                <div>Composite Risk Score: <strong className="mono" style={{ color: 'var(--neon-block)' }}>{sarData.riskAssessment?.totalScore} / 100</strong></div>
                <div>Policy Action: <strong style={{ color: 'var(--neon-block)' }}>{sarData.riskAssessment?.actionRequired}</strong></div>
                <div>Coercion Detected: <strong style={{ color: sarData.riskAssessment?.isCoercionDetected ? 'var(--neon-block)' : 'inherit' }}>
                  {sarData.riskAssessment?.isCoercionDetected ? 'YES (Active Impersonation / Social Engineering)' : 'NO'}
                </strong></div>
              </div>
            </div>

            {/* FinCEN Narrative Prose */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📜 Statutory Law Enforcement Narrative</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '400' }}>(Drafted by Google Gemini 3.8 Flash)</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="btn btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  {copied ? '✓ Narrative Copied!' : '📋 Copy Narrative'}
                </button>
              </div>
              <div style={{
                background: 'hsla(220, 35%, 8%, 0.9)',
                border: '1px solid hsla(220, 30%, 25%, 0.6)',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.6',
                color: 'hsla(210, 40%, 90%, 1)',
                whiteSpace: 'pre-wrap',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {sarData.narrative}
              </div>
            </div>

            {/* Compliance Sign-off & Footer Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid hsla(220, 30%, 20%, 0.6)',
              paddingTop: '16px',
              marginTop: '4px'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Compliance Officer Sign-off: <strong style={{ color: 'var(--text-secondary)' }}>{sarData.complianceSignoff}</strong>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleFile}
                  disabled={filedStatus}
                  style={{
                    background: filedStatus ? 'var(--neon-approve)' : 'linear-gradient(135deg, hsla(43, 90%, 50%, 1), hsla(38, 90%, 45%, 1))',
                    color: '#000',
                    fontWeight: '700',
                    borderColor: 'hsla(43, 90%, 60%, 1)'
                  }}
                >
                  {filedStatus ? '✓ Filed with Regulatory Gateway' : '⚖️ File with Regulatory Gateway (FinCEN / IC3)'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
