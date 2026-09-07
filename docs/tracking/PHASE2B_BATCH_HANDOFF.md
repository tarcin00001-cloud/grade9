# Phase 2B Batch Handoff: Remaining 15 Labs (Ranks 2–16)

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. This supersedes nothing in `PHASE2B_THEME_MOBILE_BRIEF.md` — read that first for the full method, palette guidance, and verification standard. This document only narrows scope to the remaining labs and folds in what the `ransomware9` pilot proved.

---

## 1. What's already done — do not re-touch

**`ransomware9` (rank 1, 18→7 dark-token hits) is fully fixed and independently re-verified.** Its fix is the reference implementation for this batch — read `labs/Ransomware9.tsx` before starting if you want a worked example of:
- How to distinguish a dominant dark-void fill (fix it) from a genuinely contained hardware accent (leave it) — see the M3 memory-scan monitor and M5 SIEM terminal, both kept intentionally dark with a light bezel/frame around them so they read as equipment, not voids.
- How subtitle removal, dark-token fixes, and micro-typography can be done together in one pass per file.
- A real example of the verification bar: rendered screenshots at rest, `tsc`/lint clean, and the exact token counts reported before/after (19→7, not just "fixed").

Do not modify `Ransomware9.tsx` in this batch.

---

## 2. Scope: 15 labs, ranks 2–16

Work top-down. Stop and report back after finishing this list rather than continuing further down the full 59-lab queue without a checkpoint.

| Rank | Slug | File | Dark-token hits (last measured) | Theme prop |
|---|---|---|---:|---|
| 2 | `algorithmicmusic9` | `AlgorithmicMusic9.tsx` | 14 | none |
| 3 | `mobileplatform37` | `MobilePlatform37.tsx` | 11 | `ocean` |
| 3 | `csrfattacks9` | `CsrfAttacks9.tsx` | 11 | none |
| 5 | `ratelimiting9` | `RateLimiting9.tsx` | 9 | none |
| 5 | `quantumcomputing9` | `QuantumComputing9.tsx` | 9 | `cosmos` |
| 5 | `cloudflare9` | `Cloudflare9.tsx` | 9 | none |
| 8 | `sshkeys9` | `SshKeys9.tsx` | 8 | none |
| 9 | `univac9` | `Univac9.tsx` | 7 | none |
| 9 | `setsandvenn27` | `SetsAndVenn27.tsx` | 7 | none |
| 11 | `usbconnectivity25` | `USBConnectivity25.tsx` | 6 | none |
| 11 | `smartring32` | `SmartRing32.tsx` | 6 | `ocean` |
| 11 | `foldablesmartphone11` | `FoldableSmartphone11.tsx` | 6 | none |
| 11 | `ethereumdao9` | `EthereumDao9.tsx` | 6 | none |
| 11 | `cloudstrategy16` | `CloudStrategy16.tsx` | 6 | none |
| 11 | `bufferoverflow9` | `BufferOverflow9.tsx` | 6 | `ocean` |

**Re-run the dark-token grep on each file before starting work on it** — these counts are from the original audit and may have drifted if anything touched these files since. Report the actual starting count you find, not the number in this table, if they differ.

Also apply, on any of these 15 that have it (checked against the full brief's Section 3/4 lists, not re-copied here):
- Subtitle removal, if the file still passes `subtitle=` to `LabShell`.
- Micro-typography floor (`text-[Npx]` where N ≤ 9 → `text-xs` minimum).

---

## 3. One correction from the pilot, folded into this handoff

The original brief's Section 3 said to give screenshot proof "for every dark-token fix." Based on the `ransomware9` pilot: **also verify with a lint pass on every file you touch**, even ones that look purely visual. The pilot's own comment-wording introduced a banned word (`"sequential"`) that `node scripts/lint-labs.js` caught and the original brief didn't explicitly call out as a risk for code-comment text, not just UI strings. Lint every touched file, not only ones where you added visible copy.

---

## 4. Verification requirement (unchanged from the full brief, restated for this batch)

For each of the 15 labs:
1. `npx tsc --noEmit` — 0 new errors.
2. `node scripts/lint-labs.js` — 0 new violations, including in code comments.
3. Re-run the dark-token grep, report before/after count. A nonzero remaining count is fine if it's a genuinely contained accent — say which element and why, the way the `ransomware9` fix documented its 7 remaining hits.
4. Screenshot before/after at 1366×768.
5. If the lab has a multi-stage/mission flow, note explicitly whether you were able to click through and visually confirm later stages, or whether you only verified the resting state. Say so plainly either way — don't imply full-flow verification if only the first screen was checked.

Report back per lab in the same format as the `ransomware9` walkthrough: slug, starting count, ending count, what was preserved as an accent and why, confirmation of render.
