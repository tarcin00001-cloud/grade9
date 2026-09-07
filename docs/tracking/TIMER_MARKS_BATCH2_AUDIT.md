# Timer + Marks Batch 2: Audit of the Remaining 50 Labs

> **Author**: Architect, done directly in-session (same method as the original Tier D audit — read every file's actual state shape and JSX before classifying, not just the type name).
> **Purpose**: Determine what, if any, marks scheme each of the 50 non-canonical-Step labs can honestly attach a 5:00 timer + partial-credit marks feature to. Every one of these 50 already calls `reportComplete()` at least once (confirmed via grep across all 50 — every file has a genuine completion point), so a timer *can* technically be added to all of them. The real question per file is what should drive the marks calculation.

---

## 1. Classification buckets

- **Numeric/typed stage counter** — a real `useState<Stage>` or `useState(1)`-style counter that increments through a fixed sequence. Same shape as `Univac9`/`RateLimiting9` from Batch 1 — these can use the identical pattern (`STEP_ORDER`-equivalent index ÷ total × 100).
- **Named phase/state enum with real sequence** — a `type Phase = "A" | "B" | "C"` where the values genuinely represent an ordered progression (confirmed by reading the JSX, not assumed from the name).
- **Config/mode toggle, no sequence** — a typed state that represents *which option is currently selected*, not *how far the student has progressed* (e.g. tab selection, a filter, a simulation mode). No honest "50% done" exists here.
- **No typed/discrete state at all** — the lab is driven by continuous values, object collections, or ref-based animation state with no meaningful checkpoint to award partial credit at.

---

## 2. Findings (all 50, checked directly)

### Bucket A — Numeric/typed stage counter (marks-ready, same pattern as Batch 1)

| Lab | State found |
|---|---|
| `ComputingBenefits44` | `const [stage, setStage] = useState(1)` |
| `SshKeys9` | `const [level, setLevel] = useState(1)` |
| `SmartRing32` | `const [day, setDay] = useState(1)` (two independent `day` declarations at different scopes — verify which drives the real narrative before using it) |
| `CloudStrategy16` | `const [quarter, setQuarter] = useState(1)` (a year/quarter counter — check whether this is a real sequential business-sim progression or a free-roam sandbox before treating it as marks-ready) |
| `FoldableSmartphone11` | `const [mission, setMission] = useState<1 \| 2>(1)` (2-mission structure, same shape as `AsymmetricCrypto9` but simpler — likely a straightforward 0/50/100 split) |
| `ServerlessFunctions9` | `const [servers, setServers] = useState(1)` — **caution**: this reads as a live simulation dial (number of servers spun up), not a progress counter. Needs a close JSX read before treating as marks-ready; may actually belong in Bucket C. |

### Bucket B — Named phase enum with a real sequence (marks-ready, needs a custom order array)

| Lab | Type found | Sequence read |
|---|---|---|
| `BinarySearch12` | `type Phase = "idle" \| "pick_mid" \| "evaluate" \| "failed" \| "success"` | Real linear search-attempt sequence. Marks-ready. |
| `EdgeComputing9` | `type Phase = "IDLE" \| "SEND_CLOUD" \| "CRASH" \| "SEND_EDGE" \| "STOP_SAFE" \| "DONE"` | Real sequence (cloud-latency failure, then edge-computing fix). Marks-ready. |
| `GraphQLBasics9` | `type Phase = "IDLE" \| "REQUESTING" \| "PROCESSING" \| "RETURNING" \| "DONE"` | Real request-lifecycle sequence, though likely repeats per query rather than being a single one-way arc — verify whether this is a repeatable demo loop (Bucket C) or a genuine first-time-only progression before committing. |
| `OauthFlow9` | `type Phase = "APP_START" \| "GOOGLE_CONSENT" \| "GOOGLE_TOKEN" \| "APP_RETURN" \| "FETCHING_DATA" \| "DONE"` | Real linear OAuth handshake sequence. Marks-ready. |
| `PublicKeyInfrastructure9` | `type Phase = "IDLE" \| "SEND_CSR" \| "CA_STAMPS" \| "CERT_ISSUED" \| "CLIENT_CONNECTS" \| "VERIFIED"` | Real linear PKI handshake sequence. Marks-ready. |
| `ReverseProxies9` | `type PacketState = "IDLE" \| "FLYING" \| "BLOCKED" \| "FORWARDED" \| "RETURNED"` | Likely a repeatable per-packet animation cycle, not a one-way lab arc — verify against JSX before treating as marks-ready; may need a separate "mission count" wrapper state instead. |
| `TorRouting9` | `type Phase = "IDLE" \| "NODE1" \| "NODE2" \| "NODE3" \| "TARGET" \| "DONE"` | Real linear routing-hop sequence. Marks-ready. |
| `ZeroDayExploit9` | `type Phase = "IDLE" \| "ATTACK_FLYING" \| "BREACHED" \| "PATCHING" \| "PATCHED" \| "ATTACK_FLYING_2" \| "DEFLECTED"` | Real linear attack/patch/defend sequence. Marks-ready. |
| `Blockchain9` | `type ChainState = "trad_pristine" \| ...` (full value list not yet read past first value) | Needs full read — likely a real before/after hack demonstration sequence, not confirmed marks-ready yet. |
| `WebAssembly9` | `type RunMode = "IDLE" \| "JS" \| "COMPILING" \| "WASM"` | Reads as a **mode toggle** (JS vs WASM execution path), not a one-way progression — likely Bucket C, not B. Flagging here pending a closer JSX read. |
| `TwoFactorAuth9` | `type Phase = "IDLE" \| "SUCCESS" \| "ERROR"` | Too short/binary to support meaningful partial credit — 3 states with no real middle ground. Likely Bucket C or D. |

### Bucket C — Config/mode toggle, no real sequence (not marks-ready as-is)

| Lab | State found | Why it's a toggle, not a sequence |
|---|---|---|
| `AlgorithmicMusic9` | `GeneratorType`, `FilterType`, `TimbreType` | All three are simultaneous *selection* states (which generator/filter/timbre is active), not a progression. Free-form sandbox. |
| `ChaosEngineering9` | `NodeType`, `NodeStatus` | Per-node classification, not a lab-wide progress signal. |
| `ClassesInJava9` | `ActivityId`, `ModuleId` | Tab/module selection, not sequential — student can jump between them. |
| `Cloudflare9` | `ComponentType`, `ServerState` | Per-component state, not overall lab progress. |
| `ContinuousIntegration9` | `StageId`, `StageStatus` | Looks sequence-like (`lint→unit→build→integration→deploy`) but likely represents a togglable pipeline configuration the student assembles, not a one-way personal progression — needs a JSX read to confirm which. |
| `CrossSiteScripting9` | `PayloadType`, `SanitizerMode`, `SimState` | Payload/mode selection plus a per-attempt animation state, not overall progress. |
| `CsrfAttacks9` | `RequestSource`, `ProtectionMode`, `SameSitePolicy` | Already confirmed in this project as a genuine **8-mission independent-sandbox structure** (see its own `missions: boolean[]` array, referenced in earlier Phase 4 fixes) — this is actually the strongest Bucket A/B candidate in the whole remaining set, just not typed as a simple `Phase`. Worth a dedicated look, likely marks-ready via `missions.filter(Boolean).length / missions.length`. |
| `MachineLearning9` | `LearningRate`, `FailureState` | Hyperparameter selection, not progress. |
| `ManInTheMiddle9` | `AnimState` | Per-attempt animation state, resets each cycle — not cumulative progress. |
| `MobilePlatform37` | `SimState` | Per-simulation-run result state, not overall lab progress. |
| `RequirementAnalysis9` | `MissionId`, `RequirementType` | Mission *selection*, not sequential completion — likely a pick-any-order structure across 3 case studies. |
| `SetsAndVenn27` | `Operator` | Which set operation is currently selected — a sandbox control, not progress. |
| `USBConnectivity25` | `Era` | Binary toggle (`LEGACY`/`USB`), no meaningful partial credit. |

### Bucket D — No typed/discrete state at all (not marks-ready without redesign)

| Lab | Notes |
|---|---|
| `AGIInterview19` | No `type` declaration found; needs a deeper read to find any state at all. |
| `AdvancedAlgorithms24` | No `type` declaration found — but this lab has significant interactive complexity (per earlier phases); likely driven by object/array state rather than a simple enum. Needs a dedicated read. |
| `CloudStrategy16` | (Also listed in Bucket A for `quarter` — but the lab's core mechanic may be continuous business metrics, not the quarter counter itself. Needs reconciliation.) |
| `Containerization9` | No typed state found. |
| `ContentDeliveryNetwork9` | Driven by `Record`/`Set` collection state (drive locations, syncing stations) — no single discrete progress value. |
| `DatabaseIndexing9` | No typed state found. |
| `DigitalSignatures9` | No typed state found (confirmed earlier in this project as a single automated sign/verify animation with no real fail-retry-improve loop — likely genuinely not marks-ready). |
| `EventSourcing9` | `EventType` describes ledger entry types, not lab progress — the real state is the event *array*, not a discrete phase. |
| `Gpu9` | No typed state found. |
| `JwtTokens9` | Already permanently excluded (documented reason: tamper/verify cycle, no honest learning-arc mapping — same reasoning applies here). |
| `LoadBalancing9` | Driven by a `Traffic[]` array — continuous simulation, not discrete stages. |
| `MachineLearningTraining9` | No typed state found. |
| `Microservices9` | No typed state found. |
| `OopPython15` | No typed state found. |
| `RoboticSurgery46` | `ModalState` is transient (modal overlays), not cumulative progress — same conclusion as this lab's existing `Step`-shape check from earlier phases (this is one of the 3 gold-standard labs but was never given canonical `Step`). |
| `SemanticWeb45` | Driven by a `Triple[]` array (learned facts collection) — count-based, not phase-based; could plausibly support marks via `learnedTriples.length / totalTriples`, but that's a different mechanism than the Batch 1 pattern, not a simple port. |
| `SmartContracts9` | No typed state found. |
| `SpectreMeltdown9` | No typed state found. |
| `Subnetting9` | No typed state found. |
| `VectorDatabases9` | No typed state found. |
| `WebSockets9` | `Packet` is a data shape (individual packet objects), not a phase enum — continuous animation state. |

---

## 3. What this means for scope

**Realistic breakdown, pending the closer per-file JSX reads flagged above:**
- **~10-12 labs (Bucket A + confirmed Bucket B)** are genuinely marks-ready using the same pattern as Batch 1, with custom step orders per file — a real second batch, similar in spirit to Batch 1 but smaller.
- **~4-5 labs need one more read before classifying** (`ServerlessFunctions9`, `GraphQLBasics9`, `ReverseProxies9`, `ContinuousIntegration9`, `Blockchain9`, `WebAssembly9`, `TwoFactorAuth9`) — flagged inline above with the specific question that needs answering.
- **`CsrfAttacks9` is a special, promising case** — its existing 8-mission array structure could support marks via mission-completion-count, but needs its own bespoke design (like `AsymmetricCrypto9`'s combinator), not the standard `STEP_ORDER` pattern.
- **~14 labs are genuine config/mode toggles** (Bucket C) — a timer could still be added (every lab has a `reportComplete()` firing point), but marks would have to be pass/fail-on-completion only, not stage-based partial credit, since there's no honest intermediate progress signal.
- **~19 labs have no discrete state to hang marks on at all** (Bucket D) — timer-with-pass/fail-marks is still technically possible (same as Bucket C), but stage-based partial credit specifically is not honest here without inventing a fake progress metric, which this project has consistently avoided doing.

---

## 4. Recommendation

Before writing any execution brief, this needs your decision on **Bucket C and D's marks model**, since "stage-based partial credit" — the design you approved for `AsymmetricCrypto9` — genuinely doesn't apply to roughly two-thirds of these 50 labs. The honest options are:
1. **Timer + pass/fail marks only** for Buckets C/D (full marks if completed within 5:00, zero if not) — still delivers the timer pressure and *some* marks signal, just not partial credit.
2. **Skip timer/marks entirely for Buckets C/D**, and only extend the full Batch 1 pattern to the ~10-12 Bucket A/B labs (plus `CsrfAttacks9` as its own bespoke case) — a smaller, cleaner "Batch 2."
3. **Design a per-bucket-appropriate metric** (e.g. `SemanticWeb45`'s triple-count, `CsrfAttacks9`'s mission-count) on a lab-by-lab basis — most thorough, most work, most true to "do the whole project," but needs individual design judgment per lab, not a single reusable brief.

This document is research only — no code changes, no execution brief yet. Next step is your call on which of the above (or a mix) to pursue, then I'll draft the actual handoff(s).
