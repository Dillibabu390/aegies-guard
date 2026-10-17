import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rule-evaluation-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">🛡️</span>
          <h3>Rule Evaluation</h3>
          <span class="rules-count">{{ rules.length }} Rules</span>
        </div>
        <div class="header-actions">
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('rule-evaluation')" title="Pop out to separate screen">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <div class="rules-list">
        <div class="rule-card" *ngFor="let r of rules" [ngClass]="r.status">
          <div class="rule-icon-box" [style.background]="r.bg">
            <span>{{ r.icon }}</span>
          </div>
          <div class="rule-details">
            <div class="rule-name">{{ r.name }}</div>
            <div class="rule-desc">{{ r.description }}</div>
          </div>
          <div class="rule-status-badge" [ngClass]="r.status">
            <span class="status-indicator"></span>
            {{ r.statusLabel }}
          </div>
          <div class="rule-severity" [ngClass]="r.severity.toLowerCase()">
            {{ r.severity }}
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
    .rules-count {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
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
    .rules-list {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .rule-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 8px;
      padding: 10px 12px;
      transition: all 0.2s;
    }
    .rule-card:hover {
      background: rgba(30, 41, 59, 0.65);
      border-color: rgba(56, 189, 248, 0.3);
    }
    .rule-card.triggered {
      border-left: 3px solid #ef4444;
    }
    .rule-card.passed {
      border-left: 3px solid #10b981;
    }
    .rule-card.review {
      border-left: 3px solid #f59e0b;
    }
    .rule-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    .rule-details {
      flex: 1;
      min-width: 0;
    }
    .rule-name {
      font-size: 12px;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rule-desc {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rule-status-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .rule-status-badge.triggered {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }
    .rule-status-badge.passed {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }
    .rule-status-badge.review {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }
    .status-indicator {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }
    .rule-severity {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      flex-shrink: 0;
      text-transform: uppercase;
    }
    .rule-severity.critical {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .rule-severity.high {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
    .rule-severity.medium {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
    }
    .rule-severity.low {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
  `]
})
export class RuleEvaluationPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public rules: any[] = [];
  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe((res) => {
      this.generateRules(res);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private generateRules(res: EvaluationResult | null) {
    const isBlock = (res?.scoring?.totalRiskScore || 0) > 70;
    const isChallenge = (res?.scoring?.totalRiskScore || 0) > 35 && (res?.scoring?.totalRiskScore || 0) <= 70;

    this.rules = [
      {
        name: 'Impossible Physical Travel',
        description: 'London → Tokyo (12 min, Velocity: 47,250 km/h)',
        icon: '✈️',
        bg: 'rgba(239, 68, 68, 0.2)',
        status: isBlock ? 'triggered' : 'passed',
        statusLabel: isBlock ? '! Triggered' : 'Passed',
        severity: 'Critical'
      },
      {
        name: 'Velocity Spike Detection',
        description: '5 high-value wires in 10 mins (historical avg: 1/day)',
        icon: '⏱️',
        bg: 'rgba(245, 158, 11, 0.2)',
        status: (isBlock || isChallenge) ? 'triggered' : 'passed',
        statusLabel: (isBlock || isChallenge) ? '! Triggered' : 'Passed',
        severity: 'High'
      },
      {
        name: 'Known Device Whitelist',
        description: 'Device fingerprint matches trusted hardware profile',
        icon: '📱',
        bg: 'rgba(16, 185, 129, 0.2)',
        status: isBlock ? 'triggered' : 'passed',
        statusLabel: isBlock ? 'Failed' : 'Passed',
        severity: 'Low'
      },
      {
        name: 'Benford Amount Deviation',
        description: '$4,500.00 vs user baseline moving average $120.00',
        icon: '💰',
        bg: 'rgba(168, 85, 247, 0.2)',
        status: isBlock ? 'review' : 'passed',
        statusLabel: isBlock ? 'Review' : 'Passed',
        severity: 'Medium'
      },
      {
        name: 'KYC Document Optical Forensics',
        description: 'EXIF camera signature & font glyph tampering inspection',
        icon: '🪪',
        bg: 'rgba(56, 189, 248, 0.2)',
        status: 'passed',
        statusLabel: 'Passed',
        severity: 'Low'
      },
      {
        name: 'Live Scam / Coercion Detection',
        description: 'Active call linguistic stress + live Google Search threat match',
        icon: '🚨',
        bg: 'rgba(239, 68, 68, 0.2)',
        status: isBlock ? 'triggered' : 'passed',
        statusLabel: isBlock ? '! Triggered' : 'Passed',
        severity: 'High'
      }
    ];
  }
}
