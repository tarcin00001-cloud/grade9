# Phase 3 Kickoff Brief: 7-Step State Machine Standardization

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Drafted, not yet approved for execution. Present for review alongside the Phase 2B (Theme & Mobile) work already underway. This is a larger, higher-risk workstream than Phase 2B — read the risk section before agreeing to start it.

---

## 0. What this standardizes, and why it matters

`AGENTS.md`'s "Lab Flow" mandate and the master lab prompt both specify one canonical pedagogical shape every lab should follow:

```
Learn → Try → Fail safely → Understand why → Improve → Complete → See the outcome
```

The intended implementation is a single TypeScript type, literally named `Step`, with exactly these values:
```ts
type Step = 'LEARN' | 'TRY_MANUAL' | 'FAIL_OVERLOAD' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';
```

A full, code-level audit of all 59 catalog labs (run 2026-09-05, reproducible via the script in Section 5) found:

| Tier | Count | What it means |
|---|---:|---|
| **Exact match** | 1 | Type literally named `Step`, values exactly the 7 canonical strings, in order. |
| **`Step`-named, wrong values** | 7 | Uses the right type name but different/extra/missing stage values — inconsistent even with itself as a category. |
| **Right shape, wrong type name** | 4 | 5+ stages including a literal `LEARN` value, functionally close to canonical, but the type is called `Phase`, `Mission1Step`, or `LabStep` instead of `Step`. |
| **No canonical signal detected** | 47 | No literal `LEARN` string and no type named `Step`. Includes labs with a *real* narrative arc under an unrelated name (see caveat below) and labs with no lifecycle type at all (numeric index, boolean flags, tab strings). |

**This is a consistency and tooling gap, not a bug.** The student-facing experience in most of these 47 labs is fine — `ransomware9`, for example, has a completely legitimate 6-mission incident-response arc with real failure states, just under `type Phase` with mission-numbered values (`M1_LEARN`, `M1_FAILED`, `M2_FIREWALL`...) instead of the canonical type. The problem this phase solves is that **a future tool, lint rule, or agent grepping for `type Step` to find every lab's state machine finds exactly one hit out of 59** — the master prompt's own enforcement mechanism doesn't work today.

**Caveat on the "no signal" count**: 47 is the number of labs where my regex found no `type Step` and no literal `'LEARN'` string. It does **not** mean 47 labs lack any real lifecycle shape — `bufferoverflow9`'s `type SysState = 'IDLE' | 'PROCESSING' | 'CRASHED' | 'HIJACKED' | 'SECURED'` is a genuine crash→exploit→fix arc without ever using the word LEARN. Before starting work on any lab in the "no signal" tier, actually read its state type and judge whether it already has the right shape under a different vocabulary, or genuinely has none. Don't assume the count is precise at the individual-lab level; it's precise about what the automated check can detect.

---

## 1. The real per-tier data

### Tier A — Exact match (1 lab, no work needed)
`colossus28` — `type Step = 'LEARN' | 'TRY_MANUAL' | 'FAIL_OVERLOAD' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';`. **Use this file as the reference implementation** for what "done" looks like structurally.

### Tier B — Type named `Step`, but values diverge (7 labs)
These already committed to the right type *name* — the fix here is reconciling values, which is lower-risk than a full rename since nothing referencing the type needs to change its import or declaration site.

| Slug | Current values | Gap from canonical |
|---|---|---|
| `hashfunctions9` | `LEARN, TRY_ORIGINAL, TRY_SNEAK, FAIL, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` | Splits `TRY_MANUAL` into two named sub-stages (`TRY_ORIGINAL`/`TRY_SNEAK`); `FAIL` not `FAIL_OVERLOAD`. |
| `symmetriccrypto9` | `LEARN, TRY_PUBLIC, FAIL_RAW, UNDERSTAND, IMPROVE, COMPLETE, SECURE_CHAT, OUTCOME` | Renamed `TRY_MANUAL`→`TRY_PUBLIC`, `FAIL_OVERLOAD`→`FAIL_RAW`; extra `SECURE_CHAT` stage after `COMPLETE`. |
| `aieducation22` | `LEARN, TRY_MANUAL, FAIL_OVERLOAD, UNDERSTAND, IMPROVE, BATCH_SCALE, OUTCOME` | Closest to canonical of this tier — only substitutes `COMPLETE` for an extra `BATCH_SCALE` stage. |
| `networkinterface31` | `LEARN, INIT_MAC, INIT_MEDIUM, TRY_RAW, FAIL_CPU, UNDERSTAND, IMPROVE, OUTCOME` | Two extra setup stages (`INIT_MAC`, `INIT_MEDIUM`) before `TRY`; missing a distinct `COMPLETE` before `OUTCOME`. |
| `datavisualization36` | `LEARN, TRY_RAW, FAIL_PIE, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` | Renamed `TRY_MANUAL`→`TRY_RAW`, `FAIL_OVERLOAD`→`FAIL_PIE` — otherwise a clean 1:1 match. |
| `jwttokens9` | `EXPLORE, TAMPERED, VERIFYING, REJECTED, ACCEPTED` | **Different case entirely** — the type is literally named `Step` but its values describe a JWT-tampering detection flow, not a learn/fail/improve lifecycle at all. This one needs a real design decision, not a rename (see Section 3). |
| `computingproject39` | `LEARN, FAIL_SCOPE, IMPROVE, COMPLETE, OUTCOME` | Missing a distinct `TRY_MANUAL` and `UNDERSTAND` stage — goes straight from `LEARN` to failing. |

