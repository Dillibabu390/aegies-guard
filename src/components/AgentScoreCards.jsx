import React from 'react';

export default function AgentScoreCards({ agentResults }) {
  if (!agentResults) return null;

  const {
    agent1,
    agent2,
    agent3,
    agent4,
    agent5
  } = agentResults;

  return (
    <div className="agents-container" id="five-agents-section">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <div className="section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          Five-Agent Parallel Microservice Deep-Dive (25 Pts Max Each)
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Concurrent independent evaluation • Real-time feature extraction & Google Search Grounding
        </div>
      </div>

      <div className="agents-grid">
        {/* ================= AGENT 1 ================= */}
        {agent1 && (
          <div className="agent-card" id="card-agent-1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="agent-header">
                <div className="agent-title-group">
                  <span className="agent-number">Agent 01</span>
                  <span className="agent-name">Transaction Telemetry & Velocity</span>
                </div>
                <div className={`agent-score-pill ${agent1.status}`}>
                  <span>{agent1.score}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/25</span>
                </div>
              </div>

              {/* Score Bar */}
              <div className="agent-score-bar-wrap">
                <div 
                  className={`agent-score-bar-fill ${agent1.status}`}
                  style={{ width: `${(agent1.score / 25) * 100}%` }}
                ></div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {agent1.summary}
              </div>

              {/* Granular Breakdown */}
              <div className="agent-breakdown-list">
                {(agent1.breakdown || []).map((item, idx) => (
                  <div key={idx} className={`breakdown-item ${item.status}`}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '11px' }}>{item.metric}</div>
                      <div className="breakdown-detail">{item.detail}</div>
                    </div>
                    <div className={`breakdown-pts ${item.status}`}>
                      +{item.riskPoints} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="agent-footer">
              <span>Latency: <strong className="mono">{agent1.latencyMs}ms</strong></span>
              <span>Geo Speed: <strong className="mono">{agent1.metrics?.geoVelocityKmH || 0} km/h</strong></span>
            </div>
          </div>
        )}

        {/* ================= AGENT 2 ================= */}
        {agent2 && (
          <div className="agent-card" id="card-agent-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="agent-header">
                <div className="agent-title-group">
                  <span className="agent-number">Agent 02</span>
                  <span className="agent-name">Audit & Database RAG</span>
                </div>
                <div className={`agent-score-pill ${agent2.status}`}>
                  <span>{agent2.score}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/25</span>
                </div>
              </div>

              <div className="agent-score-bar-wrap">
                <div 
                  className={`agent-score-bar-fill ${agent2.status}`}
                  style={{ width: `${(agent2.score / 25) * 100}%` }}
                ></div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {agent2.summary}
              </div>

              {/* Gemini LLM Forensic Audit */}
              {agent2.geminiAudit && (
                <div className="gemini-reasoning-box">
                  <div className="gemini-header-row">
                    <span className="gemini-badge-pill">⚡ Gemini Flash RAG</span>
                    <span className={`gemini-threat-tag ${agent2.geminiAudit.llmRiskPoints < 10 ? 'SAFE' : ''}`}>
                      {agent2.geminiAudit.threatCategory || 'Security Threat'}
                    </span>
                  </div>
                  <div className="gemini-reasoning-text">
                    "{agent2.geminiAudit.reasoning}"
                  </div>
                </div>
              )}

              {/* RAG Retrieved Patterns Banner */}
              {agent2.retrievedPatterns && agent2.retrievedPatterns.length > 0 && (
                <div style={{ background: 'hsla(350, 89%, 60%, 0.1)', border: '1px solid var(--neon-block)', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}>
                  <div style={{ color: 'var(--neon-block)', fontWeight: '700' }}>
                    ⚠️ Vector RAG Match: {agent2.retrievedPatterns[0].title}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
                    Match Confidence: {agent2.retrievedPatterns[0].confidence}%
                  </div>
                </div>
              )}

              <div className="agent-breakdown-list">
                {(agent2.breakdown || []).map((item, idx) => (
                  <div key={idx} className={`breakdown-item ${item.status}`}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '11px' }}>{item.metric}</div>
                      <div className="breakdown-detail">{item.detail}</div>
                    </div>
                    <div className={`breakdown-pts ${item.status}`}>
                      +{item.riskPoints} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="agent-footer">
              <span>Latency: <strong className="mono">{agent2.latencyMs}ms</strong></span>
              <span>MPIN Age: <strong className="mono">{agent2.metrics?.mpinResetHours ? `${agent2.metrics.mpinResetHours}h` : 'None'}</strong></span>
            </div>
          </div>
        )}

        {/* ================= AGENT 3 ================= */}
        {agent3 && (
          <div className="agent-card" id="card-agent-3">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="agent-header">
                <div className="agent-title-group">
                  <span className="agent-number">Agent 03</span>
                  <span className="agent-name">Multimodal Identity</span>
                </div>
                <div className={`agent-score-pill ${agent3.status}`}>
                  <span>{agent3.score}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/25</span>
                </div>
              </div>

              <div className="agent-score-bar-wrap">
                <div 
                  className={`agent-score-bar-fill ${agent3.status}`}
                  style={{ width: `${(agent3.score / 25) * 100}%` }}
                ></div>
              </div>

              {/* Gemini Multimodal Vision Reasoning */}
              {agent3.geminiVision && (
                <div className="gemini-reasoning-box">
                  <div className="gemini-header-row">
                    <span className="gemini-badge-pill">⚡ Gemini Vision AI</span>
                    <span className={`gemini-threat-tag ${!agent3.geminiVision.isDeepfakeOrSpoof ? 'SAFE' : ''}`}>
                      {agent3.geminiVision.isDeepfakeOrSpoof ? '🚨 Presentation Attack' : '✅ Live Biometric Match'}
                    </span>
                  </div>
                  <div className="gemini-reasoning-text">
                    "{agent3.geminiVision.reasoning}"
                  </div>
                </div>
              )}

              {/* Multimodal Image Inspector Preview */}
              <div className="biometric-preview-row">
                <div className="biometric-img-box">
                  <img src={agent3.images?.idCard || '/assets/id_card_alex.jpg'} alt="KYC Government ID" />
                  <span className="biometric-label">On-File Government ID</span>
                </div>
                <div className="biometric-img-box">
                  <img src={agent3.images?.presentedSelfie || '/assets/selfie_alex_match.jpg'} alt="Presented Selfie" />
                  <span className="biometric-label">Presented Biometric Selfie</span>
                </div>
              </div>

              <div className="agent-breakdown-list">
                {(agent3.breakdown || []).map((item, idx) => (
                  <div key={idx} className={`breakdown-item ${item.status}`}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '11px' }}>{item.metric}</div>
                      <div className="breakdown-detail">{item.detail}</div>
                    </div>
                    <div className={`breakdown-pts ${item.status}`}>
                      +{item.riskPoints} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="agent-footer">
              <span>Latency: <strong className="mono">{agent3.latencyMs}ms</strong></span>
              <span>Face Match: <strong className="mono">{agent3.metrics?.facialMatchConfidence}%</strong></span>
            </div>
          </div>
        )}

        {/* ================= AGENT 4 ================= */}
        {agent4 && (
          <div className="agent-card" id="card-agent-4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="agent-header">
                <div className="agent-title-group">
                  <span className="agent-number">Agent 04</span>
                  <span className="agent-name">Behavioral & Graph Anomaly</span>
                </div>
                <div className={`agent-score-pill ${agent4.status}`}>
                  <span>{agent4.score}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/25</span>
                </div>
              </div>

              <div className="agent-score-bar-wrap">
                <div 
                  className={`agent-score-bar-fill ${agent4.status}`}
                  style={{ width: `${(agent4.score / 25) * 100}%` }}
                ></div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {agent4.summary}
              </div>

              <div className="agent-breakdown-list">
                {(agent4.breakdown || []).map((item, idx) => (
                  <div key={idx} className={`breakdown-item ${item.status}`}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '11px' }}>{item.metric}</div>
                      <div className="breakdown-detail">{item.detail}</div>
                    </div>
                    <div className={`breakdown-pts ${item.status}`}>
                      +{item.riskPoints} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="agent-footer">
              <span>Latency: <strong className="mono">{agent4.latencyMs}ms</strong></span>
              <span>Balance Drain: <strong className="mono">{agent4.metrics?.drainagePercentage}%</strong></span>
            </div>
          </div>
        )}

        {/* ================= AGENT 5 ================= */}
        {agent5 && (
          <div className="agent-card" id="card-agent-5">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="agent-header">
                <div className="agent-title-group">
                  <span className="agent-number" style={{ color: 'var(--brand-purple, #a855f7)' }}>Agent 05</span>
                  <span className="agent-name">Scam Narrative & Coercion Intelligence</span>
                </div>
                <div className={`agent-score-pill ${agent5.status}`}>
                  <span>{agent5.score}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/25</span>
                </div>
              </div>

              <div className="agent-score-bar-wrap">
                <div 
                  className={`agent-score-bar-fill ${agent5.status}`}
                  style={{ width: `${(agent5.score / 25) * 100}%` }}
                ></div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="scenario-badge" style={{ fontSize: '10px', background: 'hsla(280, 80%, 50%, 0.15)', borderColor: '#a855f7', color: '#d8b4fe' }}>
                  {agent5.threatCategory || 'Scam Assessment'}
                </span>
                {agent5.isCoercionDetected && (
                  <span className="scenario-badge block" style={{ fontSize: '10px' }}>
                    🚨 Coercion Detected
                  </span>
                )}
                {agent5.metrics?.googleSearchGrounding?.active && (
                  <span className="scenario-badge" style={{ fontSize: '10px', background: 'hsla(180, 90%, 40%, 0.15)', borderColor: 'var(--brand-cyan)', color: 'var(--brand-cyan)' }}>
                    🌐 Google Search Grounded
                  </span>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {agent5.summary}
              </div>

              {/* Google Search Grounding Summary & Citations */}
              {agent5.metrics?.googleSearchGrounding && (
                <div style={{ background: 'hsla(220, 30%, 12%, 0.9)', padding: '10px', borderRadius: '6px', border: '1px solid hsla(180, 50%, 40%, 0.25)', fontSize: '11px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--brand-cyan)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🔍 Google Threat Intelligence Grounding:</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {agent5.metrics.googleSearchGrounding.summary}
                  </div>
                  {agent5.metrics.googleSearchGrounding.citations?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {agent5.metrics.googleSearchGrounding.citations.map((cite, i) => (
                        <a key={i} href={cite.url} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>🔗</span> <span>{cite.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="agent-breakdown-list">
                {(agent5.breakdown || []).map((item, idx) => (
                  <div key={idx} className={`breakdown-item ${item.status}`}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '11px' }}>{item.metric}</div>
                      <div className="breakdown-detail">{item.detail}</div>
                    </div>
                    <div className={`breakdown-pts ${item.status}`}>
                      +{item.riskPoints} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="agent-footer">
              <span>Latency: <strong className="mono">{agent5.latencyMs}ms</strong></span>
              <span>Active Call: <strong className="mono" style={{ color: agent5.metrics?.activeCallInProgress ? 'var(--neon-block)' : 'inherit' }}>
                {agent5.metrics?.activeCallInProgress ? `${agent5.metrics?.callDurationMinutes}m` : 'None'}
              </strong></span>
              <span>Clipboard: <strong className="mono" style={{ color: agent5.metrics?.clipboardPasted ? 'var(--neon-block)' : 'inherit' }}>
                {agent5.metrics?.clipboardPasted ? `${agent5.metrics?.clipboardDwellTimeSeconds}s` : 'Direct'}
              </strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
