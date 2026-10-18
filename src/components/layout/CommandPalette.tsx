import React, { useState, useEffect } from 'react';
import { useSentinelStore, ActiveTab } from '../../engine/store';
import {
  Command,
  Search,
  Zap,
  Shield,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  Boxes,
  Database,
  Terminal,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    activeTab,
    setActiveTab,
    mode,
    setMode,
    soundEnabled,
    toggleSound,
    runSingleTestRound,
    runFullEvaluationSuite,
    verifyFullChain,
    isRunningSuite,
  } = useSentinelStore();

  const [query, setQuery] = useState<string>('');

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }

      // Escape closes palette
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
        return;
      }

      // Ignore standard key hotkeys if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      // Quick hotkeys
      if (e.key === ' ' && !isCommandPaletteOpen) {
        e.preventDefault();
        runSingleTestRound();
      } else if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        runFullEvaluationSuite();
      } else if (e.key.toLowerCase() === 'm') {
        toggleSound();
      } else if (e.key.toLowerCase() === 't') {
        setMode(mode === 'secure' ? 'insecure' : 'secure');
      } else if (e.key === '1') {
        setActiveTab('arena');
      } else if (e.key === '2') {
        setActiveTab('breach-lab');
      } else if (e.key === '3') {
        setActiveTab('audit-chain');
      } else if (e.key === '4') {
        setActiveTab('payload-builder');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, mode, runSingleTestRound, runFullEvaluationSuite, toggleSound, setMode, setActiveTab, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const ACTIONS = [
    {
      id: 'step-test',
      title: 'Step Single Test Round',
      subtitle: 'Advance 1 round through 4-phase commit-reveal cycle',
      icon: Play,
      shortcut: 'Space',
      action: () => {
        runSingleTestRound();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'run-suite',
      title: 'Run 20-Round Evaluation Suite',
      subtitle: 'Execute full automated benchmark suite',
      icon: Sparkles,
      shortcut: 'R',
      action: () => {
        runFullEvaluationSuite();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'toggle-mode',
      title: `Switch to ${mode === 'secure' ? 'Insecure Shared Sandbox' : 'Bayora Secure Mode'}`,
      subtitle: 'Toggle cryptographic membranes and canary isolation',
      icon: Shield,
      shortcut: 'T',
      action: () => {
        setMode(mode === 'secure' ? 'insecure' : 'secure');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'toggle-audio',
      title: soundEnabled ? 'Mute Procedural Web Audio Synthesizer' : 'Enable Web Audio Synthesizer',
      subtitle: 'Audio feedback on clicks, chimes, alarms, and glitches',
      icon: soundEnabled ? VolumeX : Volume2,
      shortcut: 'M',
      action: () => {
        toggleSound();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'verify-chain',
      title: 'Verify Entire SHA-256 Audit Chain',
      subtitle: 'Validate all block hashes and Ed25519 signatures',
      icon: CheckCircle2,
      action: () => {
        setActiveTab('audit-chain');
        verifyFullChain();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'tab-payload-builder',
      title: 'Open Custom Payload Sandbox',
      subtitle: 'Interactive live SHA-256 pre-image generator',
      icon: Zap,
      shortcut: '4',
      action: () => {
        setActiveTab('payload-builder');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'tab-arena',
      title: 'Open 3D Spatial Arena View',
      subtitle: '3D Enclave forcefields and animated light packets',
      icon: Boxes,
      shortcut: '1',
      action: () => {
        setActiveTab('arena');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'tab-breach',
      title: 'Open Breach Simulation Lab',
      subtitle: '7 adversarial attacks & live eBPF kernel terminal',
      icon: Terminal,
      shortcut: '2',
      action: () => {
        setActiveTab('breach-lab');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'tab-report',
      title: 'Open Compliance Audit Report',
      subtitle: 'Export signed JSON file or print visual PDF summary',
      icon: FileText,
      action: () => {
        setActiveTab('report');
        setCommandPaletteOpen(false);
      },
    },
  ];

  const filtered = ACTIONS.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 px-3 sm:px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#090d16] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="h-4 w-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or action (Esc to exit)..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] text-slate-400 bg-slate-900 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto p-2 space-y-1 touch-scroll">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/90 cursor-pointer transition-colors group text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40 text-cyan-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-200 group-hover:text-cyan-300 font-sans">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {item.shortcut && (
                  <kbd className="px-2 py-1 text-[10px] text-slate-400 bg-slate-950 border border-slate-800 rounded font-mono group-hover:border-cyan-500/30">
                    {item.shortcut}
                  </kbd>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching commands found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer Hint Strip */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-900 text-[10px] text-slate-500">
          <span>Tip: Press <kbd className="text-slate-400">Cmd+K</kbd> anywhere to open</span>
          <span>Bayora Sentinel Control Plane v1.0</span>
        </div>
      </div>
    </div>
  );
};
