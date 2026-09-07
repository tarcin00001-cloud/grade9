# Phase 3 Batch: Tier D Clean/Partial Fit (9 Labs)

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. Based on the independently re-verified Tier D audit (6 Clean fit + 3 Partial fit). Same canonical target and verification bar as the Tier B/C batch — read `PHASE3_TIER_BC_HANDOFF.md` first if you need the method definitions (A/B/C) restated; this document gives exact per-file wiring only.

Canonical target, unchanged: `type Step = 'LEARN' | 'TRY_MANUAL' | 'FAIL_OVERLOAD' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';`

---

## 1. Scope: 9 labs, 3 methods

| Lab | Current type/var | Method | Notes |
|---|---|---|---|
| `ITSupport18.tsx` | `type Phase`, var `phase` | A | Near 1:1 game-loop match |
| `ResponsibleAI23.tsx` | `type Phase`, var `phase` | A | Identical structure to ITSupport18 |
| `VirtualMem9.tsx` | `type Phase`, var `phase` | A | Richest narrative in this batch, 8 values |
| `DeepLearning9.tsx` | `type Phase`, var `phase` | A | **Read §2 carefully — a transient/settled state pair needs distinguishing, not a flat rename** |
| `PropositionalLogic42.tsx` | `type MissionPhase`, var (check file) | A | Mission-based, documented gaps |
| `BrainComputerInterface9.tsx` | `type LabStage`, var `stage`/`labStage` (check exact name in file) | B (type-name rename, values already close) | Documented gaps — no explicit FAIL/UNDERSTAND |
| `TestingStrategies43.tsx` | `type QAState`, var (check file) | B (in-place rename, 12 values → 7) | Longest value list in this batch — read the full narrative before collapsing |
| `RateLimiting9.tsx` | **no named type — implicit `useState(1)`, numeric** | A (additive, numeric→canonical) | See §3 |
| `Univac9.tsx` | **no named type — inline `useState<1\|2\|3\|4\|5>(1)`, numeric** | C (dual-mission combinator, same shape as AsymmetricCrypto9) | See §4 |

---

## 2. `DeepLearning9.tsx` — the transient-vs-settled distinction

This is the one place in this batch where a naive rename would be wrong. The type has **two states that both sound like "fail"**:

```ts
type Phase = "learn" | "training_fail" | "failed" | "feedback" | "improving" | "training_success" | "success";
```

Confirmed from source (`labs/DeepLearning9.tsx`):
- `training_fail` and `training_success` are **transient, animated "training in progress" states** — gated together via `const isTraining = phase === "training_fail" || phase === "training_success";` (line 69). The student is watching an animation resolve, not looking at a settled result yet.
- After that animation, `training_fail` transitions to the **settled** `"failed"` state (line 150), and `training_success` transitions to the settled `"success"` state (line 141).
- `"feedback"` is reached from `"failed"` and is the explanation/understand screen (line 396 groups `phase === "failed" || phase === "feedback"` in a shared render branch — read this branch before finalizing wording, they may share a container but represent different explanatory depth).
- `"improving"` is reached via the two hidden-layer adjustment buttons (lines 346, 352) — this is the actual hands-on retry/improve interaction, not a badge state.

**Do not map `training_fail`/`training_success` directly to `FAIL_OVERLOAD`/`COMPLETE`.** They are momentary animation states inside the "trying" moment. Correct mapping:

```ts
function phaseToStep(phase: Phase): Step {
  switch (phase) {
    case 'learn':             return 'LEARN';
    case 'training_fail':     return 'TRY_MANUAL';   // still mid-attempt, resolving to a fail
    case 'training_success':  return 'TRY_MANUAL';   // still mid-attempt, resolving to success
    case 'failed':            return 'FAIL_OVERLOAD'; // settled fail result
    case 'feedback':          return 'UNDERSTAND';
    case 'improving':         return 'IMPROVE';
    case 'success':           return 'COMPLETE';
    default:                  return 'LEARN';
  }
}
```

