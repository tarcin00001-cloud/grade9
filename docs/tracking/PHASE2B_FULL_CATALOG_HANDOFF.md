# Phase 2B Full-Catalog Handoff: Subtitle + Micro-Typography Cleanup (All Remaining Labs)

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. This completes the Theme & Mobile Pass visual baseline across the entire 59-lab catalog before Phase 3 (state-machine standardization) begins.
> **Supersedes**: Nothing. Extends `PHASE2B_BATCH_HANDOFF.md` (ranks 2–16, closed) to the rest of the catalog for the two remaining violation types only — dark-token remediation is NOT re-opened here; that work is done.

---

## 0. Why the numbers here differ from what you may have seen before

An earlier planning pass cited "12 subtitle violations" and "24 micro-typography offenders" as the remaining scope. A fresh full-catalog grep run just now found the real numbers are larger:

- **27 files** still pass a `subtitle=` prop to `LabShell` (banned per AGENTS.md — no exceptions carved out).
- **33 files** contain sub-10px literal text sizes (`text-[Npx]` / `text-[N.Npx]`), totaling **153 individual instances** to raise to `text-xs` (10px) minimum.

Treat the tables in this document as the ground truth, not the 12/24 figures. Two things fell out of this audit worth flagging explicitly:

1. **`ContentDeliveryNetwork9.tsx` — one of AGENTS.md's three named "Gold Standard Reference Labs" — has both violations**: 1 `subtitle=` prop (line 370) and **35 micro-typography instances**, the highest count in the entire catalog. Gold-standard status was evidently judged on layout/mechanics, not this specific checklist. Fix it like any other file; its reference status for layout patterns is unaffected.
2. **`Univac9.tsx` was reported CLOSED in the last Batch 2B walkthrough** ("micro-type reduced 12 → 0") but actually still has **5 micro-typography instances** (`text-[8.5px]` ×4, `text-[9.5px]` ×1, lines 94/110/126/142/649). This is a real leftover gap in a lab marked done, not a new violation — pick it up as part of this pass and correct the closure record once fixed.

---

## 1. Scope: two violation types, full catalog

Do **not** re-touch dark-token counts on the 16 labs already closed (ransomware9 + ranks 2–16) — that work is verified and final. This handoff only concerns:

- Removing `subtitle=` props (move the content into `instruction`/`hint` or drop it — never render it as a second title line).
- Raising every `text-[Npx]` / `text-[N.Npx]` below 10px to `text-xs` as the floor.

### 1a. Subtitle violations — 27 files

| File | Current subtitle content (truncated) |
|---|---|
| ChaosEngineering9.tsx | "L48 · System Reliability..." |
| Containerization9.tsx | "L23 · Cloud Architecture..." |
| ContentDeliveryNetwork9.tsx | "Deploy Regional Caches to Reduce Global Wait Time" |
| ContinuousIntegration9.tsx | "L46 · DevOps..." |
| DataVisualization36.tsx | "Grade 9 \| Data Representation..." |
| DatabaseIndexing9.tsx | "L22 · Database Engineering..." |
| DigitalSignatures9.tsx | "L25 · Cryptography..." |
| EdgeComputing9.tsx | "L44 · Cloud Infrastructure..." |
| EventSourcing9.tsx | "L47 · Data Architecture..." |
| GraphQLBasics9.tsx | "L38 · Web Engineering..." |
| JwtTokens9.tsx | "L45 · Cryptography..." |
| LoadBalancing9.tsx | "L31 · Cloud Architecture..." |
| MachineLearningTraining9.tsx | "L36 · Artificial Intelligence..." |
| Microservices9.tsx | "L34 · System Architecture..." |
| OauthFlow9.tsx | "L42 · Web Security..." |
| PublicKeyInfrastructure9.tsx | "L24 · Cryptography..." |
| ReverseProxies9.tsx | "L43 · Network Architecture..." |
| ServerlessFunctions9.tsx | "L43 · Cloud Architecture..." |
| SmartContracts9.tsx | "L29 · Blockchain Technology..." |
| Subnetting9.tsx | "L23 · Network Architecture..." |
| TorRouting9.tsx | "L33 · Network Privacy..." |
| TwoFactorAuth9.tsx | "L41 · Security Architecture..." |
| VectorDatabases9.tsx | "L46 · Artificial Intelligence..." |
| WebAssembly9.tsx | "L44 · Browser Engines..." |
| WebSockets9.tsx | "L30 · Network Protocols..." |
| ZeroDayExploit9.tsx | "L35 · Application Security..." |

Note the pattern: most of these use a `"L{n} · {category}"` convention — that's lesson-number metadata, not a real subtitle. Move it into a small metadata chip elsewhere in the header if it's worth keeping visually, or drop it — either is acceptable, but it must not render through the banned `subtitle` prop.

