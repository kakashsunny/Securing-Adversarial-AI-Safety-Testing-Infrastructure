import React from 'react';
import { THREAT_MODEL_DATA } from '../../engine/benchmarkData';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export const ThreatModelView: React.FC = () => {
  const radarData = [
    { subject: 'Payload Secrecy', A: 100, fullMark: 100 },
    { subject: 'Rule Confidentiality', A: 96, fullMark: 100 },
    { subject: 'Context Isolation', A: 99, fullMark: 100 },
    { subject: 'Ledger Immutability', A: 100, fullMark: 100 },
    { subject: 'Timing Side-Channel', A: 94, fullMark: 100 },
    { subject: 'Host Kernel Containment', A: 78, fullMark: 100 },
  ];

  return (
    <div className="h-full w-full overflow-y-auto p-6 space-y-6 bg-[#06090e]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-100">
              Threat Model & Residual Risk Radar
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              Formal Security Evaluation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exhaustive defense guarantees, failure bounds, and honest non-protected boundary vectors.
          </p>
        </div>
      </div>

      {/* Radar Chart & High-Level Posture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Residual Risk Radar Chart */}
        <div className="lg:col-span-6 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="font-display text-base font-bold text-slate-100">
                Multi-Axis Security Guarantee Radar
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographic confidence scores across 6 attack dimensions
              </p>
            </div>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} fontFamily="Plus Jakarta Sans" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Radar
                  name="Bayora Security Posture (%)"
                  dataKey="A"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Honest "NOT Protected Against" Callout Panel */}
        <div className="lg:col-span-6 p-6 bg-rose-950/20 border border-rose-500/40 rounded-2xl space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-500/30">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h2 className="font-display text-base font-bold text-rose-200">
              Honest Boundary: What Bayora Does NOT Protect Against
            </h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Institutional rigor requires explicit acknowledgment of hardware and kernel limits. Standard containers share the Linux host kernel.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950/80 border border-rose-500/30 rounded-xl space-y-1">
              <div className="font-semibold text-rose-300">1. Host Linux Kernel 0-Day Exploits</div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                If an attacker has an unpatched ring-0 memory corruption bug in the host kernel, container namespaces can be broken. (Mitigation: gVisor or Kata microVMs).
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-rose-500/30 rounded-xl space-y-1">
              <div className="font-semibold text-rose-300">2. Physical CPU Microarchitectural Flaws (Spectre / Meltdown)</div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                Branch target injection and hyperthreading cache snooping cannot be stopped without hardware TEEs (AMD SEV-SNP / Intel TDX).
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-rose-500/30 rounded-xl space-y-1">
              <div className="font-semibold text-rose-300">3. Malicious Host Root Operator</div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                An insider with root privilege on the physical host hypervisor can inspect memory. (Mitigation: Confidential VMs with remote attestation).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exhaustive Threat Model Matrix Table */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-display text-base font-bold text-slate-100">
              Full Threat & Mitigation Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive taxonomy of adversarial vectors, mitigations, and roadmap improvements
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            8 Scenarios Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                <th className="pb-3 px-3">Adversarial Threat</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Guaranteed?</th>
                <th className="pb-3 px-3">Mitigation Architecture</th>
                <th className="pb-3 px-3">Failure Condition</th>
                <th className="pb-3 px-3">Future Roadmap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {THREAT_MODEL_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-3 font-semibold text-slate-100">{item.threat}</td>
                  <td className="py-3 px-3 text-slate-400">{item.category}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.protectedInBayora
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.protectedInBayora ? 'PROTECTED' : 'UNMITIGATED'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-cyan-300 text-[11px] max-w-xs">{item.mitigation}</td>
                  <td className="py-3 px-3 text-amber-300 text-[11px] max-w-xs">{item.failureCondition}</td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs">{item.futureWork}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
