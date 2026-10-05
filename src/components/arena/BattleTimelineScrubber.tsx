import React from 'react';
import { useSentinelStore, CameraPreset } from '../../engine/store';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Camera,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const BattleTimelineScrubber: React.FC = () => {
  const {
    currentPhase,
    currentRound,
    totalRounds,
    isRunningSuite,
    runSingleTestRound,
    runFullEvaluationSuite,
    stopEvaluationSuite,
    playbackSpeed,
    setPlaybackSpeed,
    cameraPreset,
    setCameraPreset,
    activeLatency,
    activeVerdict,
    activePayload,
  } = useSentinelStore();

  const PHASES = ['COMMIT', 'TEST', 'VERDICT', 'REVEAL'];
  const CAMERAS: { id: CameraPreset; label: string }[] = [
    { id: 'overview', label: 'Tactical Grid' },
    { id: 'red', label: 'Red Team' },
    { id: 'arbiter', label: 'Arbiter Core' },
    { id: 'blue', label: 'Blue Team' },
    { id: 'model', label: 'Model Chamber' },
  ];

  const SPEEDS = [0.5, 1, 2, 4];

  return (
    <div className="bg-[#090d16]/95 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl space-y-3 pointer-events-auto">
      {/* Top Row: Playback Controls & Speed Multipliers */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Execution Controls */}
        <div className="flex items-center gap-2">
          {isRunningSuite ? (
            <button
              onClick={stopEvaluationSuite}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900 rounded-xl text-xs font-mono font-medium transition-all shadow-md active:scale-95"
            >
              <Pause className="h-3.5 w-3.5 fill-rose-300" />
              <span>Pause Suite</span>
            </button>
          ) : (
            <button
              onClick={() => runSingleTestRound()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 rounded-xl text-xs font-mono font-medium transition-all shadow-md shadow-cyan-950/40 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-cyan-300" />
              <span>Step Single Round</span>
            </button>
          )}

          <button
            onClick={() => runFullEvaluationSuite()}
            disabled={isRunningSuite}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-slate-200 rounded-xl text-xs font-mono transition-all disabled:opacity-50 active:scale-95 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Run 20-Round Suite</span>
          </button>
        </div>

        {/* Center: Playback Speed Scrubber */}
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 rounded-xl p-1">
          <span className="text-[10px] font-mono text-slate-500 px-1.5">SPEED:</span>
          {SPEEDS.map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-all ${
                playbackSpeed === spd
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Right: Camera Viewport Presets */}
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 rounded-xl p-1">
          <Camera className="h-3 w-3 text-slate-400 ml-1 mr-0.5" />
          {CAMERAS.map((cam) => (
            <button
              key={cam.id}
              onClick={() => setCameraPreset(cam.id)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                cameraPreset === cam.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row: 4-Phase Step Progress Bar & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
        {PHASES.map((phase, idx) => {
          const isCurrent = currentPhase === phase;
          const isCompleted =
            PHASES.indexOf(currentPhase) > idx || currentPhase === 'COMPLETED';

          return (
            <div
              key={phase}
              className={`p-2 rounded-xl border text-xs font-mono transition-all ${
                isCurrent
                  ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-950/30 text-cyan-200'
                  : isCompleted
                  ? 'bg-slate-900/80 border-slate-800 text-emerald-400'
                  : 'bg-slate-950/40 border-slate-900 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="opacity-75">PHASE 0{idx + 1}</span>
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                ) : null}
              </div>
              <div className="font-bold tracking-wider mt-0.5">{phase}</div>
              <div className="text-[9px] opacity-75 truncate mt-0.5">
                {idx === 0
                  ? 'SHA-256 Commit & Nonce'
                  : idx === 1
                  ? 'Ephemeral Session Infer'
                  : idx === 2
                  ? 'Verdict-Only Filtering'
                  : 'Proof Reveal & Signed Log'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
