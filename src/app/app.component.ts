import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Services
import { FraudDataService } from './services/fraud-data.service';
import { GoldenLayoutService } from './services/golden-layout.service';

// Modals
import { ArchitectureModalComponent } from './modals/architecture-modal.component';
import { StepUpChallengeModalComponent } from './modals/step-up-challenge-modal.component';
import { SarReportModalComponent } from './modals/sar-report-modal.component';

// Panels for popout window mode
import { DecisionVerdictPanelComponent } from './panels/decision-verdict-panel.component';
import { RecentTransactionsPanelComponent } from './panels/recent-transactions-panel.component';
import { TelemetryAgentPanelComponent } from './panels/telemetry-agent-panel.component';
import { AuditRagAgentPanelComponent } from './panels/audit-rag-agent-panel.component';
import { VerificationAgentPanelComponent } from './panels/verification-agent-panel.component';
import { BehavioralGraphAgentPanelComponent } from './panels/behavioral-graph-agent-panel.component';
import { ScamCoercionAgentPanelComponent } from './panels/scam-coercion-agent-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ArchitectureModalComponent,
    StepUpChallengeModalComponent,
    SarReportModalComponent,
    DecisionVerdictPanelComponent,
    RecentTransactionsPanelComponent,
    TelemetryAgentPanelComponent,
    AuditRagAgentPanelComponent,
    VerificationAgentPanelComponent,
    BehavioralGraphAgentPanelComponent,
    ScamCoercionAgentPanelComponent
  ],
  template: `
    <!-- Popout Standalone Mode for Multi-Monitor Workstations -->
    <div class="popout-standalone-window" *ngIf="isPopoutMode">
      <header class="popout-header">
        <div class="popout-header-left">
          <span class="logo-shield">🛡️</span>
          <span class="popout-title">AegisGuard AI • Popped-Out Terminal [{{ popoutPanelType }}]</span>
          <span class="sync-badge">🟢 Live Sync Active</span>
        </div>
        <button class="dock-back-btn" (click)="closePopoutWindow()">
          ✕ Close Popout
        </button>
      </header>

      <main class="popout-content">
        <app-decision-verdict-panel *ngIf="popoutPanelType === 'decision-verdict'" (openChallenge)="isChallengeModalOpen = true" (openSar)="isSarModalOpen = true"></app-decision-verdict-panel>
        <app-recent-transactions-panel *ngIf="popoutPanelType === 'recent-transactions'"></app-recent-transactions-panel>
        <app-telemetry-agent-panel *ngIf="popoutPanelType === 'telemetry-agent'"></app-telemetry-agent-panel>
        <app-audit-rag-agent-panel *ngIf="popoutPanelType === 'audit-rag-agent'"></app-audit-rag-agent-panel>
        <app-verification-agent-panel *ngIf="popoutPanelType === 'verification-agent'"></app-verification-agent-panel>
        <app-behavioral-graph-agent-panel *ngIf="popoutPanelType === 'behavioral-graph-agent'"></app-behavioral-graph-agent-panel>
        <app-scam-coercion-agent-panel *ngIf="popoutPanelType === 'scam-coercion-agent'"></app-scam-coercion-agent-panel>
      </main>
    </div>

    <!-- Main Full Workspace Shell -->
    <div class="main-app-shell" *ngIf="!isPopoutMode">
      <!-- Top Navbar with Brand, Add Agent Screen Dropdown & Active TXN Status -->
      <header class="top-navbar">
        <div class="navbar-left">
          <div class="brand-group">
            <div class="brand-logo-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </div>
            <span class="brand-name">AegisGuard <span class="gradient-ai">AI</span></span>
          </div>
        </div>

        <div class="navbar-center">
          <!-- Active Focal Transaction Indicator -->
          <div class="active-txn-pill" *ngIf="currentEvaluation" title="Active transaction reflected in all agent screens">
            <span class="active-pulse-dot" [ngClass]="getDecisionClass(currentEvaluation?.scoring?.decision)"></span>
            <span class="pill-label">INSPECTING TXN:</span>
            <span class="pill-code">{{ currentEvaluation?.transactionId || currentEvaluation?.id }}</span>
            <span class="pill-amount" *ngIf="currentEvaluation?.transactionDetails?.amount">
              \${{ currentEvaluation.transactionDetails.amount | number:'1.2-2' }}
            </span>
            <span class="pill-decision" [ngClass]="getDecisionClass(currentEvaluation?.scoring?.decision)">
              {{ currentEvaluation?.scoring?.decision || 'APPROVE' }}
            </span>
          </div>

          <!-- Add Agent Screen Dropdown Trigger -->
          <div class="add-agent-dropdown-wrapper">
            <button class="add-agent-btn" (click)="toggleAddDropdown($event)" id="addAgentScreenBtn" title="Add agent screen or tool panel to boxes">
              <span class="plus-icon">＋</span>
              <span class="btn-label">Add Agent Screen</span>
              <span class="caret-icon">{{ isAddDropdownOpen ? '▲' : '▼' }}</span>
            </button>

            <!-- Dropdown Menu for Agent Boxes -->
            <div class="add-agent-menu" *ngIf="isAddDropdownOpen" (click)="$event.stopPropagation()">
              <div class="menu-header">
                <span class="m-title">ADD AGENT SCREEN TO WORKSPACE</span>
                <span class="m-sub">Docks live into grid layout boxes</span>
              </div>

              <div class="menu-section">
                <div class="section-label">PARALLEL AI RISK AGENTS (0-25 PTS)</div>
                <button class="menu-item-btn" (click)="addAgentScreen('telemetry-agent')">
                  <span class="item-emoji">📡</span>
                  <div class="item-text">
                    <strong>Agent 1: Telemetry & Velocity</strong>
                    <small>Amount Z-Score, Geo Travel Jumps & Device Trust</small>
                  </div>
                </button>

                <button class="menu-item-btn" (click)="addAgentScreen('audit-rag-agent')">
                  <span class="item-emoji">🔍</span>
                  <div class="item-text">
                    <strong>Agent 2: Audit & Database RAG</strong>
                    <small>MPIN Resets, SIM Swap & Typology Retrieval</small>
                  </div>
                </button>

                <button class="menu-item-btn" (click)="addAgentScreen('verification-agent')">
                  <span class="item-emoji">🛡️</span>
                  <div class="item-text">
                    <strong>Agent 3: Biometric Verification</strong>
                    <small>Presented Selfie vs KYC ID, Liveness & Anti-Spoof</small>
                  </div>
                </button>

                <button class="menu-item-btn" (click)="addAgentScreen('behavioral-graph-agent')">
                  <span class="item-emoji">🕸️</span>
                  <div class="item-text">
                    <strong>Agent 4: Behavioral & Graph Anomaly</strong>
                    <small>Mule Hub Accounts, Sanctions Proximity & Liquidity</small>
                  </div>
                </button>

                <button class="menu-item-btn" (click)="addAgentScreen('scam-coercion-agent')">
                  <span class="item-emoji">🚨</span>
                  <div class="item-text">
                    <strong>Agent 5: Scam Narrative & Coercion</strong>
                    <small>Call Sensors, Memo Psychology & Search Grounding</small>
                  </div>
                </button>
              </div>

              <div class="menu-section">
                <div class="section-label">FORENSIC & LEDGER SCREENS</div>
                <button class="menu-item-btn" (click)="addAgentScreen('decision-verdict')">
                  <span class="item-emoji">⚖️</span>
                  <div class="item-text">
                    <strong>Decision & Root Cause Verdict</strong>
                    <small>Unified 100-Point Risk Gauge & Interception Gates</small>
                  </div>
                </button>

                <button class="menu-item-btn" (click)="addAgentScreen('recent-transactions')">
                  <span class="item-emoji">📑</span>
                  <div class="item-text">
                    <strong>All Transactions Ledger</strong>
                    <small>Historical transaction audit ledger with View details</small>
                  </div>
                </button>

                <button class="menu-item-btn" (click)="addAgentScreen('network-graph')">
                  <span class="item-emoji">🌐</span>
                  <div class="item-text">
                    <strong>Mule Network & KYC Graph</strong>
                    <small>Multi-hop graph topology of high-risk nodes</small>
                  </div>
                </button>

                <button class="menu-item-btn" (click)="addAgentScreen('orchestration-flow')">
                  <span class="item-emoji">⚡</span>
                  <div class="item-text">
                    <strong>DAG LangGraph Pipeline</strong>
                    <small>Multi-Agent parallel orchestration timeline</small>
                  </div>
                </button>

                <button class="menu-item-btn" (click)="addAgentScreen('sar-compliance')">
                  <span class="item-emoji">📋</span>
                  <div class="item-text">
                    <strong>FinCEN SAR Copilot</strong>
                    <small>Automated BSA Form 111 Regulatory Narrative</small>
                  </div>
                </button>
              </div>

              <div class="menu-footer">
                <button class="reset-layout-btn" (click)="resetLayout()">
                  <span>↺ Reset Default 7-Box Layout</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Reset Layout quick button -->
          <button class="reset-quick-btn" (click)="resetLayout()" title="Reset layout boxes to standard 7-panel view">
            <span>↺ Reset Boxes</span>
          </button>

          <!-- Threat Simulator Studio Launch Button -->
          <a class="simulator-nav-link" href="/simulator" target="_blank" title="Open Threat Simulator Studio in a new tab">
            <span class="sim-icon">📱</span>
            <span>Threat Simulator</span>
          </a>
        </div>

        <div class="navbar-right">
          <div class="clock-display">{{ currentTime }}</div>
        </div>
      </header>

      <!-- Golden Layout Docking Workspace -->
      <main class="golden-layout-workspace-container" #layoutContainer></main>

      <!-- Modals -->
      <app-architecture-modal 
        [isOpen]="isArchModalOpen" 
        (close)="isArchModalOpen = false">
      </app-architecture-modal>

      <app-step-up-challenge-modal 
        [isOpen]="isChallengeModalOpen" 
        (close)="isChallengeModalOpen = false"
        (resolved)="onChallengeResolved()">
      </app-step-up-challenge-modal>

      <app-sar-report-modal 
        [isOpen]="isSarModalOpen" 
        [transaction]="currentEvaluation"
        (close)="isSarModalOpen = false">
      </app-sar-report-modal>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #080d1a;
      color: #f8fafc;
      font-family: 'Inter', -apple-system, sans-serif;
    }

    /* Popout Standalone Mode */
    .popout-standalone-window {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      background: #080d1a;
    }
    .popout-header {
      height: 38px;
      background: #0f172a;
      border-bottom: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }
    .popout-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-shield { font-size: 16px; }
    .popout-title { font-size: 12px; font-weight: 600; color: #f1f5f9; }
    .sync-badge {
      font-size: 9px;
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      padding: 2px 7px;
      border-radius: 10px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .dock-back-btn {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #ef4444;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 4px;
      cursor: pointer;
    }
    .dock-back-btn:hover { background: #ef4444; color: white; }
    .popout-content { flex: 1; overflow: hidden; }

    /* Main App Shell */
    .main-app-shell {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    /* Minimalist Top Navbar: Strictly Product Name + Time Only */
    .top-navbar {
      height: 42px;
      background: rgba(11, 19, 41, 0.98);
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 18px;
      z-index: 100;
      flex-shrink: 0;
    }
    .navbar-left {
      display: flex;
      align-items: center;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 9px;
    }
    .brand-logo-icon {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      background: linear-gradient(135deg, #0284c7, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
    }
    .brand-name {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #f8fafc;
      font-family: 'Outfit', sans-serif;
    }
    .gradient-ai {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .navbar-right {
      display: flex;
      align-items: center;
    }
    .clock-display {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Center Navbar & Add Agent Button */
    .navbar-center {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .active-txn-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 11px;
    }
    .active-pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .active-pulse-dot.approve { background: #10b981; box-shadow: 0 0 8px #10b981; }
    .active-pulse-dot.challenge { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
    .active-pulse-dot.block { background: #ef4444; box-shadow: 0 0 8px #ef4444; }

    .pill-label { font-size: 9px; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px; }
    .pill-code { font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-weight: 700; }
    .pill-amount { font-family: 'JetBrains Mono', monospace; color: #f8fafc; font-weight: 600; }
    .pill-decision {
      font-size: 9px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 10px;
      text-transform: uppercase;
    }
    .pill-decision.approve { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .pill-decision.challenge { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .pill-decision.block { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

    /* Add Agent Screen Dropdown */
    .add-agent-dropdown-wrapper {
      position: relative;
    }

    .add-agent-btn {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.8), rgba(99, 102, 241, 0.8));
      border: 1px solid rgba(56, 189, 248, 0.6);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
      transition: all 0.2s;
    }
    .add-agent-btn:hover {
      background: linear-gradient(135deg, #0284c7, #6366f1);
      box-shadow: 0 0 18px rgba(56, 189, 248, 0.6);
      transform: translateY(-1px);
    }
    .plus-icon { font-size: 13px; font-weight: 900; }
    .caret-icon { font-size: 8px; opacity: 0.8; }

    .reset-quick-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      color: #94a3b8;
      font-size: 11px;
      padding: 4px 9px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .reset-quick-btn:hover {
      background: #334155;
      color: #38bdf8;
      border-color: #38bdf8;
    }

    .simulator-nav-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(99, 102, 241, 0.25));
      border: 1px solid rgba(56, 189, 248, 0.45);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 11px;
      border-radius: 6px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .simulator-nav-link:hover {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.35), rgba(99, 102, 241, 0.4));
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
    }

    /* Dropdown Floating Menu */
    .add-agent-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 6px;
      width: 320px;
      background: rgba(11, 19, 41, 0.98);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 8px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.2);
      backdrop-filter: blur(16px);
      z-index: 99999;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .menu-header {
      padding: 6px 8px 4px 8px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      display: flex;
      flex-direction: column;
    }
    .m-title { font-size: 11px; font-weight: 800; color: #f8fafc; font-family: 'Outfit', sans-serif; letter-spacing: 0.3px; }
    .m-sub { font-size: 9px; color: #64748b; }

    .menu-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .section-label {
      font-size: 9px;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 0.6px;
      padding: 4px 8px 2px 8px;
    }

    .menu-item-btn {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 6px 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
      color: #f1f5f9;
    }
    .menu-item-btn:hover {
      background: rgba(56, 189, 248, 0.12);
      border-color: rgba(56, 189, 248, 0.35);
    }
    .item-emoji { font-size: 16px; width: 22px; text-align: center; }
    .item-text { display: flex; flex-direction: column; }
    .item-text strong { font-size: 11px; font-weight: 600; color: #f8fafc; }
    .item-text small { font-size: 9px; color: #94a3b8; }

    .menu-footer {
      border-top: 1px solid rgba(51, 65, 85, 0.5);
      padding-top: 6px;
    }
    .reset-layout-btn {
      width: 100%;
      background: rgba(30, 41, 59, 0.6);
      border: 1px dashed rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      font-size: 10px;
      font-weight: 600;
      padding: 6px;
      border-radius: 4px;
      cursor: pointer;
      text-align: center;
    }
    .reset-layout-btn:hover {
      background: rgba(56, 189, 248, 0.2);
    }

    /* Golden Layout Workspace */
    .golden-layout-workspace-container {
      flex: 1;
      width: 100%;
      height: calc(100vh - 42px);
      position: relative;
      overflow: hidden;
      background: #080d1a;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('layoutContainer') layoutContainerRef!: ElementRef<HTMLDivElement>;

  public isPopoutMode: boolean = false;
  public popoutPanelType: string = '';

  public currentTime: string = '';
  public currentEvaluation: any = null;
  public isAddDropdownOpen: boolean = false;

  @HostListener('document:click')
  public onDocumentClick() {
    this.isAddDropdownOpen = false;
  }

  public toggleAddDropdown(e: Event) {
    e.stopPropagation();
    this.isAddDropdownOpen = !this.isAddDropdownOpen;
  }

  public addAgentScreen(panelType: string) {
    this.glService.addPanel(panelType);
    this.isAddDropdownOpen = false;
  }

  public resetLayout() {
    this.glService.resetToDefault();
    this.isAddDropdownOpen = false;
  }

  public getDecisionClass(decision: string | undefined): string {
    const d = (decision || '').toLowerCase();
    if (d.includes('block')) return 'block';
    if (d.includes('challenge')) return 'challenge';
    return 'approve';
  }

  // Modals state
  public isArchModalOpen: boolean = false;
  public isChallengeModalOpen: boolean = false;
  public isSarModalOpen: boolean = false;

  private clockInterval: any = null;
  private subs: Subscription[] = [];

  constructor(
    private fraudService: FraudDataService,
    private glService: GoldenLayoutService
  ) {}

  ngOnInit() {
    this.checkPopoutMode();
    this.startClock();

    // Connect modal triggers from GoldenLayout
    this.glService.onOpenChallengeModal = () => { this.isChallengeModalOpen = true; };
    this.glService.onOpenSarModal = () => { this.isSarModalOpen = true; };

    this.subs.push(
      this.fraudService.currentEvaluation$.subscribe(ev => this.currentEvaluation = ev)
    );
  }

  ngAfterViewInit() {
    if (!this.isPopoutMode && this.layoutContainerRef) {
      setTimeout(() => {
        this.glService.init(this.layoutContainerRef.nativeElement);
      }, 50);
    }
  }

  ngOnDestroy() {
    clearInterval(this.clockInterval);
    this.subs.forEach(s => s.unsubscribe());
    this.glService.destroy();
  }

  private checkPopoutMode() {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const popout = urlParams.get('popout');
      if (popout) {
        this.isPopoutMode = true;
        this.popoutPanelType = popout;
      }
    }
  }

  public closePopoutWindow() {
    window.close();
  }

  private startClock() {
    const update = () => {
      const d = new Date();
      this.currentTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')} IST`;
    };
    update();
    this.clockInterval = setInterval(update, 1000);
  }

  public onChallengeResolved() {
    if (this.currentEvaluation) {
      const updated = {
        ...this.currentEvaluation,
        scoring: {
          ...this.currentEvaluation.scoring,
          decision: 'APPROVE',
          actionRequired: 'Biometric challenge resolved successfully. Funds cleared.'
        }
      };
      this.fraudService.resolveChallenge(updated);
    }
  }
}
