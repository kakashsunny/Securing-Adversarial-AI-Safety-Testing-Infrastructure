import React from 'react';
import { useSentinelStore, ActiveTab } from '../../engine/store';
import {
  Boxes,
  Zap,
  Link2,
  Clock,
  Activity,
  Network,
  ShieldAlert,
  FileCode2,
  Database,
  FileText,
  Code2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'arena',
    label: 'Arena',
    badge: '3D',
    icon: Boxes,
    description: '3D spatial enclaves & animated packets',
  },
  {
    id: 'breach-lab',
    label: 'Breach Lab',
    badge: '7 Attacks',
    icon: Zap,
    description: 'Simulate attacks on isolation membranes',
  },
  {
    id: 'payload-builder',
    label: 'Payload Sandbox',
    badge: 'Builder',
    icon: Code2,
    description: 'Custom adversarial prompt & SHA-256 prover',
  },
  {
    id: 'audit-chain',
    label: 'Audit Chain',
    icon: Link2,
    description: 'SHA-256 hash chained blocks & tamper injector',
  },
  {
    id: 'commit-reveal',
    label: 'Commit-Reveal',
    icon: Clock,
    description: 'Cryptographic pre-image proof timeline',
  },
  {
    id: 'leakage',
    label: 'Leakage Monitor',
    icon: Activity,
    description: 'Canary tokens & timing histogram',
  },
  {
    id: 'access',
    label: 'Access & Network',
    icon: Network,
    description: 'Capability tokens & ABAC topology',
  },
  {
    id: 'threat-model',
    label: 'Threat Model',
    icon: ShieldAlert,
    description: 'Guarantees & residual risk radar',
  },
  {
    id: 'docker-poc',
    label: 'Docker & PoC',
    badge: 'PoC',
    icon: FileCode2,
    description: 'Production Docker Compose & seccomp manifests',
  },
  {
    id: 'datasets',
    label: 'Datasets & Intel',
    badge: '8 Sources',
    icon: Database,
    description: 'JailbreakBench, HarmBench, AdvBench & CVE registry',
  },
  {
    id: 'report',
    label: 'Audit Report',
    badge: 'PDF/JSON',
    icon: FileText,
    description: 'Executive security scorecard & printable PDF export',
  },
];

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    toggleSidebar,
  } = useSentinelStore();

  return (
    <aside
      className={`shrink-0 border-r border-slate-800/80 bg-[#080B10]/95 flex flex-col justify-between transition-all duration-200 hidden md:flex ${
        sidebarCollapsed ? 'w-16 p-2' : 'w-64 p-3'
      }`}
    >
      <div className="space-y-1">
        {/* Header with Title and Closing / Collapse Button */}
        <div className="flex items-center justify-between px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800/60 mb-2">
          {!sidebarCollapsed && (
            <span className="truncate select-none">Control Plane Centers</span>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition-colors flex items-center justify-center ${
              sidebarCollapsed ? 'w-full py-1.5' : ''
            }`}
            title={sidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse / Close Navigation Sidebar'}
            aria-label={sidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse / Close Navigation Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-slate-400 hover:text-cyan-400" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-slate-400 hover:text-rose-400" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={`${item.label} — ${item.description}`}
                className={`group flex w-full items-center rounded-xl text-xs font-medium transition-all ${
                  sidebarCollapsed
                    ? 'justify-center p-2.5'
                    : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/90 to-slate-900 text-cyan-200 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!sidebarCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Panel */}
      {!sidebarCollapsed ? (
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Sandbox Isolation</span>
            <span className="flex items-center gap-1.5 font-mono text-emerald-400 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              ENFORCED
            </span>
          </div>
          <div className="text-[11px] text-slate-500 leading-relaxed">
            Air-gapped red/blue/model network bridges. WebCrypto SHA-256 active.
          </div>
        </div>
      ) : (
        <div
          className="flex justify-center p-2 bg-slate-900/60 border border-slate-800/80 rounded-xl cursor-pointer"
          title="Sandbox Isolation: ENFORCED (Air-gapped red/blue/model network bridges)"
          onClick={toggleSidebar}
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
        </div>
      )}
    </aside>
  );
};
