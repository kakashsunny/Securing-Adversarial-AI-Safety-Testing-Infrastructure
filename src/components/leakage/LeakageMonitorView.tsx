import React from 'react';
import { useSentinelStore } from '../../engine/store';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Key,
  Layers,
  Radio,
  EyeOff,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

export const LeakageMonitorView: React.FC = () => {
  const { mode, canaryTokens, anomalies, latencyRecords } = useSentinelStore();

  const isSecure = mode === 'secure';
  const leakageScore = isSecure ? 0.0 : 88.4;
  const leakedCanaryCount = canaryTokens.filter((c) => c.status === 'LEAKED').length;

  // Chart data: prepare latency comparison
  const sampleLatencyData = latencyRecords.length > 0
    ? latencyRecords.slice(-10).map((r) => ({
        name: `R#${r.roundNumber}`,
        raw: r.rawLatencyMs,
        normalized: r.normalizedLatencyMs,
      }))
    : [
        { name: 'R#1', raw: 42, normalized: 200 },
        { name: 'R#2', raw: 185, normalized: 200 },
        { name: 'R#3', raw: 94, normalized: 200 },
        { name: 'R#4', raw: 140, normalized: 200 },
        { name: 'R#5', raw: 78, normalized: 200 },
        { name: 'R#6', raw: 162, normalized: 200 },
        { name: 'R#7', raw: 55, normalized: 200 },
        { name: 'R#8', raw: 120, normalized: 200 },
      ];

  return (
    <div className="h-full w-full overflow-y-auto p-3 sm:p-6 pb-24 sm:pb-8 space-y-4 sm:space-y-6 bg-[#06090e] touch-scroll">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-100">
              Leakage & Side-Channel Monitor
            </h1>
            <span
              className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded font-bold ${
                isSecure
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}
            >
              {isSecure ? 'LEAKAGE: 0.0%' : 'LEAKAGE: 88.4% CRITICAL'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time surveillance of honeytoken canaries, timing side-channels, and metadata-only anomaly feeds with zero payload exposure.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <EyeOff className="h-4 w-4 text-cyan-400" />
          <span>Zero-Payload Telemetry Active</span>
        </div>
      </div>

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Aggregate Leakage Score Gauge */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/90 rounded-2xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Leakage Risk</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-3xl font-bold ${
                isSecure ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {leakageScore}%
            </span>
            <span className="text-xs text-slate-500">
              {isSecure ? 'Zero Cross-Tenant Leak' : 'Unbounded Leakage'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isSecure ? 'bg-emerald-400 w-0' : 'bg-rose-500 w-[88%]'
              }`}
            />
          </div>
        </div>

        {/* Metric 2: Canary Sentinel Status */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/90 rounded-2xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Honeytoken Canaries</span>
            <Key className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-3xl font-bold ${
                leakedCanaryCount === 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {leakedCanaryCount === 0 ? '0 Leaks' : `${leakedCanaryCount} Leaked`}
            </span>
            <span className="text-xs text-slate-500">
              of {canaryTokens.length} active canaries
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {isSecure ? 'Commit-reveal prevents leak' : 'Leaked into Blue memory'}
          </div>
        </div>

        {/* Metric 3: Timing Variance Reduction */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/90 rounded-2xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Timing Side-Channel Shield</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-cyan-400">
              ±0.4 ms
            </span>
            <span className="text-xs text-slate-500">
              residual jitter variance
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Padded into fixed 200ms slices
          </div>
        </div>
      </div>

      {/* Latency Variance Chart (Raw vs Normalized) */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-display text-base font-bold text-slate-100">
              Latency Normalization Histogram (Raw vs Normalized Slices)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defeating timing side-channel attacks by padding execution variances into uniform 200ms buckets.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-amber-400" />
              <span className="text-slate-400">Raw Latency (Variable)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-cyan-400" />
              <span className="text-slate-400">Normalized Bucket (Fixed 200ms)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sampleLatencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" unit="ms" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono',
                }}
              />
              <Bar dataKey="raw" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Raw Latency (ms)" />
              <Bar dataKey="normalized" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Normalized (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Canary Honeytoken Table & Metadata Anomaly Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canary Honeytokens Status Grid */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-400" />
              <h3 className="font-display text-sm font-bold text-slate-100">
                Active Canary Honeytoken Grid
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Trap Tokens in Payloads & Rules
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {canaryTokens.map((canary) => {
              const isLeaked = canary.status === 'LEAKED';
              return (
                <div
                  key={canary.id}
                  className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 font-mono"
                >
                  <div className="space-y-0.5">
                    <div className="text-slate-200 font-semibold">{canary.token}</div>
                    <div className="text-[10px] text-slate-500">
                      Planted in: {canary.plantedIn} · Owner: {canary.ownerTenant}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isLeaked
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isLeaked ? 'LEAK DETECTED' : 'UNTOUCHED / SECURE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zero-Payload Metadata Anomaly Feed */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              <h3 className="font-display text-sm font-bold text-slate-100">
                Metadata-Only Anomaly Feed
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Strict Non-Disclosure Policy
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono max-h-64 overflow-y-auto pr-1">
            {anomalies.length > 0 ? (
              anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{anom.timestamp}</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded ${
                        anom.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {anom.type}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px] truncate">
                    {anom.metadataSnippet}
                  </div>
                  <div className="text-cyan-400 text-[10px]">{anom.mitigationAction}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No active security anomalies detected. Sandbox invariants holding.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
