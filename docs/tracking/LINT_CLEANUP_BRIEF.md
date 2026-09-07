# Lint Cleanup Brief: Zero Out Pre-Existing Debt Before Phase 3

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. This is a dedicated pass, not opportunistic — the goal is a linter that runs silently, so the first red line during Phase 3's state-machine refactor is guaranteed to be a real regression, not background noise.
> **Scope**: 12 pre-existing violations across 11 files, confirmed unrelated to any prior phase's diff. No layout, palette, or typography work here — that's closed. This is copy/comment text only.

---

## 1. Why these are safe to touch now

Every one of these 12 violations was checked against `git diff` during Batch 2B review and confirmed to already exist before that batch's changes — none were introduced by recent work. `node scripts/lint-labs.js` only reports the **first matching line per banned word per file**, so a file listed once may still need more than one edit if the word recurs — check the whole file, not just the reported line.

---

## 2. The 12 violations, with exact context

### `AdvancedAlgorithms24.tsx` — "Array" + "Sorted"
Both are core vocabulary for a Merge Sort / Binary Search lab — **do not blanket find-replace**. Read each occurrence and rephrase naturally:
- Line 323: `"...at the front of either array."` → e.g. "at the front of either list."
- Line 330: `"Left Array"` badge label → e.g. "Left List" / "Left Group"
- Line 359: `"Right Array"` badge label → matching rename
- Line 24, 25, 27 (and any others): `"sorted database"`, `"sorted alphabetically"`, `"sorted server log"` → e.g. "ordered database", "ordered alphabetically", "time-ordered server log"
- Search the full file for every instance of "array" and "sorted" (case-insensitive) — the lint tool only reported the first hit of each word, there may be more below line 359.

### `AIEducation22.tsx` — "Array"
- Line 49: `// Array of 3 slots` — this is a **code comment**, not visible UI text. The lint regex doesn't distinguish comments from JSX strings, so it still trips. Fix: reword the comment, e.g. `// Group of 3 slots`. No visible-copy change needed.

### `BinarySearch12.tsx` — "Sorted"
Same category as AdvancedAlgorithms24 — "sorted" is core to a Binary Search lab, rephrase carefully, don't strip the concept:
- Line 11: `// Generate distinct sorted arrays for levels` (comment — reword freely, e.g. "ordered lists")
- Line 89: `"List is sorted! Now try..."` (visible feedback text) → e.g. "List is in order! Now try the Binary Search logic again."
- Line 177: `"...why sorted data is a strict requirement!"` (visible instruction text) → e.g. "...why ordered data is a strict requirement!"
- Search the full file for more instances — only the first 3 are shown here.

### `BufferOverflow9.tsx` — "Array" + Emoji
- Line 71: `// Construct current payload display array` — comment, reword e.g. "display list".
- Lines 74/78: `Array(Math.min(...)).fill(...)` and `Array(payloadLen).fill(...)` — these are **JS constructor calls**, not flagged by the word-boundary regex (confirmed: `Array(` is explicitly excluded). Leave these alone.
- **Emoji**: not yet located by line number — run a full-file scan (see §4 below) since the emoji regex doesn't print which character or line it matched. Search for any emoji character and remove or replace with a Lucide icon component, consistent with how every other lab in this catalog renders icons.

### `ComputingBenefits44.tsx` — Emoji
- Same as above: no line number reported. Full-file emoji scan required.

### `ComputingProject39.tsx` — Emoji
- Same: full-file emoji scan required.

### `DataVisualization36.tsx` — Emoji
- Same: full-file emoji scan required.

### `EthereumDao9.tsx` — "Conduit"
- Line 342: `{/* Conduit */}` — this is a **JSX comment naming a visual element** (a connecting line/wire in the diagram, presumably), not visible text. Fix: rename the comment, e.g. `{/* Connector */}` or `{/* Link Line */}`. Zero visual risk — comments don't render.

### `ITSupport18.tsx` — Emoji
- Same: full-file emoji scan required.

### `SmartRing32.tsx` — "Firmware"
- Line 799: `message="Firmware Certified! You have mastered power-budget tradeoffs for wearable computing."` — this is a **visible completion-screen message** shown to the student. Fix: rephrase without the banned word, e.g. `"Power Budget Certified! You have mastered power-budget tradeoffs for wearable computing."` Keep the celebratory tone and the existing sentence structure — only the first clause needs to change.

### `VirtualMem9.tsx` — "Array"
- Line 365: `<Zap size={14} /> Physical RAM Array` — this is **visible UI label text** (confirmed via isolated regex test — this exact string is what trips the check, not the `Array(6)`/`Array(12)` calls on lines 411/421, which are correctly excluded and must NOT be touched). Fix: rename the label, e.g. `"Physical RAM Bank"` or `"Physical RAM Modules"`.

---

## 3. What NOT to touch

- `Array(N).fill(...)` / `[...Array(N)]` constructor calls anywhere — these are code, already correctly excluded by the linter's own regex, and touching them risks breaking actual logic for zero lint benefit.
- Any dark-token, subtitle, or micro-typography work — all three are closed per the prior two handoffs. This brief is banned-word and emoji only.
- Any layout, spacing, or interaction logic. Text-only changes.

---

## 4. Locating the 5 unresolved emoji violations

The lint script's emoji check only reports the filename, not the line or character — `node scripts/lint-labs.js` alone won't pinpoint it. Before editing, run something equivalent to this against each of the 5 flagged files to get exact line numbers:

```bash
grep -nP '[\x{1F300}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{1F600}-\x{1F64F}\x{1F680}-\x{1F6FF}]' labs/BufferOverflow9.tsx labs/ComputingBenefits44.tsx labs/ComputingProject39.tsx labs/DataVisualization36.tsx labs/ITSupport18.tsx
```

For each hit found: if it's decorative (e.g. a celebratory emoji in a completion message), replace with a Lucide icon component matching the lab's existing icon usage elsewhere. If it's inside a comment, just delete it or reword the comment.

---

## 5. Verification requirement

1. `node scripts/lint-labs.js` — must print `✅ Lab linting passed.` and exit 0. This is the actual bar: not "0 new violations" (the standard for every prior phase), but **true zero total violations**, since the whole point of this pass is a silent baseline.
2. `npx tsc --noEmit` — 0 errors.
3. For the two rephrased-vocabulary files (`AdvancedAlgorithms24.tsx`, `BinarySearch12.tsx`), screenshot the resting state at 1366×768 to confirm the reworded copy still reads naturally and nothing broke visually — text length changes can occasionally wrap differently.
4. Report back per file: exact line(s) changed, old text → new text. Do not report "removed banned word" without showing the actual before/after string — that's the level of specificity every closure claim in this project has needed to survive re-verification.

---

## 6. Definition of done

`node scripts/lint-labs.js` exits 0 with the passing message, across the full 59-lab catalog, with zero suppressions or banned-word-list edits used to get there — every fix is a genuine copy/comment change, not a loosening of the linter itself. Once confirmed, Phase 3 (state-machine standardization) can begin against a linter that only ever fires on a real new regression.
