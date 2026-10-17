import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FraudDataService, TransactionSummaryItem } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recent-transactions-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">📑</span>
          <h3>All Transactions Ledger</h3>
          <span class="count-badge">{{ filteredTransactions.length }} TXNs</span>
        </div>
        <div class="header-actions">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search TXN / User..." 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilter()"
          />
          <select class="channel-select" [(ngModel)]="selectedChannel" (ngModelChange)="applyFilter()">
            <option value="ALL">All Channels</option>
            <option value="Online">Online Wire</option>
            <option value="Mobile App">Mobile App</option>
            <option value="POS">POS Terminal</option>
          </select>
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('recent-transactions')" title="Pop out window">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="txn-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>TXN ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Score</th>
              <th>Verdict</th>
              <th>Time</th>
              <th>View TXN</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              *ngFor="let tx of filteredTransactions" 
              [class.active-row]="tx.id === selectedTxId"
              (click)="selectTx(tx)"
            >
              <td class="status-cell">
                <span class="dot-indicator" [ngClass]="tx.decision.toLowerCase()"></span>
              </td>
              <td class="id-cell">
                <span class="txn-code">{{ tx.id }}</span>
              </td>
              <td class="cust-cell">{{ tx.customer }}</td>
              <td class="amount-cell">\${{ tx.amount | number:'1.2-2' }}</td>
              <td class="score-cell">
                <span class="score-badge" [style.color]="getScoreColor(tx.riskScore)">
                  {{ tx.riskScore }}
                </span>
              </td>
              <td>
                <span class="decision-pill" [ngClass]="tx.decision.toLowerCase()">
                  {{ tx.decision }}
                </span>
              </td>
              <td class="time-cell">{{ formatTime(tx.timestamp) }}</td>
              <td class="action-cell">
                <button 
                  class="view-btn" 
                  [class.selected]="tx.id === selectedTxId"
                  (click)="selectTx(tx); $event.stopPropagation()"
                  title="View this transaction across all agent windows"
                >
                  <span class="view-icon">👁️</span>
                  <span>{{ tx.id === selectedTxId ? 'Viewing' : 'View' }}</span>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredTransactions.length === 0">
              <td colspan="8" class="empty-cell">No transactions found matching filter criteria.</td>
            </tr>
          </tbody>
        </table>
      </div>
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
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.4);
      gap: 10px;
      flex-shrink: 0;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-title h3 {
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      font-family: 'Outfit', sans-serif;
    }
    .count-badge {
      font-size: 10px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 2px 6px;
      border-radius: 10px;
      font-family: 'JetBrains Mono', monospace;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .search-input {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid #334155;
      color: #f1f5f9;
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      width: 130px;
      outline: none;
    }
    .search-input:focus { border-color: #38bdf8; }
    .channel-select {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid #334155;
      color: #cbd5e1;
      font-size: 10px;
      padding: 4px 6px;
      border-radius: 4px;
      cursor: pointer;
      outline: none;
    }
    .mini-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      color: #cbd5e1;
      font-size: 10px;
      padding: 4px 7px;
      border-radius: 4px;
      cursor: pointer;
    }
    .mini-btn:hover { background: #334155; color: #38bdf8; }

    .table-container {
      flex: 1;
      overflow-y: auto;
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.5);
    }
    .txn-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      text-align: left;
    }
    .txn-table th {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #94a3b8;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      padding: 7px 10px;
      border-bottom: 1px solid #334155;
      z-index: 10;
    }
    .txn-table td {
      padding: 7px 10px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.25);
    }
    .txn-table tbody tr {
      cursor: pointer;
      transition: background 0.15s;
    }
    .txn-table tbody tr:hover {
      background: rgba(56, 189, 248, 0.08);
    }
    .txn-table tbody tr.active-row {
      background: rgba(56, 189, 248, 0.15);
      border-left: 3px solid #38bdf8;
    }
    .status-cell { width: 24px; text-align: center; }
    .dot-indicator {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .dot-indicator.approve { background: #10b981; box-shadow: 0 0 6px #10b981; }
    .dot-indicator.challenge { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
    .dot-indicator.block { background: #ef4444; box-shadow: 0 0 6px #ef4444; }

    .id-cell { font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-weight: 600; }
    .cust-cell { color: #cbd5e1; font-weight: 500; }
    .amount-cell { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #f8fafc; }
    .score-cell { font-family: 'JetBrains Mono', monospace; font-weight: 800; }
    .decision-pill {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      text-transform: uppercase;
    }
    .decision-pill.approve { background: rgba(16, 185, 129, 0.18); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .decision-pill.challenge { background: rgba(245, 158, 11, 0.18); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .decision-pill.block { background: rgba(239, 68, 68, 0.18); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

    .time-cell { font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace; }
    .action-cell { text-align: center; }
    .view-btn {
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }
    .view-btn:hover {
      background: rgba(56, 189, 248, 0.25);
      border-color: #38bdf8;
      color: #f8fafc;
      transform: translateY(-1px);
    }
    .view-btn.selected {
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border-color: #38bdf8;
      font-weight: 700;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    .view-icon { font-size: 11px; }

    .empty-cell {
      text-align: center;
      padding: 20px;
      color: #64748b;
      font-style: italic;
    }
  `]
})
export class RecentTransactionsPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public transactions: TransactionSummaryItem[] = [];
  public filteredTransactions: TransactionSummaryItem[] = [];
  public selectedTxId: string = '';
  public searchQuery: string = '';
  public selectedChannel: string = 'ALL';

  private subList: Subscription | null = null;
  private subCurrent: Subscription | null = null;

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.subList = this.fraudService.allTransactions$.subscribe(list => {
      this.transactions = list || [];
      this.applyFilter();
      // First priority: ensure the latest / most recent transaction is active if none is selected
      if (!this.selectedTxId && this.filteredTransactions.length > 0) {
        this.selectTx(this.filteredTransactions[0]);
      }
    });

    this.subCurrent = this.fraudService.currentEvaluation$.subscribe(curr => {
      if (curr) {
        this.selectedTxId = curr.transactionId || curr.id || '';
      }
    });
  }

  ngOnDestroy() {
    if (this.subList) this.subList.unsubscribe();
    if (this.subCurrent) this.subCurrent.unsubscribe();
  }

  public applyFilter() {
    let res = [...this.transactions];
    if (this.selectedChannel !== 'ALL') {
      res = res.filter(t => t.channel?.toLowerCase().includes(this.selectedChannel.toLowerCase()));
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      res = res.filter(t => 
        t.id.toLowerCase().includes(q) || 
        t.customer.toLowerCase().includes(q) ||
        (t.memo && t.memo.toLowerCase().includes(q))
      );
    }
    this.filteredTransactions = res;
  }

  public selectTx(item: TransactionSummaryItem) {
    this.selectedTxId = item.id;
    this.fraudService.selectTransaction(item);
  }

  public getScoreColor(s: number): string {
    if (s >= 60) return '#ef4444';
    if (s >= 25) return '#f59e0b';
    return '#10b981';
  }

  public formatTime(ts: string): string {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    } catch {
      return ts;
    }
  }
}
