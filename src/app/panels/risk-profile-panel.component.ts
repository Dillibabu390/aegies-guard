import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-risk-profile-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">📊</span>
          <h3>Risk Profile & Decision</h3>
        </div>
        <div class="header-actions">
          <button class="mini-btn popout-btn" (click)="onPopoutClick()" title="Pop out to separate screen">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <div class="panel-body" *ngIf="evalData; else loadingTpl">
        <!-- Gauge & Decision Block -->
        <div class="gauge-decision-row">
          <div class="gauge-wrapper">
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
            <div class="gauge-subtext">Aggregate Risk</div>
          </div>

          <div class="decision-info">
            <div class="badge-row">
              <span class="decision-badge" [ngClass]="getDecisionClass(decision)">
                <span class="pulse-dot"></span>
                {{ decision }}
              </span>
              <span class="latency-chip" *ngIf="evalData.executionTimeMs">
                ⚡ {{ evalData.executionTimeMs }}ms
              </span>
            </div>

            <div class="action-desc">
              {{ evalData.scoring?.actionRequired || getActionDescription(decision) }}
            </div>

            <div class="cta-actions">
              <button class="btn btn-warning" (click)="openChallenge.emit()" *ngIf="decision === 'CHALLENGE' || decision === 'REVIEW' || score > 45">
                🛡️ Step-Up Challenge
              </button>
              <button class="btn btn-danger" (click)="openSar.emit()" *ngIf="decision === 'BLOCK' || score >= 60">
                📄 File FinCEN SAR
              </button>
            </div>
          </div>
        </div>

        <!-- Risk Factors Breakdown -->
        <div class="factors-breakdown">
          <h4 class="section-title">Telemetry & Intelligence Factors</h4>
          <div class="factor-item" *ngFor="let factor of factors">
            <div class="factor-header">
              <span class="factor-name">{{ factor.name }}</span>
              <span class="factor-val">{{ (factor.value * 100) | number:'1.0-0' }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" 
                   [style.width.%]="factor.value * 100"
                   [style.background]="getBarColor(factor.value)">
              </div>
            </div>
          </div>
        </div>

        <!-- Decision Reasons -->
        <div class="reasons-block" *ngIf="evalData.reasons && evalData.reasons.length">
          <h4 class="section-title">Causal Attribution</h4>
          <ul class="reason-list">
            <li *ngFor="let r of evalData.reasons">
              <span class="bullet">⚠</span> {{ r }}
            </li>
          </ul>
        </div>
      </div>

      <ng-template #loadingTpl>
        <div class="panel-loading">
          <div class="spinner"></div>
          <span>Synthesizing agent telemetry...</span>
        </div>
      </ng-template>
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
      margin-bottom: 16px;
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
      letter-spacing: -0.2px;
      color: #e2e8f0;
    }
    .header-title .icon {
      font-size: 16px;
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
      border-color: #0284c7;
    }
    .gauge-decision-row {
      display: flex;
      gap: 20px;
      align-items: center;
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .gauge-wrapper {
      width: 110px;
      flex-shrink: 0;
      text-align: center;
    }
    .circular-chart {
      max-width: 100%;
      max-height: 100px;
    }
    .circle-bg {
      fill: none;
      stroke: #1e293b;
      stroke-width: 3.5;
    }
    .circle-fill {
      fill: none;
      stroke-width: 3.8;
      stroke-linecap: round;
      transition: stroke-dasharray 0.8s ease, stroke 0.4s ease;
    }
    .percentage {
      fill: #f8fafc;
      font-family: 'Outfit', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-anchor: middle;
    }
    .percentage-label {
      fill: #64748b;
      font-size: 4px;
      text-anchor: middle;
    }
    .gauge-subtext {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .decision-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .badge-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .decision-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .decision-badge.badge-approve {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .decision-badge.badge-challenge {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }
    .decision-badge.badge-block {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.5);
    }
    .decision-badge.badge-review {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.4);
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
    }
    .latency-chip {
      font-size: 11px;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.2);
      padding: 3px 8px;
      border-radius: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    .action-desc {
      font-size: 12px;
      color: #cbd5e1;
      line-height: 1.4;
    }
    .cta-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-warning {
      background: #f59e0b;
      color: #0f172a;
    }
    .btn-warning:hover {
      background: #d97706;
    }
    .btn-danger {
      background: #ef4444;
      color: #ffffff;
    }
    .btn-danger:hover {
      background: #dc2626;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin: 14px 0 8px;
    }
    .factors-breakdown {
      margin-bottom: 16px;
    }
    .factor-item {
      margin-bottom: 8px;
    }
    .factor-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 3px;
    }
    .progress-track {
      height: 5px;
      background: #1e293b;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      border-radius: 3px;
      transition: width 0.6s ease;
    }
    .reasons-block {
      background: rgba(30, 41, 59, 0.3);
      border-radius: 8px;
      padding: 10px 12px;
    }
    .reason-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 11px;
      color: #cbd5e1;
    }
    .reason-list li {
      margin-bottom: 5px;
      line-height: 1.4;
      display: flex;
      gap: 6px;
    }
    .bullet {
      color: #f59e0b;
      flex-shrink: 0;
    }
    .panel-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      gap: 12px;
      color: #64748b;
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
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class RiskProfilePanelComponent implements OnInit, OnDestroy {
  @Output() openChallenge = new EventEmitter<void>();
  @Output() openSar = new EventEmitter<void>();
  @Output() popoutRequest = new EventEmitter<string>();

  public evalData: EvaluationResult | null = null;
  public score: number = 0;
  public decision: string = 'APPROVE';
  public factors: { name: string; value: number }[] = [];
  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe((res) => {
      this.evalData = res;
      if (res && res.scoring) {
        this.score = res.scoring.totalRiskScore || 0;
        this.decision = res.scoring.decision || 'APPROVE';
        const fs = res.scoring.factorScores || {
          telemetry: 0.1,
          behavioral: 0.1,
          financial: 0.1,
          networkKyc: 0.1,
          coercion: 0.1
        };
        this.factors = [
          { name: 'Device Telemetry & Geo', value: fs.telemetry },
          { name: 'Behavioral Biometrics', value: fs.behavioral },
          { name: 'Financial & Benford Patterns', value: fs.financial },
          { name: 'Network & KYC Forensics', value: fs.networkKyc },
          { name: 'Scam & Coercion Intelligence', value: fs.coercion }
        ];
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  getScoreColor(s: number): string {
    if (s < 35) return '#10b981';
    if (s < 70) return '#f59e0b';
    return '#ef4444';
  }

  getBarColor(v: number): string {
    if (v < 0.35) return '#10b981';
    if (v < 0.70) return '#f59e0b';
    return '#ef4444';
  }

  getDecisionClass(d: string): string {
    if (d === 'APPROVE') return 'badge-approve';
    if (d === 'CHALLENGE') return 'badge-challenge';
    if (d === 'BLOCK' || d === 'HOLD') return 'badge-block';
    return 'badge-review';
  }

  getActionDescription(d: string): string {
    if (d === 'APPROVE') return 'Zero anomaly detected. Instant pre-settlement clearing authorized.';
    if (d === 'CHALLENGE') return 'Elevated behavioral or circadian risk. Triggering biometric step-up MFA.';
    if (d === 'BLOCK' || d === 'HOLD') return 'Critical anomaly. Funds held pre-settlement to prevent irreversible loss.';
    return 'Manual analyst review required before ledger settlement.';
  }

  onPopoutClick() {
    this.popoutRequest.emit('risk-profile');
  }
}
