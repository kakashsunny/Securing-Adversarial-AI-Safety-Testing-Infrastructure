# Implementation Plan: 3-Minute Hackathon Demo Script (`demoreadme.md`)

## 1. Goal & Requirements
Create a comprehensive, production-grade `demoreadme.md` containing an exact, word-for-word 3-minute demo video script tailored to win hackathons. It focuses on the high-impact contrast between standard vulnerable LLM sandboxes (Insecure Mode) and Bayora Sentinel's air-gapped cryptographic containment (Secure Mode).

---

## 2. Script Structure & Timecodes (Total: 3:00)

### Segment 1: The Problem & The Hook (0:00 - 0:35)
- **Speaker**: "Every AI red-teaming platform today leaks defensive patterns or suffers from cross-tenant memory side-channels. Watch what happens in a standard shared sandbox."
- **On-Screen Action**: Start on 3D Arena in Insecure Mode, trigger an exploit and show canary token leaks.

### Segment 2: Live Breach Simulation Lab & The Attack Shockwave (0:35 - 1:15)
- **Speaker**: "In our Breach Simulation Lab, we test 7 live adversarial attack vectors—from side-channel timing attacks to privilege escalation."
- **On-Screen Action**: Switch to Breach Simulation Lab. Run the **Timing Side-Channel Probe** or **Cross-Tenant Context Exfiltration** in Insecure Mode (showing red alarm, compromised state) -> Switch live to **Bayora Secure Mode** -> Launch attack -> Show the green 100% CONTAINED verdict banner and eBPF kernel deflection.

### Segment 3: The 3D Spatial Arena & Cryptographic Commit-Reveal (1:15 - 2:00)
- **Speaker**: "How does Bayora Sentinel guarantee zero leakage? Using a 4-phase cryptographic commit-reveal protocol with air-gapped network bridges."
- **On-Screen Action**: In 3D Arena, click **Step Single Test** or **Run Full Evaluation**. Show Red Enclave submitting SHA-256 commit hash, Blue rendering blind verdict, and Arbiter enforcing 200ms discrete timing buckets.

### Segment 4: Tamper-Proof Audit Blockchain & Custom Prover (2:00 - 2:40)
- **Speaker**: "Every test verdict is permanently recorded in a SHA-256 hash-chained audit blockchain with zero-knowledge replayability."
- **On-Screen Action**: Switch to **Tamper-Proof Audit Chain**. Click **Tamper Block #2** -> Watch the chain flash red as verification fails -> Click **Restore & Self-Heal** -> Switch to **Payload Sandbox** to prove a custom adversarial prompt.

### Segment 5: Enterprise Compliance & Winning Closing (2:40 - 3:00)
- **Speaker**: "With exportable PDF compliance scorecards, eBPF kernel enforcement, and zero residual leakage, Bayora Sentinel sets the new gold standard for adversarial LLM evaluation."
- **On-Screen Action**: Navigate to **Audit Report**, show the 100% defense score, download PDF/JSON, and display the final Bayora Sentinel logo.

---

## 3. Bonus Sections in `demoreadme.md`
- **Recording & Audio Setup Guide** (OBS settings, screen resolution, mic settings).
- **Judge FAQ & Killer Answers** (Addressing common questions on latency overhead, scalability, WebCrypto security).
- **30-Second Elevator Pitch** for in-person judging rounds.

---

## 4. Implementation Steps
1. Write the complete, formatted `demoreadme.md` to the workspace root.
2. Verify all applet routes and features match the script perfectly.
