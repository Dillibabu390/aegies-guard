import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-architecture-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-left">
            <span class="arch-icon">🌐</span>
            <div>
              <h2>Google Cloud AI Architecture & System Topology</h2>
              <p class="subtitle">AI Builder Cup 2026 • Enterprise BFSI Multi-Agent Consensus Engine</p>
            </div>
          </div>
          <button class="close-x" (click)="close.emit()">✕</button>
        </div>

        <div class="modal-content">
          <!-- 4 Pillars of Google AI -->
          <div class="section-title">1. The 4-Pillar Google AI Stack</div>
          <div class="pillars-grid">
            <div class="pillar-card">
              <div class="pillar-header">
                <span class="pillar-icon">⚡</span>
                <span class="pillar-name">Google Gemini 3.8 Flash</span>
              </div>
              <div class="pillar-role">Production Multi-Agent Core</div>
              <p class="pillar-desc">
                Powers all 5 parallel detection agents and compliance microservices with structured Pydantic schemas (<380ms response).
              </p>
              <div class="pillar-tag">Active in Python LangGraph Swarm</div>
            </div>

            <div class="pillar-card">
              <div class="pillar-header">
                <span class="pillar-icon">🔍</span>
                <span class="pillar-name">Google GenAI SDK + Search</span>
              </div>
              <div class="pillar-role">Live Threat Grounding</div>
              <p class="pillar-desc">
                Direct integration with <code>types.Tool(google_search=types.GoogleSearch())</code> dynamically verifying recipient mule accounts against real-time web fraud advisories.
              </p>
              <div class="pillar-tag">Active in Agent 5 (Scam Coercion)</div>
            </div>

            <div class="pillar-card">
              <div class="pillar-header">
                <span class="pillar-icon">🏛️</span>
                <span class="pillar-name">Google Cloud Vertex AI</span>
              </div>
              <div class="pillar-role">Enterprise Banking Layer</div>
              <p class="pillar-desc">
                Enterprise VPC Service Controls, private network peering, banking data residency compliance, and SLA governance.
              </p>
              <div class="pillar-tag">Enterprise VPC Ready</div>
            </div>

            <div class="pillar-card">
              <div class="pillar-header">
                <span class="pillar-icon">💎</span>
                <span class="pillar-name">Google Gemma 2 (Edge Tier)</span>
              </div>
              <div class="pillar-role">Sub-20ms Mobile / POS Gating</div>
              <p class="pillar-desc">
                Open-weights Gemma 2 (2B/9B) deployed on mobile banking terminals for local typing cadence & hardware validation before cloud transmission.
              </p>
              <div class="pillar-tag">Two-Phase Latency Architecture</div>
            </div>
          </div>

          <!-- Architectural Diagram Flow -->
          <div class="section-title">2. Sub-450ms Payment Rail Execution Flow</div>
          <div class="diagram-box">
            <div class="diagram-row">
              <div class="box-step">Payment Initiation (POS / App)</div>
              <span class="arrow-sym">➔</span>
              <div class="box-step highlight">Edge Filter (Gemma 2) &lt;20ms</div>
              <span class="arrow-sym">➔</span>
              <div class="box-step special">LangGraph Parallel DAG (Gemini 3.8 Flash) ~380ms</div>
              <span class="arrow-sym">➔</span>
              <div class="box-step">Pre-Settlement Hold / Clear</div>
            </div>
          </div>

          <!-- Regulatory Compliance -->
          <div class="section-title">3. Regulatory Audit & FinCEN Compliance</div>
          <div class="compliance-box">
            <p>
              AegisGuard incorporates automated FinCEN Suspicious Activity Report (SAR) generation using Gemini's structured legal drafting, and a real-time Debiasing Copilot adhering to the Equal Credit Opportunity Act (ECOA) to ensure zero algorithmic bias.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" (click)="close.emit()">Close Architecture Blueprint</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }
    .modal-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 16px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15);
      color: #f8fafc;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }
    .modal-header {
      padding: 18px 24px;
      border-bottom: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(30, 41, 59, 0.3);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .arch-icon {
      font-size: 26px;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .subtitle {
      margin: 2px 0 0;
      font-size: 11px;
      color: #94a3b8;
    }
    .close-x {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s;
    }
    .close-x:hover {
      color: #f8fafc;
    }
    .modal-content {
      padding: 20px 24px;
      overflow-y: auto;
      flex: 1;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin: 16px 0 10px;
    }
    .section-title:first-child {
      margin-top: 0;
    }
    .pillars-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .pillar-card {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .pillar-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pillar-icon {
      font-size: 18px;
    }
    .pillar-name {
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
    }
    .pillar-role {
      font-size: 10px;
      color: #38bdf8;
      font-weight: 600;
      text-transform: uppercase;
    }
    .pillar-desc {
      font-size: 11px;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.4;
      flex: 1;
    }
    .pillar-tag {
      font-size: 9px;
      color: #94a3b8;
      background: rgba(15, 23, 42, 0.6);
      padding: 2px 6px;
      border-radius: 4px;
      align-self: flex-start;
      margin-top: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .diagram-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 14px;
    }
    .diagram-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }
    .box-step {
      background: #1e293b;
      border: 1px solid #334155;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      color: #e2e8f0;
      font-weight: 600;
    }
    .box-step.highlight {
      border-color: #0284c7;
      color: #38bdf8;
      background: rgba(2, 132, 199, 0.15);
    }
    .box-step.special {
      border-color: #6366f1;
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.15);
    }
    .arrow-sym {
      color: #64748b;
      font-size: 14px;
    }
    .compliance-box {
      background: rgba(30, 41, 59, 0.35);
      border-left: 3px solid #10b981;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
    }
    .compliance-box p {
      margin: 0;
      font-size: 11px;
      color: #cbd5e1;
      line-height: 1.5;
    }
    .modal-footer {
      padding: 14px 24px;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: flex-end;
      background: rgba(30, 41, 59, 0.3);
    }
    .btn-primary {
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class ArchitectureModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
}
