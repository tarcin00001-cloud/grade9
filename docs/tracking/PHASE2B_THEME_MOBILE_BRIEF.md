# Phase 2B Kickoff Brief: Theme & Mobile Compliance Pass

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to start. This is the second Phase 2 workstream (catalog extension already closed). The 7-step state machine standardization and low-scoring lab rewrites remain separately scoped items — do not fold them into this pass.

---

## 0. Read this before starting

The original 4-proposal plan framed this as "migrate `cosmos`/dark-void themed labs to `ocean`." **That framing does not survive contact with the actual code and should not be followed as written.** The `theme` prop on `LabShell` only controls text color contrast decisions inside the shell chrome — it does **not** set each lab's background. Every lab's actual background comes from its own JSX (a `bgOverride` string or an internal gradient div), completely independent of what `theme` value it happens to pass.

Concretely: `ransomware9` passes `theme="ocean"` (the "safe" theme) yet has **18** occurrences of literally-banned dark-void tokens in its own markup — the single worst offender in the catalog. Meanwhile several `theme="cosmos"` labs (`microservices9`, `machinelearningtraining9`) have only 1 occurrence each. **Do not use the `theme` prop name as your worklist.** Use the actual token grep below, verified directly against source on 2026-09-05.

---

## 1. What was actually measured

Three independent, re-runnable checks across all 59 catalog labs:

