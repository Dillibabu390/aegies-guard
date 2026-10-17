import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audit-rag-agent-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <!-- Agent Header -->
      <div class="panel-header">
        <div class="header-left">
          <span class="agent-icon">🔍</span>
          <div class="header-text">
            <h3>Agent 2: Audit & Database RAG</h3>
            <span class="subtext">MongoDB Security Audit + LangChain RAG Typology</span>
          </div>
        </div>
        <div class="header-right">
          <div class="score-badge" [ngClass]="getStatusClass(agentData?.status)">
            <span class="score-num">{{ agentData?.score || 0 }}</span>
            <span class="score-max">/ 25 Pts</span>
          </div>
          <button class="mini-btn" (click)="popoutRequest.emit('audit-rag-agent')" title="Pop out window">
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

        <!-- Audit & RAG Core Points -->
        <div class="audit-points-list">
          <!-- Point 1: Login/Logout Counts & Failed Login Streak -->
          <div class="point-card" [class.alert]="pointLogins.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">1</span>
                <span class="point-name">Login / Logout Trajectory & Failed Attempts Streak</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointLogins.status)">
                  {{ pointLogins.riskPoints }} / 5 Pts ({{ getPercentage(pointLogins.riskPoints, 5) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointLogins.status)">{{ pointLogins.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Failed Logins (24h):</span>
                <span class="val highlight" [style.color]="metrics.failedLogins >= 3 ? '#ef4444' : '#38bdf8'">
                  {{ metrics.failedLogins ?? 0 }} Attempts
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Session Integrity:</span>
                <span class="val">{{ (metrics.failedLogins ?? 0) >= 3 ? 'Brute-Force Anomaly' : 'Clean Authorization' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">Due to What:</span>
              <span class="wh-text">{{ pointLogins.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 2: Password / MPIN Reset Recency -->
          <div class="point-card" [class.alert]="pointMpin.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">2</span>
                <span class="point-name">MPIN & Password Credential Reset Recency</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointMpin.status)">
                  {{ pointMpin.riskPoints }} / 8 Pts ({{ getPercentage(pointMpin.riskPoints, 8) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointMpin.status)">{{ pointMpin.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Hours Since Reset:</span>
                <span class="val highlight" [style.color]="(metrics.mpinResetHours !== null && metrics.mpinResetHours < 6) ? '#ef4444' : '#38bdf8'">
                  {{ metrics.mpinResetHours !== null ? (metrics.mpinResetHours + ' hrs ago') : 'No Recent Reset' }}
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">ATO Vulnerability:</span>
                <span class="val">{{ (metrics.mpinResetHours !== null && metrics.mpinResetHours < 6) ? 'CRITICAL Window (<6h)' : 'Zero Risk Window' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">Due to What:</span>
              <span class="wh-text">{{ pointMpin.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 3: Telco SIM Swap & Rebinding Telemetry -->
          <div class="point-card" [class.alert]="pointSim.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">3</span>
                <span class="point-name">Telco SIM Swap & Carrier Device Rebinding Audit</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointSim.status)">
                  {{ pointSim.riskPoints }} / 4 Pts ({{ getPercentage(pointSim.riskPoints, 4) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointSim.status)">{{ pointSim.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">SIM Swap Flag:</span>
                <span class="val" [style.color]="metrics.simSwapFlag ? '#ef4444' : '#10b981'">
                  {{ metrics.simSwapFlag ? 'DETECTED (Last 48h)' : 'CLEAN / STABLE' }}
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Telco IMSI Binding:</span>
                <span class="val">{{ metrics.simSwapFlag ? 'Carrier Hijack Risk' : 'Binding Verified' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">Due to What:</span>
              <span class="wh-text">{{ pointSim.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 4: MongoDB Typology RAG Vector Match -->
          <div class="point-card" [class.alert]="pointRag.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">4</span>
                <span class="point-name">MongoDB Typology RAG Knowledge Base Vector Similarity</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointRag.status)">
                  {{ pointRag.riskPoints }} / 8 Pts ({{ getPercentage(pointRag.riskPoints, 8) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointRag.status)">{{ pointRag.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Vector Similarity:</span>
                <span class="val highlight" [style.color]="metrics.ragTopSimilarity > 40 ? '#ef4444' : '#38bdf8'">
                  {{ metrics.ragTopSimilarity || 0 }}% Semantic Match
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Typology Pattern:</span>
                <span class="val">{{ topPatternName || 'Benign Transfer' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">Due to What:</span>
              <span class="wh-text">{{ pointRag.whatHappened }}</span>
            </div>
          </div>
        </div>

        <!-- Google Gemini Audit Reasoning Card -->
        <div class="ai-insight-card" *ngIf="geminiAudit">
          <div class="ai-header">
            <span class="ai-sparkle">✨</span>
            <span class="ai-title">Google Gemini 3.8 Flash Audit & RAG Reasoning</span>
            <span class="ato-badge" [class.alert]="geminiAudit.isAccountTakeoverLikely">
              ATO Likely: {{ geminiAudit.isAccountTakeoverLikely ? 'YES (CRITICAL)' : 'NO' }}
            </span>
          </div>
          <p class="ai-desc">{{ geminiAudit.reasoning }}</p>
          <div class="ai-footer">
            <span class="ai-threat">Threat Category: <strong>{{ geminiAudit.threatCategory }}</strong></span>
            <span class="ai-engine">{{ geminiAudit.framework || 'LangChain + MongoDB RAG' }}</span>
          </div>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="loading-state">
          <span>Loading audit and credential telemetry...</span>
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

    .audit-points-list {
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
    .ato-badge {
      margin-left: auto;
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.2);
      color: #86efac;
      font-family: 'JetBrains Mono', monospace;
    }
    .ato-badge.alert {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }
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
    .ai-threat strong { color: #f8fafc; }
    .ai-engine { font-style: italic; }

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
export class AuditRagAgentPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public agentData: any = null;
  public metrics: any = {};
  public geminiAudit: any = null;
  public topPatternName: string = '';

  // 4 Points
  public pointLogins: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Zero failed login attempts recorded; clean session.' };
  public pointMpin: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'No credential or MPIN resets detected in database security history.' };
  public pointSim: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'SIM IMSI binding verified with telco operator; zero SIM swap events.' };
  public pointRag: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Typology vector similarity within safe consumer baseline.' };

  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe(data => {
      if (data) {
        const a2 = data.agentResults?.agent2 || data.agentResults?.agent2_audit_rag;
        if (a2) {
          this.agentData = a2;
          this.metrics = a2.metrics || {};
          this.geminiAudit = a2.geminiAudit || null;

          const patterns = a2.retrievedPatterns || [];
          this.topPatternName = patterns.length > 0 ? patterns[0].title : 'Benign Transaction';

          this.extractPoints(a2);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private extractPoints(a2: any) {
    const bd = a2.breakdown || [];

    // Point 1: Logins
    const item1 = bd.find((b: any) => b.metric?.toLowerCase().includes('login')) || {};
    const failed = this.metrics.failedLogins ?? 0;
    this.pointLogins = {
      riskPoints: item1.riskPoints ?? (failed >= 4 ? 5 : (failed >= 2 ? 3 : 0)),
      status: item1.status || (failed >= 4 ? 'HIGH_RISK' : (failed >= 2 ? 'ELEVATED' : 'NORMAL')),
      whatHappened: item1.whatHappened || item1.detail || (
        failed >= 4
          ? `Abnormal authentication friction: ${failed} consecutive failed logins prior to this transaction. High likelihood of credential stuffing.`
          : 'Clean authentication trajectory; zero abnormal failed login bursts.'
      )
    };

    // Point 2: MPIN Reset
    const item2 = bd.find((b: any) => b.metric?.toLowerCase().includes('mpin') || b.metric?.toLowerCase().includes('reset')) || {};
    const hrs = this.metrics.mpinResetHours;
    const isMpinAlert = hrs !== null && hrs !== undefined && hrs < 6;
    this.pointMpin = {
      riskPoints: item2.riskPoints ?? (isMpinAlert ? 8 : (hrs !== null && hrs < 24 ? 5 : 0)),
      status: item2.status || (isMpinAlert ? 'HIGH_RISK' : (hrs !== null && hrs < 24 ? 'ELEVATED' : 'NORMAL')),
      whatHappened: item2.whatHappened || item2.detail || (
        isMpinAlert
          ? `MPIN was reset ${hrs?.toFixed(1)} hrs ago. Account is inside the critical ATO vulnerability window (<6h).`
          : 'No historical credential changes detected in MongoDB database security audit.'
      )
    };

    // Point 3: SIM Swap
    const item3 = bd.find((b: any) => b.metric?.toLowerCase().includes('sim')) || {};
    const isSimAlert = !!this.metrics.simSwapFlag;
    this.pointSim = {
      riskPoints: item3.riskPoints ?? (isSimAlert ? 4 : 0),
      status: item3.status || (isSimAlert ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: item3.whatHappened || item3.detail || (
        isSimAlert
          ? 'Active carrier SIM swap reported within last 48 hours. Mobile OTP interception risk is critical.'
          : 'Carrier IMSI binding confirmed stable; zero SIM swap events reported.'
      )
    };

    // Point 4: RAG
    const item4 = bd.find((b: any) => b.metric?.toLowerCase().includes('rag') || b.metric?.toLowerCase().includes('knowledge')) || {};
    const sim = this.metrics.ragTopSimilarity || 0;
    this.pointRag = {
      riskPoints: item4.riskPoints ?? (sim > 40 ? 8 : (sim > 22 ? 4 : 0)),
      status: item4.status || (sim > 40 ? 'HIGH_RISK' : (sim > 22 ? 'ELEVATED' : 'NORMAL')),
      whatHappened: item4.whatHappened || item4.detail || (
        sim > 40
          ? `Strong vector cosine similarity (${sim}%) with known syndicate pattern in MongoDB knowledge base: '${this.topPatternName}'.`
          : 'Typology vector similarity within safe consumer baseline in MongoDB.'
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
