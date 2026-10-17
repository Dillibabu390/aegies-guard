import React from 'react';

export default function OrchestrationFlow({ evaluation, isEvaluating }) {
  const scoring = evaluation?.scoring || {};
  const agents = evaluation?.agentResults || {};
  const telemetry = evaluation?.telemetry || {};

  const p1Ms = telemetry.phase1FastGateLatencyMs || 18;
  const totalMs = telemetry.totalPipelineLatencyMs || 24;
  const isCircuitOpen = telemetry.circuitBreakerState === 'OPEN';

  return (
    <div className="pipeline-flow-wrapper" id="orchestration-pipeline-flow">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-display" style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Two-Phase Dual-Rail Orchestration Flow
          </span>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--brand-cyan)', background: 'rgba(0, 229, 255, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
            ⚡ Phase 1: Real-Time Gate (&lt;50ms SLA) + 🧠 Phase 2: LangGraph Gemini AI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isCircuitOpen && (
            <span className="mono" style={{ fontSize: '10px', color: '#ffb300', background: 'rgba(255, 179, 0, 0.15)', border: '1px solid rgba(255, 179, 0, 0.4)', padding: '2px 6px', borderRadius: '4px' }}>
              🛡️ Circuit Guard Active (Zero-Lag Fallback Engine)
            </span>
          )}
          <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {isEvaluating ? (
              'DISPATCHING DUAL-RAIL CONCURRENT PIPELINE...'
            ) : (
              <span>
                Gate: <strong style={{ color: '#00e676' }}>{p1Ms}ms</strong> | Total: <strong>{totalMs}ms</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pipeline-nodes">
        {/* Node 1: Ingestion */}
        <div className={`pipeline-node ${isEvaluating ? 'active' : ''}`} id="pipeline-node-ingest">
          <div className="node-icon-box">📱</div>
          <div className="node-label">Client Ingestion</div>
          <div className="node-sub">Mobile / Gateway</div>
        </div>

        <div className="pipeline-connector"></div>

        {/* Node 2: Phase 1 Real-Time Gate */}
        <div className="pipeline-node active" id="pipeline-node-phase1">
          <div className="node-icon-box" style={{ borderColor: '#00e676' }}>⚡</div>
          <div className="node-label">Phase 1 Real-Time Gate</div>
          <div className="node-sub mono" style={{ color: '#00e676', fontWeight: '600' }}>
            {p1Ms} ms (&lt;50ms SLA)
          </div>
        </div>

        <div className="pipeline-connector"></div>

        {/* Node 3: LangGraph AI Orchestrator */}
        <div className="pipeline-node active" id="pipeline-node-orchestrator">
          <div className="node-icon-box" style={{ background: 'var(--brand-gradient)' }}>🧠</div>
          <div className="node-label">LangGraph 5-Agent</div>
          <div className="node-sub">Concurrent Fan-Out</div>
        </div>

        <div className="pipeline-connector"></div>

        {/* Node 4: 5 Agents Parallel Block */}
        <div className="pipeline-node active" id="pipeline-node-agents">
          <div className="node-icon-box" style={{ borderColor: 'var(--brand-primary)' }}>🤖</div>
          <div className="node-label">5 Parallel Agents</div>
          <div className="node-sub mono" style={{ fontSize: '10px' }}>
            {(agents.agent1?.score ?? 0) + (agents.agent2?.score ?? 0) + (agents.agent3?.score ?? 0) + (agents.agent4?.score ?? 0) + (agents.agent5?.score ?? 0)} / 125 Pts
          </div>
        </div>

        <div className="pipeline-connector"></div>

        {/* Node 5: Aggregation */}
        <div className="pipeline-node active" id="pipeline-node-aggregator">
          <div className="node-icon-box">∑</div>
          <div className="node-label">Score Synthesis</div>
          <div className="node-sub mono" style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
            {scoring.totalRiskScore ?? 0} / 100
          </div>
        </div>

        <div className="pipeline-connector"></div>

        {/* Node 6: Decision */}
        <div className="pipeline-node active" id="pipeline-node-decision">
          <div 
            className="node-icon-box"
            style={{ 
              borderColor: scoring.decision === 'BLOCK' ? 'var(--neon-block)' : (scoring.decision === 'CHALLENGE' ? 'var(--neon-challenge)' : 'var(--neon-safe)')
            }}
          >
            {scoring.decision === 'BLOCK' ? '🛡️' : (scoring.decision === 'CHALLENGE' ? '⚠️' : '✅')}
          </div>
          <div className="node-label">Payment Decision</div>
          <div className="node-sub font-display" style={{ 
            fontWeight: '700',
            color: scoring.decision === 'BLOCK' ? 'var(--neon-block)' : (scoring.decision === 'CHALLENGE' ? 'var(--neon-challenge)' : 'var(--neon-safe)')
          }}>
            {scoring.decision || 'PENDING'}
          </div>
        </div>
      </div>
    </div>
  );
}