### Tier C — Right shape, wrong type name (4 labs)
Lower-risk rename-only work: change the type name to `Step`, keep or lightly adjust values to match canonical.

| Slug | Current type name | Current values |
|---|---|---|
| `ethereumdao9` | `Phase` | `LEARN, ATTACK_RUNNING, HACKED, PATCHING, PATCH_RUNNING, SECURED, GOVERNANCE, COMPLETED` |
| `quantumcomputing9` | `Phase` | `LEARN, FAIL, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` — closest to canonical in this tier, just missing a distinct `TRY_MANUAL`. |
| `asymmetriccrypto9` | `Mission1Step` | `LEARN, TRY, FAIL, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` — note this file also has a second, incompatible `Mission2Step` type; both need reconciling or the mission split needs a documented reason to stay separate. |
| `gesturecontrol40` | `LabStep` | `LEARN, TRY, FAIL, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` — matches canonical shape almost exactly, `TRY`/`FAIL` are abbreviated forms of `TRY_MANUAL`/`FAIL_OVERLOAD`. |

### Tier D — No canonical signal (47 labs)
This is the large, high-effort tier. **Do not treat this as one uniform batch.** Sub-classify each lab into one of three buckets before touching it:
1. **Real narrative shape, different vocabulary** (e.g. `ransomware9`'s `type Phase` with `M1_LEARN...M6_HARDENING`, `bufferoverflow9`'s `type SysState` with `IDLE→PROCESSING→CRASHED→HIJACKED→SECURED`) — these need a value/name mapping, similar in spirit to Tier C, just not yet detected by the automated check because they don't use the word LEARN or the name Step.
2. **Mission-board / multi-track labs** (e.g. `csrfattacks9`'s 8-mission progression, `itsupport18`'s arcade shift-survival loop) — per the existing Phase 2B brief's own guardrail (carried forward here): **do not flatten these into one linear stepper.** The mission board stays the UI; the fix is to have it emit transitions through an underlying canonical `Step` type, so a `FAIL_OVERLOAD` transition fires consistently regardless of which mission triggered it.
3. **Genuinely no lifecycle type** (numeric mission index, boolean flags, tab-string state) — these need the most work: introducing a `Step` type where none conceptually exists yet, without inventing new mechanics (see Section 3's scope boundary).

Full slug list for sub-classification, grouped only by their current declared type name (not yet judged into the three buckets above — that judgment is this phase's actual work):

- **Has *a* named type, no canonical signal**: `deeplearning9` (Phase), `cloudflare9` (ComponentType), `virtualmem9` (Phase), `machinelearning9` (LearningRate), `blockchain9` (ChainState), `classesinjava9` (ActivityId), `algorithmicmusic9` (GeneratorType), `maninthemiddle9` (AnimState), `ransomware9` (Phase), `braincomputerinterface9` (LabStage), `passwordcracking9` (AttackStatus), `bufferoverflow9` (SysState), `binarysearch12` (Phase), `itsupport18` (Phase), `responsibleai23` (Phase), `usbconnectivity25` (Era), `setsandvenn27` (Operator), `mobileplatform37` (SimState), `crosssitescripting9` (PayloadType), `torrouting9` (Phase), `zerodayexploit9` (Phase), `graphqlbasics9` (Phase), `sshkeys9` (PacketType), `oauthflow9` (Phase), `webassembly9` (RunMode), `continuousintegration9` (StageId), `reverseproxies9` (PacketState), `csrfattacks9` (RequestSource), `roboticsurgery46` (ModalState), `propositionallogic42` (GateType), `testingstrategies43` (QAState), `requirementsanalysis9` (MissionId)
- **No lifecycle type detected at all**: `univac9`, `gpu9`, `spectremeltdown9`, `foldablesmartphone11`, `ooppython15`, `cloudstrategy16`, `agiinterview19`, `advancedalgorithms24`, `microservices9`, `machinelearningtraining9`, `contentdeliverynetwork9`, `ratelimiting9`, `smartring32`, `computingbenefits44`, `semanticweb45`

---

## 2. Risk assessment — read before agreeing to start

This phase is meaningfully riskier than Phase 1, Phase 2, or Phase 2B, for reasons specific to what it touches:

1. **It touches state logic, not just presentation.** Phase 2B changed CSS classes — visually different, behaviorally identical. Renaming a `Phase` type to `Step` and changing its values touches every `useState<Phase>`, every `phase === 'X'` conditional, every `setPhase('Y')` call, and every place the value is read to drive UI (colors, instructions, button visibility) in that file. A single missed rename site is a silent runtime bug — a lab that gets stuck, or a "Next Phase" button that never appears — not a lint warning.
2. **47 labs is triple the size of Phase 2B's touched set.** Attempting this as one batch is not realistic; it should be broken into its own sub-phases (Tier B, then Tier C, then Tier D in smaller waves).
3. **Tier D's "mission-board" labs require a judgment call this brief cannot make for you** — deciding where in an 8-mission CSRF sandbox the canonical `FAIL_OVERLOAD` transition actually fires is a design decision about that specific lab's pedagogy, not a mechanical find-and-replace.
4. **The payoff is tooling/consistency, not a student-facing fix.** Unlike Phase 1's broken LMS bridges (a real functional failure) or Phase 2B's dark-void violations (a real AGENTS.md compliance failure), no student is currently affected by `ransomware9` using `type Phase` instead of `type Step`. This phase should be sequenced accordingly — after, not instead of, anything with direct student impact.

**Recommendation embedded in this brief**: if approved, execute in the order Tier B → Tier C → Tier D, and treat Tier D as its own multi-wave effort with a checkpoint after each wave, not a single pass across all 47.

---

## 3. Scope boundaries

- **This phase renames/reconciles types and values. It does not change mechanics, UI, layout, or add new failure states.** A lab that currently has no distinct "fail safely" moment does not get one invented here — that's a content/pedagogy decision belonging to the separate "targeted lab rewrites" workstream, not this one.
- **Tier D mission-board labs keep their board.** Per the guardrail already established for Phase 2B and repeated here: no flattening sandbox/mission-based labs into a single linear stepper.
- **`jwttokens9`'s Tier B case is a genuine exception requiring a decision, not a rename**: its `Step` type describes a JWT-verification state machine (`EXPLORE → TAMPERED → VERIFYING → REJECTED/ACCEPTED`), a real and different concept from the canonical learn/fail/improve arc. Options: (a) leave this type as-is under a renamed type (e.g. `VerificationState`) and add a *separate* outer `Step` type for the lab's own learn/try/fail/improve/outcome arc if one exists narratively; (b) determine the lab genuinely doesn't have an outer pedagogical arc distinct from the JWT mechanic and document that as a deliberate exception. Do not force this file's existing `Step` type to adopt canonical values — they describe an unrelated mechanic.
- **Do not touch labs outside the 59-entry catalog.**

---

## 4. Suggested execution order

1. **Wave 1 — Tier B (7 labs)**: reconcile values within the already-correctly-named `Step` type. Lowest risk, since no rename of the type itself or its usage sites is needed — only the literal string values change.
2. **Wave 2 — Tier C (4 labs)**: rename `Phase`/`Mission1Step`/`LabStep` → `Step` at the declaration and every usage site (`useState<X>`, conditionals, setters). Slightly higher risk than Wave 1 because the type name itself changes everywhere it's referenced.
3. **Wave 3 — Tier D, sub-batch by sub-classification**: start with the "real narrative shape, different vocabulary" bucket (closest to Wave 2's risk profile), then mission-board labs (needs per-lab pedagogy judgment), then "no lifecycle type" labs last (highest effort, introducing new state where none exists conceptually).

Do not start Wave 2 until Wave 1 is verified complete. Do not start Wave 3 until Wave 2 is verified complete.

---

## 5. Reproducing this audit

```python
import os, re
labs_dir = "labs"
canonical = ['LEARN','TRY_MANUAL','FAIL_OVERLOAD','UNDERSTAND','IMPROVE','COMPLETE','OUTCOME']
for fname in os.listdir(labs_dir):
    if not fname.endswith(".tsx"): continue
    with open(os.path.join(labs_dir, fname), encoding="utf-8", errors="ignore") as f:
        content = f.read()
    type_match = re.search(r'type\s+(\w+)\s*=\s*\n?\s*(?:\||)\s*[\'"]', content)
    type_name = type_match.group(1) if type_match else "none"
    values = []
    if type_match:
        start = type_match.start()
        snippet = content[start:start+800]
        end = snippet.find(";")
        decl = snippet[:end] if end != -1 else snippet
        values = re.findall(r'[\'"]([A-Z0-9_]+)[\'"]', decl)
    print(fname, "|", type_name, "|", values[:10])
```

Cross-reference results against `data/labs.ts`'s 59 slugs before acting on any finding — this script scans every file in `labs/`, which includes files outside the current catalog (same caveat as every prior phase's audits in this project).

---

## 6. Verification requirement

Same standard as every prior phase:
1. `npx tsc --noEmit` — 0 new errors. This is the primary safety net for this phase specifically: a missed rename site or a value used in a conditional that no longer exists in the type will surface here.
2. `node scripts/lint-labs.js` — 0 new violations.
3. For every renamed/reconciled type: grep the file for the old type name and old value strings to confirm zero remaining references, not just that the new ones exist.
4. **Render and click through the actual lab's flow** for every touched file — not just the resting state. A renamed value that silently breaks a `phase === 'OLD_VALUE'` conditional will not show up in `tsc` if the conditional was already loosely typed, and will not show up in a resting-state screenshot at all. This phase's verification bar is higher than Phase 2B's for exactly this reason.
5. Report per lab: original type/values, new type/values, and confirmation the lab's full flow (not just its first screen) was exercised and works.
