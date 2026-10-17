import { Injectable, EnvironmentInjector, ApplicationRef, createComponent, ComponentRef } from '@angular/core';
import { GoldenLayout, LayoutConfig, ItemType, ComponentContainer } from 'golden-layout';

// Import the 7 Core Panels
import { DecisionVerdictPanelComponent } from '../panels/decision-verdict-panel.component';
import { RecentTransactionsPanelComponent } from '../panels/recent-transactions-panel.component';
import { TelemetryAgentPanelComponent } from '../panels/telemetry-agent-panel.component';
import { AuditRagAgentPanelComponent } from '../panels/audit-rag-agent-panel.component';
import { VerificationAgentPanelComponent } from '../panels/verification-agent-panel.component';
import { BehavioralGraphAgentPanelComponent } from '../panels/behavioral-graph-agent-panel.component';
import { ScamCoercionAgentPanelComponent } from '../panels/scam-coercion-agent-panel.component';

// Auxiliary Panels
import { NetworkGraphPanelComponent } from '../panels/network-graph-panel.component';
import { OrchestrationFlowPanelComponent } from '../panels/orchestration-flow-panel.component';
import { SarCompliancePanelComponent } from '../panels/sar-compliance-panel.component';

export interface PanelDefinition {
  type: string;
  title: string;
  component: any;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoldenLayoutService {
  private layout: GoldenLayout | null = null;
  private containerElement: HTMLElement | null = null;
  private activeComponents = new Map<ComponentContainer, ComponentRef<any>>();

  // Event callbacks for parent modals
  public onOpenChallengeModal?: () => void;
  public onOpenSarModal?: () => void;

  public availablePanels: PanelDefinition[] = [
    { type: 'decision-verdict', title: 'Decision & Root Cause Verdict', component: DecisionVerdictPanelComponent, icon: '⚖️' },
    { type: 'recent-transactions', title: 'All Transactions Ledger', component: RecentTransactionsPanelComponent, icon: '📑' },
    { type: 'telemetry-agent', title: 'Agent 1: Telemetry & Velocity', component: TelemetryAgentPanelComponent, icon: '📡' },
    { type: 'audit-rag-agent', title: 'Agent 2: Audit & Database RAG', component: AuditRagAgentPanelComponent, icon: '🔍' },
    { type: 'verification-agent', title: 'Agent 3: Biometric Verification', component: VerificationAgentPanelComponent, icon: '🛡️' },
    { type: 'behavioral-graph-agent', title: 'Agent 4: Behavioral & Graph', component: BehavioralGraphAgentPanelComponent, icon: '🕸️' },
    { type: 'scam-coercion-agent', title: 'Agent 5: Scam & Coercion', component: ScamCoercionAgentPanelComponent, icon: '🚨' },
    { type: 'network-graph', title: 'Mule Network & KYC Graph', component: NetworkGraphPanelComponent, icon: '🌐' },
    { type: 'orchestration-flow', title: 'DAG LangGraph Pipeline', component: OrchestrationFlowPanelComponent, icon: '⚡' },
    { type: 'sar-compliance', title: 'FinCEN SAR Copilot', component: SarCompliancePanelComponent, icon: '⚖️' }
  ];

  constructor(
    private injector: EnvironmentInjector,
    private appRef: ApplicationRef
  ) {}

  public init(container: HTMLElement) {
    this.containerElement = container;
    this.createLayout();

    window.addEventListener('resize', this.onWindowResize);
  }

  private onWindowResize = () => {
    if (this.layout && this.containerElement) {
      this.layout.setSize(this.containerElement.clientWidth, this.containerElement.clientHeight);
    }
  };

  public destroy() {
    window.removeEventListener('resize', this.onWindowResize);
    this.cleanupActiveComponents();
    if (this.layout) {
      this.layout.destroy();
      this.layout = null;
    }
  }

  private cleanupActiveComponents() {
    this.activeComponents.forEach((compRef) => {
      this.appRef.detachView(compRef.hostView);
      compRef.destroy();
    });
    this.activeComponents.clear();
  }

  public getDefaultConfig(): LayoutConfig {
    return {
      settings: {
        showPopoutIcon: true,
        showMaximiseIcon: true,
        showCloseIcon: true
      },
      header: {
        show: 'top',
        popout: 'Pop out window to separate screen',
        maximise: 'Maximize panel',
        close: 'Close panel'
      },
      root: {
        type: ItemType.row,
        content: [
          // Left Column (32%): Decision Box + All Transactions List
          {
            type: ItemType.column,
            size: '32%',
            content: [
              {
                type: ItemType.component,
                componentType: 'decision-verdict',
                title: 'Decision & Root Cause Verdict',
                size: '54%'
              },
              {
                type: ItemType.component,
                componentType: 'recent-transactions',
                title: 'All Transactions Ledger',
                size: '46%'
              }
            ]
          },
          // Middle Column (34%): Agent 1 & Agent 2
          {
            type: ItemType.column,
            size: '34%',
            content: [
              {
                type: ItemType.component,
                componentType: 'telemetry-agent',
                title: 'Agent 1: Telemetry & Velocity',
                size: '50%'
              },
              {
                type: ItemType.component,
                componentType: 'audit-rag-agent',
                title: 'Agent 2: Audit & Database RAG',
                size: '50%'
              }
            ]
          },
          // Right Column (34%): Agent 3, Agent 4, Agent 5
          {
            type: ItemType.column,
            size: '34%',
            content: [
              {
                type: ItemType.component,
                componentType: 'verification-agent',
                title: 'Agent 3: Biometric Verification',
                size: '36%'
              },
              {
                type: ItemType.component,
                componentType: 'behavioral-graph-agent',
                title: 'Agent 4: Behavioral & Graph',
                size: '32%'
              },
              {
                type: ItemType.component,
                componentType: 'scam-coercion-agent',
                title: 'Agent 5: Scam & Coercion',
                size: '32%'
              }
            ]
          }
        ]
      }
    };
  }

  private mountPanel(container: ComponentContainer, def: PanelDefinition) {
    const compRef = createComponent(def.component, {
      environmentInjector: this.injector
    });

    // Wire up output events
    if ('popoutRequest' in compRef.instance) {
      compRef.instance.popoutRequest.subscribe((panelType: string) => {
        this.popoutToSeparateScreen(panelType);
      });
    }
    if ('openChallenge' in compRef.instance) {
      compRef.instance.openChallenge.subscribe(() => {
        this.onOpenChallengeModal?.();
      });
    }
    if ('openSar' in compRef.instance) {
      compRef.instance.openSar.subscribe(() => {
        this.onOpenSarModal?.();
      });
    }

    container.element.appendChild(compRef.location.nativeElement);
    this.appRef.attachView(compRef.hostView);
    compRef.changeDetectorRef.detectChanges();

    this.activeComponents.set(container, compRef);
    return compRef;
  }

  private handleBindComponent = (container: ComponentContainer, itemConfig?: any) => {
    const type = itemConfig?.componentType || (itemConfig as any)?.componentName;
    if (type) {
      const def = this.availablePanels.find(p => p.type === type);
      if (def) {
        return this.mountPanel(container, def);
      }
    }
  };

  private handleUnbindComponent = (container: ComponentContainer) => {
    const compRef = this.activeComponents.get(container);
    if (compRef) {
      this.appRef.detachView(compRef.hostView);
      compRef.destroy();
      this.activeComponents.delete(container);
    }
  };

  private createLayout(config?: LayoutConfig) {
    if (!this.containerElement) return;

    this.cleanupActiveComponents();
    if (this.layout) {
      try {
        this.layout.destroy();
      } catch (e) {
        console.warn('Error destroying existing layout:', e);
      }
      this.layout = null;
    }
    this.containerElement.innerHTML = '';

    const layoutConfig = config || this.loadSavedConfig() || this.getDefaultConfig();

    this.layout = new GoldenLayout(
      this.containerElement,
      this.handleBindComponent,
      this.handleUnbindComponent
    );

    // Register each component explicitly
    this.availablePanels.forEach(panel => {
      this.layout!.registerComponentFactoryFunction(panel.type, (container) => {
        return this.mountPanel(container, panel);
      });
    });

    try {
      this.layout.loadLayout(layoutConfig);
    } catch (e) {
      console.warn('Failed to load layout configuration, falling back to default:', e);
      localStorage.removeItem('aegisguard_gl_layout');
      try {
        this.layout.loadLayout(this.getDefaultConfig());
      } catch (err) {
        console.error('Default layout load error:', err);
      }
    }

    // Save layout on state changes
    this.layout.on('stateChanged', () => {
      this.saveCurrentLayout();
    });
  }

  public saveCurrentLayout() {
    if (this.layout) {
      try {
        const config = this.layout.saveLayout();
        localStorage.setItem('aegisguard_gl_layout', JSON.stringify(config));
      } catch (e) {}
    }
  }

  public loadSavedConfig(): LayoutConfig | null {
    try {
      const saved = localStorage.getItem('aegisguard_gl_layout');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.root && parsed.root.content && parsed.root.content.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  }

  public resetToDefault() {
    localStorage.removeItem('aegisguard_gl_layout');
    this.createLayout(this.getDefaultConfig());
  }

  public addPanel(panelType: string) {
    if (!this.layout) return;
    const def = this.availablePanels.find(p => p.type === panelType);
    if (!def) return;

    try {
      this.layout.addComponent(def.type, undefined, def.title);
      this.saveCurrentLayout();
    } catch (e) {
      console.warn('addComponent fallback to addItem:', e);
      try {
        this.layout.addItem({
          type: ItemType.component,
          componentType: def.type,
          title: def.title
        });
        this.saveCurrentLayout();
      } catch (err) {
        console.error('Could not add panel:', err);
      }
    }
  }

  /**
   * Pops out any panel into an independent browser window
   */
  public popoutToSeparateScreen(panelType: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('popout', panelType);

    const width = 850;
    const height = 650;
    const left = window.screenX + 50;
    const top = window.screenY + 50;

    const popup = window.open(
      url.toString(),
      `AegisGuard_${panelType}_${Date.now()}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no,resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
    }
  }
}
