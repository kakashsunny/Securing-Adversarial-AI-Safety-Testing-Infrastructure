import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ArenaScene } from './ArenaScene';
import { BattleTimelineScrubber } from './BattleTimelineScrubber';
import { useSentinelStore } from '../../engine/store';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Maximize2,
  Sparkles,
  Shield,
  Layers,
  Fingerprint,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EnclaveType } from '../../engine/types';

export const ArenaView: React.FC = () => {
  const {
    mode,
    currentPhase,
    currentRound,
    totalRounds,
    activePayload,
    activeCommitHash,
    activeVerdict,
    activeModelOutput,
    activeLatency,
    isRunningSuite,
    runSingleTestRound,
    runFullEvaluationSuite,
    selectedEnclave,
    setSelectedEnclave,
    reducedMotion,
  } = useSentinelStore();

  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState<boolean>(false);
  const PHASES = ['COMMIT', 'TEST', 'VERDICT', 'REVEAL'];

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-[#06090e] select-none">
      {/* Top HUD: Test Cycle Sequence Indicator */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        {/* Phase Timeline Stepper */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-xl pointer-events-auto shadow-xl overflow-x-auto max-w-full">
          <div className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-400 font-display whitespace-nowrap">
            RND {currentRound > 0 ? currentRound : 1}/{totalRounds}
          </div>

          <div className="h-3.5 sm:h-4 w-px bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

          {PHASES.map((phase, idx) => {
            const isCurrent = currentPhase === phase;
            const isCompleted =
              PHASES.indexOf(currentPhase) > idx || currentPhase === 'COMPLETED';

            return (
              <div
                key={phase}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-xs font-mono transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-800/80 text-emerald-400'
                    : 'text-slate-500'
                }`}
              >
                <span className="opacity-75">{idx + 1}.</span>
                <span className="font-medium">{phase}</span>
                {isCompleted && <CheckCircle2 className="h-3 w-3 text-emerald-400 hidden sm:inline" />}
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Enclave Selectors HUD */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 pointer-events-auto">
          {/* Enclave Selector Chips */}
          <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-slate-900/95 border border-slate-800 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setSelectedEnclave(selectedEnclave === 'RED' ? null : 'RED')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium transition-all ${
                selectedEnclave === 'RED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              Red
            </button>
            <button
              onClick={() => setSelectedEnclave(selectedEnclave === 'ARBITER' ? null : 'ARBITER')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium transition-all ${
                selectedEnclave === 'ARBITER'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Arbiter
            </button>
            <button
              onClick={() => setSelectedEnclave(selectedEnclave === 'BLUE' ? null : 'BLUE')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium transition-all ${
                selectedEnclave === 'BLUE'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Blue
            </button>
            <button
              onClick={() => setSelectedEnclave(selectedEnclave === 'MODEL' ? null : 'MODEL')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium transition-all ${
                selectedEnclave === 'MODEL'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              Model
            </button>
          </div>

          <button
            onClick={() => runSingleTestRound()}
            disabled={isRunningSuite}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-slate-200 bg-slate-900/95 border border-slate-700/80 hover:border-cyan-400 rounded-xl backdrop-blur-md transition-all active:scale-95 disabled:opacity-50 shadow-lg shrink-0"
          >
            <Play className="h-3 w-3 text-cyan-400 fill-cyan-400" />
            <span className="hidden sm:inline">Step Test</span>
            <span className="sm:hidden font-mono">Step</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas / 2D Fallback */}
      <div className="flex-1 w-full h-full min-h-0 relative touch-none">
        {reducedMotion ? (
          // Pristine 2D Fallback View for Accessibility
          <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-8 bg-gradient-to-b from-[#080B10] to-[#0d131f] overflow-y-auto">
            <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
              <div
                onClick={() => setSelectedEnclave('RED')}
                className="cursor-pointer p-3 sm:p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-950/40 transition-colors"
              >
                <div className="text-xs font-mono text-rose-400 font-bold">RED ENCLAVE</div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  Adversarial Prover
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Isolated subnet (172.28.1.0/24). Submits SHA-256 commits before reveal.
                </div>
              </div>

              <div
                onClick={() => setSelectedEnclave('ARBITER')}
                className="cursor-pointer p-3 sm:p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 transition-colors"
              >
                <div className="text-xs font-mono text-amber-400 font-bold">ARBITER CORE</div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  Commit-Reveal Gateway
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Verifies hashes, enforces 200ms discrete timing buckets, and appends to audit chain.
                </div>
              </div>

              <div
                onClick={() => setSelectedEnclave('BLUE')}
                className="cursor-pointer p-3 sm:p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 transition-colors"
              >
                <div className="text-xs font-mono text-cyan-400 font-bold">BLUE ENCLAVE</div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  Defensive Evaluator
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Isolated subnet (172.28.2.0/24). Renders verdict without exposing filter regex.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Canvas
            shadows
            camera={{ position: [0, 8, 14], fov: 45 }}
            className="w-full h-full touch-none"
          >
            <Suspense fallback={null}>
              <ArenaScene />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Bottom Live Stream Telemetry & Hash Inspector (Hidden on mobile for pristine full-screen 3D spatial immersion) */}
      <div className="hidden sm:block border-t border-slate-800/80 bg-[#080B10]/95 p-2 sm:p-3 backdrop-blur-md z-10 space-y-2">
        {/* Toggle Telemetry Strip Button */}
        <div className="flex items-center justify-between gap-2">
          <BattleTimelineScrubber />
          <button
            onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
            className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] sm:text-xs font-mono flex items-center gap-1 shrink-0"
            title={isTelemetryExpanded ? 'Collapse Telemetry Panel' : 'Expand Telemetry Panel'}
          >
            <span>{isTelemetryExpanded ? 'Hide' : 'Telemetry'}</span>
            {isTelemetryExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>

        {isTelemetryExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs animate-in slide-in-from-bottom-2 duration-150">
            {/* 1. Red Payload Commit Hash */}
            <div className="p-2 sm:p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-rose-400 font-medium text-[11px]">
                  <Fingerprint className="h-3 w-3" />
                  Red Commit Hash
                </span>
                <span className="font-mono text-[9px] text-slate-500">SHA-256</span>
              </div>
              <div className="font-mono text-slate-200 text-[11px] truncate" title={activeCommitHash || ''}>
                {activeCommitHash ? `${activeCommitHash.substring(0, 18)}...` : 'Awaiting round...'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {activePayload?.name || 'No active benchmark payload'}
              </div>
            </div>

            {/* 2. Model Enclave Inference Output */}
            <div className="p-2 sm:p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-purple-400 font-medium text-[11px]">
                  <Layers className="h-3 w-3" />
                  Model Inference
                </span>
                <span className="font-mono text-[9px] text-emerald-400">Isolated</span>
              </div>
              <div className="font-mono text-slate-200 text-[11px] truncate" title={activeModelOutput || ''}>
                {activeModelOutput ? activeModelOutput.substring(0, 30) + '...' : 'Context dormant'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Per-session salt injected
              </div>
            </div>

            {/* 3. Blue Team Verdict */}
            <div className="p-2 sm:p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-medium text-[11px]">
                  <Shield className="h-3 w-3" />
                  Blue Verdict
                </span>
                <span className="font-mono text-[9px] text-slate-500">Verdict-Only</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                    activeVerdict === 'BLOCK'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      : activeVerdict === 'SANITIZE'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      : activeVerdict === 'ALLOW'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {activeVerdict || 'PENDING'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {activeVerdict ? 'Rules hidden' : 'Evaluating...'}
                </span>
              </div>
            </div>

            {/* 4. Timing Normalization */}
            <div className="p-2 sm:p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                  <Sparkles className="h-3 w-3" />
                  Timing Defense
                </span>
                <span className="font-mono text-[9px] text-cyan-400">Bucket: 200ms</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="text-slate-400">Raw: {activeLatency ? `${activeLatency.raw}ms` : '--'}</span>
                <span className="text-slate-600">→</span>
                <span className="text-emerald-400 font-semibold">
                  Norm: {activeLatency ? `${activeLatency.normalized}ms` : '--'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enclave Detail Drawer Modal */}
      {selectedEnclave && (
        <div className="absolute inset-y-0 right-0 w-full sm:w-80 md:w-96 bg-[#080B10]/95 border-l border-slate-800 p-4 sm:p-6 z-20 backdrop-blur-xl shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm sm:text-base text-slate-100">
                  {selectedEnclave === 'RED' && 'Red Team Enclave'}
                  {selectedEnclave === 'BLUE' && 'Blue Team Enclave'}
                  {selectedEnclave === 'MODEL' && 'Client LLM Enclave'}
                  {selectedEnclave === 'ARBITER' && 'Arbiter Gateway Core'}
                </span>
              </div>
              <button
                onClick={() => setSelectedEnclave(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono p-1.5 rounded hover:bg-slate-800"
                aria-label="Close Inspector"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              {selectedEnclave === 'RED' &&
                'The Red Team operates on the isolated `red-net` bridge. It submits cryptographic SHA-256 commits before each evaluation. Attack payloads remain confidential until after Blue renders a final verdict.'}
              {selectedEnclave === 'BLUE' &&
                'The Blue Team operates on `blue-net`. It inspects sanitized queries and outputs only ALLOW, BLOCK, or SANITIZE enums. Its regex rules and neural classifier weights are strictly inaccessible to Red.'}
              {selectedEnclave === 'MODEL' &&
                'The Model Enclave runs the client LLM (Gemini 3.8 Flash). It is provisioned with per-tenant random cache salts and wipes activation memory after every round to eliminate cross-session attention leakage.'}
              {selectedEnclave === 'ARBITER' &&
                'The Arbiter Gateway is the sole mediator. It validates commit-reveal nonces, pads execution latency into discrete 200ms buckets, and writes append-only SHA-256 hash-chained audit blocks with ECDSA signatures.'}
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
              <div className="text-slate-500 uppercase text-[10px]">Network Segment</div>
              <div className="text-cyan-300 break-words text-[11px]">
                {selectedEnclave === 'RED' && 'red-net (Bridge: 172.28.1.0/24 - internal: true)'}
                {selectedEnclave === 'BLUE' && 'blue-net (Bridge: 172.28.2.0/24 - internal: true)'}
                {selectedEnclave === 'MODEL' && 'model-net (Bridge: 172.28.3.0/24 - internal: true)'}
                {selectedEnclave === 'ARBITER' && 'Multi-homed Gateway (Nexus 0.0.0.0)'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedEnclave(null)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors mt-4"
          >
            Close Inspector
          </button>
        </div>
      )}
    </div>
  );
};