Note there's no distinct `OUTCOME` value in this lab's own `Phase` — check whether `reportComplete()` fires at `"success"` or elsewhere, and whether `OUTCOME` needs its own mapped value or `COMPLETE` is genuinely the terminal state here (documented exception, same treatment as NetworkInterface31's missing `COMPLETE` in the last batch — say which, don't force it).

---

## 3. `RateLimiting9.tsx` — numeric stage, Method A

No named type exists; the state is `const [stage, setStage] = useState(1);` (untyped number). Confirmed transitions from source:

- Stage 1: intro/setup, "Initialize Setup" button → stage 2
- Stage 2 → 4: botnet launch attempt (try)
- Stage 4: **"503 SERVER CRASH" modal** (confirmed at `stage === 4` in source) — this is the fail state
- Stage 4 → 5 via "INSTALL LIMITER" button
- Stage 5 → 6: tune capacity/refill sliders (improve)
- Stage 6 → 7: secure/outcome panel with stats

Do this as Method A: keep `stage` as the source of truth (give it an explicit `type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;` if it doesn't already have one — untyped numeric state should get a named type as part of this work, that's a natural cleanup, not scope creep), add `type Step` and `function stageToStep(stage: Stage): Step`, wire `data-step` the same as every other Method A lab. Confirm what stages 3 and 6→7 actually render before finalizing — this brief's read is from transition call-sites, not a full read of every intermediate screen; verify against the actual JSX the way `EthereumDao9`'s mapping was checked last batch.

---

## 4. `Univac9.tsx` — dual-mission combinator, Method C

Same shape as `AsymmetricCrypto9`, not a flat rename. Confirmed from source: `const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);`

Confirmed transitions:
- Stage 1: assemble hardware (install tubes/tape/memory/printer), toggle AC, attempt boot
- Boot without AC → **stage 2, `isOverheating` set true** — this is the fail state (Mission 1 fail)
- Boot with AC → **stage 3** — Mission 1 success (chilled, operational)
- Stage 3 → 4 via "Proceed to Election" — **Mission 2 begins** (tape mount, run prediction, reveal)
- Stage 4 → 5 via correct assessment answer — **`reportComplete()` fires here** (confirmed at line 327 in source, inside `handleAnswerAssessment`)

This is structurally identical to `AsymmetricCrypto9`'s `m1Step`/`m2Step` split, except here it's a single linear `stage` counter rather than two independent variables — which actually makes this simpler than `AsymmetricCrypto9`, not a true multi-stepper. A single `stageToStep` mapping should work directly:

```ts
type Step = 'LEARN' | 'TRY_MANUAL' | 'FAIL_OVERLOAD' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';

function stageToStep(stage: 1 | 2 | 3 | 4 | 5): Step {
  switch (stage) {
    case 1: return 'LEARN';
    case 2: return 'FAIL_OVERLOAD'; // overheat, boot without AC
    case 3: return 'IMPROVE';       // boot succeeded — treat as Mission 1 cleared, moving toward the lab's real payoff (Mission 2)
    case 4: return 'IMPROVE';       // Mission 2 in progress (tape/prediction)
    case 5: return 'OUTCOME';       // reportComplete() fires here — confirmed
    default: return 'LEARN';
  }
}
```

**Judgment call to make explicitly, not silently**: stage 3 (Mission 1 success) is mapped to `IMPROVE` here rather than `COMPLETE`, because unlike `AsymmetricCrypto9` there is no natural `COMPLETE`-then-bridge-to-Mission-2 moment — the lab moves straight from "boot succeeded" into "now let's use this machine for something," which reads more like the improve/mastery-application phase than a discrete completion. If you disagree after reading the actual stage-3 screen content, propose an alternative and say why — don't just follow this table blindly if the on-screen content doesn't support it. This is exactly the kind of call that was worth catching in `AsymmetricCrypto9`'s Mission 2 `INTRO`→`IMPROVE` decision.

Also note: there's no distinct `UNDERSTAND`, `TRY_MANUAL`, or `COMPLETE` value reachable in this mapping — document these as genuine narrative gaps (same treatment as ComputingProject39's missing stages), not invented states.

