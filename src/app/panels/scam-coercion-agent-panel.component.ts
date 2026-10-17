import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scam-coercion-agent-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <!-- Agent Header -->
      <div class="panel-header">
        <div class="header-left">
          <span class="agent-icon">🚨</span>
          <div class="header-text">
            <h3>Agent 5: Scam Narrative & Coercion Intelligence</h3>
            <span class="subtext">Google Search Grounding + Gemini 3.8 Flash LangChain</span>
          </div>
        </div>
        <div class="header-right">
          <div class="score-badge" [ngClass]="getStatusClass(agentData?.status)">
            <span class="score-num">{{ agentData?.score || 0 }}</span>
            <span class="score-max">/ 25 Pts</span>
          </div>
          <button class="mini-btn" (click)="popoutRequest.emit('scam-coercion-agent')" title="Pop out window">
            <span>⧉</span>
          </button>
        </div>
      </div>

      <!-- Agent Body -->
      <div class="panel-body" *ngIf="agentData; else emptyTpl">
        <!-- Status Bar -->
        <div class="status-summary-bar" [ngClass]="getStatusClass(agentData.status)">
          <div class="status-left">
            <span class="dot-indicator"></span>
            <span class="status-title">{{ agentData.status || 'OPTIMAL' }}</span>
            <span class="latency-pill" *ngIf="agentData.latencyMs">⚡ {{ agentData.latencyMs }}ms</span>
          </div>
          <span class="score-percentage">{{ getPercentage(agentData.score, 25) }}% Risk</span>
        </div>

        <!-- 4 Core Scam & Coercion Points -->
        <div class="scam-points-list">
          <!-- Point 1: Payment Memo Semantics & Urgency Extraction -->
          <div class="point-card" [class.alert]="pointMemo.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">1</span>
                <span class="point-name">Payment Memo Semantics & Psychological Urgency Extraction</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointMemo.status)">
                  {{ pointMemo.riskPoints }} / 7 Pts ({{ getPercentage(pointMemo.riskPoints, 7) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointMemo.status)">{{ pointMemo.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Memo Narration:</span>
                <span class="val highlight">"{{ currentMemo }}"</span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Urgency Typology:</span>
                <span class="val" [style.color]="pointMemo.riskPoints >= 5 ? '#ef4444' : '#38bdf8'">
                  {{ typologyCategory }}
                </span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointMemo.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 2: Active Concurrent Voice / VoIP Call Telemetry -->
          <div class="point-card" [class.alert]="pointCall.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">2</span>
                <span class="point-name">Device Sensor Telemetry: Active Concurrent Cellular / VoIP Calls</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointCall.status)">
                  {{ pointCall.riskPoints }} / 8 Pts ({{ getPercentage(pointCall.riskPoints, 8) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointCall.status)">{{ pointCall.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Active Voice Call:</span>
                <span class="val highlight" [style.color]="metrics.activeCallInProgress ? '#ef4444' : '#10b981'">
                  {{ metrics.activeCallInProgress ? 'YES (CALL IN PROGRESS)' : 'NO CALL DETECTED' }}
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Call Duration:</span>
                <span class="val" [style.color]="metrics.activeCallInProgress ? '#ef4444' : '#e2e8f0'">
                  {{ (metrics.callDurationMinutes || 0) | number:'1.1-1' }} Minutes
                </span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointCall.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 3: Clipboard Rapid Pasting Telemetry -->
          <div class="point-card" [class.alert]="pointClip.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">3</span>
                <span class="point-name">Clipboard Telemetry: Rapid Pasting from External Chat Apps</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointClip.status)">
                  {{ pointClip.riskPoints }} / 5 Pts ({{ getPercentage(pointClip.riskPoints, 5) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointClip.status)">{{ pointClip.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Clipboard Pasted:</span>
                <span class="val" [style.color]="metrics.clipboardPasted ? '#ef4444' : '#10b981'">
                  {{ metrics.clipboardPasted ? 'Pasted from External App' : 'Manual / Address Book' }}
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Input Dwell Time:</span>
                <span class="val highlight">{{ (metrics.clipboardDwellTimeSeconds || 10) | number:'1.1-1' }}s</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointClip.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 4: Real-Time Google Search Grounding -->
          <div class="point-card" [class.alert]="pointGrounding.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">4</span>
                <span class="point-name">Real-Time Google Search Grounding on Recipient & Scheme</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointGrounding.status)">
                  {{ pointGrounding.riskPoints }} / 5 Pts ({{ getPercentage(pointGrounding.riskPoints, 5) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointGrounding.status)">{{ pointGrounding.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Threat Grounding Match:</span>
                <span class="val highlight" [style.color]="grounding?.groundedThreatMatched ? '#ef4444' : '#10b981'">
                  {{ grounding?.groundedThreatMatched ? 'THREAT CORROBORATED' : 'Zero Public Alerts' }}
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Grounding Confidence:</span>
                <span class="val">{{ ((grounding?.confidence || 0.95) * 100) | number:'1.0-0' }}%</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointGrounding.whatHappened }}</span>
            </div>
            <!-- Search Citations -->
            <div class="citations-row" *ngIf="grounding?.citations?.length">
              <span class="cite-lbl">Verified Citations:</span>
              <a *ngFor="let c of grounding.citations" [href]="c.uri" target="_blank" class="cite-link">
                🔗 {{ c.title }}
              </a>
            </div>
          </div>
        </div>

        <!-- Point 5: Gemini 3.8 Flash LangChain Pydantic Structured Output -->
        <div class="ai-insight-card" *ngIf="llmInsight">
          <div class="ai-header">
            <span class="ai-sparkle">✨</span>
            <span class="ai-title">Integrates with Google Gemini 3.8 Flash via LangChain (Pydantic Output)</span>
            <span class="coercion-pill" [class.alert]="llmInsight.isCoercionDetected">
              Coercion: {{ llmInsight.isCoercionDetected ? 'CONFIRMED' : 'NEGATIVE' }}
            </span>
          </div>
          <p class="ai-desc">{{ llmInsight.reasoning }}</p>
          <div class="ai-footer">
            <span class="ai-cat">Threat Category: <strong>{{ llmInsight.threatCategory || agentData.threatCategory }}</strong></span>
            <span class="ai-model">Model: gemini-3.8-flash</span>
          </div>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="loading-state">
          <span>Loading scam intelligence and search grounding...</span>
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
      padding: 12px;
      overflow-y: auto;
      font-family: 'Inter', sans-serif;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.4);
      flex-shrink: 0;
    }
    .header-left { display: flex; align-items: center; gap: 8px; }
    .agent-icon { font-size: 18px; }
    .header-text h3 {
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      font-family: 'Outfit', sans-serif;
    }
    .subtext { font-size: 9px; color: #64748b; }
    .header-right { display: flex; align-items: center; gap: 6px; }
    .score-badge {
      display: flex;
      align-items: baseline;
      gap: 3px;
      padding: 3px 8px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .score-badge.critical { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); }
    .score-badge.warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); }
    .score-badge.optimal { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); }
    .score-num { font-size: 14px; font-weight: 800; }
    .score-max { font-size: 9px; opacity: 0.8; }
    .mini-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      color: #cbd5e1;
      font-size: 10px;
      padding: 3px 6px;
      border-radius: 4px;
      cursor: pointer;
    }

    .panel-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }
    .status-summary-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.4);
      font-size: 11px;
    }
    .status-left { display: flex; align-items: center; gap: 6px; }
    .dot-indicator { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .status-title { font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
    .status-summary-bar.critical { color: #ef4444; border-color: rgba(239, 68, 68, 0.4); }
    .status-summary-bar.warning { color: #f59e0b; border-color: rgba(245, 158, 11, 0.4); }
    .status-summary-bar.optimal { color: #10b981; border-color: rgba(16, 185, 129, 0.4); }
    .latency-pill { font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; margin-left: 6px; }
    .score-percentage { font-family: 'JetBrains Mono', monospace; font-weight: 700; }

    .scam-points-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .point-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 6px;
      padding: 9px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .point-card.alert {
      border-left: 3px solid #ef4444;
      background: linear-gradient(90deg, rgba(239, 68, 68, 0.05), rgba(15, 23, 42, 0.6));
    }
    .point-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
    }
    .point-title-group { display: flex; align-items: center; gap: 6px; }
    .bullet {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      font-size: 9px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      flex-shrink: 0;
    }
    .point-name { font-size: 11px; font-weight: 600; color: #f1f5f9; }
    .point-meta { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
    .points-pill {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .points-pill.critical { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .points-pill.warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .points-pill.optimal { background: rgba(16, 185, 129, 0.15); color: #10b981; }

    .status-chip {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .status-chip.critical { background: #ef4444; color: white; }
    .status-chip.warning { background: #f59e0b; color: #0f172a; }
    .status-chip.optimal { background: #10b981; color: #0f172a; }

    .point-metrics-row {
      display: flex;
      gap: 12px;
      background: rgba(30, 41, 59, 0.4);
      padding: 4px 8px;
      border-radius: 4px;
    }
    .metric-chip { display: flex; gap: 4px; font-size: 10px; }
    .lbl { color: #64748b; }
    .val { color: #e2e8f0; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .val.highlight { color: #38bdf8; }

    .what-happened-box {
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.4;
      background: rgba(15, 23, 42, 0.4);
      padding: 5px 8px;
      border-radius: 4px;
      border-left: 2px solid #334155;
    }
    .wh-label { font-weight: 700; color: #cbd5e1; margin-right: 4px; font-size: 10px; text-transform: uppercase; }
    .wh-text { color: #cbd5e1; }

    .citations-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      background: rgba(30, 41, 59, 0.4);
      padding: 4px 8px;
      border-radius: 4px;
    }
    .cite-lbl { color: #94a3b8; font-weight: 600; }
    .cite-link { color: #38bdf8; text-decoration: none; }
    .cite-link:hover { text-decoration: underline; }

    .ai-insight-card {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.08));
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 6px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ai-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #38bdf8;
    }
    .ai-sparkle { font-size: 13px; }
    .coercion-pill {
      margin-left: auto;
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.2);
      color: #86efac;
      font-family: 'JetBrains Mono', monospace;
    }
    .coercion-pill.alert { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .ai-desc { font-size: 11px; color: #cbd5e1; line-height: 1.4; margin: 0; }
    .ai-footer {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
      border-top: 1px solid rgba(51, 65, 85, 0.3);
      padding-top: 4px;
    }
    .ai-cat strong { color: #f8fafc; }
    .ai-model { font-family: 'JetBrains Mono', monospace; }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #94a3b8;
      font-size: 12px;
    }
  `]
})
export class ScamCoercionAgentPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public agentData: any = null;
  public metrics: any = {};
  public grounding: any = null;
  public llmInsight: any = null;
  public currentMemo: string = 'Digital Transfer';
  public typologyCategory: string = 'Normal Transfer';

  // Points
  public pointMemo: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Payment memo is consistent with benign consumer behavior.' };
  public pointCall: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'No active voice call detected on device during fund dispatch.' };
  public pointClip: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Beneficiary entered through standard verified address book.' };
  public pointGrounding: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Google Search Grounding clear: zero known fraud reports associated with recipient.' };

  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe(data => {
      if (data) {
        const a5 = data.agentResults?.agent5 || data.agentResults?.agent5_scam_coercion;
        if (a5) {
          this.agentData = a5;
          this.metrics = a5.metrics || {};
          this.grounding = this.metrics.googleSearchGrounding || null;
          this.llmInsight = a5.llmInsight || null;
          this.currentMemo = data.transactionDetails?.memo || 'Digital Transfer';
          this.typologyCategory = a5.threatCategory || 'Normal Transfer';

          this.extractPoints(a5);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private extractPoints(a5: any) {
    const bd = a5.breakdown || [];

    // Point 1: Memo NLP
    const itemMemo = bd.find((b: any) => b.metric?.toLowerCase().includes('memo') || b.metric?.toLowerCase().includes('narration') || b.metric?.toLowerCase().includes('nlp')) || {};
    const memoScore = this.metrics.memoUrgencyScore ?? (this.currentMemo.toLowerCase().includes('safe') || this.currentMemo.toLowerCase().includes('vault') ? 7 : 0);
    this.pointMemo = {
      riskPoints: itemMemo.riskPoints ?? memoScore,
      status: itemMemo.status || (memoScore >= 6 ? 'HIGH_RISK' : (memoScore > 0 ? 'ELEVATED' : 'NORMAL')),
      whatHappened: itemMemo.whatHappened || itemMemo.detail || (
        memoScore >= 6
          ? `Narration matches known social engineering coercive pattern: '${this.typologyCategory}' ("${this.currentMemo}").`
          : 'Payment memo is consistent with benign consumer behavior.'
      )
    };

    // Point 2: Active Voice Call
    const itemCall = bd.find((b: any) => b.metric?.toLowerCase().includes('call') || b.metric?.toLowerCase().includes('voice')) || {};
    const isCallActive = !!this.metrics.activeCallInProgress;
    this.pointCall = {
      riskPoints: itemCall.riskPoints ?? (isCallActive ? 8 : 0),
      status: itemCall.status || (isCallActive ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: itemCall.whatHappened || itemCall.detail || (
        isCallActive
          ? `Active cellular/VoIP call in progress during transaction execution (${this.metrics.callDurationMinutes?.toFixed(1) || '18.2'} mins duration) — high indicator of live social engineering coaching.`
          : 'No active voice call detected on device during fund dispatch.'
      )
    };

    // Point 3: Clipboard Pasting
    const itemClip = bd.find((b: any) => b.metric?.toLowerCase().includes('clipboard') || b.metric?.toLowerCase().includes('dwell')) || {};
    const isPasted = !!this.metrics.clipboardPasted;
    const dwell = this.metrics.clipboardDwellTimeSeconds || 10;
    this.pointClip = {
      riskPoints: itemClip.riskPoints ?? (isPasted && dwell < 4 ? 5 : (isPasted ? 3 : 0)),
      status: itemClip.status || (isPasted && dwell < 4 ? 'HIGH_RISK' : (isPasted ? 'ELEVATED' : 'NORMAL')),
      whatHappened: itemClip.whatHappened || itemClip.detail || (
        isPasted
          ? `Beneficiary destination pasted directly from clipboard within ${dwell.toFixed(1)}s of app entry (typical of external messaging app coaching).`
          : 'Beneficiary entered through standard verified address book.'
      )
    };

    // Point 4: Google Search Grounding
    const itemGrounding = bd.find((b: any) => b.metric?.toLowerCase().includes('grounding') || b.metric?.toLowerCase().includes('search')) || {};
    const isThreatGrounded = !!this.grounding?.groundedThreatMatched;
    this.pointGrounding = {
      riskPoints: itemGrounding.riskPoints ?? (isThreatGrounded ? 5 : 0),
      status: itemGrounding.status || (isThreatGrounded ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: itemGrounding.whatHappened || itemGrounding.detail || (
        isThreatGrounded
          ? 'Google Search Grounding corroborated active consumer fraud alerts matching recipient name and narration.'
          : 'Google Search Grounding clear: zero known fraud reports associated with recipient.'
      )
    };
  }

  public getPercentage(pts: number, max: number): number {
    if (!max) return 0;
    return Math.round((pts / max) * 100);
  }

  public getStatusClass(st: string): string {
    const s = (st || '').toUpperCase();
    if (s.includes('CRITICAL') || s.includes('HIGH')) return 'critical';
    if (s.includes('WARNING') || s.includes('ELEVATED')) return 'warning';
    return 'optimal';
  }
}
