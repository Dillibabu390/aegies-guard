import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDataService, ThreatScenario } from '../services/fraud-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scenario-picker-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <div class="panel-header">
        <div class="header-title">
          <span class="icon">🎯</span>
          <h3>Threat Scenarios Library</h3>
          <span class="count-badge">{{ scenarios.length }} Preconfigured</span>
        </div>
        <div class="header-actions">
          <button class="mini-btn popout-btn" (click)="popoutRequest.emit('scenario-picker')" title="Pop out to separate screen">
            <span>⧉</span> Pop Out
          </button>
        </div>
      </div>

      <div class="scenarios-grid">
        <div class="scenario-card" 
             *ngFor="let sc of scenarios" 
             [class.active]="sc.id === activeId"
             (click)="onSelect(sc)">
          <div class="card-top-row">
            <span class="sc-name">{{ sc.name }}</span>
            <span class="sc-tag" [ngClass]="getTagClass(sc.tag)">{{ sc.tag }}</span>
          </div>
          <p class="sc-desc">{{ sc.description }}</p>
          <div class="card-bottom-row">
            <span class="target-decision">Expected: <strong>{{ sc.expectedDecision }}</strong></span>
            <button class="run-btn" [class.running]="sc.id === activeId && isEvaluating">
              {{ sc.id === activeId && isEvaluating ? 'Evaluating...' : '▶ Run Attack' }}
            </button>
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
    .count-badge {
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
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
    .scenarios-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .scenario-card {
      background: rgba(30, 41, 59, 0.45);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 10px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .scenario-card:hover {
      background: rgba(30, 41, 59, 0.7);
      border-color: rgba(56, 189, 248, 0.4);
      transform: translateY(-1px);
    }
    .scenario-card.active {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
    }
    .card-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      gap: 8px;
    }
    .sc-name {
      font-size: 13px;
      font-weight: 600;
      color: #f8fafc;
    }
    .sc-tag {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .sc-tag.danger {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .sc-tag.warning {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .sc-tag.safe {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .sc-desc {
      font-size: 11px;
      color: #94a3b8;
      margin: 0 0 10px;
      line-height: 1.35;
    }
    .card-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .target-decision {
      font-size: 11px;
      color: #64748b;
    }
    .target-decision strong {
      color: #cbd5e1;
    }
    .run-btn {
      background: #1e293b;
      border: 1px solid #475569;
      color: #38bdf8;
      font-size: 10px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .run-btn:hover {
      background: #0284c7;
      color: white;
      border-color: #0284c7;
    }
    .run-btn.running {
      background: #d97706;
      color: white;
      border-color: #d97706;
    }
  `]
})
export class ScenarioPickerPanelComponent implements OnInit, OnDestroy {
  @Output() popoutRequest = new EventEmitter<string>();

  public scenarios: ThreatScenario[] = [];
  public activeId: string | null = null;
  public isEvaluating: boolean = false;
  private subs: Subscription[] = [];

  constructor(private fraudService: FraudDataService) {}

  ngOnInit() {
    this.subs.push(
      this.fraudService.scenarios$.subscribe(sc => this.scenarios = sc),
      this.fraudService.activeScenarioId$.subscribe(id => this.activeId = id),
      this.fraudService.isEvaluating$.subscribe(ev => this.isEvaluating = ev)
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  onSelect(sc: ThreatScenario) {
    this.fraudService.selectScenario(sc);
  }

  getTagClass(tag: string): string {
    const t = tag.toLowerCase();
    if (t.includes('critical') || t.includes('block')) return 'danger';
    if (t.includes('elevated') || t.includes('challenge') || t.includes('coercion')) return 'warning';
    return 'safe';
  }
}
