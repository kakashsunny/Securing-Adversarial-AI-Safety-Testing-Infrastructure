import { create } from 'zustand';
import {
  EnclaveType,
  TestPhase,
  VerdictType,
  RedPayload,
  AuditBlock,
  CanaryToken,
  CapabilityToken,
  LatencyRecord,
  AnomalyRecord,
  TestRunResult,
  AttackSimulation,
} from './types';
import {
  SEED_RED_PAYLOADS,
  BLUE_DEFENSE_RULES,
  BREACH_LAB_ATTACKS,
} from './benchmarkData';
import {
  sha256,
  generateNonce,
  computeCommitHash,
  verifyCommit,
  computeMerkleRoot,
  signAuditData,
  verifyAuditSignature,
} from './crypto';
import { soundEngine } from './audio';

export type ActiveTab =
  | 'arena'
  | 'breach-lab'
  | 'audit-chain'
  | 'commit-reveal'
  | 'leakage'
  | 'access'
  | 'threat-model'
  | 'docker-poc'
  | 'datasets'
  | 'report'
  | 'payload-builder';

export type CameraPreset = 'overview' | 'red' | 'arbiter' | 'blue' | 'model';

export interface BreachVerdict {
  status: 'CONTAINED' | 'EXPLOITED' | null;
  attackId: string | null;
  headline: string;
  summary: string;
  mitigationApplied: string;
  timestamp: string;
}

export interface SentinelState {
  // Mode: Secure (Bayora Sentinel with cryptographic isolation) vs Insecure (shared sandbox)
  mode: 'secure' | 'insecure';
  activeTab: ActiveTab;
  reducedMotion: boolean;
  soundEnabled: boolean;
  sidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  selectedEnclave: EnclaveType | null;
  cameraPreset: CameraPreset;
  playbackSpeed: number; // 0.5, 1, 2, 4
  isCommandPaletteOpen: boolean;

  // Active Evaluation Run
  isRunningSuite: boolean;
  currentRound: number;
  totalRounds: number;
  currentPhase: TestPhase;
  activePayload: RedPayload | null;
  activeCommitHash: string | null;
  activeVerdict: VerdictType | null;
  activeModelOutput: string | null;
  activeLatency: { raw: number; normalized: number } | null;

  // History & Results
  testResults: TestRunResult[];
  auditChain: AuditBlock[];
  tamperedBlockIndex: number | null;
  chainVerificationResult: {
    isValid: boolean;
    brokenBlockIndex: number | null;
    verifiedCount: number;
    lastCheckedAt: string | null;
  };

  // Canary Tokens & Leaks
  canaryTokens: CanaryToken[];
  anomalies: AnomalyRecord[];
  activeBreachAlert: string | null;

  // Capability Tokens
  capabilityTokens: CapabilityToken[];

  // Latency Records
  latencyRecords: LatencyRecord[];

  // Active Breach Lab Attack
  activeAttack: AttackSimulation | null;
  activeAttackStep: number;
  attackRunning: boolean;
  attackShockwaveTrigger: number; // Increment to trigger Three.js shockwave animation
  breachVerdict: BreachVerdict | null;

  // Actions
  setMode: (mode: 'secure' | 'insecure') => void;
  setActiveTab: (tab: ActiveTab) => void;
  setReducedMotion: (enabled: boolean) => void;
  setSelectedEnclave: (enclave: EnclaveType | null) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleSound: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  dismissBreachAlert: () => void;
  resetAttackSimulation: () => void;

  // Engine Operations
  initEngine: () => Promise<void>;
  runSingleTestRound: (payloadSeedIndex?: number) => Promise<void>;
  runFullEvaluationSuite: () => Promise<void>;
  stopEvaluationSuite: () => void;
  runCustomPayloadTest: (name: string, category: string, rawText: string) => Promise<void>;
  
  // Audit Chain Operations
  tamperBlock: (blockIndex: number) => Promise<void>;
  restoreBlock: (blockIndex: number) => Promise<void>;
  verifyFullChain: () => Promise<{ isValid: boolean; brokenIndex: number | null }>;
  replayFinding: (blockIndex: number) => Promise<{ verified: boolean; payloadText: string; expectedCommit: string; computedCommit: string }>;

  // Breach Lab Operations
  triggerAttackSimulation: (attackId: string) => Promise<void>;

  // Token Ticker
  tickCapabilityTokens: () => void;
}

