# Phase 3 Handoff: Tier B + Tier C State Machine Standardization (11 → 9 Labs)

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. This is the first Phase 3 rollout beyond the `ransomware9` pilot — read `PHASE3_STATE_MACHINE_BRIEF.md` first for the full tier classification and risk framing; this document narrows scope to Tier B + Tier C and gives exact per-file wiring.
> **Precondition met**: The full UI baseline (dark-token dominance, subtitle removal, micro-typography floor, lint) is closed and independently re-verified across all 59 labs. This is the first phase where CSS/layout and state-machine work are not being fought simultaneously.

---

## 1. Scope: 9 labs in this batch, 1 excluded, 1 called out for extra care

The user approved Tier B + Tier C (11 labs total from the original brief). A fresh audit of current source found two labs need different treatment than a simple batch entry:

### Excluded from this batch: `JwtTokens9`
Its `Step` type (`EXPLORE | TAMPERED | VERIFYING | REJECTED | ACCEPTED`) drives a real, live single-request tamper/verify interaction — not a Learn→Try→Fail→Understand→Improve→Complete→Outcome narrative. There is no honest mapping from this flow onto the canonical 7-step shape. **Do not touch this file in this batch.** It was already flagged as a non-candidate in the original brief; this confirms that call still holds.

### Flagged for extra design care: `AsymmetricCrypto9`
This lab tracks **two independent mission steppers** — `m1Step: Mission1Step` and `m2Step: Mission2Step` — not one. The `ransomware9` pattern (single derived `Step` + single `phaseToStep()` mapping) doesn't drop in cleanly here; it needs a combined mapping that accounts for both missions' progress into one canonical `Step` value. Do this one last, after the other 9 are done and the pattern is fresh, and expect it to take longer per-file than the rest.

### The 9-lab core batch
6 of these 9 already declare a type literally named `Step` — meaning this is an **in-place values rename**, not an additive derived type like the `ransomware9` pilot. That's a different, higher-touch operation: every comparison against the old string values (`step === 'TRY_PUBLIC'`, switch statements, conditional renders) must be updated consistently in the same pass, or the component silently breaks at runtime with no type error (string literal unions won't catch a stale comparison against a value that still compiles as a valid member of the old-but-renamed type during a partial edit).

| File | Current type | Current values | State var | Refs to update |
|---|---|---|---|---|
| `HashFunctions9.tsx` | `Step` (rename in place) | `LEARN, TRY_ORIGINAL, TRY_SNEAK, FAIL, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` | `step` | 33 occurrences of `step`/`Step` — largest in this batch |
| `SymmetricCrypto9.tsx` | `Step` (rename in place) | `LEARN, TRY_PUBLIC, FAIL_RAW, UNDERSTAND, IMPROVE, COMPLETE, SECURE_CHAT, OUTCOME` | `step` | Check full file |
| `AIEducation22.tsx` | `Step` (rename in place) | `LEARN, TRY_MANUAL, FAIL_OVERLOAD, UNDERSTAND, IMPROVE, BATCH_SCALE, OUTCOME` | `step` | Check full file |
| `NetworkInterface31.tsx` | `Step` (rename in place) | `LEARN, INIT_MAC, INIT_MEDIUM, TRY_RAW, FAIL_CPU, UNDERSTAND, IMPROVE, OUTCOME` | `step` | Check full file |
| `DataVisualization36.tsx` | `Step` (rename in place) | `LEARN, TRY_RAW, FAIL_PIE, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` | `step` | Check full file |
| `ComputingProject39.tsx` | `Step` (rename in place) | `LEARN, FAIL_SCOPE, IMPROVE, COMPLETE, OUTCOME` — also has an unrelated second `type Phase = 'planning' \| 'building' \| 'testing'` | `step` | 7 occurrences of `step`/`Step` — leave the separate `Phase` type alone, it's an unrelated project-tracker concept in the same file, not a state-machine candidate |
| `EthereumDao9.tsx` | `Phase` (additive, like ransomware9) | `LEARN, ATTACK_RUNNING, HACKED, PATCHING, PATCH_RUNNING, SECURED, GOVERNANCE, COMPLETED` | `phase` | Add derived `Step` + mapping function, same pattern as `ransomware9` |
| `QuantumComputing9.tsx` | `Phase` (additive, like ransomware9) | `LEARN, FAIL, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` | `phase` | Add derived `Step` + mapping function — this one is nearly a 1:1 match already, should be the fastest of the batch |
| `GestureControl40.tsx` | `LabStep` (rename the type name only) | `LEARN, TRY, FAIL, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` | `step` | Values already match canonical exactly — only the type name `LabStep` needs renaming to `Step`, nothing else changes |

---

## 2. Two different methods in this batch — do not conflate them

### Method A — additive derived type (for `EthereumDao9`, `QuantumComputing9`)
Same proven pattern as `ransomware9`:
1. Keep the existing `Phase` type and `phase` state variable completely untouched.
2. Add `type Step = 'LEARN' | 'TRY_MANUAL' | 'FAIL_OVERLOAD' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';` alongside it.
3. Add a pure `function phaseToStep(phase: Phase): Step { switch(...) }` mapping every existing phase value to the nearest canonical step.
4. Expose it via `const step: Step = phaseToStep(phase);` and a `data-step={step}` attribute on the top-level HUD/wrapper div — invisible to students, zero layout change.
5. This is the lower-risk method. Prefer it whenever the existing type is not already named `Step`.

