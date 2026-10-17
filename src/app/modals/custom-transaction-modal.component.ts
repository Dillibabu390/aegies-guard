import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-left">
            <span class="modal-icon">➕</span>
            <div>
              <h2>Custom Transaction Simulator</h2>
              <p class="subtitle">Craft custom financial parameters & evaluate against the 5-agent swarm</p>
            </div>
          </div>
          <button class="close-x" (click)="close.emit()">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Amount (USD)</label>
              <input type="number" [(ngModel)]="amount" class="form-input"/>
            </div>
            <div class="form-group">
              <label>User ID</label>
              <input type="text" [(ngModel)]="userId" class="form-input"/>
            </div>
            <div class="form-group">
              <label>Location / Country</label>
              <input type="text" [(ngModel)]="location" class="form-input"/>
            </div>
            <div class="form-group">
              <label>IP Address / Exit Node</label>
              <input type="text" [(ngModel)]="ipAddress" class="form-input"/>
            </div>
            <div class="form-group">
              <label>Device Hardware</label>
              <input type="text" [(ngModel)]="device" class="form-input"/>
            </div>
            <div class="form-group">
              <label>Beneficiary Account</label>
              <input type="text" [(ngModel)]="beneficiaryAccount" class="form-input"/>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Payment Memo / Notes</label>
            <input type="text" [(ngModel)]="memo" class="form-input"/>
          </div>

          <div class="switches-row">
            <label class="switch-item">
              <input type="checkbox" [(ngModel)]="vpnDetected"/>
              <span>Simulate VPN / Proxy</span>
            </label>
            <label class="switch-item">
              <input type="checkbox" [(ngModel)]="activeCallInProgress"/>
              <span>Simulate Active Phone Call (Coercion Risk)</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="close.emit()">Cancel</button>
          <button class="btn-submit" (click)="onSubmit()">⚡ Evaluate Custom Transaction</button>
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
      max-width: 640px;
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
    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .modal-icon { font-size: 22px; }
    .modal-header h2 { margin: 0; font-size: 16px; font-weight: 700; color: #f1f5f9; }
    .subtitle { margin: 2px 0 0; font-size: 11px; color: #94a3b8; }
    .close-x { background: transparent; border: none; color: #64748b; font-size: 18px; cursor: pointer; }
    .close-x:hover { color: #f8fafc; }
    .modal-body { padding: 20px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .form-group label {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .form-input {
      width: 100%;
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      font-size: 12px;
      padding: 8px 10px;
      border-radius: 6px;
      outline: none;
    }
    .form-input:focus { border-color: #38bdf8; }
    .full-width { margin-bottom: 14px; }
    .switches-row {
      display: flex;
      gap: 16px;
      padding: 10px 12px;
      background: rgba(30, 41, 59, 0.4);
      border-radius: 8px;
    }
    .switch-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #cbd5e1;
      cursor: pointer;
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
      color: #94a3b8;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-submit {
      background: linear-gradient(135deg, #0284c7, #2563eb);
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
export class CustomTransactionModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() evaluateCustom = new EventEmitter<any>();

  public amount: number = 7500;
  public userId: string = 'usr_alex_chen';
  public location: string = 'London, United Kingdom';
  public ipAddress: string = '185.220.101.42 (Mullvad VPN)';
  public device: string = 'Linux x86_64 Emulator';
  public beneficiaryAccount: string = 'ACC_MULE_990142';
  public memo: string = 'Urgent International Relocation Clearance';
  public vpnDetected: boolean = true;
  public activeCallInProgress: boolean = true;

  onSubmit() {
    this.evaluateCustom.emit({
      userId: this.userId,
      amount: this.amount,
      currency: 'USD',
      memo: this.memo,
      location: { country: this.location },
      device: { deviceModel: this.device, ip: this.ipAddress, vpnDetected: this.vpnDetected },
      beneficiary: { accountNumber: this.beneficiaryAccount, id: 'BEN_CUSTOM', name: 'Apex Escrow' },
      activeCallInProgress: this.activeCallInProgress
    });
    this.close.emit();
  }
}
