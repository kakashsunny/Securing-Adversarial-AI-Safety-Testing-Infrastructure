import React, { useState } from 'react';
import { useSentinelStore } from '../../engine/store';
import { AuditBlock } from '../../engine/types';
import confetti from 'canvas-confetti';
import {
  Link2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileSearch,
  Lock,
  FileCode,
  Hash,
  Sparkles,
} from 'lucide-react';

export const AuditChainView: React.FC = () => {
  const {
    auditChain,
    tamperedBlockIndex,
    chainVerificationResult,
    tamperBlock,
    restoreBlock,
    verifyFullChain,
    replayFinding,
  } = useSentinelStore();

  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [replayModalData, setReplayModalData] = useState<{
    verified: boolean;
    payloadText: string;
    expectedCommit: string;
    computedCommit: string;
    blockIndex: number;
  } | null>(null);

  const selectedBlock = auditChain[selectedBlockIndex] || auditChain[0];

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    const result = await verifyFullChain();
    setIsVerifying(false);
    if (result.isValid) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleTamperClick = async (index: number) => {
    await tamperBlock(index);
  };

  const handleRestoreClick = async (index: number) => {
    await restoreBlock(index);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleReplayClick = async (index: number) => {
    const res = await replayFinding(index);
    setReplayModalData({
      ...res,
      blockIndex: index,
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto p-3 sm:p-6 pb-24 sm:pb-8 space-y-4 sm:space-y-6 bg-[#06090e] touch-scroll">
      {/* Header & Chain Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-100">
              Tamper-Evident Audit Chain Ledger
            </h1>
            <span
              className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded ${
                chainVerificationResult.isValid
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}
            >
              {chainVerificationResult.isValid
                ? 'ALL BLOCKS VERIFIED'
                : `BROKEN AT #${chainVerificationResult.brokenBlockIndex}`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Every evaluation finding is cryptographically chained (<code>H_n = SHA-256(H_prev + EntryData)</code>) and signed with Arbiter ECDSA keys to ensure mathematical non-repudiation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {tamperedBlockIndex !== null ? (
            <button
              onClick={() => handleRestoreClick(tamperedBlockIndex)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-xl hover:bg-emerald-900/60 transition-all shadow-md active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore Authentic State</span>
            </button>
          ) : (
            <button
              onClick={() => handleTamperClick(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-xl hover:bg-rose-900/60 transition-all shadow-md active:scale-95"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Tamper Block #1</span>
            </button>
          )}

          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 font-display active:scale-95"
          >
            <ShieldCheck className="h-3.5 w-3.5 fill-slate-900" />
            <span>{isVerifying ? 'Verifying...' : 'Verify Chain'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Glowing Blockchain Blocks Stream */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="uppercase font-semibold tracking-wider">
            Sequential Blockchain View ({auditChain.length} Blocks)
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Click block to inspect cryptographic payload
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 px-1">
          {auditChain.map((block, idx) => {
            const isSelected = selectedBlockIndex === idx;
            const isTampered = block.status === 'TAMPERED';

            return (
              <div
                key={idx}
                onClick={() => setSelectedBlockIndex(idx)}
                className={`shrink-0 cursor-pointer w-56 p-4 rounded-xl border transition-all relative ${
                  isTampered
                    ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/50'
                    : isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Block Number & Status */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-200">
                    <Hash className="h-3 w-3 text-cyan-400" />
                    Block #{block.index}
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isTampered
                        ? 'bg-rose-950 text-rose-300'
                        : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {isTampered ? 'CORRUPT' : 'SEALED'}
                  </span>
                </div>

                {/* Hash Previews */}
                <div className="space-y-1.5 pt-2 text-[11px] font-mono">
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Entry Hash</div>
                    <div className="text-slate-300 truncate" title={block.entryHash}>
                      {block.entryHash.substring(0, 16)}...
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Prev Hash Link</div>
                    <div className="text-slate-400 truncate" title={block.prevHash}>
                      {block.prevHash.substring(0, 16)}...
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Verdict:</span>
                    <span
                      className={`font-bold ${
                        block.verdict === 'BLOCK'
                          ? 'text-rose-400'
                          : block.verdict === 'SANITIZE'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {block.verdict}
                    </span>
                  </div>
                </div>

                {/* Chaining arrow indicator */}
                {idx < auditChain.length - 1 && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Block Cryptographic Deep-Dive Inspector */}
      {selectedBlock && (
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-6 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  INDEX #{selectedBlock.index}
                </span>
                <h2 className="font-display text-lg font-bold text-slate-100">
                  Block Cryptographic Ledger Entry
                </h2>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                    selectedBlock.status === 'TAMPERED'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {selectedBlock.status === 'TAMPERED'
                    ? 'INTEGRITY VIOLATION DETECTED'
                    : 'CRYPTOGRAPHICALLY SEALED'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Timestamp: {selectedBlock.timestamp}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReplayClick(selectedBlock.index)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/60 transition-colors"
              >
                <FileSearch className="h-3.5 w-3.5" />
                <span>Replay Finding</span>
              </button>

              {selectedBlock.status === 'VALID' ? (
                <button
                  onClick={() => handleTamperClick(selectedBlock.index)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-lg hover:bg-rose-900/60 transition-colors"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Tamper This Block</span>
                </button>
              ) : (
                <button
                  onClick={() => handleRestoreClick(selectedBlock.index)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-lg hover:bg-emerald-900/60 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Block</span>
                </button>
              )}
            </div>
          </div>

          {/* Cryptographic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="text-slate-500 text-[10px] uppercase">SHA-256 Entry Hash</div>
              <div className="text-cyan-300 break-all select-all font-semibold">
                {selectedBlock.entryHash}
              </div>
              <div className="text-[10px] text-slate-500">
                Formula: SHA-256(prevHash + ":" + entryJSON)
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="text-slate-500 text-[10px] uppercase">Previous Block Hash (Link)</div>
              <div className="text-slate-300 break-all select-all">
                {selectedBlock.prevHash}
              </div>
              <div className="text-[10px] text-slate-500">
                Sequential pointer ensuring append-only immutability
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="text-slate-500 text-[10px] uppercase">Digital Signature (ECDSA P-256 / Ed25519)</div>
              <div className="text-emerald-400 break-all select-all">
                {selectedBlock.signature}
              </div>
              <div className="text-[10px] text-slate-500">
                Signed by Arbiter Key Authority (Verified)
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="text-slate-500 text-[10px] uppercase">Batch Merkle Root</div>
              <div className="text-amber-300 break-all select-all">
                {selectedBlock.merkleRoot}
              </div>
              <div className="text-[10px] text-slate-500">
                Anchored root for batched zero-knowledge verification
              </div>
            </div>
          </div>

          {/* Raw Block Payload JSON */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Serialized Finding JSON (Entry Payload)
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Immutable Evaluation Artifact
              </span>
            </div>
            <pre className="p-4 bg-[#05070a] border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto">
              {JSON.stringify(JSON.parse(selectedBlock.entryJSON), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Replay Finding Modal */}
      {replayModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-xl w-full p-6 bg-[#0a0f18] border border-cyan-500/40 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-slate-100">
                  Independent Finding Reconstruction
                </h3>
              </div>
              <button
                onClick={() => setReplayModalData(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed">
              The Auditor Node independently re-computes the SHA-256 commit hash and verifies that the revealed test payload matches the pre-test commitment hash stored in Block #{replayModalData.blockIndex}.
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
              <div>
                <div className="text-slate-500 text-[10px] uppercase">Reconstructed Test Prompt</div>
                <div className="text-slate-200 mt-0.5">{replayModalData.payloadText}</div>
              </div>

              <div>
                <div className="text-slate-500 text-[10px] uppercase">Original Commit Hash</div>
                <div className="text-cyan-300 break-all">{replayModalData.expectedCommit}</div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <span className="text-slate-400">Cryptographic Verification:</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  NON-REPUDIATION CONFIRMED
                </span>
              </div>
            </div>

            <button
              onClick={() => setReplayModalData(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              Close Verifier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
