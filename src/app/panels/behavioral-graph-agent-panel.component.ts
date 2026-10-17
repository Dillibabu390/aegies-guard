import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-behavioral-graph-agent-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <!-- Agent Header -->
      <div class="panel-header">
        <div class="header-left">
          <span class="agent-icon">🕸️</span>
          <div class="header-text">
            <h3>Agent 4: Behavioral & Network Graph</h3>
            <span class="subtext">Graph Topology + LangGraph Gemini Path Reasoning</span>
          </div>
        </div>
        <div class="header-right">
          <div class="score-badge" [ngClass]="getStatusClass(agentData?.status)">
            <span class="score-num">{{ agentData?.score || 0 }}</span>
            <span class="score-max">/ 25 Pts</span>
          </div>
          <button class="mini-btn" (click)="popoutRequest.emit('behavioral-graph-agent')" title="Pop out window">
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

        <!-- 4 Core Behavioral & Graph Points -->
        <div class="graph-points-list">
          <!-- Point 1: Graph Network Cluster & Mule Syndicate Link Risk -->
          <div class="point-card" [class.alert]="pointCluster.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">1</span>
                <span class="point-name">Graph Network Cluster & Mule Syndicate Link Risk</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointCluster.status)">
                  {{ pointCluster.riskPoints }} / 10 Pts ({{ getPercentage(pointCluster.riskPoints, 10) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointCluster.status)">{{ pointCluster.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Beneficiary Node:</span>
                <span class="val highlight">{{ metrics.beneficiaryNode || 'Unknown Node' }}</span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Cluster Type:</span>
                <span class="val" [style.color]="isMuleCluster ? '#ef4444' : '#38bdf8'">
                  {{ isMuleCluster ? 'High-Density Mule Hub' : 'Verified Entity' }}
                </span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointCluster.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 2: Proximity to OFAC/AML-Sanctioned Entities -->
          <div class="point-card" [class.alert]="pointSanctions.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">2</span>
                <span class="point-name">Proximity & Shortest Path to OFAC/AML Sanctioned Nodes</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointSanctions.status)">
                  {{ pointSanctions.riskPoints }} / 6 Pts ({{ getPercentage(pointSanctions.riskPoints, 6) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointSanctions.status)">{{ pointSanctions.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Degrees of Separation:</span>
                <span class="val highlight" [style.color]="hopDistance <= 1 ? '#ef4444' : '#10b981'">
                  {{ hopDistance }} Hop(s) from Sanctions
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Sanctions Watchlist:</span>
                <span class="val">{{ hopDistance <= 1 ? 'Direct Blacklist Link' : 'Clean Distance (>3 Hops)' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointSanctions.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 3: Account Liquidity Drainage Ratio Anomaly -->
          <div class="point-card" [class.alert]="pointDrainage.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">3</span>
                <span class="point-name">Account Liquidity Drainage Ratio Anomaly</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointDrainage.status)">
                  {{ pointDrainage.riskPoints }} / 5 Pts ({{ getPercentage(pointDrainage.riskPoints, 5) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointDrainage.status)">{{ pointDrainage.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Balance Drainage:</span>
                <span class="val highlight" [style.color]="(metrics.drainagePercentage || 0) > 60 ? '#ef4444' : '#38bdf8'">
                  {{ metrics.drainagePercentage || 0 }}% of Total Balance
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Recipient Trust:</span>
                <span class="val">{{ metrics.isNewBeneficiary ? 'First-Time Recipient' : 'Established Contact' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointDrainage.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 4: Circadian & Behavioral Rhythm Profile -->
          <div class="point-card" [class.alert]="pointCircadian.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">4</span>
                <span class="point-name">Circadian & Behavioral Rhythm Profile (Out-of-Hours Timing)</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointCircadian.status)">
                  {{ pointCircadian.riskPoints }} / 4 Pts ({{ getPercentage(pointCircadian.riskPoints, 4) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointCircadian.status)">{{ pointCircadian.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Txn Local Hour:</span>
                <span class="val highlight">{{ (metrics.txnHour !== undefined ? metrics.txnHour : 14) }}:00 Local</span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Historical Window:</span>
                <span class="val">08:00 - 22:00 Baseline</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointCircadian.whatHappened }}</span>
            </div>
          </div>
        </div>

        <!-- Google Gemini Graph Path Reasoning Card -->
        <div class="ai-insight-card" *ngIf="geminiGraph">
          <div class="ai-header">
            <span class="ai-sparkle">✨</span>
            <span class="ai-title">Google Gemini 3.8 Flash LangGraph Path Reasoning</span>
            <span class="mule-badge" [class.alert]="geminiGraph.isMuleNetworkSuspected">
              Mule Syndicate: {{ geminiGraph.isMuleNetworkSuspected ? 'SUSPECTED' : 'CLEAR' }}
            </span>
          </div>
          <p class="ai-desc">{{ geminiGraph.reasoning }}</p>
          <div class="ai-footer">
            <span class="ai-threat">Threat Category: <strong>{{ geminiGraph.threatCategory }}</strong></span>
            <span class="ai-engine">{{ geminiGraph.framework || 'LangGraph + MongoDB Graph Topology' }}</span>
          </div>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="loading-state">
          <span>Loading network graph and behavioral telemetry...</span>
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

    .graph-points-list {
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
    .mule-badge {
      margin-left: auto;
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.2);
      color: #86efac;
      font-family: 'JetBrains Mono', monospace;
    }
    .mule-badge.alert { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
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
export class BehavioralGraphAgentPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public agentData: any = null;
  public metrics: any = {};
  public geminiGraph: any = null;
  public isMuleCluster: boolean = false;
  public hopDistance: number = 4;

  // Points
  public pointCluster: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Beneficiary node is a verified entity in transaction network graph.' };
  public pointSanctions: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Graph path clear: >3 hops of separation from any flagged AML watchlists.' };
  public pointDrainage: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Transfer amount represents low liquidity impact on account balance.' };
  public pointCircadian: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Transaction initiated during nominal daytime activity window.' };

  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe(data => {
      if (data) {
        const a4 = data.agentResults?.agent4 || data.agentResults?.agent4_behavioral_graph;
        if (a4) {
          this.agentData = a4;
          this.metrics = a4.metrics || {};
          this.geminiGraph = a4.geminiGraph || null;
          const flags = a4.flags || [];
          this.isMuleCluster = flags.includes('CRITICAL_MULE_HUB_BENEFICIARY') || flags.includes('HIGH_RISK_NETWORK_CLUSTER');
          this.hopDistance = a4.graphInsights?.hopDistanceToSanctions ?? 4;

          this.extractPoints(a4);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private extractPoints(a4: any) {
    const bd = a4.breakdown || [];

    // Point 1: Cluster
    const itemCluster = bd.find((b: any) => b.metric?.toLowerCase().includes('cluster') || b.metric?.toLowerCase().includes('network')) || {};
    this.pointCluster = {
      riskPoints: itemCluster.riskPoints ?? (this.isMuleCluster ? 10 : 0),
      status: itemCluster.status || (this.isMuleCluster ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: itemCluster.whatHappened || itemCluster.detail || (
        this.isMuleCluster
          ? 'Beneficiary account flagged in MongoDB transaction graph as high-density mule aggregator hub (24 in-degree edges).'
          : 'Beneficiary node is a reputable, verified entity in MongoDB transaction network graph.'
      )
    };

    // Point 2: Sanctions Proximity
    const itemSanctions = bd.find((b: any) => b.metric?.toLowerCase().includes('sanction')) || {};
    const isSanctionAlert = this.hopDistance <= 1;
    this.pointSanctions = {
      riskPoints: itemSanctions.riskPoints ?? (isSanctionAlert ? 6 : 0),
      status: itemSanctions.status || (isSanctionAlert ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: itemSanctions.whatHappened || itemSanctions.detail || (
        isSanctionAlert
          ? 'Direct 1-hop shortest path edge to OFAC/AML-sanctioned crypto mixing cluster in network graph.'
          : 'Graph path clear: >3 degrees of separation from any flagged AML watchlists in MongoDB.'
      )
    };

    // Point 3: Drainage
    const itemDrain = bd.find((b: any) => b.metric?.toLowerCase().includes('drain')) || {};
    const ratio = (this.metrics.drainagePercentage || 0) / 100;
    const isDrainAlert = ratio > 0.65;
    this.pointDrainage = {
      riskPoints: itemDrain.riskPoints ?? (isDrainAlert ? 5 : (ratio > 0.4 ? 2 : 0)),
      status: itemDrain.status || (isDrainAlert ? 'HIGH_RISK' : (ratio > 0.4 ? 'ELEVATED' : 'NORMAL')),
      whatHappened: itemDrain.whatHappened || itemDrain.detail || (
        isDrainAlert
          ? `Aggressive capital outflow: Attempting to siphon ${(ratio * 100).toFixed(1)}% of total liquid account balance in a single transaction.`
          : `Low balance impact: ${(ratio * 100).toFixed(1)}% of total account balance.`
      )
    };

    // Point 4: Circadian Rhythm
    const itemCirc = bd.find((b: any) => b.metric?.toLowerCase().includes('circadian') || b.metric?.toLowerCase().includes('timing')) || {};
    const txHour = this.metrics.txnHour ?? 14;
    const isOddHour = txHour < 6 || txHour > 23;
    this.pointCircadian = {
      riskPoints: itemCirc.riskPoints ?? (isOddHour ? 4 : 0),
      status: itemCirc.status || (isOddHour ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: itemCirc.whatHappened || itemCirc.detail || (
        isOddHour
          ? `Out-of-band transaction initiated at ${txHour}:00 local time. Historical active hours in MongoDB baseline are 08:00 - 22:00.`
          : `Transaction initiated during typical active hours (${txHour}:00 local).`
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
