import React from 'react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '880px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">System Architecture: 5-Agent Defense Matrix + Two-Phase Dual-Rail Gate</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {/* Mission Statement */}
          <div style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.25)', padding: '12px 16px', borderRadius: '8px' }}>
            <strong style={{ color: 'var(--brand-cyan)', fontSize: '14px' }}>🛡️ Core Mission: Pre-Settlement Fraud Prevention &amp; Immediate Interception</strong>
            <p style={{ marginTop: '4px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
              AegisGuard intercepts fraudulent transactions <strong>before ledger settlement</strong> across five independent threat vectors. 
              Using our <strong>Two-Phase Dual-Rail Architecture</strong>, Phase 1 delivers instant sub-50ms authorization clearance to meet real-time payment SLAs (FedNow / RTP / Visa), while Phase 2 asynchronously performs deep LangGraph multi-agent reasoning, Google Search Grounding, and regulatory FinCEN SAR drafting.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>
              1. Five Autonomous Defense Agents (25 Pts Max Each &bull; Normalized 0 - 100 Index)
            </h4>
            <div className="mono" style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: '6px', margin: '8px 0', color: 'var(--brand-cyan)' }}>
              Total Risk Score = min(100, round([A1 + A2 + A3 + A4 + A5] &times; 100 / 125))
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {/* Agent 1 */}
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Agent 1: Telemetry &amp; Velocity</strong>
              <div style={{ fontSize: '11px', color: 'var(--brand-cyan)', marginTop: '2px' }}>Account Takeover &amp; Proxy Defense</div>
              <p style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-muted)' }}>
                Stops credential hijackers via Z-score spending deviation, Haversine impossible travel speed (&gt;850 km/h), emulator farm detection, rooted hardware signatures, and Tor/VPN masking.
              </p>
            </div>

            {/* Agent 2 */}
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Agent 2: Audit &amp; Database RAG</strong>
              <div style={{ fontSize: '11px', color: 'var(--brand-cyan)', marginTop: '2px' }}>Credential Stuffing &amp; Typology Retrieval</div>
              <p style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-muted)' }}>
                Audits MongoDB security records for recent MPIN resets (&lt;6h critical vulnerability window), repeated failed logins, carrier SIM swap alerts, and semantic RAG matching against syndicate fraud patterns.
              </p>
            </div>

            {/* Agent 3 */}
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Agent 3: Multimodal Vision &amp; Biometrics</strong>
              <div style={{ fontSize: '11px', color: 'var(--brand-cyan)', marginTop: '2px' }}>Deepfake &amp; Presentation Attack Shield</div>
              <p style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-muted)' }}>
                Inspects biometric telemetry using Gemini 3.8 Flash Vision: cosine facial matching against government KYC ID, 3D biological pulse liveness, screen replay detection, and document OCR tampering checks.
              </p>
            </div>

            {/* Agent 4 */}
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Agent 4: Behavioral Graph &amp; Mule Rings</strong>
              <div style={{ fontSize: '11px', color: 'var(--brand-cyan)', marginTop: '2px' }}>Money Mule &amp; Sanctions Topology Guard</div>
              <p style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-muted)' }}>
                Analyzes live network centrality over MongoDB graph edges: detects high-density money mule hubs (&le;2 hops from sanctioned nodes), account balance drainage ratios (&gt;70%), and off-hours circadian anomalies.
              </p>
            </div>

            {/* Agent 5 */}
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', gridColumn: 'span 2' }}>
              <strong style={{ color: 'var(--brand-purple, #a855f7)' }}>Agent 5: Scam Narrative, Psychological Coercion &amp; Google Search Grounding</strong>
              <div style={{ fontSize: '11px', color: 'var(--brand-purple, #a855f7)', marginTop: '2px' }}>Authorized Push Payment (APP) &amp; Social Engineering Interceptor</div>
              <p style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-muted)' }}>
                Detects active concurrent phone/VoIP calls during transfer, rapid chat clipboard pastes (&lt;2s dwell time), and coercive memo phrasing (fake police safe havens, pig-butchering yields). Runs <strong>live Google Search Grounding</strong> on suspicious entities and deploys the conversational <strong>AI De-Biasing Interceptor</strong> directly to the victim.
              </p>
            </div>
          </div>

          {/* Two-Phase Dual-Rail Engine */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>
              2. Two-Phase Dual-Rail Real-Time Execution Pipeline
            </h4>
            <div style={{ background: 'hsla(223, 28%, 15%, 0.7)', padding: '12px 16px', borderRadius: '8px', lineHeight: '1.6' }}>
              <ul style={{ paddingLeft: '18px' }}>
                <li><strong>⚡ Phase 1 Real-Time Gate (&lt;50ms SLA):</strong> All 5 agents execute deterministic heuristics in parallel with zero external LLM dependencies. Clears low-risk payments or instantly blocks critical attacks before money leaves the account.</li>
                <li><strong>🧠 Phase 2 Deep AI Enrichment (Async):</strong> LangGraph dispatches full Gemini 3.8 Flash multi-agent reasoning, Google Search Grounding threat queries, and generates official BSA Form 111 FinCEN SAR narratives in the background.</li>
                <li><strong>🛡️ Resilient Gemini Circuit Breaker:</strong> If external AI APIs experience outages, rate limits (429 quota exhaustion), or latency spikes, the circuit breaker instantly trips to zero-lag deterministic fallback (&lt;10ms), guaranteeing the payment gateway never hangs.</li>
              </ul>
            </div>
          </div>

          {/* Policy Decision Thresholds */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>
              3. Policy Decision Thresholds &amp; Interception Rules
            </h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>
                <strong style={{ color: 'var(--neon-block)' }}>BLOCK (Critical Risk &bull; Score &ge; 60 or Critical Hard Triggers):</strong> Immediate fund halt, account protection hold, automatic FinCEN SAR draft generation. Triggers on impossible travel velocity (&gt;850 km/h) on unverified devices, confirmed deepfake presentation attacks, or mule ring hub transfers.
              </li>
              <li>
                <strong style={{ color: 'var(--neon-challenge)' }}>CHALLENGE (Elevated Risk &bull; Score 25 - 59 or Coercion):</strong> Funds provisionally held in escrow pending Step-Up Authentication (Dynamic OTP / Biometric Face Match) or AI De-Biasing intervention for live phone-scam coaching.
              </li>
              <li>
                <strong style={{ color: 'var(--neon-safe)' }}>APPROVE (Low Risk &bull; Score &lt; 25):</strong> Normal consumer spending baseline verified across all 5 agents. Auto-cleared for instant clearing settlement.
              </li>
            </ul>
          </div>

          {/* Google AI Ecosystem Stack */}
          <div style={{ background: 'hsla(217, 91%, 60%, 0.08)', border: '1px solid hsla(217, 91%, 60%, 0.25)', padding: '14px 16px', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--brand-cyan)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌐</span> Google AI Models &amp; Technologies Employed
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginTop: '6px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '6px' }}>
                <strong style={{ color: '#00e5ff', fontSize: '12px' }}>Google Gemini 3.8 Flash</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Primary multi-modal engine for structured forensic reasoning across all 5 LangGraph agents, vision KYC tampering checks, and BSA Form 111 SAR drafting.
                </p>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '6px' }}>
                <strong style={{ color: '#a855f7', fontSize: '12px' }}>Google GenAI SDK &amp; Search Grounding</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Agent 5 imports official <code>google-genai</code> SDK with real-time <code>GoogleSearch()</code> tool grounding to query live online scam registries and fake crypto alerts.
                </p>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '6px' }}>
                <strong style={{ color: '#00e676', fontSize: '12px' }}>Google Cloud Vertex AI Ready</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Enterprise configuration layer compatible with Vertex AI endpoints (VPC Service Controls, banking data residency compliance, and SLA governance).
                </p>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '6px' }}>
                <strong style={{ color: '#ffb300', fontSize: '12px' }}>Google Gemma (On-Device Edge Tier)</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Architectural edge companion model family (Gemma 2 2B/9B) for local on-device mobile banking inference (&lt;20ms) before network dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button className="btn btn-primary" onClick={onClose}>Understood</button>
        </div>
      </div>
    </div>
  );
}
