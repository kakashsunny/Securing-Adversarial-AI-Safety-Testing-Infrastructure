import React, { useEffect } from 'react';
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
  X,
  Radio,
  Lock,
  Unlock,
  ShieldCheck,
  ChevronRight,
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
    label: '3D Spatial Arena',
    badge: 'Live',
    icon: Boxes,
    description: '3D spatial enclaves & animated packets',
  },
  {
    id: 'breach-lab',
    label: 'Breach Simulation Lab',
    badge: '7 Attacks',
    icon: Zap,
    description: 'Simulate attacks on isolation membranes',
  },
  {
    id: 'payload-builder',
    label: 'Payload Sandbox',
    badge: 'Prover',
    icon: Code2,
    description: 'Custom adversarial prompt & SHA-256 prover',
  },
  {
    id: 'audit-chain',
    label: 'Tamper-Proof Audit Chain',
    icon: Link2,
    description: 'SHA-256 hash chained blocks & tamper injector',
  },
  {
    id: 'commit-reveal',
    label: 'Commit-Reveal Timeline',
    icon: Clock,
    description: 'Cryptographic pre-image proof timeline',
  },
  {
    id: 'leakage',
    label: 'Side-Channel & Leakage',
    icon: Activity,
    description: 'Canary tokens & timing histogram',
  },
  {
    id: 'access',
    label: 'Access & Capabilities',
    icon: Network,
    description: 'Capability tokens & ABAC topology',
  },
  {
    id: 'threat-model',
    label: 'Threat Model & Radar',
    icon: ShieldAlert,
    description: 'Guarantees & residual risk radar',
  },
  {
    id: 'docker-poc',
    label: 'Docker & PoC Manifests',
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

export const MobileNavDrawer: React.FC = () => {
  const {
    isMobileNavOpen,
    setMobileNavOpen,
    activeTab,
    setActiveTab,
    mode,
    setMode,
  } = useSentinelStore();

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen, setMobileNavOpen]);

  if (!isMobileNavOpen) return null;

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative flex flex-col w-[85%] max-w-xs h-full bg-[#080B10] border-r border-slate-800 shadow-2xl p-4 overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40">
              <Radio className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-slate-100">
                BAYORA SENTINEL
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Control Plane Centers
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800"
            aria-label="Close Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sandbox Mode Switcher in Drawer */}
        <div className="my-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Sandbox Isolation:</span>
            <span className={mode === 'secure' ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
              {mode === 'secure' ? 'Bayora Secure' : 'Insecure (Shared)'}
            </span>
          </div>
          <button
            onClick={() => setMode(mode === 'secure' ? 'insecure' : 'secure')}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              mode === 'secure'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40'
            }`}
          >
            {mode === 'secure' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            <span>Toggle to {mode === 'secure' ? 'Insecure Mode' : 'Bayora Secure'}</span>
          </button>
        </div>

        {/* Nav List */}
        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          <div className="text-[10px] uppercase font-semibold text-slate-500 px-2 py-1 tracking-wider">
            All Defense Centers
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/90 to-slate-900 text-cyan-200 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Isolation Beacon */}
        <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <ShieldCheck className="h-4 w-4" />
            Air-Gap Enforced
          </span>
          <span className="text-[10px] text-slate-500 font-mono">WebCrypto SHA-256</span>
        </div>
      </div>
    </div>
  );
};
