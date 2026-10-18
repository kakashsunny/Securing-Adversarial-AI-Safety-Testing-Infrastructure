import React from 'react';
import {
  ShieldCheck,
  Lock,
  Boxes,
  Key,
  Clock,
  Link2,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-2xl w-full p-4 sm:p-6 bg-[#090e17] border border-cyan-500/40 rounded-2xl shadow-2xl space-y-4 sm:space-y-6 max-h-[85vh] overflow-y-auto touch-scroll">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-100">
                How Bayora Sentinel Works
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Secure Adversarial AI Safety Testing Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-mono p-1 rounded hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold font-display">
              <Lock className="h-4 w-4" />
              1. WebCrypto Commit-Reveal
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              The Red Team commits a SHA-256 hash (<code>Payload + Nonce</code>) before the test is sent to the model. Blue only receives the plaintext after locking in its verdict.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-display">
              <Boxes className="h-4 w-4" />
              2. Ephemeral Model Sessions
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Every evaluation pass runs with a unique per-tenant cache salt. Activation memory and context are zeroized upon session termination to prevent cross-session leakage.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-display">
              <Clock className="h-4 w-4" />
              3. Timing Bucket Normalization
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              All response latencies are padded into uniform 200ms fixed buckets with synthetic jitter to defeat timing side-channels against defense classifiers.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold font-display">
              <Link2 className="h-4 w-4" />
              4. Hash-Chained Audit Ledger
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Every finding is sealed in an append-only SHA-256 hash chain with ECDSA digital signatures. If any record is tampered with, downstream hashes immediately break.
            </p>
          </div>
        </div>

        {/* Compare Toggle Advice */}
        <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs space-y-1">
          <div className="text-cyan-300 font-semibold font-display">
            Interactive Before/After Sandbox Comparison:
          </div>
          <div className="text-slate-300 text-[11px] leading-relaxed">
            Use the <strong>&quot;Bayora Secure&quot; vs &quot;Insecure Mode&quot;</strong> toggle in the top navigation bar to watch how standard shared sandboxes leak honeytoken canaries and allow lateral traversal, versus how Bayora maintains isolation.
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-amber-400 hover:brightness-110 text-slate-900 font-display font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
        >
          Enter Control Plane
        </button>
      </div>
    </div>
  );
};
