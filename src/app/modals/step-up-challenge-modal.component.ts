import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-up-challenge-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-left">
            <span class="shield-icon">🛡️</span>
            <div>
              <h2>Adaptive Step-Up Authentication</h2>
              <p class="subtitle">Elevated risk threshold triggered • Biometric FaceID / FIDO2 Passkey required</p>
            </div>
          </div>
          <button class="close-x" (click)="close.emit()">✕</button>
        </div>

        <div class="modal-body">
          <div class="challenge-status-box">
            <div class="status-icon">⚠️</div>
            <div>
              <div class="status-heading">Circadian or Behavioral Friction Gating Active</div>
              <p class="status-sub">
                This transaction triggered an adaptive step-up policy due to circadian anomaly and anomalous keystroke dynamics.
              </p>
            </div>
          </div>

          <div class="auth-methods">
            <div class="method-card" [class.selected]="selectedMethod === 'BIOMETRIC'" (click)="selectedMethod = 'BIOMETRIC'">
              <span class="method-icon">👤</span>
              <div class="method-title">Live 3D Face Liveness</div>
              <div class="method-desc">Gemini Vision anti-deepfake optical challenge</div>
            </div>

            <div class="method-card" [class.selected]="selectedMethod === 'PASSKEY'" (click)="selectedMethod = 'PASSKEY'">
              <span class="method-icon">🔑</span>
              <div class="method-title">FIDO2 Hardware Passkey</div>
              <div class="method-desc">Cryptographic Secure Enclave hardware signature</div>
            </div>
          </div>

          <div class="otp-section" *ngIf="selectedMethod === 'PASSKEY'">
            <label>Hardware Passkey PIN</label>
            <input type="password" [(ngModel)]="passkeyPin" placeholder="••••" maxlength="6" class="otp-input"/>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="close.emit()">Decline & Block Transaction</button>
          <button class="btn-verify" (click)="onVerify()">
            <span>{{ isVerifying ? 'Verifying with Gemini...' : '✓ Complete Biometric Verification' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }
    .modal-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 16px;
      max-width: 580px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      color: #f8fafc;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }
    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(30, 41, 59, 0.3);
    }
    .header-left { display: flex; align-items: center; gap: 10px; }
    .shield-icon { font-size: 22px; }
    .modal-header h2 { margin: 0; font-size: 16px; font-weight: 700; color: #f1f5f9; }
    .subtitle { margin: 2px 0 0; font-size: 11px; color: #94a3b8; }
    .close-x { background: transparent; border: none; color: #64748b; font-size: 18px; cursor: pointer; }
    .close-x:hover { color: #f8fafc; }
    .modal-body { padding: 20px; }
    .challenge-status-box {
      display: flex;
      gap: 12px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 16px;
    }
    .status-icon { font-size: 22px; }
    .status-heading { font-size: 12px; font-weight: 700; color: #f59e0b; }
    .status-sub { font-size: 11px; color: #cbd5e1; margin: 3px 0 0; line-height: 1.35; }
    .auth-methods {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    .method-card {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 10px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .method-card:hover {
      background: rgba(30, 41, 59, 0.7);
      border-color: #38bdf8;
    }
    .method-card.selected {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
    }
    .method-icon { font-size: 22px; margin-bottom: 6px; display: block; }
    .method-title { font-size: 12px; font-weight: 600; color: #f8fafc; }
    .method-desc { font-size: 10px; color: #94a3b8; margin-top: 2px; }
    .otp-section label {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .otp-input {
      width: 100%;
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      font-size: 14px;
      letter-spacing: 4px;
      padding: 8px 10px;
      border-radius: 6px;
      outline: none;
    }
    .modal-footer {
      padding: 14px 20px;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      background: rgba(30, 41, 59, 0.3);
    }
    .btn-cancel {
      background: transparent;
      border: 1px solid #334155;
      color: #ef4444;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-verify {
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      color: white;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class StepUpChallengeModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() resolved = new EventEmitter<void>();

  public selectedMethod: string = 'BIOMETRIC';
  public passkeyPin: string = '4829';
  public isVerifying: boolean = false;

  onVerify() {
    this.isVerifying = true;
    setTimeout(() => {
      this.isVerifying = false;
      this.resolved.emit();
      this.close.emit();
    }, 700);
  }
}
