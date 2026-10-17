import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FraudDataService, EvaluationResult } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mobile-simulator-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">📱</span>
          <h3>Consumer Terminal Simulator</h3>
        </div>
        <div class="header-actions">
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('mobile-simulator')" title="Pop out to separate screen">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <!-- Smartphone Device Mockup -->
      <div class="phone-wrapper">
        <div class="smartphone-bezel">
          <!-- Dynamic Island / Speaker Notch -->
          <div class="phone-notch">
            <div class="notch-camera"></div>
            <div class="notch-sensor"></div>
          </div>

          <!-- Phone Screen Container -->
          <div class="phone-screen">
            <!-- Status Bar -->
            <div class="screen-status-bar">
              <span class="status-time">{{ currentTime }}</span>
              <div class="status-icons">
                <span>5G</span>
                <span>📶</span>
                <span>🔋 94%</span>
              </div>
            </div>

            <!-- Interception Push Banner Notification -->
            <div class="phone-notification" *ngIf="showNotification" [ngClass]="notificationType">
              <div class="notif-header">
                <span class="notif-app">🛡️ AEGISGUARD SECURITY ALERT</span>
                <span class="notif-now">Just now</span>
              </div>
              <div class="notif-body">
                <strong>{{ notificationTitle }}</strong>
                <p>{{ notificationBody }}</p>
              </div>
            </div>

            <!-- Banking App Header -->
            <div class="bank-app-header">
              <div class="user-avatar-small">AC</div>
              <div class="user-greeting">
                <div class="greeting-sub">Apex NeoBank</div>
                <div class="user-name">Alex Chen</div>
              </div>
              <div class="bell-icon">🔔</div>
            </div>

            <!-- Balance Card -->
            <div class="account-card">
              <div class="card-balance-label">Total Checking Balance</div>
              <div class="card-balance-amt">$14,820.50</div>
              <div class="card-footer-info">
                <span>Visa Infinite •••• 4829</span>
                <span class="card-tag">Verified</span>
              </div>
            </div>

            <!-- Transfer Simulator Form -->
            <div class="transfer-box">
              <div class="form-title">Send Wire / Instant Transfer</div>
              
              <div class="input-group">
                <label>Amount (USD)</label>
                <div class="input-with-symbol">
                  <span class="currency-symbol">$</span>
                  <input type="number" [(ngModel)]="transferAmount" (input)="onAmountInput()" class="phone-input"/>
                </div>
              </div>

              <div class="input-group">
                <label>Recipient / Mule Account</label>
                <input type="text" [(ngModel)]="recipientAccount" (keydown)="onKeyDown($event)" (keyup)="onKeyUp($event)" placeholder="ACC_MULE_990142" class="phone-input"/>
              </div>

              <!-- Biometric Cadence Sensor Readout -->
              <div class="cadence-readout">
                <div class="readout-label">Live Keystroke Cadence:</div>
                <div class="readout-metrics">
                  <span>Flight: <strong>{{ flightTimeMs }}ms</strong></span>
                  <span>Variance: <strong>{{ typingVariance }}σ</strong></span>
                </div>
              </div>

              <button class="phone-submit-btn" [disabled]="isSubmitting" (click)="onSendPayment()">
                <span *ngIf="!isSubmitting">⚡ Authorize Wire Transfer</span>
                <span *ngIf="isSubmitting" class="spinner-small"></span>
              </button>
            </div>
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
    .phone-wrapper {
      display: flex;
      justify-content: center;
      padding: 6px 0;
    }
    .smartphone-bezel {
      width: 290px;
      height: 480px;
      background: #020617;
      border: 6px solid #1e293b;
      border-radius: 36px;
      box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.15);
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .phone-notch {
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 18px;
      background: #000;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      z-index: 10;
    }
    .notch-camera {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #1e293b;
    }
    .notch-sensor {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #0f172a;
    }
    .phone-screen {
      flex: 1;
      padding: 28px 12px 14px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: #090d16;
    }
    .screen-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .status-icons {
      display: flex;
      gap: 4px;
    }
    .phone-notification {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(239, 68, 68, 0.6);
      border-radius: 12px;
      padding: 8px 10px;
      margin-bottom: 10px;
      animation: slideDown 0.3s ease;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }
    .phone-notification.safe {
      border-color: rgba(16, 185, 129, 0.6);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    @keyframes slideDown {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .notif-header {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #f87171;
      font-weight: 700;
    }
    .phone-notification.safe .notif-header {
      color: #34d399;
    }
    .notif-body strong {
      display: block;
      font-size: 10px;
      color: #f1f5f9;
      margin-top: 2px;
    }
    .notif-body p {
      font-size: 9px;
      color: #cbd5e1;
      margin: 2px 0 0;
      line-height: 1.25;
    }
    .bank-app-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .user-avatar-small {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 700;
      color: white;
    }
    .user-greeting {
      flex: 1;
    }
    .greeting-sub {
      font-size: 8px;
      color: #64748b;
    }
    .user-name {
      font-size: 11px;
      font-weight: 600;
      color: #f1f5f9;
    }
    .bell-icon {
      font-size: 12px;
      color: #94a3b8;
    }
    .account-card {
      background: linear-gradient(135deg, #1e1b4b, #0f172a);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 10px;
    }
    .card-balance-label {
      font-size: 8px;
      color: #94a3b8;
    }
    .card-balance-amt {
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
      font-family: 'Outfit', sans-serif;
      margin: 2px 0 6px;
    }
    .card-footer-info {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #a5b4fc;
    }
    .card-tag {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      padding: 1px 4px;
      border-radius: 4px;
    }
    .transfer-box {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 10px;
      padding: 10px;
    }
    .form-title {
      font-size: 10px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 8px;
    }
    .input-group {
      margin-bottom: 6px;
    }
    .input-group label {
      display: block;
      font-size: 8px;
      color: #94a3b8;
      margin-bottom: 2px;
    }
    .input-with-symbol {
      display: flex;
      align-items: center;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 0 6px;
    }
    .currency-symbol {
      color: #38bdf8;
      font-size: 11px;
      font-weight: 600;
    }
    .phone-input {
      width: 100%;
      background: transparent;
      border: none;
      color: #f8fafc;
      font-size: 11px;
      padding: 4px;
      outline: none;
    }
    .cadence-readout {
      background: rgba(15, 23, 42, 0.7);
      border: 1px dashed rgba(56, 189, 248, 0.3);
      border-radius: 6px;
      padding: 4px 6px;
      margin: 8px 0;
      font-size: 8px;
      color: #94a3b8;
    }
    .readout-metrics {
      display: flex;
      justify-content: space-between;
      margin-top: 2px;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
    }
    .phone-submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      border: none;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 7px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .phone-submit-btn:hover {
      background: linear-gradient(135deg, #0369a1, #1d4ed8);
    }
    .spinner-small {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class MobileSimulatorPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public currentTime: string = '14:32';
  public transferAmount: number = 4500.00;
  public recipientAccount: string = 'ACC_MULE_990142';
  public flightTimeMs: number = 48;
  public typingVariance: number = 3.8;
  public isSubmitting: boolean = false;

  public showNotification: boolean = true;
  public notificationType: string = 'danger';
  public notificationTitle: string = 'Transaction Held Pre-Settlement';
  public notificationBody: string = 'Impossible physical jump from Taipei to London detected. Funds secured.';

  private lastKeyDownTime: number = 0;
  private sub: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.updateClock();
    this.sub = this.fraudService.currentEvaluation$.subscribe((res) => {
      if (res && res.scoring) {
        const isBlock = res.scoring.decision === 'BLOCK' || res.scoring.decision === 'HOLD';
        const isApprove = res.scoring.decision === 'APPROVE';
        this.notificationType = isBlock ? 'danger' : isApprove ? 'safe' : 'warning';
        this.notificationTitle = isBlock ? 'Pre-Settlement Interception Active' : isApprove ? 'Payment Authorized Instantly' : 'Step-Up MFA Required';
        this.notificationBody = res.reasons && res.reasons.length ? res.reasons[0] : 'Autonomous consensus verified.';
        this.showNotification = true;
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  updateClock() {
    const d = new Date();
    this.currentTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  onKeyDown(e: KeyboardEvent) {
    this.lastKeyDownTime = performance.now();
  }

  onKeyUp(e: KeyboardEvent) {
    if (this.lastKeyDownTime > 0) {
      const diff = Math.round(performance.now() - this.lastKeyDownTime);
      this.flightTimeMs = Math.min(180, Math.max(32, diff));
      this.typingVariance = +(Math.random() * 2.5 + 2.0).toFixed(1);
    }
  }

  onAmountInput() {
    this.typingVariance = +(Math.random() * 2.0 + 1.5).toFixed(1);
  }

  async onSendPayment() {
    this.isSubmitting = true;
    try {
      await this.fraudService.evaluateCustom({
        userId: 'usr_alex_chen',
        amount: this.transferAmount,
        currency: 'USD',
        beneficiary: { id: 'BEN_MULE_990142', accountNumber: this.recipientAccount, name: 'Apex Escrow' },
        biometric: { typingFlightTimeMs: this.flightTimeMs, typingVariance: this.typingVariance }
      });
    } finally {
      this.isSubmitting = false;
    }
  }
}