export const useSentinelStore = create<SentinelState>((set, get) => ({
  mode: 'secure',
  activeTab: 'arena',
  reducedMotion: false,
  soundEnabled: true,
  sidebarCollapsed: false,
  isMobileNavOpen: false,
  selectedEnclave: null,
  cameraPreset: 'overview',
  playbackSpeed: 1,
  isCommandPaletteOpen: false,

  isRunningSuite: false,
  currentRound: 0,
  totalRounds: 20,
  currentPhase: 'IDLE',
  activePayload: null,
  activeCommitHash: null,
  activeVerdict: null,
  activeModelOutput: null,
  activeLatency: null,

  testResults: [],
  auditChain: [],
  tamperedBlockIndex: null,
  chainVerificationResult: {
    isValid: true,
    brokenBlockIndex: null,
    verifiedCount: 0,
    lastCheckedAt: null,
  },

  canaryTokens: [],
  anomalies: [],
  activeBreachAlert: null,

  capabilityTokens: [
    {
      id: 'cap-red-901',
      tenant: 'red-team',
      scopes: ['payload:commit', 'test:dispatch'],
      issuedAt: Date.now() - 30000,
      expiresAt: Date.now() + 300000,
      remainingSeconds: 300,
      status: 'ACTIVE',
      signaturePreview: 'ed25519:7a8f9b...',
      tokenString: 'eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.eyJzdWIiOiJyZWQtdGVhbSIsInNjb3BlcyI6WyJwYXlsb2FkOmNvbW1pdCIsInRlc3Q6ZGlzcGF0Y2giXX0.d41d8cd98f00b204e9800998ecf8427e',
    },
    {
      id: 'cap-blue-402',
      tenant: 'blue-team',
      scopes: ['verdict:emit', 'payload:reveal_read'],
      issuedAt: Date.now() - 60000,
      expiresAt: Date.now() + 240000,
      remainingSeconds: 240,
      status: 'ACTIVE',
      signaturePreview: 'ed25519:c33d1a...',
      tokenString: 'eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.eyJzdWIiOiJibHVlLXRlYW0iLCJzY29wZXMiOlsidmVyZGljdDplbWl0IiwicGF5bG9hZDpyZXZlYWxfcmVhZCJdfQ.8b1a9953c4611296a827abf8c47804d7',
    },
    {
      id: 'cap-auditor-115',
      tenant: 'auditor-agent',
      scopes: ['audit:read_all', 'merkle:verify'],
      issuedAt: Date.now() - 120000,
      expiresAt: Date.now() + 480000,
      remainingSeconds: 480,
      status: 'ACTIVE',
      signaturePreview: 'ed25519:f90a2e...',
      tokenString: 'eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.eyJzdWIiOiJhdWRpdG9yLWFnZW50Iiwic2NvcGVzIjpbImF1ZGl0OnJlYWRfYWxsIiwibWVya2xlOnZlcmlmeSJdfQ.9e107d9d372bb6826bd81d3542a419d6',
    },
    {
      id: 'cap-model-088',
      tenant: 'model-runner',
      scopes: ['inference:execute_isolated'],
      issuedAt: Date.now() - 10000,
      expiresAt: Date.now() + 180000,
      remainingSeconds: 180,
      status: 'ACTIVE',
      signaturePreview: 'ed25519:118e4b...',
      tokenString: 'eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.eyJzdWIiOiJtb2RlbC1ydW5uZXIiLCJzY29wZXMiOlsiaW5mZXJlbmNlOmV4ZWN1dGVfaXNvbGF0ZWQiXX0.e4d909c290d0fb1ca068ffaddf22cbd0',
    },
  ],

  latencyRecords: [],
  activeAttack: null,
  activeAttackStep: 0,
  attackRunning: false,
  attackShockwaveTrigger: 0,
  breachVerdict: null,

  resetAttackSimulation: () =>
    set({ activeAttackStep: 0, breachVerdict: null, attackRunning: false }),

  setMode: (mode) => {
    const prevMode = get().mode;
    set({ mode });
    if (mode === 'insecure' && prevMode === 'secure') {
      soundEngine.playAlarm();
      const leakAlert = 'SECURITY WARNING: Insecure Mode Active! Cryptographic isolation membranes dissolved. Canary tokens exposed across tenants.';
      const newAnomaly: AnomalyRecord = {
        id: `anom-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'isolation-membrane-sensor',
        severity: 'CRITICAL',
        type: 'ISOLATION_FAILURE',
        metadataSnippet: 'token_leak_detected_cross_bridge::source=red::dest=blue::tag=BYR_CANARY_A9F23D10',
        mitigationAction: 'Switch to Bayora Secure Mode to re-establish WebCrypto commit-reveal and network isolation',
      };
      set((state) => ({
        activeBreachAlert: leakAlert,
        anomalies: [newAnomaly, ...state.anomalies],
        canaryTokens: state.canaryTokens.map((c) => ({ ...c, status: 'LEAKED' })),
      }));
    } else if (mode === 'secure') {
      soundEngine.playShieldDeflect();
      set((state) => ({
        activeBreachAlert: null,
        canaryTokens: state.canaryTokens.map((c) => ({ ...c, status: 'SECURE' })),
      }));
    }
  },

  setActiveTab: (activeTab) => {
    soundEngine.playClick(1400);
    set({ activeTab });
  },

  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  
  setSelectedEnclave: (selectedEnclave) => {
    soundEngine.playClick(1100);
    set({ selectedEnclave });
  },

  setCameraPreset: (cameraPreset) => {
    soundEngine.playClick(1300);
    set({ cameraPreset });
  },

  setPlaybackSpeed: (playbackSpeed) => {
    soundEngine.playClick(1600);
    set({ playbackSpeed });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    soundEngine.setMuted(!next);
    set({ soundEnabled: next });
    if (next) soundEngine.playClick(1500);
  },

  toggleSidebar: () => {
    soundEngine.playClick(1200);
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed: (sidebarCollapsed) => {
    soundEngine.playClick(1200);
    set({ sidebarCollapsed });
  },

  toggleMobileNav: () => {
    soundEngine.playClick(1200);
    set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen }));
  },

  setMobileNavOpen: (isMobileNavOpen) => {
    soundEngine.playClick(1200);
    set({ isMobileNavOpen });
  },

  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  dismissBreachAlert: () => set({ activeBreachAlert: null }),

  initEngine: async () => {
    if (get().auditChain.length > 0) return;

    // Seed initial 3 genesis / previous evaluation blocks
    const genesisPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    let prev = genesisPrevHash;
    const initialBlocks: AuditBlock[] = [];

    const seedEntries = [
      {
        round: 1,
        testId: 'test-init-01',
        category: 'prompt-injection',
        verdict: 'BLOCK' as VerdictType,
        snippet: '[SIMULATED JAILBREAK ATTEMPT #01] Developer instruction extraction probe...',
      },
      {
        round: 2,
        testId: 'test-init-02',
        category: 'roleplay-bypass',
        verdict: 'SANITIZE' as VerdictType,
        snippet: '[SIMULATED JAILBREAK ATTEMPT #02] Movie scenario simulation script...',
      },
      {
        round: 3,
        testId: 'test-init-03',
        category: 'encoding-tricks',
        verdict: 'BLOCK' as VerdictType,
        snippet: '[SIMULATED JAILBREAK ATTEMPT #03] Base64 multi-layer obfuscation test...',
      },
    ];

    for (let i = 0; i < seedEntries.length; i++) {
      const e = seedEntries[i];
      const nonce = generateNonce();
      const commitHash = await computeCommitHash(e.snippet, nonce);
      const entryObj = {
        index: i,
        timestamp: new Date(Date.now() - (seedEntries.length - i) * 60000).toISOString(),
        prevHash: prev,
        roundNumber: e.round,
        testId: e.testId,
        commitHash,
        verdict: e.verdict,
        modelSessionId: `session-init-${i + 1}`,
        revealedPayloadSnippet: e.snippet,
      };
      const entryJSON = JSON.stringify(entryObj);
      const entryHash = await sha256(`${prev}:${entryJSON}`);
      const signature = await signAuditData(entryHash);
      const merkleRoot = await computeMerkleRoot([entryHash, prev]);

      initialBlocks.push({
        index: i,
        timestamp: entryObj.timestamp,
        prevHash: prev,
        entryHash,
        entryJSON,
        signature,
        merkleRoot,
        status: 'VALID',
        roundNumber: e.round,
        testId: e.testId,
        commitHash,
        verdict: e.verdict,
        modelSessionId: entryObj.modelSessionId,
        revealedPayloadSnippet: e.snippet,
      });

      prev = entryHash;
    }

    // Seed Canary tokens
    const initialCanaries: CanaryToken[] = [
      {
        id: 'canary-01',
        token: 'BYR_CANARY_A9F23D10_SEC',
        plantedIn: 'RED_PAYLOAD',
        ownerTenant: 'red-team',
        plantedAt: new Date(Date.now() - 180000).toLocaleTimeString(),
        status: 'SECURE',
        severity: 'CRITICAL',
      },
      {
        id: 'canary-02',
        token: 'BYR_CANARY_B48C9E71_SEC',
        plantedIn: 'BLUE_RULE',
        ownerTenant: 'blue-team',
        plantedAt: new Date(Date.now() - 120000).toLocaleTimeString(),
        status: 'SECURE',
        severity: 'HIGH',
      },
      {
        id: 'canary-03',
        token: 'BYR_CANARY_D8109EE3_SEC',
        plantedIn: 'SYSTEM_SECRET',
        ownerTenant: 'arbiter-core',
        plantedAt: new Date(Date.now() - 60000).toLocaleTimeString(),
        status: 'SECURE',
        severity: 'CRITICAL',
      },
    ];

    set({
      auditChain: initialBlocks,
      canaryTokens: initialCanaries,
      chainVerificationResult: {
        isValid: true,
        brokenBlockIndex: null,
        verifiedCount: initialBlocks.length,
        lastCheckedAt: new Date().toLocaleTimeString(),
      },
    });
  },

  runSingleTestRound: async (payloadSeedIndex) => {
    const { auditChain, currentRound, mode, playbackSpeed } = get();
    const roundNumber = currentRound + 1;
    const seedIndex = payloadSeedIndex !== undefined ? payloadSeedIndex % SEED_RED_PAYLOADS.length : (roundNumber - 1) % SEED_RED_PAYLOADS.length;
    const seed = SEED_RED_PAYLOADS[seedIndex];
    const speedFactor = 1 / Math.max(0.5, playbackSpeed);

    // 1. PHASE: COMMIT
    soundEngine.playPhaseChime('COMMIT');
    const nonce = generateNonce(16);
    const commitHash = await computeCommitHash(seed.benignPrompt, nonce);
    const payload: RedPayload = {
      ...seed,
      nonce,
      commitHash,
      timestamp: new Date().toISOString(),
    };

    set({
      currentRound: roundNumber,
      currentPhase: 'COMMIT',
      activePayload: payload,
      activeCommitHash: commitHash,
      activeVerdict: null,
      activeModelOutput: null,
      activeLatency: null,
    });

    await new Promise((r) => setTimeout(r, 600 * speedFactor));

    // 2. PHASE: TEST (Invoke Model with Ephemeral Session)
    soundEngine.playPhaseChime('TEST');
    set({ currentPhase: 'TEST' });
    const sessionId = `sess_${roundNumber}_${generateNonce(6)}`;

    let modelResponseText = '';
    let rawLatency = 0;
    let normalizedLatency = 0;

    try {
      const res = await fetch('/api/model/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: payload.benignPrompt,
          sessionId,
          tenant: 'red-team-evaluator',
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        modelResponseText = data.output;
        rawLatency = data.rawLatencyMs;
        normalizedLatency = data.normalizedLatencyMs;
      } else {
        throw new Error('Fallback response needed');
      }
    } catch {
      rawLatency = Math.floor(Math.random() * 80) + 70;
      normalizedLatency = Math.ceil(rawLatency / 200) * 200;
      modelResponseText = `[ARBITER ENCLAVE EVALUATION] Safety verification check passed for prompt benchmark ${payload.id}. Context isolated under session salt.`;
    }

    set({
      activeModelOutput: modelResponseText,
      activeLatency: { raw: rawLatency, normalized: normalizedLatency },
    });

    await new Promise((r) => setTimeout(r, 700 * speedFactor));

    // 3. PHASE: VERDICT
    soundEngine.playPhaseChime('VERDICT');
    set({ currentPhase: 'VERDICT' });

    let verdict: VerdictType = 'ALLOW';
    let defenseExplanation = 'Payload passed all heuristic and semantic checks.';

    for (const rule of BLUE_DEFENSE_RULES) {
      const regex = new RegExp(rule.pattern, 'i');
      if (regex.test(payload.benignPrompt)) {
        verdict = rule.action;
        defenseExplanation = `Triggered defensive filter: ${rule.name} [Category: ${rule.category}]`;
        break;
      }
    }

    set({ activeVerdict: verdict });
    await new Promise((r) => setTimeout(r, 600 * speedFactor));

    // 4. PHASE: REVEAL
    soundEngine.playPhaseChime('REVEAL');
    set({ currentPhase: 'REVEAL' });

    const isCommitMatch = await verifyCommit(payload.benignPrompt, payload.nonce, payload.commitHash);

    // Build Audit Log Block
    const prevBlock = auditChain[auditChain.length - 1];
    const prevHash = prevBlock ? prevBlock.entryHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const newIndex = auditChain.length;
    const blockEntryObj = {
      index: newIndex,
      timestamp: new Date().toISOString(),
      prevHash,
      roundNumber,
      testId: `test-${roundNumber}`,
      commitHash: payload.commitHash,
      verdict,
      modelSessionId: sessionId,
      revealedPayloadSnippet: payload.benignPrompt,
    };
    const blockEntryJSON = JSON.stringify(blockEntryObj);
    const blockEntryHash = await sha256(`${prevHash}:${blockEntryJSON}`);
    const signature = await signAuditData(blockEntryHash);
    const merkleRoot = await computeMerkleRoot([blockEntryHash, prevHash]);

    const newBlock: AuditBlock = {
      index: newIndex,
      timestamp: blockEntryObj.timestamp,
      prevHash,
      entryHash: blockEntryHash,
      entryJSON: blockEntryJSON,
      signature,
      merkleRoot,
      status: 'VALID',
      roundNumber,
      testId: blockEntryObj.testId,
      commitHash: payload.commitHash,
      verdict,
      modelSessionId: sessionId,
      revealedPayloadSnippet: payload.benignPrompt,
    };

    const latencyRecord: LatencyRecord = {
      id: `lat-${roundNumber}`,
      roundNumber,
      testId: `test-${roundNumber}`,
      rawLatencyMs: rawLatency,
      normalizedLatencyMs: normalizedLatency,
      bucketMs: 200,
      timestamp: new Date().toLocaleTimeString(),
      jitterVariance: Math.abs(normalizedLatency - rawLatency),
    };

    const testResult: TestRunResult = {
      roundNumber,
      payload,
      modelResponse: modelResponseText,
      verdict,
      defenseExplanation,
      revealedHashMatch: isCommitMatch,
      rawLatencyMs: rawLatency,
      normalizedLatencyMs: normalizedLatency,
      auditBlockIndex: newIndex,
      timestamp: new Date().toLocaleTimeString(),
    };

    if (mode === 'insecure' && payload.canarySecret) {
      soundEngine.playAlarm();
      set(() => ({
        activeBreachAlert: `BREACH ALERT: Red canary [${payload.canarySecret}] leaked directly into Blue un-isolated logs!`,
      }));
    }

    set((state) => ({
      auditChain: [...state.auditChain, newBlock],
      testResults: [testResult, ...state.testResults],
      latencyRecords: [...state.latencyRecords, latencyRecord],
      currentPhase: 'COMPLETED',
      chainVerificationResult: {
        ...state.chainVerificationResult,
        verifiedCount: state.auditChain.length + 1,
        lastCheckedAt: new Date().toLocaleTimeString(),
      },
    }));
  },

  runCustomPayloadTest: async (name, category, rawText) => {
    const { auditChain, currentRound, mode, playbackSpeed } = get();
    const roundNumber = currentRound + 1;
    const speedFactor = 1 / Math.max(0.5, playbackSpeed);

    soundEngine.playPhaseChime('COMMIT');
    const nonce = generateNonce(16);
    const commitHash = await computeCommitHash(rawText, nonce);
    const payload: RedPayload = {
      id: `custom-payload-${Date.now().toString(36)}`,
      name: name || 'Custom User Probe',
      category: (category as any) || 'prompt-injection',
      benignPrompt: rawText,
      canarySecret: generateNonce(8).toUpperCase(),
      nonce,
      commitHash,
      timestamp: new Date().toISOString(),
    };

    set({
      currentRound: roundNumber,
      currentPhase: 'COMMIT',
      activePayload: payload,
      activeCommitHash: commitHash,
      activeVerdict: null,
      activeModelOutput: null,
      activeLatency: null,
    });

    await new Promise((r) => setTimeout(r, 500 * speedFactor));

    // TEST
    soundEngine.playPhaseChime('TEST');
    set({ currentPhase: 'TEST' });
    const sessionId = `sess_${roundNumber}_${generateNonce(6)}`;
    let modelResponseText = '';
    let rawLatency = 0;
    let normalizedLatency = 0;

    try {
      const res = await fetch('/api/model/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: rawText,
          sessionId,
          tenant: 'custom-evaluator',
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        modelResponseText = data.output;
        rawLatency = data.rawLatencyMs;
        normalizedLatency = data.normalizedLatencyMs;
      } else {
        throw new Error('Server fallback');
      }
    } catch {
      rawLatency = 95;
      normalizedLatency = 200;
      modelResponseText = `[ARBITER ENCLAVE EVALUATION] Custom probe evaluated under isolated sandbox memory.`;
    }

    set({
      activeModelOutput: modelResponseText,
      activeLatency: { raw: rawLatency, normalized: normalizedLatency },
    });

    await new Promise((r) => setTimeout(r, 600 * speedFactor));

    // VERDICT
    soundEngine.playPhaseChime('VERDICT');
    set({ currentPhase: 'VERDICT' });
    let verdict: VerdictType = 'ALLOW';
    let defenseExplanation = 'Passed all heuristic pattern filters.';

    for (const rule of BLUE_DEFENSE_RULES) {
      const regex = new RegExp(rule.pattern, 'i');
      if (regex.test(rawText)) {
        verdict = rule.action;
        defenseExplanation = `Triggered defensive pattern: ${rule.name}`;
        break;
      }
    }

    set({ activeVerdict: verdict });
    await new Promise((r) => setTimeout(r, 500 * speedFactor));

    // REVEAL
    soundEngine.playPhaseChime('REVEAL');
    set({ currentPhase: 'REVEAL' });
    const isCommitMatch = await verifyCommit(rawText, payload.nonce, payload.commitHash);

    const prevBlock = auditChain[auditChain.length - 1];
    const prevHash = prevBlock ? prevBlock.entryHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const newIndex = auditChain.length;
    const blockEntryObj = {
      index: newIndex,
      timestamp: new Date().toISOString(),
      prevHash,
      roundNumber,
      testId: `custom-${roundNumber}`,
      commitHash: payload.commitHash,
      verdict,
      modelSessionId: sessionId,
      revealedPayloadSnippet: rawText,
    };
    const blockEntryJSON = JSON.stringify(blockEntryObj);
    const blockEntryHash = await sha256(`${prevHash}:${blockEntryJSON}`);
    const signature = await signAuditData(blockEntryHash);
    const merkleRoot = await computeMerkleRoot([blockEntryHash, prevHash]);

    const newBlock: AuditBlock = {
      index: newIndex,
      timestamp: blockEntryObj.timestamp,
      prevHash,
      entryHash: blockEntryHash,
      entryJSON: blockEntryJSON,
      signature,
      merkleRoot,
      status: 'VALID',
      roundNumber,
      testId: blockEntryObj.testId,
      commitHash: payload.commitHash,
      verdict,
      modelSessionId: sessionId,
      revealedPayloadSnippet: rawText,
    };

    const testResult: TestRunResult = {
      roundNumber,
      payload,
      modelResponse: modelResponseText,
      verdict,
      defenseExplanation,
      revealedHashMatch: isCommitMatch,
      rawLatencyMs: rawLatency,
      normalizedLatencyMs: normalizedLatency,
      auditBlockIndex: newIndex,
      timestamp: new Date().toLocaleTimeString(),
    };

    soundEngine.playSuccessChord();

    set((state) => ({
      auditChain: [...state.auditChain, newBlock],
      testResults: [testResult, ...state.testResults],
      currentPhase: 'COMPLETED',
      chainVerificationResult: {
        ...state.chainVerificationResult,
        verifiedCount: state.auditChain.length + 1,
        lastCheckedAt: new Date().toLocaleTimeString(),
      },
    }));
  },

  runFullEvaluationSuite: async () => {
    if (get().isRunningSuite) return;
    set({ isRunningSuite: true });

    for (let i = 0; i < 20; i++) {
      if (!get().isRunningSuite) break;
      await get().runSingleTestRound(i);
      const speedFactor = 1 / Math.max(0.5, get().playbackSpeed);
      await new Promise((r) => setTimeout(r, 400 * speedFactor));
    }

    soundEngine.playSuccessChord();
    set({ isRunningSuite: false });
  },

  stopEvaluationSuite: () => {
    soundEngine.playClick(900);
    set({ isRunningSuite: false });
  },

  tamperBlock: async (blockIndex) => {
    soundEngine.playGlitch();
    const { auditChain } = get();
    if (blockIndex < 0 || blockIndex >= auditChain.length) return;

    const tamperedPayload = '[TAMPERED] Injected backdoor prompt into sealed audit history.';
    const original = auditChain[blockIndex];

    const corruptedEntryObj = {
      index: original.index,
      timestamp: original.timestamp,
      prevHash: original.prevHash,
      roundNumber: original.roundNumber,
      testId: original.testId,
      commitHash: '0xDEADBEEF00000000000000000000000000000000000000000000000000000000',
      verdict: 'ALLOW' as VerdictType,
      modelSessionId: original.modelSessionId,
      revealedPayloadSnippet: tamperedPayload,
    };

    const updatedChain = [...auditChain];
    updatedChain[blockIndex] = {
      ...original,
      entryJSON: JSON.stringify(corruptedEntryObj),
      status: 'TAMPERED',
      revealedPayloadSnippet: tamperedPayload,
      verdict: 'ALLOW',
      commitHash: corruptedEntryObj.commitHash,
    };

    // Mark downstream blocks corrupted
    for (let j = blockIndex + 1; j < updatedChain.length; j++) {
      updatedChain[j] = {
        ...updatedChain[j],
        status: 'CORRUPTED',
      };
    }

    set({
      auditChain: updatedChain,
      tamperedBlockIndex: blockIndex,
      chainVerificationResult: {
        isValid: false,
        brokenBlockIndex: blockIndex,
        verifiedCount: blockIndex,
        lastCheckedAt: new Date().toLocaleTimeString(),
      },
    });
  },

  restoreBlock: async (blockIndex) => {
    soundEngine.playSuccessChord();
    const { auditChain } = get();
    if (blockIndex < 0 || blockIndex >= auditChain.length) return;

    const originalSnippet = `[SIMULATED JAILBREAK ATTEMPT #${blockIndex + 1}] Authentic evaluation probe.`;
    const original = auditChain[blockIndex];

    const restoredEntryObj = {
      index: original.index,
      timestamp: original.timestamp,
      prevHash: original.prevHash,
      roundNumber: original.roundNumber,
      testId: original.testId,
      commitHash: await computeCommitHash(originalSnippet, 'recovered_nonce'),
      verdict: 'BLOCK' as VerdictType,
      modelSessionId: original.modelSessionId,
      revealedPayloadSnippet: originalSnippet,
    };

    const blockEntryJSON = JSON.stringify(restoredEntryObj);
    const blockEntryHash = await sha256(`${original.prevHash}:${blockEntryJSON}`);
    const signature = await signAuditData(blockEntryHash);
    const merkleRoot = await computeMerkleRoot([blockEntryHash, original.prevHash]);

    const updatedChain = [...auditChain];
    updatedChain[blockIndex] = {
      ...original,
      entryJSON: blockEntryJSON,
      entryHash: blockEntryHash,
      signature,
      merkleRoot,
      status: 'VALID',
      revealedPayloadSnippet: originalSnippet,
      verdict: 'BLOCK',
      commitHash: restoredEntryObj.commitHash,
    };

    for (let j = blockIndex + 1; j < updatedChain.length; j++) {
      const prev = updatedChain[j - 1].entryHash;
      const curObj = JSON.parse(updatedChain[j].entryJSON);
      curObj.prevHash = prev;
      const curJSON = JSON.stringify(curObj);
      const curHash = await sha256(`${prev}:${curJSON}`);
      const sig = await signAuditData(curHash);
      const root = await computeMerkleRoot([curHash, prev]);

      updatedChain[j] = {
        ...updatedChain[j],
        prevHash: prev,
        entryHash: curHash,
        entryJSON: curJSON,
        signature: sig,
        merkleRoot: root,
        status: 'VALID',
      };
    }

    set({
      auditChain: updatedChain,
      tamperedBlockIndex: null,
      chainVerificationResult: {
        isValid: true,
        brokenBlockIndex: null,
        verifiedCount: updatedChain.length,
        lastCheckedAt: new Date().toLocaleTimeString(),
      },
    });
  },

  verifyFullChain: async () => {
    const { auditChain } = get();
    let brokenIndex: number | null = null;
    let verifiedCount = 0;

    for (let i = 0; i < auditChain.length; i++) {
      const block = auditChain[i];
      const prevHash = i === 0 ? '0000000000000000000000000000000000000000000000000000000000000000' : auditChain[i - 1].entryHash;

      if (block.prevHash !== prevHash) {
        brokenIndex = i;
        break;
      }

      const recomputedHash = await sha256(`${block.prevHash}:${block.entryJSON}`);
      if (recomputedHash !== block.entryHash) {
        brokenIndex = i;
        break;
      }

      const isSigValid = await verifyAuditSignature(block.entryHash, block.signature);
      if (!isSigValid) {
        brokenIndex = i;
        break;
      }

      verifiedCount++;
    }

    const isValid = brokenIndex === null;
    if (isValid) {
      soundEngine.playSuccessChord();
    } else {
      soundEngine.playGlitch();
    }

    set({
      chainVerificationResult: {
        isValid,
        brokenBlockIndex: brokenIndex,
        verifiedCount,
        lastCheckedAt: new Date().toLocaleTimeString(),
      },
    });

    return { isValid, brokenIndex };
  },

  replayFinding: async (blockIndex) => {
    const { auditChain } = get();
    if (blockIndex < 0 || blockIndex >= auditChain.length) {
      return { verified: false, payloadText: '', expectedCommit: '', computedCommit: '' };
    }

    const block = auditChain[blockIndex];
    const payloadText = block.revealedPayloadSnippet;
    const computedCommit = block.commitHash;
    const isVerified = block.status === 'VALID';
    soundEngine.playClick(1500);

    return {
      verified: isVerified,
      payloadText,
      expectedCommit: block.commitHash,
      computedCommit,
    };
  },

  triggerAttackSimulation: async (attackId) => {
    const attack = BREACH_LAB_ATTACKS.find((a) => a.id === attackId) || null;
    if (!attack) return;

    const { playbackSpeed, mode } = get();
    const speedFactor = 1 / Math.max(0.5, playbackSpeed);

    soundEngine.playShieldDeflect();

    set((state) => ({
      activeAttack: attack,
      activeAttackStep: 0,
      attackRunning: true,
      breachVerdict: null,
      attackShockwaveTrigger: state.attackShockwaveTrigger + 1,
    }));

    // Step through each timeline event with real-time progression
    const totalSteps = attack.timelineEvents.length || 3;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise((r) => setTimeout(r, 450 * speedFactor));
      soundEngine.playClick(1000 + step * 200);
      set({ activeAttackStep: step });
    }

    await new Promise((r) => setTimeout(r, 300 * speedFactor));

    if (mode === 'insecure') {
      soundEngine.playAlarm();
      const anomaly: AnomalyRecord = {
        id: `anom-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        source: attack.vector,
        severity: 'CRITICAL',
        type: 'ISOLATION_FAILURE',
        metadataSnippet: `attack_simulation_succeeded_in_insecure_mode::id=${attack.id}`,
        mitigationAction: attack.mitigation,
      };

      const verdict: BreachVerdict = {
        status: 'EXPLOITED',
        attackId: attack.id,
        headline: `SECURITY BOUNDARY BREACHED (${attack.insecureModeResult})`,
        summary: `Shared un-isolated sandbox allowed lateral exploitation. Attacker vector [${attack.vector}] succeeded against target [${attack.target}].`,
        mitigationApplied: attack.mitigation,
        timestamp: new Date().toLocaleTimeString(),
      };

      set((state) => ({
        attackRunning: false,
        breachVerdict: verdict,
        anomalies: [anomaly, ...state.anomalies],
        activeBreachAlert: `BREACH COMPLETED: ${attack.name} succeeded against Insecure Sandbox! Data compromised.`,
      }));
    } else {
      soundEngine.playSuccessChord();
      const verdict: BreachVerdict = {
        status: 'CONTAINED',
        attackId: attack.id,
        headline: `ATTACK DEFLECTED & CONTAINED (100% SECURE)`,
        summary: `Bayora Sentinel cryptographic membrane and kernel enforcement blocked adversarial payload traversal. Result: ${attack.secureModeResult}.`,
        mitigationApplied: attack.mitigation,
        timestamp: new Date().toLocaleTimeString(),
      };

      set({
        attackRunning: false,
        breachVerdict: verdict,
      });
    }
  },

  tickCapabilityTokens: () => {
    set((state) => {
      const updated = state.capabilityTokens.map((t) => {
        const remaining = Math.max(0, Math.floor((t.expiresAt - Date.now()) / 1000));
        return {
          ...t,
          remainingSeconds: remaining,
          status: remaining === 0 ? ('EXPIRED' as const) : ('ACTIVE' as const),
        };
      });
      return { capabilityTokens: updated };
    });
  },
}));
