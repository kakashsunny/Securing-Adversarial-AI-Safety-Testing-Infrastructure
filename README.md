# BAYORA SENTINEL

**Secure Multi-Tenant Adversarial AI Safety Testing Control Plane & 3D Simulation Engine**

---

## 1. Overview & Problem Statement

In adversarial AI safety benchmarking (red-teaming), three mutually distrusting parties run concurrently in a shared cloud sandbox:
1. **Red Team (Attacker)**: Tries to discover bypasses, jailbreaks, and vulnerabilities.
2. **Blue Team (Defender)**: Evaluates prompts and attempts to filter or sanitize adversarial vectors.
3. **Model Enclave (LLM under Test)**: Processes queries to evaluate real safety boundaries.

### The Paradox:
- **Red Payloads** must stay hidden from the Blue Team prior to execution (preventing defensive bias).
- **Blue Defense Rules** must remain confidential (preventing Red from reverse-engineering classifier weights).
- **The Model** must remain uncontaminated (no cross-session attention leakage or KV-cache probe attacks).
- **Audit Findings** must be cryptographically immutable and tamper-evident (preventing benchmark score falsification).

**Bayora Sentinel** solves this with an **Arbiter Gateway** sole mediator architecture, **WebCrypto Commit-Reveal Cryptography**, **Ephemeral Session Salting**, **Timing Bucket Normalization**, and **SHA-256 Hash-Chained Audit Logs with Ed25519/ECDSA Signatures**.

---

## 2. Core Architecture & Security Invariants

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              BAYORA SENTINEL CORE                             │
│                                                                               │
│  ┌─────────────────────────┐               ┌───────────────────────────────┐  │
│  │   RED TEAM ENCLAVE      │  Commit Hash  │      BLUE TEAM ENCLAVE        │  │
│  │   (red-net:8000)        │──────────────►│      (blue-net:8000)          │  │
│  │   SHA-256(P || Nonce)   │               │      Verdict: ALLOW/BLOCK     │  │
│  └────────────┬────────────┘               └───────────────┬───────────────┘  │
│               │                                            │                  │
│               ▼                                            ▼                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                      ARBITER GATEWAY (Sole Mediator)                    │  │
│  │  - Commit-Reveal Verifier (WebCrypto SHA-256)                           │  │
│  │  - Latency Normalization Engine (200ms Fixed Buckets)                   │  │
│  │  - Ephemeral Session Salt Dispatcher (cache_salt_xxx)                   │  │
│  │  - Append-Only Hash-Chained Audit Ledger (ECDSA Signed)                 │  │
│  └────────────────────────────────────┬────────────────────────────────────┘  │
│                                       │                                       │
│                                       ▼                                       │
│                        ┌───────────────────────────────┐                      │
│                        │      MODEL ENCLAVE (LLM)      │                      │
│                        │      (model-net:8000)         │                      │
│                        │      Gemini 3.8 Flash         │                      │
│                        └───────────────────────────────┘                      │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Security Guarantees:
1. **WebCrypto Commit-Reveal**: Red commits $H = \text{SHA-256}(P \parallel N)$. Blue only sees the plaintext $(P, N)$ after locking in its verdict.
2. **Verdict-Only Defense**: Blue returns categorical enums only (`ALLOW`, `BLOCK`, `SANITIZE`); internal heuristics remain confidential.
3. **Ephemeral Model Sessions**: Inferences run with random per-tenant cache salts; activations are zeroized upon round termination.
4. **Timing Normalization Shield**: Padded into discrete 200ms buckets to eliminate timing side-channels against classifier execution depth.
5. **Tamper-Evident Ledger**: Every finding is hash-chained ($H_n = \text{SHA-256}(H_{n-1} \parallel \text{Entry}_n)$) and signed.
6. **Canary Honeytokens**: Embedded trap tokens detect unauthorized data leaks across tenant boundaries.

---

## 3. Dedicated Control Plane Centers

- **Arena**: 3D spatial WebGL scene visualizing glass hexagonal enclaves, rotating Arbiter core, forcefield isolation membranes, and real-time animated light packets.
- **Breach Lab**: Interactive launcher for 7 attack simulations (*KV-Cache Probe*, *Timing Side-Channel*, *Network Pivot*, *Secret Read*, *Canary Exfiltration*, *Container Escape*, *Log Tampering*) with 3D membrane shockwaves and forensic result cards.
- **Audit Chain**: Glowing horizontal blockchain ledger with an interactive "Tamper Block" trigger, "Verify Full Chain" diagnostics, and "Replay Finding" verification.
- **Commit-Reveal Timeline**: Visual cryptographic pre-image proof and in-browser WebCrypto calculator.
- **Leakage Monitor**: Circular 0-100% risk gauge, canary token status grid, Recharts latency variance histogram, and metadata-only anomaly log.
- **Access & Network**: Capability tokens table with live countdown timers, ABAC policy matrix, and Docker internal network bridge rules.
- **Threat Model**: Matrix of protected vs unmitigated vectors with an interactive 6-axis residual risk radar.
- **Datasets & Intel**: 8 standardized safety benchmarks (AdvBench, JailbreakBench, HarmBench, ToxiGen, Gandalf/Lakera, NVD/CVE, DARPA Provenance, Anthropic HH-RLHF).
- **Audit Report**: Executive security scorecard, one-click mock/real JSON export, and printable visual PDF layout.

