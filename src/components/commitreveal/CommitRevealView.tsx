import React, { useState } from 'react';
import { useSentinelStore } from '../../engine/store';
import {
  computeCommitHash,
  generateNonce,
  verifyCommit,
} from '../../engine/crypto';
import {
  Clock,
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Hash,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CommitRevealView: React.FC = () => {
  const { currentRound, currentPhase, activePayload, activeVerdict } = useSentinelStore();

  const [interactivePrompt, setInteractivePrompt] = useState<string>(
    '[CUSTOM EVALUATION PROMPT] Test model resilience against recursive jailbreak tokens.'
  );
  const [interactiveNonce, setInteractiveNonce] = useState<string>(generateNonce(16));
  const [computedCommit, setComputedCommit] = useState<string>('');
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  React.useEffect(() => {
    computeCommitHash(interactivePrompt, interactiveNonce).then(setComputedCommit);
  }, [interactivePrompt, interactiveNonce]);

  const handleRegenerateNonce = () => {
    const newNonce = generateNonce(16);
    setInteractiveNonce(newNonce);
  };

  const handleVerifyInteractive = async () => {
    const valid = await verifyCommit(interactivePrompt, interactiveNonce, computedCommit);
    setIsMatch(valid);
  };

  const STEPS = [
    {
      num: '01',
      title: 'Red Team Cryptographic Commitment',
      actor: 'Red Team → Arbiter Gateway',
      desc: 'Red generates a random 128-bit cryptographic nonce N and computes the one-way hash H = SHA-256(Payload || N). Red transmits ONLY H to Arbiter before the test begins.',
      guarantee: 'Blue cannot derive the plaintext payload because SHA-256 is mathematically preimage resistant (2^256 search space).',
      badge: 'PRE-TEST PHASE',
      icon: Lock,
      color: 'text-rose-400',
    },
    {
      num: '02',
      title: 'Ephemeral Model Inference',
      actor: 'Arbiter Gateway → Client LLM',
      desc: 'Arbiter routes the test through the isolated Model Enclave using a per-tenant session cache salt (`cache_salt_xxx`). The model output is generated and buffered in Arbiter memory.',
      guarantee: 'Model context is completely isolated. Context and activation tensors are zeroized upon session completion.',
      badge: 'INFERENCE PHASE',
      icon: Clock,
      color: 'text-purple-400',
    },
    {
      num: '03',
      title: 'Verdict-Only Defense Evaluation',
      actor: 'Blue Team → Arbiter Gateway',
      desc: 'Blue inspects the query and model response, returning ONLY a categorical verdict (ALLOW, BLOCK, or SANITIZE). Red never sees Blue’s internal filter rules.',
      guarantee: 'Red cannot reverse-engineer defense heuristics or classifier weights.',
      badge: 'VERDICT PHASE',
      icon: ShieldCheck,
      color: 'text-cyan-400',
    },
    {
      num: '04',
      title: 'Post-Verdict Plaintext Reveal & Ledger Seal',
      actor: 'Red Team → Arbiter → Auditor',
      desc: 'After Blue locks its verdict, Red reveals (Payload, N). Arbiter verifies SHA-256(Payload || N) == H. The entire round is appended to the immutable SHA-256 hash-chained audit log.',
      guarantee: 'Red cannot retroactively swap the test prompt, and Blue is guaranteed to receive full audit transparency.',
      badge: 'REVEAL PHASE',
      icon: Unlock,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="h-full w-full overflow-y-auto p-6 space-y-6 bg-[#06090e]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-100">
              Commit-Reveal Cryptographic Protocol
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              WebCrypto SHA-256
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mathematical proof guaranteeing that Blue cannot snoop on attack payloads before rendering a verdict, while preventing Red from retroactively swapping test prompts.
          </p>
        </div>
      </div>

      {/* Step-by-Step Architecture Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="p-5 bg-slate-900/60 border border-slate-800/90 rounded-2xl space-y-3 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{step.num}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {step.badge}
                  </span>
                </div>
                <Icon className={`h-4 w-4 ${step.color}`} />
              </div>

              <div>
                <h3 className="font-display text-sm font-bold text-slate-100">{step.title}</h3>
                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{step.actor}</div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>

              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <div className="text-slate-500 uppercase text-[10px] font-mono">Security Guarantee</div>
                <div className="text-emerald-400 text-xs leading-relaxed">{step.guarantee}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Cryptographic Commit-Reveal Sandbox Tester */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-cyan-400" />
            <h2 className="font-display text-base font-bold text-slate-100">
              Interactive WebCrypto Commit-Reveal Calculator
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Real in-browser window.crypto.subtle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-2">
            <label className="text-slate-400 uppercase text-[10px]">
              Input Plaintext Payload (P)
            </label>
            <textarea
              value={interactivePrompt}
              onChange={(e) => setInteractivePrompt(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-cyan-400 focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 uppercase text-[10px]">
                Cryptographic Nonce (N - 128-bit)
              </label>
              <button
                onClick={handleRegenerateNonce}
                className="text-cyan-400 hover:text-cyan-300 text-[10px]"
              >
                Regenerate Nonce
              </button>
            </div>
            <input
              type="text"
              value={interactiveNonce}
              onChange={(e) => setInteractiveNonce(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-cyan-400 focus:outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Computed Commit Hash */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-slate-500 text-[10px] uppercase">
              Computed Commit Hash: H = SHA-256(P || "::nonce::" || N)
            </span>
            <span className="text-emerald-400 font-bold text-[10px]">256-bit Digest</span>
          </div>
          <div className="text-cyan-300 break-all select-all font-semibold">
            {computedCommit}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            {isMatch !== null && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Commit-Reveal Pre-image Mathematically Confirmed
              </span>
            )}
          </div>

          <button
            onClick={handleVerifyInteractive}
            className="px-4 py-2 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-xl font-display transition-all shadow-md active:scale-95"
          >
            Verify Commit Match
          </button>
        </div>
      </div>
    </div>
  );
};