1. **Banned dark-void tokens** (per `AGENTS.md`'s "High Contrast Themes Only" mandate: `bg-slate-900`, `bg-slate-950`, `#050518`, `#060b14`, `#0f172a`) — counted per file. A nonzero count is not automatically a violation: a small, contained mechanical accent (a terminal readout, a conveyor track) is allowed to stay dark. What matters is whether the token is the **dominant background fill** or a **contained accent** — that judgment has to be made per lab by looking at it, not by the count alone.
2. **Banned `subtitle` prop usage** on `<LabShell>` — AGENTS.md's zero-scroll mandate (§4) says to rely on `instruction` + `compact={true}` instead. 27 of 59 labs still pass `subtitle`.
3. **Sub-10px micro-typography** (`text-[Npx]` where N ≤ 9) — banned under the mobile/zero-scroll rules. 46 of 59 labs have at least one occurrence.

Reproduce all three yourself before starting, since this brief's numbers are a snapshot:
```bash
grep -c -E 'bg-slate-900|bg-slate-950|#050518|#060b14|#0f172a' labs/<File>.tsx
grep -l 'subtitle=' labs/*.tsx
grep -lE 'text-\[[4-9]px\]' labs/*.tsx
```

---

## 2. Priority queue — ranked by actual dark-token severity, not theme name

| Rank | Slug | File | Dark-token hits | `theme` prop | Note |
|---|---|---|---:|---|---|
| 1 | `ransomware9` | `Ransomware9.tsx` | 18 | `ocean` | Worst offender in the catalog despite the "safe" theme name. `bgOverride="bg-slate-950"` is set directly on the shell. |
| 2 | `algorithmicmusic9` | `AlgorithmicMusic9.tsx` | 14 | none | No theme prop at all; check what's actually rendering. |
| 3 | `mobileplatform37` | `MobilePlatform37.tsx` | 11 | `ocean` | Same false-safety pattern as `ransomware9`. |
| 3 | `csrfattacks9` | `CsrfAttacks9.tsx` | 11 | none | |
| 5 | `ratelimiting9` | `RateLimiting9.tsx` | 9 | none | |
| 5 | `quantumcomputing9` | `QuantumComputing9.tsx` | 9 | `cosmos` | The one lab where theme name and actual darkness roughly agree. |
| 5 | `cloudflare9` | `Cloudflare9.tsx` | 9 | none | |
| 8 | `sshkeys9` | `SshKeys9.tsx` | 8 | none | |
| 9 | `univac9` | `Univac9.tsx` | 7 | none | |
| 9 | `setsandvenn27` | `SetsAndVenn27.tsx` | 7 | none | |
| 11 | `usbconnectivity25` | `USBConnectivity25.tsx` | 6 | none | `bgOverride="bg-slate-900"` directly. |
| 11 | `smartring32` | `SmartRing32.tsx` | 6 | `ocean` | |
| 11 | `foldablesmartphone11` | `FoldableSmartphone11.tsx` | 6 | none | |
| 11 | `ethereumdao9` | `EthereumDao9.tsx` | 6 | none | |
| 11 | `cloudstrategy16` | `CloudStrategy16.tsx` | 6 | none | |
| 11 | `bufferoverflow9` | `BufferOverflow9.tsx` | 6 | `ocean` | |

**Everything below rank 16** (down to single-digit and zero-hit labs) is lower priority — work top-down and stop when you run out of allotted time for this pass rather than trying to force all 59 into one batch. Re-run the grep after finishing the top 16 to confirm the count actually dropped before moving further down the list.

**Zero-hit labs, confirmed clean on this specific check** (do not touch for this reason — they may still have `subtitle`/micro-type issues, see below): `classesinjava9`, `binarysearch12`, `crosssitescripting9`, `webassembly9`, `computingproject39`, `semanticweb45`, `propositionallogic42`.

---

## 3. What "fixed" means for a dark-token hit

For each lab you touch, per hit found:
1. Open the lab and actually look at what that token controls. Is it the outer shell background / a full-screen gradient div (**fix it**), or a small mechanical element — a readout screen, a conveyor belt, a terminal window inset within an otherwise light scene (**leave it, it's allowed**)?
2. If it needs fixing, replace the **base fill** with `AGENTS.md`'s actual current mandate: the `ocean` theme — crisp white cards, dark slate typography, vibrant emerald/indigo interactive accents. A clean glossy chassis material (snow white, brushed metal, hazard yellow, cobalt blue) is a reasonable extension of that same direction. Do not invent a new color language per lab — stay inside this approved set.
3. Do not change layout, mechanics, or which elements exist on screen. This is a palette pass, same restriction as Phase 1's Target 4e — colorfulness/compliance only.
4. Screenshot before/after at 1366×768 for every lab you touch. A code diff alone does not prove the fix — this project's history includes multiple cases where a "fixed" palette read correctly in the diff but rendered wrong (self-shadowing, z-fighting, washed-out colors against a new background depth). Look at the actual render.

---

## 4. `subtitle` prop removal (12 labs in the current catalog)

The raw grep for `subtitle=` across `labs/*.tsx` hits 27 files, but most of those (`ChaosEngineering9`, `Containerization9`, `DatabaseIndexing9`, `EdgeComputing9`, `TwoFactorAuth9`, etc.) are not in the 59-entry catalog at all — same category as the pre-Phase-2 unregistered files, out of scope here. Filtered down to only the labs actually in `data/labs.ts`, the real list is:

`contentdeliverynetwork9, continuousintegration9, datavisualization36, graphqlbasics9, jwttokens9, machinelearningtraining9, microservices9, oauthflow9, reverseproxies9, torrouting9, webassembly9, zerodayexploit9`

Confirm each still has `subtitle=` before editing (this brief is a snapshot). For each: remove the `subtitle` prop, rely on `instruction` (already required) and `compact={true}`. Confirm the lab's header doesn't leave an empty gap where the subtitle used to render — check spacing after removal, don't just delete the line blindly.

Note the overlap with Section 2 and 3's dark-token/micro-type work: several of these (`torrouting9`, `microservices9`, `machinelearningtraining9`, `graphqlbasics9`, `oauthflow9`, `reverseproxies9`, `webassembly9`, `jwttokens9`, `continuousintegration9`) are the Phase 2 extension labs, and it's worth doing all three fixes (dark-token, subtitle, micro-type) on each of these 9 files in one pass rather than reopening them three separate times.

---

## 5. Micro-typography sweep (43 labs in the current catalog, of 46 raw hits)

Replace any `text-[Npx]` where N ≤ 9 with `text-xs` (12px) as the floor, or a larger step if the surrounding layout has room. This is the single largest-count item in this brief — budget accordingly, and prioritize it on labs that are already being touched for the dark-token fix or `subtitle` removal (do all applicable passes on the same file in one edit, don't reopen files multiple times). Re-run `grep -lE 'text-\[[4-9]px\]' labs/*.tsx` yourself and cross-check against `data/labs.ts`'s 59 slugs before starting — 3 of the 46 raw hits are in files outside the current catalog and are out of scope.

---

## 6. Mobile / zero-scroll check (390×844 and 1024×450)

AGENTS.md §6 mandates zero vertical scroll and zero clipping at these two checkpoints specifically (of the full 7-viewport list, these are the tightest constraints and the ones most likely to fail). This brief does not have pre-existing screenshot evidence at these two sizes for all 59 labs — that would need its own pass. For labs you're already touching in sections 2–5 above, add this check to the same verification round:
1. Render the lab at 390×844 and at 1024×450.
2. Confirm no vertical scrollbar appears and no interactive element is clipped or pushed off-screen.
3. If either viewport fails, note it in your report even if you don't fix it in this batch — don't silently skip a failing viewport just because it wasn't the reason you opened the file.

---

## 7. Explicitly out of scope for this brief

- The 7-step state machine standardization (separate brief, not this one).
- Full lab rewrites / new mechanics / new failure states (separate brief).
- Any lab not in the current 59-entry catalog.
- Changing a lab's `theme` prop value itself — that's cosmetic metadata only; changing it does nothing to the actual background per §0 above, so there's no reason to touch it as part of this work.

---

## 8. Verification requirement

Same standard as every prior phase in this project — claims get independently re-checked against the running code and a rendered screenshot, not accepted from a diff or an exit code alone:

1. `npx tsc --noEmit` — 0 new errors.
2. `node scripts/lint-labs.js` — 0 new violations.
3. Re-run all three greps from Section 1 and report the new counts per file you touched, not just "fixed."
4. Screenshot before/after at 1366×768 for every dark-token fix.
5. Screenshot at 390×844 for every lab you also mobile-check per Section 6.
6. Report format per lab: slug, what was found (dark-token count / subtitle present / micro-type count), what was actually changed, and the re-measured count after your fix. If a lab's count didn't reach zero, say so and say why (e.g. "2 remaining hits are the terminal readout screen, judged as an allowed contained accent, not fixed").

Do not report a lab "done" if you did not re-render it and look.
