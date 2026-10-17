import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-network-graph-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">🕸️</span>
          <h3>Network & KYC Forensics</h3>
          <span class="cluster-badge">Cluster #99 Detected</span>
        </div>
        <div class="header-actions">
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('network-graph')" title="Pop out to separate screen">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <!-- Graph Visualizer SVG -->
      <div class="graph-viewport">
        <svg class="graph-svg" viewBox="0 0 400 220">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="dangerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <!-- Connecting Edges -->
          <line x1="80" y1="110" x2="200" y2="70" stroke="#475569" stroke-width="2" stroke-dasharray="4"/>
          <line x1="80" y1="110" x2="200" y2="150" stroke="#475569" stroke-width="2"/>
          <line x1="200" y1="150" x2="320" y2="110" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5"/>
          <line x1="200" y1="70" x2="320" y2="110" stroke="#475569" stroke-width="1.5"/>
          <line x1="320" y1="110" x2="350" y2="50" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3"/>
          <line x1="320" y1="110" x2="360" y2="170" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3"/>

          <!-- Sender Node -->
          <circle cx="80" cy="110" r="18" fill="url(#nodeGlow)"/>
          <circle cx="80" cy="110" r="12" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
          <text x="80" y="140" class="svg-label" text-anchor="middle">Sender (Alex)</text>

          <!-- Intermediary Node 1 -->
          <circle cx="200" cy="70" r="10" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="200" y="52" class="svg-sub-label" text-anchor="middle">Payment Rail</text>

          <!-- Intermediary Node 2 -->
          <circle cx="200" cy="150" r="12" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="200" y="176" class="svg-sub-label" text-anchor="middle">Hop Gateway</text>

          <!-- Beneficiary / Mule Ring Node -->
          <circle cx="320" cy="110" r="22" fill="url(#dangerGlow)"/>
          <circle cx="320" cy="110" r="14" fill="#991b1b" stroke="#ef4444" stroke-width="2.5"/>
          <text x="320" y="145" class="svg-label danger" text-anchor="middle">Mule Hub #99</text>

          <!-- Satellite Mule Nodes -->
          <circle cx="350" cy="50" r="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>
          <circle cx="360" cy="170" r="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>
        </svg>
      </div>

      <!-- KYC Document Forensics Inspection Card -->
      <div class="kyc-forensics-card">
        <div class="card-header-row">
          <div class="kyc-title-row">
            <span class="kyc-icon">🪪</span>
            <span class="kyc-title">Optical ID Verification</span>
          </div>
          <span class="kyc-badge passed">Gemini Vision OCR: Passed</span>
        </div>
        <div class="kyc-grid">
          <div class="kyc-stat">
            <span class="stat-label">Document Type</span>
            <span class="stat-val">US Passport Card</span>
          </div>
          <div class="kyc-stat">
            <span class="stat-label">Tamper Score</span>
            <span class="stat-val safe">0.03 (Clean)</span>
          </div>
          <div class="kyc-stat">
            <span class="stat-label">EXIF Signature</span>
            <span class="stat-val">iPhone 15 Pro TrueDepth</span>
          </div>
          <div class="kyc-stat">
            <span class="stat-label">Mule Cluster Risk</span>
            <span class="stat-val danger">0.85 (High Velocity)</span>
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
      margin-bottom: 12px;
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
    .cluster-badge {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 12px;
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
    .graph-viewport {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 10px;
      padding: 6px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .graph-svg {
      width: 100%;
      height: 160px;
    }
    .svg-label {
      fill: #e2e8f0;
      font-size: 9px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
    }
    .svg-label.danger {
      fill: #ef4444;
      font-weight: 700;
    }
    .svg-sub-label {
      fill: #94a3b8;
      font-size: 8px;
      font-family: 'Inter', sans-serif;
    }
    .kyc-forensics-card {
      background: rgba(30, 41, 59, 0.45);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 10px;
      padding: 12px;
    }
    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .kyc-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .kyc-title {
      font-size: 12px;
      font-weight: 600;
      color: #f1f5f9;
    }
    .kyc-badge.passed {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .kyc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .kyc-stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .stat-label {
      font-size: 10px;
      color: #64748b;
    }
    .stat-val {
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      font-family: 'JetBrains Mono', monospace;
    }
    .stat-val.safe {
      color: #10b981;
    }
    .stat-val.danger {
      color: #ef4444;
    }
  `]
})
export class NetworkGraphPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public evalData: EvaluationResult | null = null;
  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe((res) => {
      this.evalData = res;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