### 1b. Micro-typography violations — 33 files, 153 instances

| Instances | File |
|---:|---|
| 35 | ContentDeliveryNetwork9.tsx |
| 12 | VirtualMem9.tsx |
| 8 | RequirementAnalysis9.tsx |
| 8 | ITSupport18.tsx |
| 7 | OopPython15.tsx |
| 7 | EventSourcing9.tsx |
| 7 | AIEducation22.tsx |
| 6 | ContinuousIntegration9.tsx |
| 6 | Blockchain9.tsx |
| 5 | Univac9.tsx *(leftover from Batch 2B — see §0)* |
| 5 | ResponsibleAI23.tsx |
| 5 | DataVisualization36.tsx |
| 4 | TestingStrategies43.tsx |
| 4 | CrossSiteScripting9.tsx |
| 3 | SemanticWeb45.tsx |
| 3 | RoboticSurgery46.tsx |
| 3 | JwtTokens9.tsx |
| 3 | ComputingProject39.tsx |
| 3 | Colossus28.tsx |
| 3 | ChaosEngineering9.tsx |
| 2 | VectorDatabases9.tsx |
| 2 | HashFunctions9.tsx |
| 2 | ClassesInJava9.tsx |
| 1 | WebAssembly9.tsx |
| 1 | SymmetricCrypto9.tsx |
| 1 | SpectreMeltdown9.tsx |
| 1 | PasswordCracking9.tsx |
| 1 | ManInTheMiddle9.tsx |
| 1 | MachineLearning9.tsx |
| 1 | Gpu9.tsx |
| 1 | BrainComputerInterface9.tsx |
| 1 | BinarySearch12.tsx |
| 1 | AdvancedAlgorithms24.tsx |

Two of these (`RoboticSurgery46.tsx`, `ContentDeliveryNetwork9.tsx`) are AGENTS.md gold-standard reference labs. Fix them the same as any other file — do not skip or special-case them.

Some of these files (RequirementAnalysis9, HashFunctions9, ClassesInJava9, Colossus28, JwtTokens9, ComputingProject39) overlap with Phase 1 or Phase 3 pilot work from earlier phases. That's fine — this is a different violation type (typography, not LMS wiring or state machine), so touching them again here doesn't conflict.

---

## 2. Method

Same standard as every prior phase in this project:

1. Batch by file count, not by severity this time — there's no dark-token risk calculus here, just a mechanical floor-raise and a prop removal. Suggest 4 batches of ~7-8 files each, but organize however is efficient; report per-batch.
2. For subtitle removal: read how each file currently renders the `LabShell` header before deciding whether the content is worth relocating or safe to drop. Don't guess — check each file individually since the "L{n} · category" pattern may be used elsewhere in the component too.
3. For micro-typography: every `text-[Npx]` / `text-[N.Npx]` where N < 10 → `text-xs` at minimum. If a responsive pair exists (e.g. `text-[7px] sm:text-[8px]`), both sides must clear the floor — `text-xs sm:text-xs` is acceptable, or a slightly larger paired class if it reads better, but neither side may stay below 10px.
4. Do not touch dark-token counts, layout, mechanics, or interaction logic in these files. This is a typography/prop-only pass — same constraint as every phase so far: **no design changes except toward a more colorful, higher-contrast UI.**

---

## 3. Verification requirement (unchanged standard)

For every file touched:

1. `npx tsc --noEmit` — 0 new errors.
2. `node scripts/lint-labs.js` — 0 new violations.
3. Re-grep both violation types on the file, report the exact before/after count. For subtitle, before/after is binary (1→0). For micro-typography, report the instance count, not just "fixed."
4. Screenshot before/after at 1366×768 for at least one file per batch — prioritize `ContentDeliveryNetwork9.tsx` given its reference status and highest violation count.
5. For `Univac9.tsx` specifically: explicitly reconcile this fix against the prior Batch 2B closure claim — state plainly "Batch 2B claimed 12→0; actual was 12→5; now corrected to 5→0" (or whatever the real numbers turn out to be) rather than silently re-closing it.

Report back per batch: files touched, starting count, ending count, confirmation of render, and any file where content had to be judgment-called (e.g., subtitle content that seemed worth preserving elsewhere).

---

## 4. What comes after this

Once this lands and is verified, the full 59-lab catalog will be clean on: dark-token dominance, subtitle prop usage, and micro-typography floor. That closes the Theme & Mobile Pass entirely. Phase 3 (7-step state-machine standardization, currently drafted but not approved for full rollout) is the next candidate workstream — it will not begin until this visual baseline is confirmed closed, per the user's explicit sequencing: finish the UI layer cleanly before touching mechanical/state logic, so the two aren't fought simultaneously.
