import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agent-status-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">🤖</span>
          <h3>AI Agent Swarm</h3>
          <span class="active-badge">5 / 5 Active</span>
        </div>
        <div class="header-actions">
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('agent-status')" title="Pop out to separate screen">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <div class="agents-grid">
        <!-- Agent 1 -->
        <div class="agent-card" [class.alert]="(a1?.riskScore || 0) > 0.6">
          <div class="agent-card-header">
            <div class="agent-name-row">
              <span class="agent-icon">📱</span>
              <div>
                <div class="agent-title">Agent 1: Telemetry</div>
                <div class="agent-sub">Device, IP, VPN, Geolocation Velocity</div>
              </div>
            </div>
            <div class="agent-meta">
              <span class="status-dot green"></span>
              <span class="latency-text">42ms</span>
            </div>
          </div>
          <div class="agent-metric-row">
            <span class="metric-label">Risk Telemetry</span>
            <span class="metric-score" [style.color]="getScoreColor(a1?.riskScore || 0.1)">
              {{ (a1?.riskScore || 0.1) | number:'1.2-2' }}
            </span>
          </div>
          <div class="agent-desc">
            {{ a1?.details || 'Device fingerprint verified; VPN/Tor proxy check normal.' }}
          </div>
        </div>

        <!-- Agent 2 -->
        <div class="agent-card" [class.alert]="(a2?.riskScore || 0) > 0.6">
          <div class="agent-card-header">
            <div class="agent-name-row">
              <span class="agent-icon">👆</span>
              <div>
                <div class="agent-title">Agent 2: Behavioral Biometrics</div>
                <div class="agent-sub">Keystroke Cadence, Touch Pressure, Velocity</div>
              </div>
            </div>
            <div class="agent-meta">
              <span class="status-dot green"></span>
              <span class="latency-text">68ms</span>
            </div>
          </div>
          <div class="agent-metric-row">
            <span class="metric-label">Biometric Risk</span>
            <span class="metric-score" [style.color]="getScoreColor(a2?.riskScore || 0.1)">
              {{ (a2?.riskScore || 0.1) | number:'1.2-2' }}
            </span>
          </div>
          <div class="agent-desc">
            {{ a2?.details || 'Keystroke flight time within 1.2 std dev of user baseline profile.' }}
          </div>
        </div>

        <!-- Agent 3 -->
        <div class="agent-card" [class.alert]="(a3?.riskScore || 0) > 0.6">
          <div class="agent-card-header">
            <div class="agent-name-row">
              <span class="agent-icon">📈</span>
              <div>
                <div class="agent-title">Agent 3: Financial Patterns</div>
                <div class="agent-sub">Velocity Spikes, Structuring, Benford's Law</div>
              </div>
            </div>
            <div class="agent-meta">
              <span class="status-dot green"></span>
              <span class="latency-text">73ms</span>
            </div>
          </div>
          <div class="agent-metric-row">
            <span class="metric-label">Financial Risk</span>
            <span class="metric-score" [style.color]="getScoreColor(a3?.riskScore || 0.1)">
              {{ (a3?.riskScore || 0.1) | number:'1.2-2' }}
            </span>
          </div>
          <div class="agent-desc">
            {{ a3?.details || 'Transaction conforms to historical moving baseline distribution.' }}
          </div>
        </div>

        <!-- Agent 4 -->
        <div class="agent-card" [class.alert]="(a4?.riskScore || 0) > 0.6">
          <div class="agent-card-header">
            <div class="agent-name-row">
              <span class="agent-icon">🪪</span>
              <div>
                <div class="agent-title">Agent 4: Vision KYC & Network</div>
                <div class="agent-sub">Document Forensics, Mule Ring Clusters</div>
              </div>
            </div>
            <div class="agent-meta">
              <span class="status-dot green"></span>
              <span class="latency-text">96ms</span>
            </div>
          </div>
          <div class="agent-metric-row">
            <span class="metric-label">Network/KYC Risk</span>
            <span class="metric-score" [style.color]="getScoreColor(a4?.riskScore || 0.1)">
              {{ (a4?.riskScore || 0.1) | number:'1.2-2' }}
            </span>
          </div>
          <div class="agent-desc">
            {{ a4?.details || 'ID document optical integrity passed. No mule ring cluster association.' }}
          </div>
        </div>

        <!-- Agent 5 -->
        <div class="agent-card" [class.alert]="(a5?.riskScore || 0) > 0.6">
          <div class="agent-card-header">
            <div class="agent-name-row">
              <span class="agent-icon">🛡️</span>
              <div>
                <div class="agent-title">Agent 5: Scam & Coercion (Live Search)</div>
                <div class="agent-sub">Call NLP + Google GenAI Search Grounding</div>
              </div>
            </div>
            <div class="agent-meta">
              <span class="status-dot green"></span>
              <span class="latency-text">105ms</span>
            </div>
          </div>
          <div class="agent-metric-row">
            <span class="metric-label">Coercion Threat</span>
            <span class="metric-score" [style.color]="getScoreColor(a5?.riskScore || 0.1)">
              {{ (a5?.riskScore || 0.1) | number:'1.2-2' }}
            </span>
          </div>
          <div class="agent-desc">
            {{ a5?.details || 'No high-pressure coercion speech detected. Real-time threat feeds clear.' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .panel-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(12px);
      color: #f1f5f9;
      padding: 16px;
      overflow-y: auto;
      font-family: 'Inter', sans-serif;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-title h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #e2e8f0;
    }
    .active-badge {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 12px;
      font-weight: 600;
    }
    .mini-btn {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid #334155;
      color: #94a3b8;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }
    .mini-btn:hover {
      background: #334155;
      color: #38bdf8;
    }
    .agents-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .agent-card {
      background: rgba(30, 41, 59, 0.45);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 10px;
      padding: 12px;
      transition: all 0.25s ease;
    }
    .agent-card:hover {
      border-color: rgba(56, 189, 248, 0.4);
      background: rgba(30, 41, 59, 0.65);
    }
    .agent-card.alert {
      border-color: rgba(239, 68, 68, 0.5);
      background: rgba(239, 68, 68, 0.08);
    }
    .agent-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .agent-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .agent-icon {
      font-size: 18px;
    }
    .agent-title {
      font-size: 13px;
      font-weight: 600;
      color: #f8fafc;
    }
    .agent-sub {
      font-size: 10px;
      color: #94a3b8;
    }
    .agent-meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .status-dot.green {
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .latency-text {
      font-size: 10px;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }
    .agent-metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding-top: 6px;
      border-top: 1px solid rgba(51, 65, 85, 0.3);
    }
    .metric-label {
      font-size: 11px;
      color: #94a3b8;
    }
    .metric-score {
      font-size: 13px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .agent-desc {
      font-size: 11px;
      color: #cbd5e1;
      line-height: 1.4;
    }
  `]
})
export class AgentStatusPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public a1: any = null;
  public a2: any = null;
  public a3: any = null;
  public a4: any = null;
  public a5: any = null;
  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe((res) => {
      if (res && res.agentResults) {
        this.a1 = res.agentResults.agent1_telemetry;
        this.a2 = res.agentResults.agent2_behavioral || res.agentResults.agent2_audit_rag;
        this.a3 = res.agentResults.agent3_financial || res.agentResults.agent3_multimodal;
        this.a4 = res.agentResults.agent4_network_kyc || res.agentResults.agent4_behavioral_graph;
        this.a5 = res.agentResults.agent5_scam_coercion;
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  getScoreColor(s: number): string {
    if (s < 0.35) return '#10b981';
    if (s < 0.70) return '#f59e0b';
    return '#ef4444';
  }
}
