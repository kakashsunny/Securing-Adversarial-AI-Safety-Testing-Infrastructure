import React from 'react';
import { useSentinelStore } from '../../engine/store';
import {
  Play,
  Square,
  HelpCircle,
  Eye,
  EyeOff,
  Radio,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onOpenHowItWorks: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHowItWorks }) => {
  const {
    mode,
    setMode,
    isRunningSuite,
    runFullEvaluationSuite,
    stopEvaluationSuite,
    currentRound,
    totalRounds,
    chainVerificationResult,
    canaryTokens,
    reducedMotion,
    setReducedMotion,
    soundEnabled,
    toggleSound,
    setCommandPaletteOpen,
    sidebarCollapsed,
    toggleSidebar,
    toggleMobileNav,
  } = useSentinelStore();

  const leakedCanariesCount = canaryTokens.filter((c) => c.status === 'LEAKED').length;
  const isChainValid = chainVerificationResult.isValid;

  return (
    <header className="sticky top-0 z-50 flex h-14 sm:h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#080B10]/95 px-2.5 sm:px-5 backdrop-blur-md">
      {/* Zone 1: Brand & Sidebar / Mobile Drawer Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Desktop Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors hidden md:flex items-center justify-center"
          title={sidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse / Close Navigation Sidebar'}
          aria-label={sidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse / Close Navigation Sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 text-cyan-400" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={toggleMobileNav}
          className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors flex md:hidden items-center justify-center"
          title="Open Control Plane Menu"
          aria-label="Open Control Plane Menu"
        >
          <Menu className="h-4 w-4 text-cyan-400" />
        </button>

        <a href="#arena" className="flex items-center gap-1.5 sm:gap-2 group">
          <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 group-hover:border-cyan-400 transition-colors">
            <Radio className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400 animate-pulse" />
          </div>
          <span className="font-display text-sm sm:text-base md:text-lg font-bold tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
            BAYORA<span className="hidden sm:inline"> SENTINEL</span>
          </span>
        </a>

        {/* Live Status Indicators (Desktop unboxed typography) */}
        <div className="hidden xl:flex items-center gap-3 text-xs text-slate-400 border-l border-slate-800 pl-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Leakage Risk</span>
            <span className={`font-mono font-medium ${mode === 'insecure' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {mode === 'insecure' ? '88% CRITICAL' : '0.0% SECURE'}
            </span>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Audit Chain</span>
            <span className={`font-mono font-medium ${isChainValid ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isChainValid ? 'VERIFIED (SHA-256)' : 'TAMPER DETECTED'}
            </span>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Canaries</span>
            <span className={`font-mono font-medium ${leakedCanariesCount > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {leakedCanariesCount > 0 ? `${leakedCanariesCount} LEAKED` : 'ALL SECURE'}
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Primary Controls & Mode Switcher */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Desktop Dual Mode Switcher */}
        <div className="hidden sm:flex items-center gap-1 p-0.5 sm:p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
          <button
            onClick={() => setMode('secure')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'secure'
                ? 'bg-gradient-to-r from-cyan-950 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Bayora Sentinel cryptographic isolation with commit-reveal"
          >
            <Lock className="h-3.5 w-3.5 text-cyan-400" />
            <span className="whitespace-nowrap">Secure</span>
          </button>
          <button
            onClick={() => setMode('insecure')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'insecure'
                ? 'bg-gradient-to-r from-rose-950 to-slate-900 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Standard shared sandbox without isolation"
          >
            <Unlock className="h-3.5 w-3.5 text-rose-400" />
            <span className="whitespace-nowrap">Insecure</span>
          </button>
        </div>

        {/* Mobile Single Toggle Button */}
        <button
          onClick={() => setMode(mode === 'secure' ? 'insecure' : 'secure')}
          className={`sm:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all ${
            mode === 'secure'
              ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
          }`}
          title="Tap to toggle between Bayora Secure and Insecure Sandbox"
        >
          {mode === 'secure' ? <Lock className="h-3 w-3 text-cyan-400" /> : <Unlock className="h-3 w-3 text-rose-400" />}
          <span>{mode === 'secure' ? 'Secure' : 'Insecure'}</span>
        </button>

        {/* Evaluation Suite Runner CTA */}
        {isRunningSuite ? (
          <button
            onClick={stopEvaluationSuite}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-500/40 rounded-lg hover:bg-amber-900/60 transition-colors whitespace-nowrap"
          >
            <Square className="h-3.5 w-3.5 fill-amber-400 shrink-0" />
            <span className="hidden sm:inline">Stop ({currentRound}/{totalRounds})</span>
            <span className="sm:hidden font-mono text-[10px]">{currentRound}/{totalRounds}</span>
          </button>
        ) : (
          <button
            onClick={runFullEvaluationSuite}
            className="flex items-center gap-1 px-2.5 sm:px-4 py-1.5 text-xs font-medium text-slate-900 bg-gradient-to-r from-cyan-400 to-amber-400 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md shadow-cyan-950/40 whitespace-nowrap font-display"
          >
            <Play className="h-3.5 w-3.5 fill-slate-900 shrink-0" />
            <span className="hidden sm:inline">Run Evaluation</span>
            <span className="sm:hidden font-bold text-[11px]">Run</span>
          </button>
        )}

        {/* Web Audio Synthesizer Toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
            soundEnabled
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Web Audio Synthesizer Active' : 'Sound Muted'}
          aria-label="Toggle sound synthesizer"
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" /> : <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </button>

        {/* Command Palette Trigger (Desktop only) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800 rounded-lg transition-colors whitespace-nowrap font-mono"
          title="Open Command Palette (Cmd+K)"
        >
          <Command className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-500">Cmd+K</span>
        </button>

        {/* Accessibility: Reduced Motion Toggle */}
        <button
          onClick={() => setReducedMotion(!reducedMotion)}
          className={`hidden sm:flex p-1.5 sm:p-2 rounded-lg border transition-colors ${
            reducedMotion
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={reducedMotion ? 'Reduced motion active' : 'Toggle reduced motion'}
          aria-label="Toggle reduced motion"
        >
          {reducedMotion ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </button>

        {/* How it Works / Help */}
        <button
          onClick={onOpenHowItWorks}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          title="System Architecture & Threat Model"
          aria-label="Help and Architecture"
        >
          <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden md:inline">Docs</span>
        </button>
      </div>
    </header>
  );
};
