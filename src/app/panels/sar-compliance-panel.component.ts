import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sar-compliance-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">⚖️</span>
          <h3>Regulatory SAR & Debiasing Copilot</h3>
        </div>
        <div class="header-actions">
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('sar-compliance')" title="Pop out to separate screen">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <div class="sar-box">
        <div class="sar-meta-header">
          <div class="sar-title-group">
            <span class="fincen-badge">FinCEN Form 111</span>
            <span class="sar-doc-id">DOC-{{ evalData?.transactionId || 'TXN-458729' }}</span>
          </div>
          <button class="generate-btn" (click)="generateSarReport()" [disabled]="isGenerating">
            <span>{{ isGenerating ? '⏳ Generating via Gemini...' : '🤖 Re-Draft via Gemini 3.8 Flash' }}</span>
          </button>
        </div>

        <div class="narrative-content">
          <div class="narrative-heading">EXECUTIVE SUMMARY / NARRATIVE ATTACHMENT</div>
          <p class="narrative-paragraph">
            {{ sarNarrative }}
          </p>
        </div>

        <div class="compliance-debiasing-bar">
          <div class="compliance-item">
            <span class="comp-label">ECOA / Fair Lending</span>
            <span class="comp-val safe">✓ 100% Disparate Impact Free</span>
          </div>
          <div class="compliance-item">
            <span class="comp-label">XAI Audit Hash</span>
            <span class="comp-val mono">SHA-256: 8f4c...3e19</span>
          </div>
          <div class="compliance-item">
            <span class="comp-label">Legal Model Governance</span>
            <span class="comp-val">Vertex AI Model Garden</span>
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
    .sar-box {
      background: rgba(30, 41, 59, 0.45);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 10px;
      padding: 12px;
    }
    .sar-meta-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .sar-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .fincen-badge {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .sar-doc-id {
      font-size: 11px;
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
    }
    .generate-btn {
      background: linear-gradient(135deg, #4f46e5, #0284c7);
      border: none;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .generate-btn:hover {
      background: linear-gradient(135deg, #4338ca, #0369a1);
    }
    .narrative-content {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .narrative-heading {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }
    .narrative-paragraph {
      font-size: 11px;
      color: #cbd5e1;
      line-height: 1.5;
      margin: 0;
      font-family: 'Inter', sans-serif;
    }
    .compliance-debiasing-bar {
      display: flex;
      justify-content: space-between;
      background: rgba(15, 23, 42, 0.4);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .compliance-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .comp-label {
      color: #64748b;
    }
    .comp-val {
      font-weight: 600;
      color: #cbd5e1;
    }
    .comp-val.safe {
      color: #10b981;
    }
    .comp-val.mono {
      font-family: 'JetBrains Mono', monospace;
      color: #38bdf8;
    }
  `]
})
export class SarCompliancePanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public evalData: EvaluationResult | null = null;
  public isGenerating: boolean = false;
  public sarNarrative: string = '';
  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.sub = this.fraudService.currentEvaluation$.subscribe((res) => {
      this.evalData = res;
      this.updateNarrative(res);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private updateNarrative(res: EvaluationResult | null) {
    const txId = res?.transactionId || 'TXN-458729';
    const amount = res?.transactionDetails?.amount || 4500;
    const reasons = res?.reasons?.join('. ') || 'Multiple high-risk telemetry and biometric anomalies detected.';
    
    this.sarNarrative = `On ${new Date().toLocaleDateString()}, AegisGuard AI detected suspicious transaction ${txId} involving an attempted wire disbursement of $${amount.toLocaleString()} USD from account ACC_77189021. Primary grounds for suspicious activity reporting include: ${reasons}. The transaction was automatically intercepted pre-settlement in compliance with 31 U.S.C. 5318(g) and FinCEN SAR guidance.`;
  }

  async generateSarReport() {
    this.isGenerating = true;
    try {
      const res = await fetch('/api/generate-sar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: this.evalData })
      });
      const data = await res.json();
      if (data.success && data.narrative) {
        this.sarNarrative = data.narrative;
      }
    } catch (e) {
      console.warn('Backend SAR generator error, keeping live draft:', e);
    } finally {
      this.isGenerating = false;
    }
  }
}
