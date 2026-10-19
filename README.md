# 🛡️ Bayora Sentinel
### Cryptographically Isolated Adversarial AI Safety Evaluation Control Plane

[![Security Posture](https://img.shields.io/badge/Security%20Posture-Zero--Leakage%20Enclaves-06b6d4?style=for-the-badge&logo=shield)](https://github.com)
[![Cryptography](https://img.shields.io/badge/Cryptography-SHA--256%20Commit--Reveal-10b981?style=for-the-badge&logo=lock)](https://github.com)
[![Kernel Defense](https://img.shields.io/badge/Kernel%20Defense-eBPF%20%2B%20Seccomp-8b5cf6?style=for-the-badge&logo=linux)](https://github.com)
[![Audit Ledger](https://img.shields.io/badge/Audit%20Ledger-Merkle%20Chain%20(ECDSA)-f59e0b?style=for-the-badge&logo=blockchain)](https://github.com)
[![License](https://img.shields.io/badge/License-Apache--2.0-ec4899?style=for-the-badge)](./LICENSE)

> **Red Team. Blue Team. One LLM. Zero trust between them.**
> Bayora Sentinel lets you red-team adversarial models without either side leaking proprietary defense rules, model internals, or evaluation data to the other.

📽️ **[Watch the 2-minute demo](#)** · 🚀 **[Try the live deployment](#)** · 📊 **[Read the architecture deep-dive](#-mathematical--cryptographic-foundations)**

<!-- Replace the three links above with real URLs before submission. A live demo link is the single highest-leverage addition you can make. -->

---

## 📑 Table of Contents
- [The Problem](#-the-problem-ai-red-teaming-has-a-trust-gap)
- [What Bayora Does](#-what-bayora-does)
- [Architecture](#️-system-topology--zero-trust-architecture)
- [Cryptographic Foundations](#-mathematical--cryptographic-foundations)
- [Control Plane Centers](#️-the-10-control-plane-centers)
- [Quickstart](#-quickstart)
- [Tech Stack](#-tech-stack)
- [Benchmarks Supported](#-supported-adversarial-benchmarks--corpora)
- [Known Limitations](#-known-limitations--threat-model-boundaries)
- [Roadmap](#-roadmap)
- [Team](#-team)
- [License](#-license--citation)

---

## 🎯 The Problem: AI Red-Teaming Has a Trust Gap

Regulatory pressure (EU AI Act, NIST AI RMF, Executive Order 14110) is pushing every org deploying generative AI toward mandatory adversarial evaluation. But most red-teaming setups run attacker and defender in the same trust domain, which creates real failure modes:

| Vulnerability | Why it matters |
|---|---|
| **Lateral memory exfiltration** | Multi-tenant LLM sandboxes can retain KV-cache/activation state across sessions, leaking context between red and blue sides. |
| **Defense rule snooping** | Adaptive probing lets an attacker reverse-engineer a defender's detection logic over many queries. |
| **Timing side-channels** | Raw response-latency variance can leak a safety classifier's confidence signal. |
| **Mutable audit logs** | Post-hoc evaluation reports can be edited after the fact, undermining compliance evidence. |

Bayora's premise: **the red team and blue team should never be able to observe each other's internals, and the evaluation record should be provably tamper-evident.**

---

## 💡 What Bayora Does

Bayora is a control plane that runs adversarial LLM evaluations across physically isolated enclaves, mediated by a cryptographic arbiter. Concretely, it gives you:

- **Commit-reveal evaluation flow** — the attacker's payload is cryptographically committed before the defender ever sees a verdict, preventing either side from adapting after the fact.
- **Timing-jitter normalization** — response latency is quantized so neither side can infer internals from microsecond variance.
- **An append-only Merkle audit chain** — every test result is cryptographically chained and signed, so tampering is immediately detectable.
- **Network-level isolation** — red, blue, and model components run on separate unroutable Docker bridges, not just logical sandboxing.

---

## 🖼️ Screenshots

<!-- Add 2–4 real screenshots or a GIF here before submission — judges weight visual proof of a working build heavily. -->
`[ screenshot: Breach Simulation Lab ]`  `[ screenshot: Tamper-Evident Audit Chain ]`  `[ screenshot: 3D Enclave Arena ]`

---

## 🏛️ System Topology & Zero-Trust Architecture

Four enclaves communicate exclusively through an air-gapped arbiter:

```
                  ┌─────────────────────────────────────┐
                  │          RED TEAM ENCLAVE            │
                  │   Isolated Bridge: 172.28.1.0/24     │
                  │  (Adversarial Prompt Generator)      │
                  └──────────────────┬────────────────────┘
                                     │
                         1. COMMIT: SHA-256(P || N)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          ARBITER GATEWAY CORE                           │
│  • Multi-homed network membrane (internal: true, unroutable bridges)    │
│  • Cryptographic commit-reveal state machine                            │
│  • Discrete latency quantization (200ms bucket jitter normalization)    │
│  • eBPF syscall filter & seccomp runtime enforcement                    │
│  • Append-only Merkle audit chain with ECDSA block signatures           │
└──────────────┬───────────────────────────────────────────┬──────────────┘
               │                                           │
  2. TEST: Salted Payload                     3. VERDICT: Categorical Only
               ▼                                           ▼
┌───────────────────────────────┐           ┌─────────────────────────────┐
│      MODEL ENCLAVE (LLM)      │           │      BLUE TEAM ENCLAVE       │
│ Isolated Bridge: 172.28.3.0/24│           │ Isolated Bridge: 172.28.2.0/24│
│ • Per-session cache salting   │           │ • Defense heuristics hidden  │
│ • Ephemeral zeroized context  │           │ • Output: ALLOW/BLOCK/SANITIZE│
└───────────────────────────────┘           └─────────────────────────────┘
```

The defender never sees the raw payload before committing a verdict; the attacker never sees the defense logic, only a categorical result.

---

## 📐 Mathematical & Cryptographic Foundations

### 1. Pre-image-resistant commit-reveal
Red generates a 128-bit nonce $N$ and commits payload $P$ as:

$$H = \text{SHA-256}(P \parallel \texttt{"::nonce::"} \parallel N)$$

- **Hiding**: Blue cannot recover $P$ from $H$ — SHA-256 pre-image search is a $2^{256}$ problem.
- **Binding**: Red cannot swap $P$ after seeing Blue's verdict without a SHA-256 collision ($2^{128}$ work).

### 2. Timing side-channel normalization
Response time is quantized into discrete buckets with bounded noise so clock jitter can't leak internal state:

$$T_{\text{normalized}} = \left\lceil \frac{T_{\text{raw}} + \Delta_{\text{jitter}}}{200} \right\rceil \times 200, \quad \Delta_{\text{jitter}} \in [0, 15)\text{ms}$$

### 3. Append-only Merkle audit chain
Each finding is chained to the previous block's hash and signed:

$$H_n = \text{SHA-256}(H_{n-1} \parallel \text{Index} \parallel \text{PayloadCommit} \parallel \text{Verdict} \parallel \text{Nonce} \parallel \text{Timestamp})$$
$$S_n = \text{Sign}_{\text{ECDSA-P256}}(\text{PrivKey}_{\text{Arbiter}}, H_n)$$

Modifying block $k$ breaks every subsequent hash ($\forall i > k,\ \text{Hash}_i \neq \text{ExpectedHash}_i$), so tampering is detected immediately rather than discovered in a post-hoc audit.

---

## 🎛️ The 10 Control Plane Centers

| # | Center | What it does |
|---|---|---|
| 01 | **3D Spatial Arena** | Real-time WebGL visualization of enclave boundaries and live packet flow (Three.js, with a 2D mobile fallback). |
| 02 | **Breach Simulation Lab** | 7 live attack vectors — timing side-channel, activation bleed, kernel escape — with eBPF trace output. |
| 03 | **Custom Payload Sandbox** | Hardware-accelerated WebCrypto SHA-256 prover; dispatch custom payloads straight to the Arbiter. |
| 04 | **Tamper-Evident Audit Chain** | Interactive Merkle ledger — tamper a block, watch the chain break, then self-heal on restore. |
| 05 | **Commit-Reveal Engine** | Step-by-step explorer of the 4-phase protocol and its security invariants. |
| 06 | **Leakage & Side-Channel Monitor** | 6 synthetic canary tokens with live latency-normalization comparison. |
| 07 | **Access & Network Segmentation** | Short-lived Ed25519 capability tokens with live countdown + unroutable bridge rules. |
| 08 | **Threat Model & Residual Risk** | Honest 6-axis risk radar: what's protected, what isn't, and why. |
| 09 | **Hardened Docker PoC** | Inspectable Compose manifests, non-root seccomp profiles, automated test suite. |
| 10 | **Datasets & Compliance Report** | Cross-references HarmBench / JailbreakBench / MITRE ATLAS; exports signed JSON/PDF reports. |

---

## 🚀 Quickstart

**Prerequisites:** Node.js ≥ 18, npm ≥ 9, Docker (for the container isolation PoC)

```bash
git clone https://github.com/your-org/bayora-sentinel.git
cd bayora-sentinel
npm install
npm run dev        # http://localhost:3000
```

**Production build:**
```bash
npm run build
npm run lint
```

**Run the container isolation proof-of-concept:**
```bash
docker compose -f docker-compose.poc.yml up --build
```

### 60-second judge walkthrough
1. In the top navbar, leave **Insecure Mode** selected → open **Breach Simulation Lab** → run *Side-Channel Timing Probe*. Expect **`EXPLOITED ❌`**.
2. Toggle to **Bayora Secure** → run the same simulation. Expect **`BLOCKED ✅`**, with latency quantized into 200ms buckets.
3. Open **Tamper-Evident Audit Chain** → click **Tamper Block #1** (chain breaks) → **Restore Authentic State** (chain self-heals).

---

## 🧰 Tech Stack

<!-- Fill in the real stack — this is what judges scan for feasibility. -->
- **Frontend:** React / Three.js (WebGL arena)
- **Crypto:** WebCrypto API (client-side SHA-256), ECDSA-P256 (Arbiter signing)
- **Isolation:** Docker Compose with `internal: true` bridges, eBPF + seccomp
- **Audit storage:** Append-only Merkle chain, JSON/PDF export

---

## 📚 Supported Adversarial Benchmarks & Corpora

- **JailbreakBench** (NeurIPS 2024) — standardized adversarial behaviors across forbidden-use categories.
- **HarmBench** (Center for AI Safety) — automated red-teaming across standard, contextual, and cyberattack vectors.
- **AdvBench** (Zou et al.) — canonical harmful-behavior strings for gradient-based attack baselines.
- **MITRE ATLAS** — adversarial threat tactics (AML.T0051–AML.T0057).
- **OWASP Top 10 for LLMs** — defense mappings for LLM01–LLM06.

---

## ⚠️ Known Limitations & Threat Model Boundaries

Being specific about what Bayora *doesn't* claim to solve is part of the engineering case:

- Timing normalization reduces but does not mathematically eliminate side-channel leakage at extreme sampling volumes.
- The commit-reveal protocol protects payload confidentiality pre-verdict; it does not itself prevent a sufficiently resourced adversary from inferring model behavior through black-box querying over many rounds.
- eBPF/seccomp enforcement is scoped to the PoC's container boundary, not a full hardware enclave (e.g., SGX/TDX) — see the roadmap below.
- This is a hackathon-stage implementation; it has not undergone third-party security audit.

---

## 🗺️ Roadmap

- [ ] Hardware TEE (SGX/TDX) backing for the Model Enclave
- [ ] Multi-model concurrent evaluation
- [ ] Formal verification of the commit-reveal state machine
- [ ] Third-party security audit

---

## 👥 Team — Sirius

- **K Akash**
- **Gagana B M**
- **Harshini B**

<!-- Add a one-line role/background per member if you want extra credibility, e.g. "— Backend & crypto architecture" -->

---

## 📄 License & Citation

Apache-2.0 License.

```bibtex
@software{bayora_sentinel_2026,
  author = {Bayora Sentinel Team},
  title = {Bayora Sentinel: Cryptographically Isolated Adversarial AI Safety Evaluation Control Plane},
  year = {2026},
  publisher = {GitHub},
  url = {https://github.com/your-org/bayora-sentinel}
}
```

---

<p align="center">
  <sub>Built for Srujana 2026 · Chanakya University, Bengaluru</sub>
</p>