### Method B — in-place rename (for `HashFunctions9`, `SymmetricCrypto9`, `AIEducation22`, `NetworkInterface31`, `DataVisualization36`, `ComputingProject39`)
These 6 files already have a type named `Step`, so adding a second one would create a naming collision or an awkward `Step` vs `CanonicalStep` split. Instead:
1. Grep the full file for every occurrence of the current value strings (e.g. `TRY_ORIGINAL`, `TRY_SNEAK` in HashFunctions9) — string literals in JSX conditionals, switch cases, and comparisons, not just the type declaration line.
2. Rename each value to its canonical equivalent in one atomic pass across the whole file. Suggested mappings (adjust if the narrative doesn't fit cleanly — report any judgment call):
   - `HashFunctions9`: `TRY_ORIGINAL`→`TRY_MANUAL`, `TRY_SNEAK`→ keep as a sub-state or fold into `TRY_MANUAL` (this lab has two try-paths; decide and document which).
   - `SymmetricCrypto9`: `TRY_PUBLIC`→`TRY_MANUAL`, `FAIL_RAW`→`FAIL_OVERLOAD`, `SECURE_CHAT`→ likely folds into `IMPROVE` or stays as a distinct post-`COMPLETE` state — check how it's used before deciding.
   - `AIEducation22`: `BATCH_SCALE`→ likely folds into `IMPROVE`, check usage first.
   - `NetworkInterface31`: `INIT_MAC`/`INIT_MEDIUM`→ both likely fold into `LEARN` or `TRY_MANUAL` depending on where they sit in the flow; `FAIL_CPU`→`FAIL_OVERLOAD`. This file has no `COMPLETE` value today — check whether one needs to be added or if `OUTCOME` alone is being used to mean both.
   - `DataVisualization36`: `TRY_RAW`→`TRY_MANUAL`, `FAIL_PIE`→`FAIL_OVERLOAD`.
   - `ComputingProject39`: shortest chain in the batch (`LEARN, FAIL_SCOPE, IMPROVE, COMPLETE, OUTCOME`) — missing `TRY_MANUAL` and `UNDERSTAND` entirely. Do not invent new UI states to fill these gaps; either the canonical type needs a documented exception for this lab (report it, don't force it) or confirm these stages are truly absent from the lab's actual flow.
3. `GestureControl40` is the one exception inside Method B: values already match canonical exactly, so only rename `type LabStep` → `type Step` and the corresponding `useState<LabStep>` → `useState<Step>`. No value-string changes at all.
4. After renaming, re-render the lab and click through at least the first 2 stages manually (or via screenshot at rest + a forced state override if the automation can trigger it) to confirm nothing silently broke. A stale string comparison after a partial rename will not throw a compile error if you miss one — this is the single biggest risk in this batch.

### Method C — combined dual-mission mapping (for `AsymmetricCrypto9` only, do last)
1. Keep `Mission1Step`/`Mission2Step` and their two state variables completely untouched.
2. Add a single `type Step = ...` (canonical) and a mapping function that takes both `m1Step` and `m2Step` and returns one combined `Step` — the overall lab's furthest-progress state, not two separate outputs. Judgment call: while Mission 1 is still in progress, `Step` reflects `m1Step`'s mapping; once Mission 1 hits `OUTCOME`, `Step` should reflect `m2Step`'s mapping instead. Document the exact transition logic you choose.
3. Expose via `data-step` same as Method A.

---

## 3. What not to touch

- Any dark-token, subtitle, or micro-typography work — closed.
- The unrelated `Phase` type inside `ComputingProject39.tsx` (`planning/building/testing`) — that's a project-tracker concept in the same file, not a state-machine candidate. Leave it alone.
- `JwtTokens9.tsx` — excluded from this batch entirely, see §1.
- Any layout, visual, or interaction-flow change beyond the state-value renames themselves. Values change; mechanics don't.

---

## 4. Verification requirement

For each of the 9 files:
1. `npx tsc --noEmit` — 0 new errors. This catches type mismatches but **not** a stale string comparison left over from a partial rename — see the manual-check requirement below.
2. `node scripts/lint-labs.js` — must still print the passing message, 0 violations (baseline is a true zero as of the last cleanup pass — don't reintroduce anything).
3. Grep the full file post-edit for any remaining old value strings — report zero leftover occurrences explicitly, by file.
4. Render at rest (1366×768 screenshot) plus, where feasible, click or force through the first 2-3 stages to confirm the renamed values actually drive the UI correctly — not just that the type declaration changed. State plainly if only resting-state was verified for a given file, same honesty standard as every prior phase.
5. For `EthereumDao9` and `QuantumComputing9` (Method A): confirm via `data-step` attribute query, same technique used to verify `ransomware9` — quote the actual DOM value observed at at least 2 different points in the flow.

Report back per file: method used, old→new value mapping table, occurrence count found/changed, any judgment call made where the narrative didn't cleanly fit 7 canonical stages (do not force a fit and stay silent about it — say so).

---

## 5. After this batch

Once verified, `AsymmetricCrypto9` (Method C) is the next single-file task — treat it as its own mini-handoff given the extra design judgment required, not a bulk-batch item. Beyond that, Tier D (47 labs with no canonical signal at all, including labs with real narrative shape under unrelated vocabulary like `ransomware9`'s own `Phase` or `bufferoverflow9`'s `SysState`) remains explicitly out of scope until a separate future brief — per the original Phase 3 brief's own risk framing, that tier is a much larger undertaking and should not be assumed approved by this handoff.
