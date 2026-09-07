# Phase 3 Tier D Batch 2: The 2 Multi-Steppers (BufferOverflow9, PasswordCracking9)

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. This closes out the Tier D Clean/Partial/Multi-stepper buckets entirely — after this batch, 21 of the ~63 in-scope labs are standardized (10 Tier B/C + 9 Batch 1 + these 2), and the remaining 49-lab "No honest fit" bucket stays closed by design, not by omission.

Canonical target, unchanged: `type Step = 'LEARN' | 'TRY_MANUAL' | 'FAIL_OVERLOAD' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';`

---

## 1. Why these two are genuinely multi-steppers, confirmed against source

Both labs were checked directly (not assumed from the original audit) — in both, the two state variables change on distinct, only loosely-paired triggers, so neither can be derived from the other. A combinator taking both inputs is required, same shape as `AsymmetricCrypto9` and `Univac9`, but with **two independent inputs** instead of one linear counter.

### `BufferOverflow9.tsx`
```ts
type Stage = 1 | 2 | 3 | 4 | 5 | 6;
type SysState = "IDLE" | "PROCESSING" | "CRASHED" | "HIJACKED" | "SECURED";
const [stage, setStage] = useState<Stage>(1);
const [sysState, setSysState] = useState<SysState>("IDLE");
```
- `stage` is the coarse narrative counter (1 = intro, 2 = post-crash, 3 = post-crash-explained, 4 = post-hijack, 5 = defense-setup, 6 = secured/final).
- `sysState` is the finer-grained live system-status flag, cycling `IDLE → PROCESSING → CRASHED/HIJACKED/SECURED → IDLE` within and across stages (confirmed multiple `setSysState("IDLE")` reset calls interleaved with stage advances at lines 84–181).
- Read the full file before finalizing the mapping — this brief gives a proposed combinator, not a final answer; confirm against the actual JSX what each `(stage, sysState)` pair actually shows on screen.

### `PasswordCracking9.tsx`
```ts
type Stage = 1 | 2 | 3 | 4;
type AttackStatus = "idle" | "attacking" | "cracked" | "stalled" | "defended";
const [stage, setStage] = useState<Stage>(1);
const [status, setStatus] = useState<AttackStatus>("idle");
```
- `stage` is the mission counter (1-4).
- `status` is the per-attempt animation/outcome flag within a stage — confirmed `status` cycles `idle → attacking → cracked/stalled/defended` multiple times within what looks like the same stage (e.g. lines 91–196 show several `attacking`→`cracked`/`stalled`/`defended` cycles before `setStage(4)` finally fires at line 205).

---

## 2. Proposed combinator shape — verify against actual JSX before finalizing

Same pattern as `getStep(mission, m1Step, m2Step)` in `AsymmetricCrypto9`: one pure function taking both state variables, returning a single canonical `Step`. Draft starting point for `BufferOverflow9` (confirm/correct after reading the full render logic):

```ts
function getStep(stage: Stage, sysState: SysState): Step {
  if (stage === 1) return 'LEARN';
  if (sysState === 'PROCESSING') return 'TRY_MANUAL';
  if (sysState === 'CRASHED' || sysState === 'HIJACKED') return 'FAIL_OVERLOAD';
  if (stage === 5) return 'IMPROVE';
  if (sysState === 'SECURED' || stage === 6) return 'OUTCOME'; // confirm reportComplete() fire point
  return 'UNDERSTAND'; // stages 2-4 post-crash/hijack explanation screens — confirm this is right
}
```

And for `PasswordCracking9`:

```ts
function getStep(stage: Stage, status: AttackStatus): Step {
  if (stage === 1) return 'LEARN';
  if (status === 'attacking') return 'TRY_MANUAL';
  if (status === 'cracked' || status === 'stalled') return 'FAIL_OVERLOAD';
  if (status === 'defended') return 'COMPLETE'; // or OUTCOME — confirm reportComplete() fire point
  return 'IMPROVE'; // between-attempt states — confirm against actual screen content
}
```

**Both drafts above are starting hypotheses, not approved mappings.** Neither has been checked against the actual on-screen narrative the way `Univac9`'s and `AsymmetricCrypto9`'s combinators were last time — confirm what each `(stage, status)` pair genuinely shows before committing, and correct anything that doesn't hold up. In particular:
- Find exactly where `reportComplete()` fires in each file and make sure that state maps to `OUTCOME`, not `COMPLETE` — this has been the single most common correction needed across every prior batch.
- Check whether `UNDERSTAND` has a genuine dedicated screen in either lab, or whether it's a gap that should be documented instead of assumed.

---

## 3. What NOT to do

- Don't touch any of the 19 already-closed labs (10 Tier B/C + 9 Tier D Batch 1).
- Don't collapse `stage` and `sysState`/`status` into a single variable — keep both as-is, this is purely additive, same rule as every prior Method C lab.
- No layout, palette, or unrelated visual changes. Disclose any bug fix found during testing explicitly and separately, same standard reinforced last batch after the `AsymmetricCrypto9` viewport issue.

---

## 4. Verification requirement (unchanged standard)

1. `npx tsc --noEmit` — 0 new errors.
2. `node scripts/lint-labs.js` — must still pass.
3. **Live click-through required for both labs, not source-reading alone** — this batch has no "easy" labs to lean on, both are genuine combinators. Quote `data-step` at every real transition you can trigger: initial `LEARN`, at least one `TRY_MANUAL`, at least one `FAIL_OVERLOAD`, and the final state where `reportComplete()` fires.
4. Report back per lab: the actual (not hypothesized) mapping table with every `(stage, secondVar)` combination checked against real rendered content, confirmation of where `reportComplete()` fires and that it maps to `OUTCOME`, and any documented narrative gap.

---

## 5. After this batch

This closes the entire currently-scoped Tier D execution (21 labs total across both batches). The remaining 49 "No honest fit" labs stay excluded by design — no further Tier D work is approved beyond this without a fresh scoping conversation, since forcing a 7-stage shape onto labs that are genuinely sandboxes, single-request cycles, or static tools would mean inventing narrative that isn't there.
