# Timer + Stage-Based Marks: Batch 1 (22 Canonical-Shape Labs)

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. Reference implementation already built and verified in `labs/AsymmetricCrypto9.tsx` — read that file first, it's the pattern to follow, not a description to reinterpret.

---

## 1. What this is

Every lab in this batch already has a canonical `type Step` (7 values: `LEARN, TRY_MANUAL, FAIL_OVERLOAD, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME`, with some documented per-file variance — see §3) wired to a `data-step` DOM attribute, from Phase 3's state-machine standardization work. This batch adds two things to each:

1. **A 5:00 countdown timer**, shown in the lab's header via `LabShell`'s `navExtra` prop.
2. **Stage-based partial-credit marks** reported via `reportComplete({ points })`, computed from how far the student's `Step` got — not just a flat 100 on completion. If the timer runs out before the student finishes, whatever marks they'd earned at that point are locked in and reported; the lab freezes with a "Time's Up!" overlay.

This is NOT the same project as Phase 3's state-machine work — it reuses that work's output (`data-step`) as the input to a new, separate feature. Do not re-touch the state-machine logic itself (no renaming values, no changing `phaseToStep`/`getStep`/`stageToStep` mapping functions) — this batch only adds a timer and a marks calculation on top.

---

## 2. Reference implementation — read this file first

`labs/AsymmetricCrypto9.tsx` has the full pattern already built, verified live (tsc clean, lint clean, timer counts down correctly, timeout overlay confirmed, marks calculation confirmed at both 0 and 50 mark bands). Key pieces to replicate:

