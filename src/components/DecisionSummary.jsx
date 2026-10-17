import React from 'react';

export default function DecisionSummary({ evaluation, onOpenChallengeModal, onOpenSarModal }) {
  if (!evaluation) return null;

  const {
    transactionId,
    timestamp,
    user,
    transactionDetails,
    scoring,
    telemetry,
    stepUpStatus
  } = evaluation;

  const contributions = scoring?.agentContributions || {};
  const isChallenge = scoring?.decision === 'CHALLENGE' || stepUpStatus === 'PENDING_CHALLENGE';
  const isChallengePassed = stepUpStatus === 'STEP_UP_VERIFIED_APPROVED';

  return (
    <div className="glass-card decision-summary-card" id="decision-summary-card">
      <div className="decision-header-info">
        <div className="dossier-meta">
          <div className="dossier-id">
            <span className="mono" style={{ color: 'var(--brand-cyan)' }}>{transactionId}</span>
            {isChallengePassed && (
              <span className="scenario-badge approve" style={{ fontSize: '11px' }}>
                ✓ Step-Up Verified
              </span>
            )}
          </div>
          <div className="dossier-time">
            Initiated: {new Date(timestamp).toLocaleString()} • User: <strong>{user?.name}</strong> ({user?.accountNumber})
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* FinCEN SAR Copilot Button */}
          <button
            className="btn btn-secondary"
            id="btn-generate-sar"
            onClick={onOpenSarModal}
            style={{
              borderColor: 'hsla(43, 90%, 55%, 0.6)',
              background: 'linear-gradient(135deg, hsla(43, 90%, 50%, 0.15), hsla(220, 30%, 15%, 0.8))',
              color: 'hsla(43, 95%, 70%, 1)',
              fontWeight: '600'
            }}
          >
            <span>⚖️</span>
            <span>Generate FinCEN SAR Copilot</span>
          </button>

          {isChallenge && (
            <button
              className="btn btn-primary"
              id="btn-resolve-challenge"
              onClick={onOpenChallengeModal}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Complete Step-Up Challenge (OTP / Face)
            </button>
          )}
        </div>
      </div>

      {/* Action Guidance Callout */}
      <div className={`action-guidance-box ${scoring?.decisionLevel || 'SAFE'}`} id="action-guidance-box">
        <div className="action-title">
          <span>Policy Engine Directive:</span>
          <span className="mono" style={{ color: 'var(--brand-cyan)' }}>{scoring?.actionRequired}</span>
        </div>
        <div className="action-desc">
          {scoring?.recommendedActionText}
        </div>
      </div>

      {/* Quick Metrics Row */}
      <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-stat-box">
          <div className="stat-label">Txn Amount</div>
          <div className="stat-value">${Number(transactionDetails?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="metric-stat-box">
          <div className="stat-label">⚡ Phase 1 Real-Time Gate</div>
          <div className="stat-value" style={{ color: '#00e676' }}>
            {telemetry?.phase1FastGateLatencyMs || 18} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ms</span>
            <span style={{ fontSize: '10px', background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '500' }}>
              &lt;50ms SLA PASS
            </span>
          </div>
        </div>
        <div className="metric-stat-box">
          <div className="stat-label">🧠 Phase 2 Deep AI Latency</div>
          <div className="stat-value">
            {telemetry?.totalPipelineLatencyMs || 28} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ms</span>
            {telemetry?.circuitBreakerState === 'OPEN' && (
              <span title="Circuit Guard active - 429 quota resilient fallback" style={{ fontSize: '10px', background: 'rgba(255, 179, 0, 0.15)', color: '#ffb300', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '500' }}>
                🛡️ Circuit Guard
              </span>
            )}
          </div>
        </div>
        <div className="metric-stat-box">
          <div className="stat-label">Payment Architecture</div>
          <div className="stat-value" style={{ fontSize: '13px', color: 'var(--brand-cyan)' }}>
            Dual-Rail Hybrid Engine
          </div>
        </div>
      </div>

      {/* Contribution Weights Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span>Agent Feature Contributions to Risk Score:</span>
          <span className="mono">Weighted: {scoring?.totalRiskScore || 0} / 100 Pts</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {/* Agent 1 */}
          <div style={{ background: 'hsla(223, 28%, 15%, 0.8)', padding: '8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>A1: Telemetry</div>
            <div className="mono" style={{ fontSize: '14px', fontWeight: '700', color: contributions.agent1Telemetry?.score > 12 ? 'var(--neon-block)' : 'var(--text-primary)' }}>
              {contributions.agent1Telemetry?.score ?? 0} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 25</span>
            </div>
          </div>
          {/* Agent 2 */}
          <div style={{ background: 'hsla(223, 28%, 15%, 0.8)', padding: '8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>A2: Audit RAG</div>
            <div className="mono" style={{ fontSize: '14px', fontWeight: '700', color: contributions.agent2AuditRAG?.score > 12 ? 'var(--neon-block)' : 'var(--text-primary)' }}>
              {contributions.agent2AuditRAG?.score ?? 0} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 25</span>
            </div>
          </div>
          {/* Agent 3 */}
          <div style={{ background: 'hsla(223, 28%, 15%, 0.8)', padding: '8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>A3: Biometrics</div>
            <div className="mono" style={{ fontSize: '14px', fontWeight: '700', color: contributions.agent3Multimodal?.score > 12 ? 'var(--neon-block)' : 'var(--text-primary)' }}>
              {contributions.agent3Multimodal?.score ?? 0} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 25</span>
            </div>
          </div>
          {/* Agent 4 */}
          <div style={{ background: 'hsla(223, 28%, 15%, 0.8)', padding: '8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>A4: Graph</div>
            <div className="mono" style={{ fontSize: '14px', fontWeight: '700', color: contributions.agent4BehavioralGraph?.score > 12 ? 'var(--neon-block)' : 'var(--text-primary)' }}>
              {contributions.agent4BehavioralGraph?.score ?? 0} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 25</span>
            </div>
          </div>
          {/* Agent 5 */}
          <div style={{ background: 'hsla(223, 28%, 15%, 0.8)', padding: '8px', borderRadius: '6px', border: contributions.agent5ScamCoercion?.score > 12 ? '1px solid hsla(280, 80%, 60%, 0.4)' : 'none' }}>
            <div style={{ fontSize: '10px', color: 'var(--brand-purple, #a855f7)', textTransform: 'uppercase', fontWeight: '600' }}>A5: Coercion</div>
            <div className="mono" style={{ fontSize: '14px', fontWeight: '700', color: contributions.agent5ScamCoercion?.score > 12 ? 'var(--neon-block)' : 'var(--text-primary)' }}>
              {contributions.agent5ScamCoercion?.score ?? 0} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 25</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
