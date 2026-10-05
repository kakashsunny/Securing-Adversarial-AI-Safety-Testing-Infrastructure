import React, { useEffect } from 'react';
import { useSentinelStore } from '../../engine/store';
import { ABAC_POLICIES, NETWORK_FLOW_POLICIES } from '../../engine/benchmarkData';
import {
  Key,
  Shield,
  Network,
  Cpu,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const AccessNetworkView: React.FC = () => {
  const { capabilityTokens, tickCapabilityTokens } = useSentinelStore();

  useEffect(() => {
    const timer = setInterval(() => {
      tickCapabilityTokens();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickCapabilityTokens]);

  return (
    <div className="h-full w-full overflow-y-auto p-6 space-y-6 bg-[#06090e]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-100">
              Access Control & Network Segmentation
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              ABAC + Capability Tokens
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Short-lived Ed25519 capability tokens, role-based boundary constraints, and air-gapped Docker internal network bridges.
          </p>
        </div>
      </div>

      {/* 1. Capability Tokens with Countdown Timers */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-cyan-400" />
            <h2 className="font-display text-base font-bold text-slate-100">
              Active Capability Tokens (Short-Lived Scoped Credentials)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Auto-expiring JWT / Macaroon delegation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilityTokens.map((tok) => {
            const pctRemaining = Math.max(0, Math.min(100, (tok.remainingSeconds / 300) * 100));
            const isExpiringSoon = tok.remainingSeconds < 60;

            return (
              <div
                key={tok.id}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 uppercase">
                      {tok.tenant}
                    </span>
                    <span className="text-[10px] text-slate-500">({tok.id})</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      tok.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {tok.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase">Granted Scopes</div>
                  <div className="flex flex-wrap gap-1.5">
                    {tok.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-[11px]"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expiry Countdown Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Time to Expiry</span>
                    <span
                      className={`font-semibold ${
                        isExpiringSoon ? 'text-amber-400 animate-pulse' : 'text-slate-300'
                      }`}
                    >
                      {Math.floor(tok.remainingSeconds / 60)}m {tok.remainingSeconds % 60}s
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isExpiringSoon ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${pctRemaining}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ABAC Access Control Matrix */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-400" />
            <h2 className="font-display text-base font-bold text-slate-100">
              Attribute-Based Access Control (ABAC) Policy Matrix
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Strict Multi-Tenant Separation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                <th className="pb-3 px-3">Role / Enclave</th>
                <th className="pb-3 px-3">Protected Resource</th>
                <th className="pb-3 px-3">Permissions</th>
                <th className="pb-3 px-3">Enforcement Constraint</th>
                <th className="pb-3 px-3">Enforced By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {ABAC_POLICIES.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="py-3 px-3 font-semibold text-cyan-300">{p.role}</td>
                  <td className="py-3 px-3 text-slate-200">{p.resource}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {p.allowedActions.map((act) => (
                        <span
                          key={act}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            act === 'NONE'
                              ? 'bg-rose-950 text-rose-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-400">{p.constraints}</td>
                  <td className="py-3 px-3 text-[11px] text-amber-300">{p.enforcedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Network Segmentation & Cgroup Resource Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Flow Table */}
        <div className="lg:col-span-8 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-cyan-400" />
              <h3 className="font-display text-base font-bold text-slate-100">
                Network Flow Policies (Internal Docker Bridges)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              eBPF Packet Rules
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {NETWORK_FLOW_POLICIES.map((flow) => {
              const isAllow = flow.action === 'ALLOW';
              return (
                <div
                  key={flow.id}
                  className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{flow.source}</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-slate-300">{flow.destination}</span>
                      <span className="text-[10px] text-slate-500">[{flow.network}]</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{flow.reason}</div>
                  </div>

                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded ${
                      isAllow
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {flow.action}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resource Governance Cgroup Quotas */}
        <div className="lg:col-span-4 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-amber-400" />
              <h3 className="font-display text-base font-bold text-slate-100">
                Tenant Resource Quotas
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Cgroup v2</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Red Team CPU / Mem</span>
                <span className="text-cyan-300">1.0 Core / 512 MB (PIDs: 100)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full w-1/3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Blue Team CPU / Mem</span>
                <span className="text-cyan-300">1.0 Core / 512 MB (PIDs: 100)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-1/3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Model Enclave CPU / Mem</span>
                <span className="text-cyan-300">2.0 Cores / 2048 MB (PIDs: 200)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full w-2/3" />
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-[11px]">
              <div className="text-slate-400 font-semibold">Fairness & DoS Prevention</div>
              <div className="text-slate-500 leading-relaxed">
                Strict PID limits prevent fork bombs; tmpfs memory caps eliminate disk fill attacks.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