- `TIMER_DURATION_SECONDS = 5 * 60` constant at module scope.
- A `marksForProgress(...)`-style pure function that maps current state to a 0–100 mark value. In `AsymmetricCrypto9` this took `(mission, m1Step, m2Step)` because that lab is a dual-mission combinator — **for this batch's labs, the equivalent function should take the lab's own canonical `Step` value directly** (see §3 for the actual formula).
- `secondsLeft`, `timedOut` state; a `setInterval`-based countdown `useEffect` that stops once `timedOut` or the lab's own completion condition is true.
- A `useEffect` that fires `reportComplete({ points: marksForProgress(...) })` exactly once when `timedOut` becomes true.
- `formattedTime` string formatting (`M:SS`, zero-padded seconds).
- Timer pill rendered via `LabShell`'s `navExtra` prop (icon + `formattedTime`, styled to turn red/pulse under 30 seconds remaining, and to show "Time's Up" once expired).
- A "Time's Up!" modal overlay (dimmed backdrop, marks-earned message, "Try Again" button that calls the lab's existing reset function) — shown only when `timedOut && !isLabComplete`, positioned above the frozen (`pointer-events-none opacity-40`) lab content.
- `resetLab`/equivalent must also reset `secondsLeft` back to `TIMER_DURATION_SECONDS` and `timedOut` back to `false`.

---

## 3. The marks formula — generic, but read the per-file notes

**Default formula for labs with the untouched 7-value canonical `Step`:**

```ts
const STEP_ORDER: Step[] = ['LEARN', 'TRY_MANUAL', 'FAIL_OVERLOAD', 'UNDERSTAND', 'IMPROVE', 'COMPLETE', 'OUTCOME'];
function marksForStep(step: Step): number {
  const index = STEP_ORDER.indexOf(step);
  return Math.round((index / (STEP_ORDER.length - 1)) * 100);
}
```

This gives 0 at `LEARN`, ~100 at `OUTCOME`, evenly spaced in between. **This is a starting formula, not a rule to apply blindly** — a few files have genuine shape differences (extra or missing values) that need the order array adjusted to match, or the marks curve won't make sense. Per-file notes:

| Lab | Actual Step values | Note |
|---|---|---|
| `AIEducation22.tsx` | standard 7 | Default formula applies directly. |
| `BufferOverflow9.tsx` | standard 7 | Uses Method C combinator (`getStep(stage, sysState)`) — already has `data-step` wired at line 217. Compute marks from the *returned* `Step` value, not from `stage`/`sysState` directly. |
| `Colossus28.tsx` | standard 7 | **No `data-step` attribute exists in this file at all**, despite having the canonical `type Step`. Add one — check how the other Tier A/pilot labs wire it (`data-step={step}` on the primary HUD wrapper) and follow that pattern here first, then add the timer on top. `reportComplete` is called as a bare function reference via `setTimeout(reportComplete, 1500)` at line 80 — needs to become `setTimeout(() => reportComplete({ points: ... }), 1500)`. |
| `ComputingProject39.tsx` | `LEARN, FAIL_OVERLOAD, IMPROVE, COMPLETE, OUTCOME` (5 values — no `TRY_MANUAL`, no `UNDERSTAND`, documented gap from Phase 3) | Use this lab's own actual 5-value order for `STEP_ORDER`, not the generic 7-value array — otherwise `indexOf` will be wrong for values that don't exist here. |
| `DataVisualization36.tsx` | standard 7 | Default formula applies directly. |
| `DeepLearning9.tsx` | standard 7 (via `phaseToStep`, Method A) | Compute marks from the *canonical* `Step` output of `phaseToStep(phase)`, not from the raw `Phase` value — same principle as BufferOverflow9. |
| `EthereumDao9.tsx` | standard 7 (via `phaseToStep`) | Same as DeepLearning9. Existing `reportComplete({ labId: 'ethereumdao9', points: 100 })` call at line 231 — replace the hardcoded `points: 100` with the computed marks value, keep `labId`. |
| `GestureControl40.tsx` | standard 7 | Default formula applies directly. |
| `HashFunctions9.tsx` | `LEARN, TRY_MANUAL, TRY_SNEAK, FAIL_OVERLOAD, UNDERSTAND, IMPROVE, COMPLETE, OUTCOME` (8 values — `TRY_SNEAK` is a documented Phase 3 exception, a distinct sub-state of trying) | Include `TRY_SNEAK` in this file's own `STEP_ORDER` array (positioned right after `TRY_MANUAL`, matching the Phase 3 documentation), so the 8-value order gives correct proportional marks. |
| `ITSupport18.tsx` | standard 7 (via `phaseToStep`) | Same as DeepLearning9. |
| `NetworkInterface31.tsx` | `LEARN, INIT_MAC, INIT_MEDIUM, TRY_MANUAL, FAIL_OVERLOAD, UNDERSTAND, IMPROVE, OUTCOME` (8 values — no `COMPLETE`, two extra pre-try setup states, documented Phase 3 exception) | **No `data-step` or `reportComplete` call found in this file at all in the current source** — check whether this file's LMS/state-machine wiring is actually complete before starting; if `reportComplete` genuinely isn't called anywhere, that's a pre-existing gap unrelated to this batch and should be flagged back to the architect, not silently worked around. |
| `PasswordCracking9.tsx` | standard 7 | Uses Method C combinator (`getStep(stage, status)`) — same treatment as BufferOverflow9. |
| `PropositionalLogic42.tsx` | standard 7 (via `phaseToStep`) | `reportComplete()` currently fires via `setTimeout(() => reportComplete(), 4500)` at line 93 — update the points argument, keep the delay. |
| `QuantumComputing9.tsx` | standard 7 (via `phaseToStep`) | Same as DeepLearning9. |
| `Ransomware9.tsx` | standard 7 | This is the Phase 3 *pilot* lab — `data-step={step}` already wired directly (not via a mapper call) at line 821. Read the comment at line 49 before touching anything; this file has the most mission-scoped internal complexity (`Phase` type has 14 raw mission values under the hood, `Step` is derived) — compute marks from the derived `step` variable only. |
| `RateLimiting9.tsx` | standard 7 (via `stageToStep`) | `reportComplete({ points: 100 })` at line 153 — replace hardcoded 100 with computed marks. |
| `ResponsibleAI23.tsx` | standard 7 (via `phaseToStep`) | Same as DeepLearning9. |
| `SymmetricCrypto9.tsx` | `LEARN, TRY_MANUAL, FAIL_OVERLOAD, UNDERSTAND, IMPROVE, COMPLETE, SECURE_CHAT, OUTCOME` (8 values — `SECURE_CHAT` is a documented Phase 3 exception, a post-COMPLETE interactive task) | Include `SECURE_CHAT` in this file's own `STEP_ORDER` (positioned between `COMPLETE` and `OUTCOME`, matching the Phase 3 documentation). |
| `TestingStrategies43.tsx` | standard 7 (via `qaStateToStep`) | Same treatment as DeepLearning9 — compute from the mapped `Step`, not the raw 12-value `QAState`. |
| `Univac9.tsx` | standard 7 (via `stageToStep`) | Same as RateLimiting9's pattern — check the exact `reportComplete` call site (line 343) for what's currently passed. |
| `VirtualMem9.tsx` | standard 7 (via `phaseToStep`) | Same as DeepLearning9. |

**Excluded from this batch**: `JwtTokens9.tsx` — its `Step` type shares the name but describes a completely different tamper/verify cycle (`EXPLORE/TAMPERED/VERIFYING/REJECTED/ACCEPTED`), not the canonical shape. Do not add a timer or marks scheme to this file as part of this batch.

---

## 4. What NOT to do

- Don't touch any Phase 3 state-machine logic — no renaming `Step` values, no changing any `phaseToStep`/`getStep`/`stageToStep` function bodies, except where §3 explicitly says to add a missing value to a local `STEP_ORDER` array for marks-calculation purposes only (that array is new code for this batch, not a change to the existing mapping functions).
- Don't add a timer to `JwtTokens9.tsx` or any of the ~50 non-canonical labs — those are out of scope for this batch entirely (a separate audit is planned for them).
- Don't change any `reportComplete()` call's `labId`, `timeTaken`, or other existing arguments — only the `points` value changes, and only where marks are now computed rather than hardcoded/defaulted.
- If a file's marks formula genuinely doesn't make sense given its actual narrative (e.g. a stage that's really a "setup" step shouldn't count the same as real progress), use judgment and document the deviation explicitly in your report — don't force the generic formula where it produces something misleading.

---

## 5. Verification requirement

Same standard as every batch in this project:
1. `npx tsc --noEmit` — 0 new errors.
2. `node scripts/lint-labs.js` — must still pass.
3. For each of the 22 labs: live-rendered screenshot showing the timer at `5:00` on load.
4. For at least 5 labs spanning different marks-formula cases (a standard-7 lab, `ComputingProject39`, `HashFunctions9`, `SymmetricCrypto9`, and one Method-C combinator lab) — a real, live-clicked demonstration of the marks value changing as `data-step` advances, quoting the actual `data-step` and the actual marks number reported at 2+ checkpoints each.
5. For at least 2 labs — a forced/simulated timeout (temporarily shortening the constant for testing, then restoring it to `5 * 60` before final commit, same technique used in the reference build) showing the "Time's Up!" overlay and correct partial marks.
6. Report back per lab: which formula was used (default vs. custom `STEP_ORDER`), any file-specific deviation and why, and confirmation of the `reportComplete` call site update.

---

## 6. After this batch

The other ~50 non-canonical labs are explicitly out of scope for this batch. A separate research/audit pass is needed first to determine what discrete state (if any) each one exposes that a marks scheme could reasonably attach to — that audit has not been scoped or approved yet.
