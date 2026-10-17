import React from 'react';

export default function RiskGauge({ score = 0, decision = 'APPROVE' }) {
  // SVG circular arc calculations
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  // Score clamped between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score));
  // Stroke dashoffset: circumference - (circumference * clampedScore / 100)
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = 'var(--neon-safe)';
  let glowColor = 'var(--neon-safe-glow)';
  let statusText = 'APPROVE';
  let statusClass = 'SAFE';

  if (clampedScore >= 90) {
    strokeColor = 'var(--neon-block)';
    glowColor = 'var(--neon-block-glow)';
    statusText = 'BLOCK / REJECT';
    statusClass = 'BLOCK';
  } else if (clampedScore >= 50) {
    strokeColor = 'var(--neon-challenge)';
    glowColor = 'var(--neon-challenge-glow)';
    statusText = 'STEP-UP CHALLENGE';
    statusClass = 'CHALLENGE';
  } else {
    statusText = 'AUTO-APPROVE';
    statusClass = 'APPROVE';
  }

  return (
    <div className="glass-card gauge-container" id="risk-gauge-card">
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="section-title" style={{ fontSize: '13px' }}>
          Calculated Risk Index
        </span>
        <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          100-Point Scale
        </span>
      </div>

      <div className="gauge-svg-wrap">
        <svg viewBox="0 0 240 240">
          {/* Background Track Circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="hsla(220, 25%, 20%, 0.5)"
            strokeWidth="14"
          />

          {/* Threshold marker indicators at 50 and 90 */}
          {/* Active Glowing Score Arc */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
              filter: `drop-shadow(0 0 10px ${glowColor})`
            }}
          />
        </svg>

        <div className="gauge-inner-content">
          <div 
            className="gauge-score-value"
            style={{ color: strokeColor }}
          >
            {clampedScore}
          </div>
          <div className="gauge-score-max">OUT OF 100</div>
        </div>
      </div>

      <div className={`decision-badge ${statusClass}`} id="policy-decision-badge">
        {statusClass === 'BLOCK' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        )}
        {statusClass === 'CHALLENGE' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )}
        {statusClass === 'APPROVE' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )}
        <span>{statusText}</span>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '16px', marginTop: '4px' }}>
        <span>0-49: Approve</span>
        <span>50-89: Challenge</span>
        <span>≥90: Block</span>
      </div>
    </div>
  );
}
