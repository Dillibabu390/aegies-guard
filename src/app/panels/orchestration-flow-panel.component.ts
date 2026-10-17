import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orchestration-flow-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">⚡</span>
          <h3>Orchestration Pipeline DAG</h3>
          <span class="latency-badge" *ngIf="evalData?.executionTimeMs">
            {{ evalData?.executionTimeMs }}ms End-to-End
          </span>
        </div>
        <div class="header-actions">
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('orchestration-flow')" title="Pop out to separate screen">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <div class="flowchart-container">
        <!-- Stage 1: Ingestion -->
        <div class="stage-node gateway-node">
          <div class="node-badge">STAGE 1</div>
          <div class="node-icon">💳</div>
          <div class="node-name">Payment Gateway</div>
          <div class="node-meta">Raw Payload Ingest</div>
          <div class="pulse-ring"></div>
        </div>

        <div class="flow-arrow">
          <div class="arrow-line"></div>
          <span class="arrow-label">&lt;20ms</span>
        </div>

        <!-- Stage 2: Gemma 2 Edge Gating -->
        <div class="stage-node edge-node">
          <div class="node-badge gemma-badge">EDGE TIER</div>
          <div class="node-icon">💎</div>
          <div class="node-name">Google Gemma 2</div>
          <div class="node-meta">On-Device Edge Filter</div>
        </div>

        <div class="flow-arrow">
          <div class="arrow-line"></div>
          <span class="arrow-label">Parallel DAG</span>
        </div>

        <!-- Stage 3: LangGraph Parallel Agents Swarm -->
        <div class="swarm-node-container">
          <div class="swarm-header">
            <span class="swarm-title">LangGraph Multi-Agent Swarm (Google Gemini 3.8 Flash)</span>
            <span class="parallel-chip">asyncio.gather()</span>
          </div>
          <div class="agent-branches">
            <div class="branch-pill">
              <span>📱</span> A1: Telemetry (42ms)
            </div>
            <div class="branch-pill">
              <span>👆</span> A2: Biometrics (68ms)
            </div>
            <div class="branch-pill">
              <span>📈</span> A3: Financial (73ms)
            </div>
            <div class="branch-pill">
              <span>🪪</span> A4: Vision KYC (96ms)
            </div>
            <div class="branch-pill">
              <span>🛡️</span> A5: Scam Grounding (105ms)
            </div>
          </div>
        </div>

        <div class="flow-arrow">
          <div class="arrow-line"></div>
          <span class="arrow-label">Consensus</span>
        </div>

        <!-- Stage 4: Policy Engine & Action -->
        <div class="stage-node decision-node" [ngClass]="getDecisionClass(decision)">
          <div class="node-badge">STAGE 4</div>
          <div class="node-icon">{{ getDecisionIcon(decision) }}</div>
          <div class="node-name">{{ decision }}</div>
          <div class="node-meta">Pre-Settlement Interception</div>
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
      color: #e2e8f0;
    }
    .latency-badge {
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 12px;
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
    .flowchart-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 6px;
      overflow-x: auto;
    }
    .stage-node {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 10px;
      padding: 12px 14px;
      text-align: center;
      position: relative;
      min-width: 130px;
      flex-shrink: 0;
    }
    .node-badge {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .gemma-badge {
      color: #38bdf8;
    }
    .node-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }
    .node-name {
      font-size: 12px;
      font-weight: 600;
      color: #f8fafc;
    }
    .node-meta {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .flow-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .arrow-line {
      width: 24px;
      height: 2px;
      background: #475569;
      position: relative;
    }
    .arrow-line::after {
      content: '';
      position: absolute;
      right: 0;
      top: -3px;
      width: 0;
      height: 0;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      border-left: 6px solid #475569;
    }
    .arrow-label {
      font-size: 9px;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }
    .swarm-node-container {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(99, 102, 241, 0.4);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
      border-radius: 10px;
      padding: 10px 14px;
      flex: 1;
      min-width: 220px;
    }
    .swarm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .swarm-title {
      font-size: 11px;
      font-weight: 600;
      color: #a5b4fc;
    }
    .parallel-chip {
      font-size: 9px;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      padding: 2px 5px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .agent-branches {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .branch-pill {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 10px;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .decision-node.approve {
      border-color: rgba(16, 185, 129, 0.5);
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .decision-node.block {
      border-color: rgba(239, 68, 68, 0.5);
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
    }
    .decision-node.challenge {
      border-color: rgba(245, 158, 11, 0.5);
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
  `]
})
export class OrchestrationFlowPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public evalData: EvaluationResult | null = null;
  public decision: string = 'BLOCK';
  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe((res) => {
      this.evalData = res;
      this.decision = res?.scoring?.decision || 'BLOCK';
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  getDecisionClass(d: string): string {
    if (d === 'APPROVE') return 'approve';
    if (d === 'CHALLENGE') return 'challenge';
    return 'block';
  }

  getDecisionIcon(d: string): string {
    if (d === 'APPROVE') return '✅';
    if (d === 'CHALLENGE') return '🛡️';
    return '🛑';
  }
}
