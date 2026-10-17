import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-telemetry-agent-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <!-- Agent Header -->
      <div class="panel-header">
        <div class="header-left">
          <span class="agent-icon">📡</span>
          <div class="header-text">
            <h3>Agent 1: Telemetry & Velocity</h3>
            <span class="subtext">Deterministic Edge Heuristics + Gemini 3.8 Flash</span>
          </div>
        </div>
        <div class="header-right">
          <div class="score-badge" [ngClass]="getStatusClass(agentData?.status)">
            <span class="score-num">{{ agentData?.score || 0 }}</span>
            <span class="score-max">/ 25 Pts</span>
          </div>
          <button class="mini-btn" (click)="popoutRequest.emit('telemetry-agent')" title="Pop out window">
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

        <!-- 4 Core Required Telemetry Points -->
        <div class="telemetry-points-list">
          <!-- Point 1: Amount Deviation vs Historical Baseline (Z-Score) -->
          <div class="point-card" [class.alert]="point1.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">1</span>
                <span class="point-name">Transaction Amount Deviation vs Baseline (Z-Score)</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(point1.status)">
                  {{ point1.riskPoints }} / 7 Pts ({{ getPercentage(point1.riskPoints, 7) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(point1.status)">{{ point1.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Txn Amount:</span>
                <span class="val highlight">\${{ (metrics.amount || 0) | number:'1.2-2' }}</span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Z-Score:</span>
                <span class="val" [style.color]="metrics.zScore > 3 ? '#ef4444' : '#38bdf8'">{{ metrics.zScore || 0 }}σ</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ point1.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 2: Geographic Distance Jumps (Haversine & Velocity km/h) -->
          <div class="point-card" [class.alert]="point2.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">2</span>
                <span class="point-name">Geographic Distance Jumps & Travel Velocity (km/h)</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(point2.status)">
                  {{ point2.riskPoints }} / 9 Pts ({{ getPercentage(point2.riskPoints, 9) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(point2.status)">{{ point2.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Haversine Distance:</span>
                <span class="val highlight">{{ (metrics.distanceKm || 0) | number:'1.0-0' }} km</span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Velocity:</span>
                <span class="val" [style.color]="metrics.geoVelocityKmH > 900 ? '#ef4444' : '#38bdf8'">
                  {{ (metrics.geoVelocityKmH || 0) | number:'1.0-0' }} km/h
                </span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ point2.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 3: 1-Hour Rolling Transaction Velocity -->
          <div class="point-card" [class.alert]="point3.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">3</span>
                <span class="point-name">1-Hour Rolling Transaction Velocity</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(point3.status)">
                  {{ point3.riskPoints }} / 4 Pts ({{ getPercentage(point3.riskPoints, 4) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(point3.status)">{{ point3.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">60-Min Velocity:</span>
                <span class="val highlight">{{ metrics.oneHourTxnCount || 1 }} Txns / hr</span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Frequency State:</span>
                <span class="val">{{ (metrics.oneHourTxnCount || 1) > 2 ? 'Burst Frequency' : 'Nominal Frequency' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ point3.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 4: Device Trust Factors -->
          <div class="point-card" [class.alert]="point4.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">4</span>
                <span class="point-name">Device Trust Factors (Fingerprint, Root/Emulator, VPN/Tor IP)</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(point4.status)">
                  {{ point4.riskPoints }} / 5 Pts ({{ getPercentage(point4.riskPoints, 5) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(point4.status)">{{ point4.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Hardware Fingerprint:</span>
                <span class="val" [style.color]="metrics.deviceTrusted ? '#10b981' : '#f59e0b'">
                  {{ metrics.deviceTrusted ? 'Verified Trusted' : 'Unrecognized Origin' }}
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">VPN / Tor Proxy:</span>
                <span class="val" [style.color]="vpnDetected ? '#ef4444' : '#10b981'">
                  {{ vpnDetected ? 'Proxy / VPN Active' : 'Clean Residential IP' }}
                </span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ point4.whatHappened }}</span>
            </div>
          </div>
        </div>

        <!-- Google Gemini AI Insight Card -->
        <div class="ai-insight-card" *ngIf="gemini">
          <div class="ai-header">
            <span class="ai-sparkle">✨</span>
            <span class="ai-title">Google Gemini 3.8 Flash Telemetry Analysis</span>
            <span class="conf-badge">Confidence: {{ (gemini.riskConfidence * 100) | number:'1.0-0' }}%</span>
          </div>
          <p class="ai-desc">{{ gemini.anomalySummary }}</p>
          <div class="ai-footer">
            <span class="ai-action">Recommended Action: <strong>{{ gemini.recommendedAction }}</strong></span>
            <span class="ai-engine">{{ gemini.framework || 'LangChain + Google Gemini' }}</span>
          </div>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="loading-state">
          <span>Loading telemetry data...</span>
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
    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .agent-icon { font-size: 18px; }
    .header-text h3 {
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      font-family: 'Outfit', sans-serif;
    }
    .subtext { font-size: 9px; color: #64748b; }
    .header-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }
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
    .status-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .status-title { font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
    .status-summary-bar.critical { color: #ef4444; border-color: rgba(239, 68, 68, 0.4); }
    .status-summary-bar.warning { color: #f59e0b; border-color: rgba(245, 158, 11, 0.4); }
    .status-summary-bar.optimal { color: #10b981; border-color: rgba(16, 185, 129, 0.4); }
    .latency-pill { font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; margin-left: 6px; }
    .score-percentage { font-family: 'JetBrains Mono', monospace; font-weight: 700; }

    .telemetry-points-list {
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
      transition: border-color 0.2s;
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
    .point-title-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }
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
    .point-meta {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }
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
    .metric-chip {
      display: flex;
      gap: 4px;
      font-size: 10px;
    }
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

    /* AI Insight Card */
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
    .conf-badge {
      margin-left: auto;
      font-size: 9px;
      background: rgba(56, 189, 248, 0.2);
      color: #7dd3fc;
      padding: 1px 6px;
      border-radius: 10px;
      font-family: 'JetBrains Mono', monospace;
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
    .ai-action strong { color: #f8fafc; }
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
export class TelemetryAgentPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public agentData: any = null;
  public metrics: any = {};
  public gemini: any = null;
  public vpnDetected: boolean = false;

  // 4 points details
  public point1: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Amount aligns with normal spending behavior' };
  public point2: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Geographic location and travel velocity consistent with local device activity' };
  public point3: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Transaction velocity conforms to single daily usage pattern' };
  public point4: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Hardware fingerprint trusted, no root/jailbreak, residential ISP IP' };

  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe(data => {
      if (data) {
        const a1 = data.agentResults?.agent1 || data.agentResults?.agent1_telemetry;
        if (a1) {
          this.agentData = a1;
          this.metrics = a1.metrics || {};
          this.gemini = a1.geminiInsight || null;
          this.vpnDetected = (a1.flags || []).includes('PROXY_OR_VPN_DETECTED');

          this.extractFourPoints(a1);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private extractFourPoints(a1: any) {
    const bd = a1.breakdown || [];

    // Point 1: Amount Deviation
    const item1 = bd.find((b: any) => b.metric?.toLowerCase().includes('amount')) || {};
    this.point1 = {
      riskPoints: item1.riskPoints ?? (this.metrics.zScore > 5 ? 7 : (this.metrics.zScore > 2.5 ? 4 : 0)),
      status: item1.status || (this.metrics.zScore > 5 ? 'HIGH_RISK' : (this.metrics.zScore > 2.5 ? 'ELEVATED' : 'NORMAL')),
      whatHappened: item1.whatHappened || item1.detail || (
        this.metrics.zScore > 5
          ? `Txn amount ($${this.metrics.amount?.toFixed(2)}) is >10x above normal baseline. Critical Z-Score anomaly (${this.metrics.zScore}σ).`
          : 'Transaction amount conforms to nominal consumer spending distribution.'
      )
    };

    // Point 2: Geo Distance & Travel Velocity
    const item2 = bd.find((b: any) => b.metric?.toLowerCase().includes('geo') || b.metric?.toLowerCase().includes('travel')) || {};
    const isHypersonic = (this.metrics.geoVelocityKmH || 0) > 900;
    this.point2 = {
      riskPoints: item2.riskPoints ?? (isHypersonic ? 9 : 0),
      status: item2.status || (isHypersonic ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: item2.whatHappened || item2.detail || (
        isHypersonic
          ? `Haversine distance jump (${Math.round(this.metrics.distanceKm || 0)} km) requires impossible physical velocity (${Math.round(this.metrics.geoVelocityKmH || 0)} km/h).`
          : 'Geographic coordinate trajectory within normal ground travel thresholds.'
      )
    };

    // Point 3: 1-Hour Rolling Velocity
    const item3 = bd.find((b: any) => b.metric?.toLowerCase().includes('velocity') || b.metric?.toLowerCase().includes('hour')) || {};
    const isBurst = (this.metrics.oneHourTxnCount || 1) >= 4;
    this.point3 = {
      riskPoints: item3.riskPoints ?? (isBurst ? 4 : 0),
      status: item3.status || (isBurst ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: item3.whatHappened || item3.detail || (
        isBurst
          ? `${this.metrics.oneHourTxnCount} transactions initiated within 60 minutes. Critical burst velocity exceeded.`
          : '1-hour transaction velocity is within standard single-transaction tolerance.'
      )
    };

    // Point 4: Device Trust Factors
    const item4 = bd.find((b: any) => b.metric?.toLowerCase().includes('device') || b.metric?.toLowerCase().includes('vpn')) || {};
    const devAlert = !this.metrics.deviceTrusted || this.vpnDetected;
    this.point4 = {
      riskPoints: item4.riskPoints ?? (devAlert ? 5 : 0),
      status: item4.status || (devAlert ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: item4.whatHappened || item4.detail || (
        devAlert
          ? 'Untrusted hardware origin or active VPN/proxy tunnel masking true geolocation.'
          : 'Device cryptographic fingerprint verified; clean ISP network origin.'
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
