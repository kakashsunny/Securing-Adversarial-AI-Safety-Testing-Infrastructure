export type EnclaveType = 'RED' | 'BLUE' | 'MODEL' | 'ARBITER' | 'AUDITOR';

export type TestPhase = 'IDLE' | 'COMMIT' | 'TEST' | 'VERDICT' | 'REVEAL' | 'COMPLETED';

export type VerdictType = 'ALLOW' | 'BLOCK' | 'SANITIZE';

export type BenchmarkCategory =
  | 'prompt-injection'
  | 'roleplay-bypass'
  | 'encoding-tricks'
  | 'multi-turn'
  | 'context-leakage';

export interface BenchmarkDataset {
  id: string;
  name: string;
  organization: string;
  url: string;
  description: string;
  focusArea: string;
  totalSamples: string;
  keyCategories: string[];
  integrationInBayora: string;
}

export interface RedPayload {
  id: string;
  category: BenchmarkCategory;
  datasetSource?: string;
  name: string;
  benignPrompt: string;
  nonce: string;
  commitHash: string;
  canaryId?: string;
  canarySecret?: string;
  timestamp: string;
}

export interface BlueRule {
  id: string;
  name: string;
  category: BenchmarkCategory;
  pattern: string;
  action: VerdictType;
  canaryId?: string;
  active: boolean;
}

export interface AuditBlock {
  index: number;
  timestamp: string;
  prevHash: string;
  entryHash: string;
  entryJSON: string;
  signature: string;
  merkleRoot: string;
  status: 'VALID' | 'TAMPERED' | 'CORRUPTED';
  roundNumber: number;
  testId: string;
  commitHash: string;
  verdict: VerdictType;
  modelSessionId: string;
  revealedPayloadSnippet: string;
  tamperedField?: string;
  originalHash?: string;
}

export interface CanaryToken {
  id: string;
  token: string;
  plantedIn: 'RED_PAYLOAD' | 'BLUE_RULE' | 'SYSTEM_SECRET' | 'MODEL_CACHE';
  ownerTenant: 'red-team' | 'blue-team' | 'model-enclave' | 'arbiter-core';
  plantedAt: string;
  leakedAt?: string;
  detectedLocation?: string;
  status: 'SECURE' | 'LEAKED';
  severity: 'HIGH' | 'CRITICAL';
}

export interface CapabilityToken {
  id: string;
  tenant: 'red-team' | 'blue-team' | 'auditor-agent' | 'model-runner';
  scopes: string[];
  issuedAt: number;
  expiresAt: number;
  remainingSeconds: number;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  signaturePreview: string;
  tokenString: string;
}

export interface AttackSimulation {
  id: string;
  name: string;
  category: 'SIDE_CHANNEL' | 'NETWORK' | 'CACHE' | 'INTEGRITY' | 'ESCAPE' | 'EXFIL';
  vector: string;
  target: string;
  description: string;
  mitigation: string;
  detectionMethod: string;
  confidence: number;
  residualRisk: string;
  secureModeResult: 'BLOCKED' | 'DEFLECTED' | 'PARTIAL_CONTAINMENT';
  insecureModeResult: 'EXPLOITED' | 'LEAKED' | 'BYPASSED';
  exploitLog: string[];
  timelineEvents: { step: string; timestamp: number; detail: string }[];
}

export interface LatencyRecord {
  id: string;
  roundNumber: number;
  testId: string;
  rawLatencyMs: number;
  normalizedLatencyMs: number;
  bucketMs: number;
  timestamp: string;
  jitterVariance: number;
}

export interface AnomalyRecord {
  id: string;
  timestamp: string;
  source: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: string;
  metadataSnippet: string; // Zero payload leakage: contains only metadata hashes/token IDs
  mitigationAction: string;
}

export interface TestRunResult {
  roundNumber: number;
  payload: RedPayload;
  modelResponse: string;
  verdict: VerdictType;
  defenseExplanation: string;
  revealedHashMatch: boolean;
  rawLatencyMs: number;
  normalizedLatencyMs: number;
  auditBlockIndex: number;
  timestamp: string;
}

export interface NetworkFlowPolicy {
  id: string;
  source: string;
  destination: string;
  network: string;
  action: 'ALLOW' | 'DENY';
  reason: string;
  securityZone: string;
}

export interface AbacPolicy {
  role: string;
  resource: string;
  allowedActions: string[];
  constraints: string;
  enforcedBy: string;
}

export interface ThreatModelItem {
  id: string;
  threat: string;
  category: string;
  protectedInBayora: boolean;
  mitigation: string;
  confidence: number;
  failureCondition: string;
  futureWork: string;
}
