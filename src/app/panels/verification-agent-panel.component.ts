import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-verification-agent-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <!-- Agent Header -->
      <div class="panel-header">
        <div class="header-left">
          <span class="agent-icon">🛡️</span>
          <div class="header-text">
            <h3>Agent 3: Biometric & Visual Verification</h3>
            <span class="subtext">Computer Vision + LangChain Multimodal Gemini</span>
          </div>
        </div>
        <div class="header-right">
          <div class="score-badge" [ngClass]="getStatusClass(agentData?.status)">
            <span class="score-num">{{ agentData?.score || 0 }}</span>
            <span class="score-max">/ 25 Pts</span>
          </div>
          <button class="mini-btn" (click)="popoutRequest.emit('verification-agent')" title="Pop out window">
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

        <!-- 5 Core Verification Points -->
        <div class="verif-points-list">
          <!-- Point 1: Processes Biometrics and Visual Telemetry -->
          <div class="point-card" [class.alert]="isBypassed">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">1</span>
                <span class="point-name">Processes Biometrics and Visual Verification Telemetry</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="isBypassed ? 'critical' : 'optimal'">
                  {{ isBypassed ? 'FAILED (25 Pts)' : 'ACTIVE (0 Pts)' }}
                </span>
                <span class="status-chip" [ngClass]="isBypassed ? 'critical' : 'optimal'">
                  {{ isBypassed ? 'BYPASSED' : 'STREAM VERIFIED' }}
                </span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Telemetry Pipeline:</span>
                <span class="val highlight">{{ isBypassed ? 'Bypass Attempt Flagged' : 'Real-Time Edge Sensor Stream Ingested' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">
                {{ isBypassed ? 'Mandatory biometric proof was stripped or bypassed by client app.' : 'High-resolution facial landmark telemetry and camera sensor stream processed through neural inference.' }}
              </span>
            </div>
          </div>

          <!-- Point 2: Compares Selfie against Verified KYC ID Photo in MongoDB -->
          <div class="point-card" [class.alert]="pointFace.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">2</span>
                <span class="point-name">Compares Presented Selfie vs MongoDB KYC ID Photo</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointFace.status)">
                  {{ pointFace.riskPoints }} / 10 Pts ({{ getPercentage(pointFace.riskPoints, 10) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointFace.status)">{{ pointFace.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Facial Match Confidence:</span>
                <span class="val highlight" [style.color]="metrics.facialMatchConfidence < 70 ? '#ef4444' : '#10b981'">
                  {{ metrics.facialMatchConfidence || 0 }}% Match
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">KYC Baseline:</span>
                <span class="val">{{ metrics.facialMatchConfidence < 70 ? 'Severe Discrepancy' : 'Corroborated with ID' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointFace.whatHappened }}</span>
            </div>

            <!-- Biometric Comparison Visuals: KYC ID Photo vs Captured Selfie -->
            <div class="biometric-photos-comparison" *ngIf="agentData?.images">
              <div class="bio-photo-card">
                <div class="photo-badge">MONGODB KYC BASELINE</div>
                <div class="photo-frame">
                  <img [src]="agentData.images.idCard || '/assets/id_card_alex.jpg'" alt="KYC ID Photo" (error)="onImgErr($event, '/assets/id_card_alex.jpg')" />
                </div>
                <span class="photo-caption">Official Government ID</span>
              </div>

              <div class="bio-vs-divider">
                <span class="vs-circle">VS</span>
                <span class="match-pct" [style.color]="metrics.facialMatchConfidence < 70 ? '#ef4444' : '#10b981'">
                  {{ metrics.facialMatchConfidence || 0 }}%
                </span>
              </div>

              <div class="bio-photo-card" [class.captured-at-txn]="agentData.images.capturedAtTxnTime">
                <div class="photo-badge" [class.live-capture]="agentData.images.capturedAtTxnTime">
                  {{ agentData.images.capturedAtTxnTime ? '📸 CAPTURED AT TXN' : 'PRESENTED SELFIE' }}
                </div>
                <div class="photo-frame">
                  <img [src]="agentData.images.presentedSelfie || '/assets/selfie_alex_match.jpg'" alt="Presented Selfie" (error)="onImgErr($event, '/assets/selfie_alex_match.jpg')" />
                </div>
                <span class="photo-caption">{{ agentData.images.capturedAtTxnTime ? 'Live Edge Camera Stream' : 'Client Biometric Sensor' }}</span>
              </div>
            </div>
          </div>

          <!-- Point 3: Anti-Spoofing and Deepfake Presentation Attack Detection -->
          <div class="point-card" [class.alert]="pointSpoof.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">3</span>
                <span class="point-name">Anti-Spoofing & Deepfake Presentation Attack Detection</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointSpoof.status)">
                  {{ pointSpoof.riskPoints }} / 9 Pts ({{ getPercentage(pointSpoof.riskPoints, 9) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointSpoof.status)">{{ pointSpoof.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">3D Liveness Confidence:</span>
                <span class="val highlight" [style.color]="metrics.livenessConfidence < 50 ? '#ef4444' : '#10b981'">
                  {{ metrics.livenessConfidence || 0 }}% Liveness
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Presentation Attack:</span>
                <span class="val" [style.color]="deepfakeDetected ? '#ef4444' : '#10b981'">
                  {{ deepfakeDetected ? 'Screen Replay / Synthetic Face' : 'Biological Human Pulse Verified' }}
                </span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointSpoof.whatHappened }}</span>
            </div>
          </div>

          <!-- Point 4: Document Tampering & OCR Identity Corroboration -->
          <div class="point-card" [class.alert]="pointDoc.riskPoints > 0">
            <div class="point-header">
              <div class="point-title-group">
                <span class="bullet">4</span>
                <span class="point-name">Document Tampering & OCR Identity Corroboration</span>
              </div>
              <div class="point-meta">
                <span class="points-pill" [ngClass]="getStatusClass(pointDoc.status)">
                  {{ pointDoc.riskPoints }} / 6 Pts ({{ getPercentage(pointDoc.riskPoints, 6) }}%)
                </span>
                <span class="status-chip" [ngClass]="getStatusClass(pointDoc.status)">{{ pointDoc.status }}</span>
              </div>
            </div>
            <div class="point-metrics-row">
              <div class="metric-chip">
                <span class="lbl">Document Integrity:</span>
                <span class="val highlight" [style.color]="metrics.docIntegrityConfidence < 60 ? '#ef4444' : '#10b981'">
                  {{ metrics.docIntegrityConfidence || 0 }}% Confidence
                </span>
              </div>
              <div class="metric-chip">
                <span class="lbl">Hologram & MRZ:</span>
                <span class="val">{{ metrics.docIntegrityConfidence < 60 ? 'Checksum / Font Mismatch' : 'Hologram & MRZ Valid' }}</span>
              </div>
            </div>
            <div class="what-happened-box">
              <span class="wh-label">What Happened:</span>
              <span class="wh-text">{{ pointDoc.whatHappened }}</span>
            </div>
          </div>
        </div>

        <!-- Point 5: LangChain Google Gemini Vision Structured Output Card -->
        <div class="ai-insight-card" *ngIf="geminiVision">
          <div class="ai-header">
            <span class="ai-sparkle">✨</span>
            <span class="ai-title">Integrates with Google Gemini via LangChain (Pydantic Output)</span>
            <span class="spoof-flag" [class.alert]="geminiVision.isDeepfakeOrSpoof">
              Deepfake Detected: {{ geminiVision.isDeepfakeOrSpoof ? 'YES' : 'NO' }}
            </span>
          </div>
          <p class="ai-desc">{{ geminiVision.assessment || 'Multimodal neural network verified authentic facial biological telemetry.' }}</p>
          <div class="ai-footer">
            <span class="ai-model">Model: <strong>{{ geminiVision.model || 'gemini-3.8-flash' }}</strong></span>
            <span class="ai-conf" *ngIf="geminiVision.confidenceScore">Forensic Confidence: {{ (geminiVision.confidenceScore * 100) | number:'1.0-0' }}%</span>
          </div>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="loading-state">
          <span>Loading biometric and identity telemetry...</span>
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

    .verif-points-list {
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
    .spoof-flag {
      margin-left: auto;
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.2);
      color: #86efac;
      font-family: 'JetBrains Mono', monospace;
    }
    .spoof-flag.alert { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
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
    .ai-model strong { color: #f8fafc; }
    .ai-conf { font-family: 'JetBrains Mono', monospace; }

    .biometric-photos-comparison {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      margin-top: 8px;
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 8px;
    }
    .bio-photo-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .photo-badge {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      font-family: 'JetBrains Mono', monospace;
    }
    .photo-badge.live-capture {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.5);
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
    }
    .photo-frame {
      width: 76px;
      height: 76px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #334155;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bio-photo-card.captured-at-txn .photo-frame {
      border-color: #10b981;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
    }
    .photo-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-caption {
      font-size: 8px;
      color: #94a3b8;
    }
    .bio-vs-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .vs-circle {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #1e293b;
      border: 1px solid #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 800;
      color: #cbd5e1;
    }
    .match-pct {
      font-size: 9px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
    }

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
export class VerificationAgentPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public agentData: any = null;
  public metrics: any = {};
  public geminiVision: any = null;
  public isBypassed: boolean = false;
  public deepfakeDetected: boolean = false;

  // Points
  public pointFace: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Biometric face match cosine similarity verified against KYC ID.' };
  public pointSpoof: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Live biological reflectance and eye-blink micro-motion confirmed.' };
  public pointDoc: any = { riskPoints: 0, status: 'NORMAL', whatHappened: 'Document MRZ checksum and hologram verified.' };

  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  public onImgErr(event: any, fallback: string) {
    if (event?.target) {
      event.target.src = fallback;
    }
  }

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe(data => {
      if (data) {
        const a3 = data.agentResults?.agent3 || data.agentResults?.agent3_multimodal;
        if (a3) {
          this.agentData = a3;
          this.metrics = a3.metrics || {};
          this.geminiVision = a3.geminiVision || null;
          const flags = a3.flags || [];
          this.isBypassed = flags.includes('BIOMETRIC_VERIFICATION_BYPASS_ATTEMPT');
          this.deepfakeDetected = flags.includes('PRESENTATION_ATTACK_DETECTED') || flags.includes('DEEPFAKE_OR_SCREEN_REPLAY');

          this.extractPoints(a3);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private extractPoints(a3: any) {
    const bd = a3.breakdown || [];

    // Point 2: Face Match vs KYC
    const itemFace = bd.find((b: any) => b.metric?.toLowerCase().includes('face')) || {};
    const matchScore = this.metrics.facialMatchConfidence || 95;
    const isFaceMismatch = matchScore < 50;
    this.pointFace = {
      riskPoints: itemFace.riskPoints ?? (isFaceMismatch ? 10 : (matchScore < 80 ? 2 : 0)),
      status: itemFace.status || (isFaceMismatch ? 'HIGH_RISK' : (matchScore < 80 ? 'ELEVATED' : 'NORMAL')),
      whatHappened: itemFace.whatHappened || itemFace.detail || (
        isFaceMismatch
          ? `Severe facial discrepancy detected: only ${matchScore.toFixed(1)}% cosine similarity with verified account holder KYC photo in MongoDB.`
          : `High-fidelity biometric match (${matchScore.toFixed(1)}% cosine similarity with KYC ID photo stored in MongoDB).`
      )
    };

    // Point 3: Anti-Spoofing & Liveness
    const itemSpoof = bd.find((b: any) => b.metric?.toLowerCase().includes('liveness') || b.metric?.toLowerCase().includes('spoof')) || {};
    const liveConf = this.metrics.livenessConfidence || 95;
    const isSpoofAlert = liveConf < 40 || this.deepfakeDetected;
    this.pointSpoof = {
      riskPoints: itemSpoof.riskPoints ?? (isSpoofAlert ? 9 : (liveConf < 70 ? 4 : 0)),
      status: itemSpoof.status || (isSpoofAlert ? 'HIGH_RISK' : (liveConf < 70 ? 'ELEVATED' : 'NORMAL')),
      whatHappened: itemSpoof.whatHappened || itemSpoof.detail || (
        isSpoofAlert
          ? 'Screen glare, moiré display patterns, and non-biological pulse detected (Synthetic / Screen Replay Attack).'
          : `Active 3D liveness verified (${liveConf.toFixed(1)}%): micro-movements, eye-blink, and natural skin reflectance confirmed.`
      )
    };

    // Point 4: Document Tampering & OCR
    const itemDoc = bd.find((b: any) => b.metric?.toLowerCase().includes('document') || b.metric?.toLowerCase().includes('ocr')) || {};
    const docConf = this.metrics.docIntegrityConfidence || 95;
    const isDocTampered = docConf < 50;
    this.pointDoc = {
      riskPoints: itemDoc.riskPoints ?? (isDocTampered ? 6 : (docConf < 80 ? 2 : 0)),
      status: itemDoc.status || (isDocTampered ? 'HIGH_RISK' : 'NORMAL'),
      whatHappened: itemDoc.whatHappened || itemDoc.detail || (
        isDocTampered
          ? 'Digital font mismatch, misaligned MRZ checksum, and altered photo edges detected on presented ID document.'
          : 'Official ID card hologram, MRZ checksum, and KYC name fully corroborated.'
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
