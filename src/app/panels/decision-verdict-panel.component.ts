import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-decision-verdict-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <!-- Header -->
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">⚖️</span>
          <h3>Decision & Verdict</h3>
          <span class="txn-badge" *ngIf="evalData?.transactionId">{{ evalData?.transactionId }}</span>
        </div>
        <div class="header-actions">
          <span class="pulse-indicator live-dot"></span>
          <span class="live-label">Recent TXN</span>
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('decision-verdict')" title="Pop out window">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <div class="panel-body" *ngIf="evalData; else loadingTpl">
        <!-- Main Verdict Banner & Gauge -->
        <div class="verdict-hero-card" [ngClass]="getDecisionClass(decision)">
          <div class="gauge-col">
            <div class="gauge-box">
              <svg class="circular-chart" viewBox="0 0 36 36">
                <path class="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle-fill"
                  [attr.stroke]="getScoreColor(score)"
                  [attr.stroke-dasharray]="score + ', 100'"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="19" class="percentage">{{ score }}</text>
                <text x="18" y="26" class="percentage-label">/ 100</text>
              </svg>
              <span class="gauge-caption">Total Risk Score</span>
            </div>
          </div>

          <div class="verdict-details-col">
            <div class="verdict-row">
              <span class="decision-pill" [ngClass]="getDecisionClass(decision)">
                <span class="dot-indicator"></span>
                {{ getDecisionDisplay(decision) }}
              </span>
              <span class="level-tag" [ngClass]="evalData.scoring?.decisionLevel?.toLowerCase()">
                {{ evalData.scoring?.decisionLevel || 'EVALUATED' }}
              </span>
              <span class="latency-tag" *ngIf="evalData.executionTimeMs">
                ⚡ {{ evalData.executionTimeMs }}ms SLA
              </span>
            </div>

            <!-- Transaction Metadata Strip -->
            <div class="txn-meta-strip">
              <div class="meta-item">
                <span class="meta-label">Amount:</span>
                <span class="meta-val highlight">\${{ (evalData.transactionDetails?.amount || 0) | number:'1.2-2' }} {{ evalData.transactionDetails?.currency || 'USD' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Customer:</span>
                <span class="meta-val">{{ evalData.user?.name || 'Alex Chen' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Recipient:</span>
                <span class="meta-val recipient">{{ evalData.transactionDetails?.beneficiary?.name || 'Unknown' }}</span>
              </div>
            </div>

            <!-- Action Required Banner -->
            <div class="action-banner">
              <span class="action-icon">🎯</span>
              <span class="action-text">{{ evalData.scoring?.actionRequired || 'Transaction cleared by autonomous policy engine.' }}</span>
            </div>
          </div>
        </div>

        <!-- Causal Forensic Attribution ("Due to Why") -->
        <div class="why-card">
          <div class="why-card-header">
            <span class="why-icon">🔍</span>
            <h4>Why Was This Transaction {{ getDecisionDisplay(decision) }}?</h4>
          </div>

          <!-- Executive Reason Text -->
          <div class="why-summary-text">
            {{ evalData.scoring?.recommendedActionText || 'All behavioral, biometric, network graph, and velocity parameters verified within historical tolerances.' }}
          </div>

          <!-- Specific Trigger Flags -->
          <div class="flags-wrap" *ngIf="allFlags.length > 0">
            <span class="flag-title">Active Trigger Flags:</span>
            <div class="flag-chips">
              <span class="flag-chip" *ngFor="let f of allFlags">
                ⚠ {{ f }}
              </span>
            </div>
          </div>

          <!-- Causal Reasons List -->
          <div class="reasons-list" *ngIf="evalData.reasons && evalData.reasons.length > 0">
            <div class="reason-row" *ngFor="let r of evalData.reasons">
              <span class="reason-bullet">▸</span>
              <span class="reason-content">{{ r }}</span>
            </div>
          </div>
        </div>

        <!-- 5-Agent Contribution Spectrum -->
        <div class="swarm-contributions-card">
          <div class="card-title-row">
            <span class="icon">🤖</span>
            <h4>5-Agent Swarm Risk Contributions</h4>
            <span class="scale-info">0 to 25 Pts per Agent</span>
          </div>

          <div class="agent-bars-grid">
            <div class="agent-bar-item" *ngFor="let a of agentContributions">
              <div class="bar-header">
                <span class="agent-label">{{ a.name }}</span>
                <span class="agent-pts" [style.color]="getScoreColor(a.pct)">
                  {{ a.score }} / 25 <small>({{ a.pct }}%)</small>
                </span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="a.pct" [style.background]="getScoreColor(a.pct)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Interventions -->
        <div class="interventions-row" *ngIf="decision === 'CHALLENGE' || decision === 'BLOCK'">
          <button class="btn btn-challenge" *ngIf="decision === 'CHALLENGE'" (click)="openChallenge.emit()">
            🛡️ Deploy Step-Up Biometric Challenge
          </button>
          <button class="btn btn-sar" *ngIf="decision === 'BLOCK'" (click)="openSar.emit()">
            📄 View FinCEN SAR Regulatory Filing
          </button>
        </div>
      </div>

      <ng-template #loadingTpl>
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Synthesizing recent transaction verdict...</span>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .panel-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #0b1329;
      color: #f1f5f9;
      padding: 14px;
      overflow-y: auto;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.4);
      flex-shrink: 0;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-title h3 {
      font-size: 14px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      font-family: 'Outfit', sans-serif;
      letter-spacing: -0.2px;
    }
    .txn-badge {
      font-size: 11px;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 2px 7px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .live-label {
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .mini-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      color: #cbd5e1;
      font-size: 10px;
      padding: 3px 7px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .mini-btn:hover {
      background: #334155;
      color: #38bdf8;
    }

    .panel-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    /* Verdict Hero Card */
    .verdict-hero-card {
      display: flex;
      align-items: center;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 10px;
      padding: 14px;
      gap: 16px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    .verdict-hero-card.block {
      border-color: rgba(239, 68, 68, 0.5);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(15, 23, 42, 0.8));
    }
    .verdict-hero-card.challenge {
      border-color: rgba(245, 158, 11, 0.5);
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.8));
    }
    .verdict-hero-card.approve {
      border-color: rgba(16, 185, 129, 0.5);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.8));
    }

    .gauge-col {
      flex-shrink: 0;
    }
    .gauge-box {
      width: 84px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .circular-chart {
      width: 74px;
      height: 74px;
    }
    .circle-bg {
      fill: none;
      stroke: rgba(51, 65, 85, 0.4);
      stroke-width: 3.2;
    }
    .circle-fill {
      fill: none;
      stroke-width: 3.2;
      stroke-linecap: round;
      transition: stroke-dasharray 0.8s ease, stroke 0.5s ease;
    }
    .percentage {
      fill: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 800;
      text-anchor: middle;
    }
    .percentage-label {
      fill: #94a3b8;
      font-size: 4px;
      text-anchor: middle;
    }
    .gauge-caption {
      font-size: 9px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }

    .verdict-details-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .verdict-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .decision-pill {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.8px;
      padding: 4px 12px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
    }
    .decision-pill.approve {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .decision-pill.challenge {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }
    .decision-pill.block {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }
    .dot-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }
    .level-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .level-tag.critical { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
    .level-tag.warning { background: rgba(245, 158, 11, 0.15); color: #fde68a; }
    .level-tag.safe { background: rgba(16, 185, 129, 0.15); color: #86efac; }
    .latency-tag {
      font-size: 10px;
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
    }

    .txn-meta-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      background: rgba(15, 23, 42, 0.6);
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid rgba(51, 65, 85, 0.4);
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
    }
    .meta-label { color: #64748b; font-weight: 500; }
    .meta-val { color: #e2e8f0; font-weight: 600; }
    .meta-val.highlight { color: #38bdf8; font-family: 'JetBrains Mono', monospace; }
    .meta-val.recipient { color: #f59e0b; }

    .action-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #cbd5e1;
      background: rgba(30, 41, 59, 0.5);
      padding: 6px 10px;
      border-radius: 6px;
      border-left: 3px solid #38bdf8;
    }
    .action-icon { font-size: 12px; }

    /* Why Card */
    .why-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 8px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .why-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .why-card-header h4 {
      font-size: 12px;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0;
      font-family: 'Outfit', sans-serif;
    }
    .why-summary-text {
      font-size: 12px;
      line-height: 1.5;
      color: #cbd5e1;
      padding: 6px 10px;
      background: rgba(30, 41, 59, 0.4);
      border-radius: 6px;
      border-left: 3px solid #f59e0b;
    }
    .flags-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .flag-title {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #94a3b8;
    }
    .flag-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .flag-chip {
      font-size: 10px;
      font-weight: 600;
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.35);
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .reasons-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .reason-row {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 11px;
      color: #94a3b8;
    }
    .reason-bullet { color: #f59e0b; font-weight: 700; }
    .reason-content { color: #cbd5e1; line-height: 1.4; }

    /* Swarm Contributions Card */
    .swarm-contributions-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 8px;
      padding: 12px 14px;
    }
    .card-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .card-title-row h4 {
      font-size: 12px;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0;
      font-family: 'Outfit', sans-serif;
      flex: 1;
    }
    .scale-info {
      font-size: 10px;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }
    .agent-bars-grid {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .agent-bar-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .bar-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
    }
    .agent-label { color: #cbd5e1; font-weight: 500; }
    .agent-pts { font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .agent-pts small { color: #64748b; font-weight: 400; margin-left: 4px; }
    .bar-track {
      width: 100%;
      height: 5px;
      background: rgba(30, 41, 59, 0.8);
      border-radius: 3px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.6s ease;
    }

    /* Interventions */
    .interventions-row {
      display: flex;
      gap: 10px;
    }
    .btn {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: none;
      transition: all 0.2s;
    }
    .btn-challenge {
      background: linear-gradient(135deg, #d97706, #b45309);
      color: white;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
    }
    .btn-challenge:hover { background: #b45309; }
    .btn-sar {
      background: linear-gradient(135deg, #dc2626, #991b1b);
      color: white;
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
    }
    .btn-sar:hover { background: #991b1b; }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 10px;
      color: #94a3b8;
      font-size: 12px;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DecisionVerdictPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();
  @Output() openChallenge = new EventEmitter<void>();
  @Output() openSar = new EventEmitter<void>();

  public evalData: EvaluationResult | null = null;
  public score: number = 0;
  public decision: string = 'APPROVE';
  public allFlags: string[] = [];

  public agentContributions: { name: string; score: number; pct: number }[] = [];

  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe(data => {
      if (data) {
        this.evalData = data;
        this.score = data.scoring?.totalRiskScore || 0;
        this.decision = data.scoring?.decision || 'APPROVE';

        // Extract flags
        this.allFlags = data.flags || [];
        if (!this.allFlags.length && data.agentResults) {
          const aRes = data.agentResults;
          const set = new Set<string>();
          Object.values(aRes).forEach((a: any) => {
            if (a?.flags && Array.isArray(a.flags)) {
              a.flags.forEach((f: string) => set.add(f));
            }
          });
          this.allFlags = Array.from(set);
        }

        // Build contribution bars
        const contrib = data.scoring?.agentContributions;
        if (contrib) {
          this.agentContributions = [
            { name: 'Agent 1: Telemetry & Velocity', score: contrib.agent1Telemetry?.score || 0, pct: contrib.agent1Telemetry?.percentage || 0 },
            { name: 'Agent 2: Audit & Database RAG', score: contrib.agent2AuditRAG?.score || 0, pct: contrib.agent2AuditRAG?.percentage || 0 },
            { name: 'Agent 3: Biometric & Verification', score: contrib.agent3Multimodal?.score || 0, pct: contrib.agent3Multimodal?.percentage || 0 },
            { name: 'Agent 4: Behavioral & Network Graph', score: contrib.agent4BehavioralGraph?.score || 0, pct: contrib.agent4BehavioralGraph?.percentage || 0 },
            { name: 'Agent 5: Scam Narrative & Coercion', score: contrib.agent5ScamCoercion?.score || 0, pct: contrib.agent5ScamCoercion?.percentage || 0 }
          ];
        } else {
          // Fallback extraction
          const a1 = data.agentResults?.agent1?.score || 0;
          const a2 = data.agentResults?.agent2?.score || 0;
          const a3 = data.agentResults?.agent3?.score || 0;
          const a4 = data.agentResults?.agent4?.score || 0;
          const a5 = data.agentResults?.agent5?.score || 0;
          this.agentContributions = [
            { name: 'Agent 1: Telemetry & Velocity', score: a1, pct: Math.round((a1 / 25) * 100) },
            { name: 'Agent 2: Audit & Database RAG', score: a2, pct: Math.round((a2 / 25) * 100) },
            { name: 'Agent 3: Biometric & Verification', score: a3, pct: Math.round((a3 / 25) * 100) },
            { name: 'Agent 4: Behavioral & Network Graph', score: a4, pct: Math.round((a4 / 25) * 100) },
            { name: 'Agent 5: Scam Narrative & Coercion', score: a5, pct: Math.round((a5 / 25) * 100) }
          ];
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  public getDecisionDisplay(d: string): string {
    if (d === 'BLOCK') return 'BLOCKED (INTERCEPTED)';
    if (d === 'CHALLENGE') return 'CHALLENGE (STEP-UP)';
    if (d === 'APPROVE') return 'AUTO APPROVED';
    return d || 'EVALUATED';
  }

  public getDecisionClass(d: string): string {
    const lower = (d || '').toLowerCase();
    if (lower.includes('block')) return 'block';
    if (lower.includes('challenge') || lower.includes('review')) return 'challenge';
    return 'approve';
  }

  public getScoreColor(val: number): string {
    if (val >= 60) return '#ef4444';
    if (val >= 25) return '#f59e0b';
    return '#10b981';
  }
}