---

## 5. The other 5 labs — standard Method A/B, same rigor as Tier B/C

- **`ITSupport18.tsx`**, **`ResponsibleAI23.tsx`**: near-identical `intro/playing/feedback/game_over/success` shape. Standard Method A. Map `intro→LEARN`, `playing→TRY_MANUAL`, `feedback→UNDERSTAND`, `game_over→FAIL_OVERLOAD`, `success→COMPLETE` — verify against actual JSX before finalizing (confirm `game_over` really is the fail branch and not, say, a session-end state that could fire on success too).
- **`VirtualMem9.tsx`**: 8-value chain (`intro, ram_fill, first_fault, thrashing_intro, thrashing, upgrade_ssd, ssd_test, success`) — richest narrative here, likely needs 2-3 values folded together (e.g. `thrashing_intro`+`thrashing` both reading as sustained `FAIL_OVERLOAD` or a `FAIL→UNDERSTAND` pair) — read the actual screens before deciding, don't guess from names alone.
- **`PropositionalLogic42.tsx`**: `M1_SANDBOX, M2_AND, M3_OR, M4_XOR, M5_FAULT, OUTCOME` — mission-gate structure. Method A, documented gap on missing explicit Try/Fail/Understand loop terminology (same treatment as EthereumDao9's missing UNDERSTAND).
- **`BrainComputerInterface9.tsx`**: `INTRO, RAW_ATTEMPT, DSP_TUNING, MIND_GRASP, COMPLETED` — the source comments themselves already annotate intended step numbers (`// Step 1: Learn...`, `// Step 2: Try...` etc. — visible in the file, use them, they're the author's own intent). Document the gap: no explicit FAIL/UNDERSTAND stage, narrative goes straight from try to tuning/improve.
- **`TestingStrategies43.tsx`**: 12-value `QAState` chain. This is Method B (in-place rename/fold), not additive — the type has no existing name collision risk the way Tier B/C's "already named Step" files did, but 12→7 requires real folding decisions (e.g. `manual_1_typing`+`manual_1_testing` both reading as one `TRY_MANUAL`, `regression_alert`+`manual_2_fail` both reading as `FAIL_OVERLOAD`, `manual_2_typing`+`manual_2_testing`+`build_selenium`+`selenium_running` reading as `IMPROVE`). Propose your own fold and justify it against the actual on-screen narrative — this is the highest-judgment file in the batch, don't rush it.

---

## 6. What NOT to do

- Don't touch any of the 10 already-closed Tier B/C labs, `JwtTokens9`, `Ransomware9`, or `Colossus28`.
- Don't force `Univac9` into a two-variable Method C combinator — confirmed it's a single linear `stage`, simpler than that.
- Don't invent canonical stages that aren't genuinely present in a lab's narrative — document gaps explicitly, the same standard held all through Tier B/C.
- No layout, palette, or unrelated visual changes. If you find a genuine bug while testing (like the `AsymmetricCrypto9` viewport clipping last batch), fix it, but **disclose it explicitly and separately in your report** — don't let it ride quietly alongside the state-machine diff again.

---

## 7. Verification requirement (unchanged standard)

1. `npx tsc --noEmit` — 0 new errors.
2. `node scripts/lint-labs.js` — must still print the passing message.
3. Grep sweep on the 2 Method B files (`BrainComputerInterface9`, `TestingStrategies43`) for leftover old values — report zero explicitly.
4. Live click-through (not just source-reading) for at least `DeepLearning9` and `Univac9` — these are the two labs with genuine judgment calls in this brief, and both deserve the same DOM-query proof `AsymmetricCrypto9` got: quote `data-step` at 3+ real checkpoints per lab, from an actual browser session, not a static mapping description.
5. Report back per lab: method used, exact mapping table, any folded/collapsed values with justification, any documented gap, and confirmation of render.

Report back per file, same format as every prior batch — I'll independently re-verify all 9 against live source before this closes.
