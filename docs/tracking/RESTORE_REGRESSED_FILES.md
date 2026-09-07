# Regression Restore — 2026-09-07

> Commit: `9c7f0c9`
> Branch: `main`
> Status: Complete

## Root Cause

Neither `AsymmetricCrypto9.tsx` nor `CsrfAttacks9.tsx` was ever committed with their respective fixes. The timer+marks feature and the deprecation fix existed only in working-tree patches that were lost when `git restore labs/*.tsx` was run during the mass-injection debugging cycle. Nothing to cherry-pick — both files were rebuilt from the current source on disk.

---

## Fix 1 — `CsrfAttacks9.tsx`

**Issue:** `MotionValue.onChange()` is deprecated in Framer Motion v12. The subscription call logged a console warning on every render.

**Fix (1 line):**
```ts
// Before (deprecated):
return balance.onChange((v) => {

// After:
return balance.on("change", (v) => {
```

Behaviour is identical; warning eliminated.

---

## Fix 2 — `AsymmetricCrypto9.tsx`

This lab is a **dual-mission combinator** — its marks formula and Step derivation use the full `(mission, m1Step, m2Step)` triple, not the generic `STEP_ORDER` index formula used across the other 22 labs. All logic follows the spec from `TIMER_MARKS_BATCH1_HANDOFF.md`.

### What was added

| Element | Detail |
|---------|--------|
| `TIMER_DURATION_SECONDS` | `5 * 60` module constant |
| `type Step` | 7-value canonical union |
| `getStep(mission, m1Step, m2Step)` | Mission-aware combinator — M1 maps each `Mission1Step` to its canonical counterpart; M2 maps each `Mission2Step` similarly; M1 `OUTCOME` maps to `COMPLETE` (mid-lab bridge, not final outcome) |
| `marksForProgress(mission, m1Step, m2Step)` | Returns `100` at M2 `OUTCOME`, `50` at M2 start or M1 `OUTCOME`, `0` otherwise |
| `[secondsLeft, setSecondsLeft]` | Countdown state, initialised to 300 |
| `[timedOut, setTimedOut]` | Timeout flag |
| `timerIntervalRef` | Ref for the 1 s interval |
| `labCurrentStep` | `getStep(mission, m1Step, m2Step)` |
| `isLabComplete` | `m2Step === "OUTCOME"` |
| Countdown `useEffect` | Stops on `timedOut` or `isLabComplete`; calls `setTimedOut(true)` at 0 |
| Timeout `useEffect` | Fires `reportComplete({ points: marksForProgress(...) })` once when `timedOut` becomes true |
| `formattedTime` | `M:SS` string |
| `resetLab` patch | Restores `secondsLeft` and `timedOut` before resetting mission state |
| `handleTestB` patch | `reportComplete()` → `reportComplete({ points: marksForProgress(mission, m1Step, m2Step) })` |
| `navExtra` on `LabShell` | Timer pill — sky-blue at rest, rose-pulsing under 30 s, static rose when timed out |
| `data-step={labCurrentStep}` | On the outermost always-rendered content div |
| Timeout modal | Dimmed backdrop, marks-earned message, Try Again button wired to `resetLab` |

### Step mapping reference

**Mission 1:**

| `m1Step` | `getStep` → |
|----------|------------|
| `LEARN` | `LEARN` |
| `TRY` | `TRY_MANUAL` |
| `FAIL` | `FAIL_OVERLOAD` |
| `UNDERSTAND` | `UNDERSTAND` |
| `IMPROVE` | `IMPROVE` |
| `COMPLETE` | `COMPLETE` |
| `OUTCOME` | `COMPLETE` *(mid-lab bridge)* |

**Mission 2:**

| `m2Step` | `getStep` → |
|----------|------------|
| `INTRO` | `IMPROVE` |
| `TESTING_A` | `IMPROVE` |
| `FAILED_A` | `FAIL_OVERLOAD` |
| `TESTING_B` | `IMPROVE` |
| `SUCCESS_B` | `COMPLETE` |
| `OUTCOME` | `OUTCOME` |

---

## Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ Exit 0, 0 errors |
| `node scripts/lint-labs.js` | ✅ Lab linting passed |

## Definition of Done (remaining items for architect)

The following items require a live browser session and cannot be verified by the developer toolchain:

- [ ] Screenshot of `asymmetriccrypto9` showing timer at 5:00 on load
- [ ] Live click-through M1→M2→OUTCOME with `data-step` quoted at 3+ checkpoints
- [ ] Confirm `csrfattacks9` no longer logs `MotionValue.onChange` deprecation warning
