import React, { useState } from 'react';
import { useSentinelStore } from '../../engine/store';
import { BREACH_LAB_ATTACKS } from '../../engine/benchmarkData';
import {
  Zap,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  Terminal,
  Activity,
  Layers,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
  Fingerprint,
} from 'lucide-react';
import { LiveKernelTerminal } from './LiveKernelTerminal';

export const BreachLabView: React.FC = () => {
  const {
    mode,
    setMode,
    activeAttack,
    activeAttackStep,
    attackRunning,
    breachVerdict,
    triggerAttackSimulation,
    resetAttackSimulation,
  } = useSentinelStore();

  const [selectedAttackId, setSelectedAttackId] = useState<string>(
    BREACH_LAB_ATTACKS[0].id
  );

  const currentAttack =
    BREACH_LAB_ATTACKS.find((a) => a.id === selectedAttackId) ||
    BREACH_LAB_ATTACKS[0];

  const handleLaunchAttack = (id: string) => {
    setSelectedAttackId(id);
    triggerAttackSimulation(id);
  };

  const totalSteps = currentAttack.timelineEvents.length || 3;
  const progressPercent = attackRunning
    ? Math.min(100, Math.round((activeAttackStep / totalSteps) * 100))
    : breachVerdict && breachVerdict.attackId === currentAttack.id
    ? 100
    : 0;

  return (
    <div className="h-full w-full overflow-y-auto p-6 space-y-6 bg-[#06090e]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-100">
              Breach Simulation Lab
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300">
              7 Active Attack Vectors
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real-world attacks against the multi-tenant sandbox to verify that cryptographic commit-reveal, network segmentation, and cache salting hold under adversarial pressure.
          </p>
        </div>

        {/* Current Sandbox Mode Badge & Toggle */}
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className="text-slate-500">Mode:</span>
            <span className={mode === 'secure' ? 'text-cyan-400 font-bold flex items-center gap-1' : 'text-rose-400 font-bold flex items-center gap-1'}>
              {mode === 'secure' ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              {mode === 'secure' ? 'Bayora Secure' : 'Insecure (Shared)'}
            </span>
          </div>
          <button
            onClick={() => setMode(mode === 'secure' ? 'insecure' : 'secure')}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Switch to {mode === 'secure' ? 'Insecure' : 'Secure'}
          </button>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selectors + Forensic Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attack Vector Catalog */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Attack Vectors Under Test
          </div>

          {BREACH_LAB_ATTACKS.map((attack) => {
            const isSelected = selectedAttackId === attack.id;
            const isRunningThis = attackRunning && isSelected;
            const hasVerdict = breachVerdict && breachVerdict.attackId === attack.id;

            return (
              <div
                key={attack.id}
                onClick={() => {
                  setSelectedAttackId(attack.id);
                  if (!attackRunning) resetAttackSimulation();
                }}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {attack.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {attack.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {attack.target}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchAttack(attack.id);
                    }}
                    disabled={attackRunning}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all shadow-md active:scale-95 ${
                      isRunningThis
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 animate-pulse'
                        : hasVerdict && breachVerdict?.status === 'CONTAINED'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900'
                        : hasVerdict && breachVerdict?.status === 'EXPLOITED'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 hover:bg-rose-900'
                        : 'bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-500/40'
                    }`}
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{isRunningThis ? 'Running...' : hasVerdict ? 'Re-run' : 'Launch'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Forensic Breakdown & Live Execution HUD */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
            {/* Header & Launch Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-300 uppercase">
                    {currentAttack.category}
                  </span>
                  <h2 className="font-display text-lg font-bold text-slate-100">
                    {currentAttack.name}
                  </h2>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Target: {currentAttack.target} · Vector: {currentAttack.vector}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLaunchAttack(currentAttack.id)}
                  disabled={attackRunning}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-display font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-slate-950" />
                  <span>{attackRunning ? 'Executing Exploit Steps...' : 'Launch Attack Simulation'}</span>
                </button>

                {breachVerdict && (
                  <button
                    onClick={resetAttackSimulation}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 rounded-xl text-xs transition-colors"
                    title="Reset Simulation"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentAttack.description}
            </p>

            {/* Live Progress Bar (Active when running) */}
            {(attackRunning || (breachVerdict && breachVerdict.attackId === currentAttack.id)) && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Activity className={`h-4 w-4 ${attackRunning ? 'animate-spin' : ''}`} />
                    {attackRunning ? `Executing Exploit Step ${activeAttackStep} of ${totalSteps}` : 'Simulation Completed'}
                  </span>
                  <span className="text-slate-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      mode === 'secure'
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                        : 'bg-gradient-to-r from-amber-500 to-rose-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Step-by-step Exploit Execution Timeline */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
                <span>Exploit Execution Timeline</span>
                <span className="text-[10px] text-slate-500">Real-Time Kernel Trace Steps</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {currentAttack.timelineEvents.map((evt, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = attackRunning && activeAttackStep === stepNum;
                  const isDone = activeAttackStep > stepNum || (!attackRunning && breachVerdict?.attackId === currentAttack.id);

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isCurrent
                          ? 'bg-amber-950/40 border-amber-500/60 shadow-md shadow-amber-950/40 text-amber-200'
                          : isDone
                          ? mode === 'secure'
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          mode === 'secure' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400" />
                          )
                        ) : isCurrent ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">
                            {stepNum}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold flex items-center justify-between text-xs">
                          <span>{evt.step}</span>
                          <span className="text-[10px] opacity-60">T+{evt.timestamp}ms</span>
                        </div>
                        <div className="text-[11px] opacity-80">{evt.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Post-Execution High-Visibility Verdict Banner */}
            {breachVerdict && breachVerdict.attackId === currentAttack.id && (
              <div
                className={`p-5 rounded-2xl border-2 transition-all space-y-3 animate-in zoom-in-95 duration-200 ${
                  breachVerdict.status === 'CONTAINED'
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-xl shadow-emerald-950/40'
                    : 'bg-rose-950/30 border-rose-500 shadow-xl shadow-rose-950/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {breachVerdict.status === 'CONTAINED' ? (
                      <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-rose-900/60 text-rose-300 border border-rose-500/40">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <div
                        className={`font-display text-sm font-bold ${
                          breachVerdict.status === 'CONTAINED'
                            ? 'text-emerald-300'
                            : 'text-rose-300'
                        }`}
                      >
                        {breachVerdict.headline}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        {breachVerdict.summary}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {breachVerdict.timestamp}
                  </span>
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Cryptographic & Kernel Defense Verification
                  </div>
                  <div className="text-cyan-300">{breachVerdict.mitigationApplied}</div>
                </div>

                {/* Quick Toggle CTA */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Want to test contrast?
                  </span>
                  <button
                    onClick={() => {
                      setMode(mode === 'secure' ? 'insecure' : 'secure');
                      setTimeout(() => handleLaunchAttack(currentAttack.id), 200);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                      mode === 'secure'
                        ? 'bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-500/40'
                        : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40'
                    }`}
                  >
                    <span>Switch to {mode === 'secure' ? 'Insecure Mode' : 'Bayora Secure'} & Retest</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Defense Mechanism vs Insecure Sandbox Comparison */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Mitigation & Mode Comparison
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                {/* Bayora Sentinel Mode */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Lock className="h-3.5 w-3.5" />
                      Bayora Secure Mode
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {currentAttack.secureModeResult}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {currentAttack.mitigation}
                  </div>
                </div>

                {/* Insecure Shared Sandbox Mode */}
                <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                      <Unlock className="h-3.5 w-3.5" />
                      Standard Shared Sandbox
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                      {currentAttack.insecureModeResult}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Isolation fails: lateral traversal or side-channel leakage exposes sensitive model context.
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics & Honest Residual Risk */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-500 text-[10px] font-mono uppercase">Detection Confidence</div>
                <div className="text-xl font-bold font-mono text-cyan-400">
                  {currentAttack.confidence}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentAttack.detectionMethod}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 sm:col-span-2">
                <div className="text-slate-500 text-[10px] font-mono uppercase">Honest Residual Risk</div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {currentAttack.residualRisk}
                </div>
              </div>
            </div>

            {/* Live Interactive eBPF Kernel Terminal */}
            <LiveKernelTerminal />
          </div>
        </div>
      </div>
    </div>
  );
};
