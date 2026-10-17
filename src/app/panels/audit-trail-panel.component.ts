import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audit-trail-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">⏱️</span>
          <h3>Audit Trail</h3>
          <span class="txn-badge" *ngIf="evalData?.transactionId">
            {{ evalData?.transactionId }}
          </span>
        </div>
        <div class="header-actions">
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('audit-trail')" title="Pop out to separate screen">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <div class="timeline-wrapper">
        <div class="timeline-item" *ngFor="let step of steps; let i = index">
          <div class="time-col">{{ step.time }}</div>
          <div class="node-col">
            <div class="node-icon-circle" [style.background]="step.color">
              <span>{{ step.icon }}</span>
            </div>
            <div class="node-line" *ngIf="i < steps.length - 1"></div>
          </div>
          <div class="content-col">
            <div class="step-title-row">
              <span class="step-title">{{ step.title }}</span>
              <span class="step-agent">{{ step.agent }}</span>
            </div>
            <div class="step-detail">{{ step.detail }}</div>
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
    .txn-badge {
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
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
    .timeline-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 4px;
    }
    .timeline-item {
      display: flex;
      gap: 12px;
      position: relative;
    }
    .time-col {
      width: 55px;
      font-size: 11px;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      padding-top: 2px;
      flex-shrink: 0;
    }
    .node-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 28px;
      flex-shrink: 0;
    }
    .node-icon-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      z-index: 2;
      box-shadow: 0 0 10px rgba(0,0,0,0.4);
    }
    .node-line {
      width: 2px;
      flex: 1;
      min-height: 20px;
      background: #334155;
      margin: 4px 0;
    }
    .content-col {
      flex: 1;
      background: rgba(30, 41, 59, 0.35);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 8px;
      padding: 8px 12px;
      transition: all 0.2s;
    }
    .content-col:hover {
      background: rgba(30, 41, 59, 0.6);
      border-color: rgba(56, 189, 248, 0.3);
    }
    .step-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .step-title {
      font-size: 12px;
      font-weight: 600;
      color: #f1f5f9;
    }
    .step-agent {
      font-size: 10px;
      color: #94a3b8;
      background: rgba(15, 23, 42, 0.5);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .step-detail {
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.35;
    }
  `]
})
export class AuditTrailPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public evalData: EvaluationResult | null = null;
  public steps: any[] = [];
  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe((res) => {
      this.evalData = res;
      this.generateSteps(res);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private generateSteps(evalData: EvaluationResult | null) {
    const amount = evalData?.transactionDetails?.amount || 4500;
    const memo = evalData?.transactionDetails?.memo || 'Card Payment';
    const decision = evalData?.scoring?.decision || 'BLOCK';

    this.steps = [
      {
        time: '14:32:05',
        icon: '💳',
        color: 'rgba(56, 189, 248, 0.3)',
        title: 'Transaction Received',
        agent: 'Gateway',
        detail: `$${amount.toLocaleString()} • ${memo} • Web Checkout`
      },
      {
        time: '14:32:07',
        icon: '📱',
        color: 'rgba(99, 102, 241, 0.3)',
        title: 'Device Telemetry Evaluated',
        agent: 'Agent 1',
        detail: 'VPN detected • New device fingerprint • London IP'
      },
      {
        time: '14:32:12',
        icon: '📈',
        color: 'rgba(245, 158, 11, 0.3)',
        title: 'Financial Risk Raised',
        agent: 'Agent 3',
        detail: 'Velocity spike detected (37.5x moving average deviation)'
      },
      {
        time: '14:32:16',
        icon: '🤖',
        color: 'rgba(168, 85, 247, 0.3)',
        title: 'Parallel Multi-Agent Consensus',
        agent: 'LangGraph',
        detail: '5 agents completed in 380ms with Gemini 3.8 Flash'
      },
      {
        time: '14:32:18',
        icon: decision === 'APPROVE' ? '✅' : '🛑',
        color: decision === 'APPROVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        title: 'Policy Decision Enforced',
        agent: 'Policy Engine',
        detail: `${decision}: Pre-settlement hold active on funds.`
      }
    ];
  }
}