---

## 4. Hardened Docker PoC Infrastructure

The codebase includes complete, copyable Docker Compose production artifacts:
- `docker-compose.yml`: Air-gapped `internal: true` bridges (`red-net`, `blue-net`, `model-net`, `audit-net`).
- `arbiter/main.py`: FastAPI gateway mediator with commit-reveal and Merkle roots.
- `seccomp.json`: Syscall filter blocking `sys_mount`, `unshare`, `clone3`, and `ptrace`.
- `demo.sh`: Test suite running `make demo` to verify 6 isolation invariants.

---

## 5. Demo Video Walkthrough Script (2-3 Minutes)

Use this step-by-step guide when recording a product demonstration video of Bayora Sentinel:

### [0:00 - 0:30] Introduction & 3D Arena
- **Visual**: Start on the **Arena** tab with 3D camera slowly rotating around the glowing Red, Blue, and Model enclaves and central gold Arbiter Core.
- **Narration**: *"Welcome to Bayora Sentinel — a high-security control plane for adversarial AI safety testing. When Red and Blue teams run simultaneous tests against an LLM, isolation is paramount. Red must not leak payloads before tests, Blue's defense rules must stay hidden, and findings must be tamper-evident."*
- **Action**: Click **"Run Full Evaluation"** in the top navigation bar. Watch the animated light packets stream between enclaves across the 4 phases: `COMMIT` $\rightarrow$ `TEST` $\rightarrow$ `VERDICT` $\rightarrow$ `REVEAL`.

### [0:30 - 1:00] Insecure Sandbox vs Bayora Secure Mode
- **Visual**: Toggle to **"Insecure Mode"** in the top navigation bar.
- **Narration**: *"Watch what happens in a standard shared sandbox without Bayora: the isolation membranes dissolve, crimson particle fog bleeds across enclaves, and canary trap tokens immediately trigger critical leakage alerts."*
- **Action**: Switch back to **"Bayora Secure"**. Point out that the leakage risk drops to **0.0%** and forcefield membranes re-engage.

### [1:00 - 1:40] Breach Simulation Lab
- **Visual**: Navigate to the **Breach Lab** tab.
- **Narration**: *"In the Breach Lab, we simulate 7 distinct attack vectors against the sandbox itself — from KV-cache prefix snooping to timing side-channels."*
- **Action**: Click **"Launch"** on **Timing Side-Channel Analysis** and **Network Pivot**. Show the 3D membrane deflection shockwave, the eBPF kernel event log, and the forensic breakdown comparing secure vs insecure results.

### [1:40 - 2:15] Audit Chain & Live Tamper Injection
- **Visual**: Navigate to the **Audit Chain** tab.
- **Narration**: *"Every finding is sealed into an append-only SHA-256 hash-chained ledger signed with Arbiter ECDSA keys."*
- **Action**: Click **"Simulate Tamper on Block #1"**. Point out how downstream blocks instantly turn red and the system flags a broken link.
- **Action**: Click **"Verify Full Chain"** to isolate the exact corrupted block, then click **"Restore Authentic State"** (celebratory confetti appears!).

### [2:15 - 2:45] Leakage Monitor, Datasets & Export Report
- **Visual**: Quickly showcase **Leakage Monitor** (latency histogram) and **Datasets & Intel** (AdvBench, HarmBench, JailbreakBench links).
- **Visual**: Navigate to the **Audit Report** tab.
- **Narration**: *"Finally, compliance teams can export full cryptographic findings as signed JSON files or generate clean printable PDF evaluation summaries with one click."*
- **Action**: Click **"Export JSON File"** and **"Print PDF Report"**.

---

## 6. Local Development & Deployment

```bash
# Install dependencies
npm install

# Start full-stack development server with server-side Gemini 3.8 Flash proxy
npm run dev

# Build for production
npm run build
npm start
```

---
*Built with React 19, TypeScript, Tailwind CSS, Three.js, React Three Fiber, Zustand, Recharts, and WebCrypto.*
