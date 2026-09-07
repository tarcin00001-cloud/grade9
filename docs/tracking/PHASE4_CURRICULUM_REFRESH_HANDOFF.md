# Phase 4 Step 2: Curriculum Reference Refresh (Research Only)

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. **This is a research task — no code changes, no edits to any lab file.** The only file you touch is `docs/CURRICULUM_REFERENCE.md` itself.

---

## 1. Why this is needed

`docs/CURRICULUM_REFERENCE.md` (1,258 lines) documents all 48 book chapters against the lab catalog and lists two gap tables: 14 labs with no matching book chapter, and 14 book chapters with no matching lab. It was built against an earlier catalog snapshot. The catalog now has **72 entries** (`n:1`–`n:72`, confirmed contiguous, no gaps) — up from whatever count existed when the reference was written, including the 13 labs just reconnected in the previous Phase 4 step (`containerization9` through `loadbalancing9`, `n:60`–`n:72`).

**I already found one confirmed error while scoping this** — fix it as part of this pass, don't just note it:

- The reference's "Book chapters with NO corresponding lab" list (line 1251) claims **Ch.43 Testing Strategies has no lab**. This is wrong: `testingstrategies43` (catalog `n:59`, title "Testing Strategies & TestingScript") already exists, matches Ch.43's own content (Selenium, test automation pyramid) almost exactly, and even carries the chapter number in its own slug. Remove this chapter from the "no lab" list and add it to wherever the reference documents confirmed 1:1 matches (check how the other 34 matched chapters are documented earlier in the file, follow the same format).

---

## 2. What to actually do

### 2a. Re-check every entry in both gap tables against the current catalog

For the **"Book chapters with NO corresponding lab" list** (currently 14 entries, lines 1240–1253): for each, check whether any lab now added since this reference was written plausibly closes the gap. Pay specific attention to:
- **Ch.13 Advanced Privacy Techniques** (2FA tiers, VPNs, encrypted messaging, password managers) — the newly-reconnected `twofactorauth9` (n:69, "Multi-Factor Authentication") plausibly closes this. Read the actual lab file (`labs/TwoFactorAuth9.tsx`) and the chapter's documented content (search this file for "Advanced Privacy" to find the existing chapter write-up) and confirm whether the match is genuine before declaring it closed — don't just take the topic-word similarity at face value, check they teach the same actual mechanism.
- **Ch.17 Networking Protocols** (IP/TCP/HTTP/DNS, request/response cycle) — check whether `subnetting9`, `websockets9`, or `edgecomputing9` (all newly reconnected) closes or partially closes this, or whether it's still a genuine gap (the original note says "tangential coverage only" via `networkinterface31` and CDN labs — confirm this is still the strongest match, or if one of the new labs is a better fit).
- **Ch.21 Design Patterns in Software** (UML, MVC, microservices) — check whether anything in the new batch touches this (unlikely based on titles, but confirm).
- **Ch.33/34/35 Software Development / IDEs / Data Structures deep-dive** — check against the new batch; `eventsourcing9` and `databaseindexing9` are data-architecture-adjacent, confirm whether either genuinely teaches data-structure fundamentals or if this remains a real gap.
- The remaining chapters in the list (Ch.1, Ch.3, Ch.26, Ch.29, Ch.41, Ch.47, Ch.48) — re-confirm each is still accurately "no lab," since the catalog has grown; don't assume they're still gaps just because the original note said so.

For the **"Labs with NO corresponding book chapter" list** (currently 14 entries, lines 1219–1232): these should be stable regardless of catalog growth (new labs don't retroactively make old labs match a chapter), but do a quick sanity check that none of them were mis-scoped originally.

### 2b. Document the 13 newly-reconnected labs and any other post-48 additions

The reference's "Total topics covered" section (line 1199) says "all 48 chapters... documented" against a lab catalog it doesn't fully enumerate. Add a new subsection (or extend the existing Coverage Summary) that:
- Lists all labs added since the original reference was written (the 13 from this Phase 4 batch, plus check for any others between the original 48/59-lab snapshot and today — cross-check catalog `n:` values against what the reference's existing per-chapter notes cite, to find the actual cutoff).
- For each newly-added lab: does it match an existing book chapter (and if so, which — update that chapter's "Matching lab" note in the body of the document, not just the summary), or does it belong in the "no corresponding book chapter" list (same treatment as the existing 14)?

### 2c. Update the Net Picture summary

Line 1257's "34 of 48... 34 of 48..." tally needs recalculating once 2a and 2b are done. State the new totals plainly: how many of the 48 chapters now have a matching lab, how many labs (out of the new total, not 48) have no matching chapter, and whether any of the specific gaps closed in 2a should change the narrative framing (e.g. if Ch.13 and Ch.43 both close, the "software-engineering practice chapters are the main gap" framing may need adjusting — say so if it does).

---

## 3. What NOT to do

- Do not modify any `labs/*.tsx` file, `data/labs.ts`, or any router file. This is documentation only.
- Do not invent a chapter/lab match that isn't genuinely there — the entire value of this document is that every claim in it was actually checked against the book text and the lab's real content. A wrong "these match" claim is worse than an honest "still a gap."
- Do not remove or alter any of the existing 34 confirmed 1:1 chapter/lab write-ups unless you find a specific error in one — this pass is additive/corrective, not a rewrite.

---

## 4. Verification requirement

Since this produces no code, the "verification" here is evidentiary rigor, not tests:
1. For every gap you claim to close, quote the specific line/passage from the lab file (its `instruction=` text or similar) and the specific chapter passage it matches — the same standard held for every state-machine mapping decision in Phase 3 (no claim without a quoted source).
2. For every gap you confirm still open, say so explicitly rather than silently leaving it unchanged, so the record shows it was re-checked, not skipped.
3. Report back: a short summary table of what changed (chapter/lab pairs added, gaps closed, the Ch.43 error fixed, the updated Net Picture numbers) — not a re-paste of the whole document.

---

## 5. After this lands

Per `PHASE4_PLANNING.md`, next is the render-verified content/quality audit across the full lab catalog, using this refreshed reference as grounding context. That audit is not yet approved — this document only covers the reference refresh.
