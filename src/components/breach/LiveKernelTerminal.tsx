import React, { useState, useEffect, useRef } from 'react';
import { useSentinelStore } from '../../engine/store';
import {
  Terminal,
  Activity,
  Shield,
  AlertTriangle,
  Play,
  RotateCcw,
  Network,
  Cpu,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface KernelTraceEvent {
  id: string;
  timestamp: string;
  hook: 'ebpf_kprobe' | 'seccomp_filter' | 'cgroup_net' | 'arbiter_proxy';
  process: string;
  pid: number;
  action: 'BLOCKED' | 'NORMALIZED' | 'ALLOWED' | 'ALERT';
  detail: string;
  sourceBridge: string;
  destBridge: string;
}

export const LiveKernelTerminal: React.FC = () => {
  const { mode, activeAttack, activeAttackStep, attackRunning } = useSentinelStore();
  const [filter, setFilter] = useState<'ALL' | 'BLOCKED' | 'ALERT'>('ALL');
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [traces, setTraces] = useState<KernelTraceEvent[]>([
    {
      id: 'tr-01',
      timestamp: new Date(Date.now() - 6000).toLocaleTimeString(),
      hook: 'seccomp_filter',
      process: 'red_runner',
      pid: 14022,
      action: 'BLOCKED',
      detail: 'SECCOMP_RET_ERRNO: syscall ptrace() denied by arbiter policy',
      sourceBridge: 'red-net (172.28.1.10)',
      destBridge: 'host_kernel',
    },
    {
      id: 'tr-02',
      timestamp: new Date(Date.now() - 4000).toLocaleTimeString(),
      hook: 'cgroup_net',
      process: 'red_probe',
      pid: 14029,
      action: 'BLOCKED',
      detail: 'DROP SYN packet destined to blue-net:8000 (air-gap enforced)',
      sourceBridge: 'red-net (172.28.1.10)',
      destBridge: 'blue-net (172.28.2.10)',
    },
    {
      id: 'tr-03',
      timestamp: new Date(Date.now() - 2000).toLocaleTimeString(),
      hook: 'arbiter_proxy',
      process: 'arbiter_gateway',
      pid: 14001,
      action: 'NORMALIZED',
      detail: 'Padding response delta 48ms -> 200ms fixed bucket',
      sourceBridge: 'model-net (172.28.3.10)',
      destBridge: 'arbiter-net',
    },
  ]);

  // Inject real attack event as activeAttackStep advances
  useEffect(() => {
    if (activeAttack && activeAttackStep > 0) {
      const stepIdx = activeAttackStep - 1;
      const currentStepEvent = activeAttack.timelineEvents[stepIdx];
      const now = new Date().toLocaleTimeString();
      const isSecure = mode === 'secure';

      const injectedEvent: KernelTraceEvent = {
        id: `attack-tr-${Date.now()}-${activeAttackStep}`,
        timestamp: now,
        hook: isSecure ? 'seccomp_filter' : 'cgroup_net',
        process: `exploit_runner[${activeAttack.id}]`,
        pid: 14800 + activeAttackStep,
        action: isSecure ? 'BLOCKED' : 'ALERT',
        detail: currentStepEvent
          ? `${currentStepEvent.step}: ${currentStepEvent.detail}`
          : `[ATTACK INJECTION] ${activeAttack.name} probe active`,
        sourceBridge: 'attacker_probe (172.28.1.50)',
        destBridge: isSecure ? 'arbiter_firewall [DEFLECTED]' : 'shared_memory [EXPOSED]',
      };

      setTraces((prev) => [...prev.slice(-40), injectedEvent]);
    }
  }, [activeAttack, activeAttackStep, mode]);

  // Periodic ambient trace emitter
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      const isSecure = mode === 'secure';

      let newEvent: KernelTraceEvent;
      if (!isSecure) {
        newEvent = {
          id: `tr-${Date.now()}`,
          timestamp: now,
          hook: 'cgroup_net',
          process: 'insecure_bridge',
          pid: Math.floor(Math.random() * 8000) + 10000,
          action: 'ALERT',
          detail: 'WARNING: Cross-container packet passed through un-isolated docker0 bridge!',
          sourceBridge: 'shared-bridge (172.17.0.2)',
          destBridge: 'shared-bridge (172.17.0.3)',
        };
      } else {
        const events: KernelTraceEvent[] = [
          {
            id: `tr-${Date.now()}`,
            timestamp: now,
            hook: 'ebpf_kprobe',
            process: 'arbiter_ebpf',
            pid: 14002,
            action: 'NORMALIZED',
            detail: 'kprobe:tcp_v4_connect: Traffic isolated to internal-only socket',
            sourceBridge: 'red-net',
            destBridge: 'arbiter-net',
          },
          {
            id: `tr-${Date.now()}`,
            timestamp: now,
            hook: 'seccomp_filter',
            process: 'model_inference',
            pid: 14044,
            action: 'BLOCKED',
            detail: 'Syscall clone3(CLONE_NEWUSER) blocked by sandboxed seccomp profile',
            sourceBridge: 'model-net',
            destBridge: 'host_kernel',
          },
        ];
        newEvent = events[Math.floor(Math.random() * events.length)];
      }

      setTraces((prev) => [...prev.slice(-40), newEvent]);
    }, 4500);

    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [traces, isAutoScroll]);

  const filteredTraces = traces.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'BLOCKED') return t.action === 'BLOCKED';
    if (filter === 'ALERT') return t.action === 'ALERT';
    return true;
  });

  return (
    <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs shadow-2xl">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-display font-bold text-slate-200 text-xs ml-1 flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            eBPF Kernel Trace & Network Telemetry Stream
          </span>
          {attackRunning && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-rose-300 animate-pulse">
              Exploit Hook Active: Step {activeAttackStep}
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1">
          {(['ALL', 'BLOCKED', 'ALERT'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                filter === f
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Stream Viewport */}
      <div
        ref={scrollRef}
        className="h-44 overflow-y-auto space-y-1.5 p-2.5 bg-black/70 rounded-xl border border-slate-900 font-mono text-[11px] select-text"
      >
        {filteredTraces.map((t) => (
          <div key={t.id} className="flex items-start gap-2 hover:bg-slate-900/40 p-0.5 rounded transition-colors">
            <span className="text-slate-500 shrink-0 text-[10px]">{t.timestamp}</span>
            <span
              className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                t.action === 'BLOCKED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : t.action === 'ALERT'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {t.action}
            </span>
            <span className="text-slate-400 shrink-0 text-[10px]">{`[${t.hook}]`}</span>
            <span className={t.action === 'BLOCKED' ? 'text-emerald-200 font-medium' : t.action === 'ALERT' ? 'text-rose-200 font-medium' : 'text-slate-200'}>
              {t.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Network Map Strip */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
        <div className="flex items-center gap-2">
          <Network className="h-3 w-3 text-cyan-400" />
          <span>Bridges: red-net (172.28.1.0/24) · blue-net (172.28.2.0/24) · model-net (172.28.3.0/24)</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <CheckCircle2 className="h-3 w-3" />
          <span>Kernel Seccomp Active</span>
        </div>
      </div>
    </div>
  );
};
