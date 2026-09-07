# Phase 4 Quick Fixes: 2 Minor Bugs from the Content Audit

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. Two small, well-scoped fixes from the render-verified content audit (`docs/tracking/PHASE4_CONTENT_AUDIT.md`). Both are low severity, non-blocking for students, but worth a quick pass.

---

## 1. `RoboticSurgery46.tsx` — clipped "Guide Scalpel" label

**Confirmed root cause, more subtle than a simple CSS typo — read this before touching the file.**

The label pill is at line ~342:
```tsx
<motion.div
   className={`absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 font-bold text-[10px] lg:text-xs uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border backdrop-blur whitespace-nowrap ${...}`}
>
  {!hasStarted ? <><MousePointer2 size={14}/> Guide Scalpel</> : ...}
</motion.div>
```
It already has `whitespace-nowrap`, so this isn't a text-wrapping bug. The actual issue: this pill is nested inside the draggable scalpel handle (`absolute z-30 w-16 h-16 -ml-8 -mt-8`, line ~333), which is itself inside a parent container with `overflow-hidden` (line ~306, the `rounded-xl ... overflow-hidden` wrapper). The pill is centered (`left-1/2 -translate-x-1/2`) *relative to the handle*, not the scene — so when the scalpel/handle is positioned near the left edge of the scene (as it is at the Stage 1 default starting position, confirmed via screenshot), the pill's left portion extends past the handle and gets clipped by the ancestor's `overflow-hidden` boundary. The clipping is position-dependent, not a static sizing bug — it will look fine once the scalpel is dragged toward the center, and only clips near the edges.

**Fix options** (pick whichever fits the design best, verify visually either way):
- Clamp the pill's horizontal position so it never extends past the scene bounds (e.g. conditionally shift it right when the handle is near the left edge, left when near the right edge) — more correct but more work.
- Simpler: since this pill only shows in the `!hasStarted` state (before the student starts dragging), consider anchoring it to a fixed position within the scene for that specific state, rather than tracking the handle, since a static "Guide Scalpel" prompt doesn't need to follow drag position before dragging has even begun. Check whether this simpler fix loses any intended UX before choosing it over the clamp approach.

**Verify**: screenshot the initial Stage 1 render (matches the state audited) and confirm "Guide Scalpel" is now fully visible, not clipped.

---

## 2. `SpectreMeltdown9.tsx` — SVG attribute not evaluated as an expression

Line 570:
```tsx
<rect key={i} x="530" y="140 + i * 30" width="100" height="20" rx="4" fill="#e2e8f0" />
```
`y="140 + i * 30"` is a plain string, not a JSX expression. Fix:
```tsx
<rect key={i} x="530" y={140 + i * 30} width="100" height="20" rx="4" fill="#e2e8f0" />
```
One-character-class fix (add `{}` around the expression, remove the quotes). Confirmed via live console error firing 3 times: `<rect> attribute y: Expected length, "140 + i * 30".` The lab renders and functions correctly regardless — this just removes 3 recurring invalid-attribute console errors.

**Verify**: reload the lab, confirm this specific console error no longer appears (other unrelated console output, if any, is out of scope).

---

## 3. What NOT to do

- Don't touch `MachineLearning9.tsx` or `BrainComputerInterface9.tsx` — both have known findings from the same audit (Framer Motion first-paint noise, SSR hydration mismatch) but both are explicitly marked lower priority, cosmetic-only, and not part of this handoff. Leave them for now.
- Don't do a broader pass over either file beyond the specific bug described — this is a two-line-diff fix, not a refactor.

---

## 4. Verification requirement

1. `npx tsc --noEmit` — 0 new errors.
2. `node scripts/lint-labs.js` — must still pass.
3. Screenshot both labs at rest, confirm the specific visual/console issue is resolved and nothing else regressed.
4. Report back: exact diff for each fix, plus confirmation the console error count for `SpectreMeltdown9` dropped from 3 to 0.
