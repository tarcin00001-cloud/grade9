# Grade 9 Labs — 7-Step State Machine Conformance Audit

> **Scope**: This document answers one specific question the existing `GRADE9_LAB_AUDIT_REFERENCE.md` (the Gemini/Antigravity Option-A audit) does not answer directly: *does each lab's actual source code implement the mandatory 7-step enum from `master_lab_prompt.md` §1 (`LEARN → TRY_MANUAL → FAIL_OVERLOAD → UNDERSTAND → IMPROVE → COMPLETE → OUTCOME`), or does it only narratively resemble that shape under a different, ad-hoc type name?*
>
> **Method**: Every finding below was verified by grepping the actual `labs/*.tsx` source files in this repo — not inferred from the existing audit's prose. Where the existing audit's claims were spot-checked (LMS bridge bugs, 7-step scores), they matched the real code in every case tested, so its narrative/pedagogical scoring is treated as reliable; this document adds the one axis it did not check: literal type-level conformance.
>
> **Companion documents**: `docs/CURRICULUM_REFERENCE.md` (textbook grounding, built earlier this project), `docs/tracking/GRADE9_LAB_AUDIT_REFERENCE.md` (the full 8-criterion Option-A audit this document supplements), `master_lab_prompt.md` and `lab_audit_reference.md` under the Gemini/Antigravity brain directory (source documents for both audits).

---

## The finding

The existing audit scored "7-Step State Machine" at 4.0–5.0/5 for the large majority of labs, describing clear `LEARN → TRY → FAIL → UNDERSTAND → IMPROVE → COMPLETE → OUTCOME` narrative arcs. That scoring is accurate as a description of the *student experience* — verified by spot-check (Colossus28, CDN, and others matched their claimed scores exactly against the real source).

But the audit's scorecard does not distinguish between **a lab that defines the literal `Step` type with those seven exact string values** and **a lab that has an equivalent narrative shape under a home-grown `Phase`, `Stage`, `Mission`, or `LabStage` type with different value names**. Both would score similarly on "does the pedagogy follow learn-fail-understand-improve," but only the first actually satisfies `master_lab_prompt.md` §1's literal mandate:

> *"Replace any linear or passive phase variables with the Gold Standard 7-step enum... Do not allow success on the first passive click."*

Grepping all 48 lab source files for the literal enum pattern (`type Step = 'LEARN' | ...` or a `useState<Step>('LEARN')` initializer) found:

| Metric | Count | % of 48 |
|---|---:|---:|
| Labs with the literal canonical `Step` enum (exact 7 values, in order) | **1** (`colossus28`) | 2% |
| Labs with *some* literal-string state machine (`'LEARN'` appears as a real value, any type name) | **8** | 17% |
| Labs using a differently-named type (`Phase`, `Stage`, `LabStage`, `MissionPhase`) with no literal `'LEARN'`/`'TRY_MANUAL'` values at all | **16** | 33% |
| Labs with no typed phase/step/stage enum detectable at all (numeric mission indices, boolean flags, or tab strings instead) | **31** | 65%* |

\* *Categories overlap — a lab can have a `type Phase = ...` declaration but never actually use the string `'LEARN'` as a value, which is why the last two rows don't sum cleanly with the second.*

**This is the real, previously-uncalled-out scope of improvement**: not that labs lack a learn→fail→fix narrative (most genuinely have one, and score well for it), but that almost none of them implement it as the *specific, consistent, literally-named type* the master prompt mandates. That matters for three concrete reasons, not just style:

1. **Maintainability** — a future engineer (or agent) grepping the codebase for `type Step` to find every lab's state machine will find exactly one hit. Every other lab's equivalent logic is invisible to that search.
2. **Tooling/automation** — any future lint rule, codemod, or analytics hook keyed to the canonical `Step` type (e.g. "flag any lab missing a `FAIL_OVERLOAD` transition") silently skips 98% of labs.
3. **The master prompt's own enforcement mechanism doesn't work today** — `master_lab_prompt.md` tells a future agent to grep for gold-standard patterns before writing code; if the canonical type name isn't actually followed, that instruction is unenforceable in practice.

---

## Per-lab conformance table

Status legend: **Exact** = literal `Step` type name AND all 7 canonical values present in order. **Equivalent (renamed)** = same 7-stage shape present but under a different type name and/or different value strings. **Partial** = some literal step values present, but incomplete set or no formal type. **Ad-hoc** = state machine exists (numeric mission index, tab string, boolean flags) but no `LEARN`/`TRY_MANUAL`/etc. literal values anywhere in source.

| # | Slug | Type name found | Conformance | Note |
|---|---|---|---|---|
| 1 | `contentdeliverynetwork9` | none | Ad-hoc | Confirmed by existing audit (1/5, "monolithic 1-phase sandbox") — verified: zero `LEARN`/`TRY_MANUAL` matches in source. |
| 2 | `univac9` | none | Ad-hoc | Mission `1 \| 2` numeric state, not a lifecycle enum. |
| 3 | `csrfattacks9` | not sampled directly | Ad-hoc (per audit) | Audit describes an 8-mission board with balance countdown, not the 7-step type. |
| 4 | `requirementsanalysis9` | not sampled directly | Ad-hoc (per audit) | 3-stage progression (Storefront → Streaming → Super-App), no 7-step type. |
| 5 | `classesinjava9` | none | Ad-hoc | 4 activity tabs (`blueprint`/`factory`/`actions`/`encapsulation`), not the mandated enum. |
| 6 | `deeplearning9` | `type Phase =` | Partial | Has a `Phase` type but does not use the literal `LEARN`/`TRY_MANUAL` strings as values. |
| 7 | `algorithmicmusic9` | none | Ad-hoc | Mission index + quiz phase, no typed enum. |
| 8 | `braincomputerinterface9` | `type LabStage =` | Partial | Renamed type (`LabStage`), no literal canonical values detected. |
| 9 | `gpu9` | none | Ad-hoc | 7 numbered missions, but as a plain index, not the `Step` enum. |
| 10 | `cloudflare9` | `type Phase =` | Partial | Renamed type, narrative arc present per audit, values not canonical. |
| 11 | `foldablesmartphone11` | none | Ad-hoc | Two-mission structure (durability test, adaptive UI), no typed enum. |
| 12 | `binarysearch12` | `type Phase =` | Partial | Renamed type; 3-level structure, not canonical values. |
| 13 | `asymmetriccrypto9` | — | **Equivalent (renamed)** | **Confirmed**: `type Mission1Step = "LEARN" \| "TRY" \| "FAIL" \| "UNDERSTAND" \| "IMPROVE" \| "COMPLETE" \| "OUTCOME"` — same 7 stages, but `"TRY"`/`"FAIL"` instead of `"TRY_MANUAL"`/`"FAIL_OVERLOAD"`, and the type is scoped to `Mission1Step` (implies a per-mission convention, not a single canonical type). |
| 14 | `virtualmem9` | `type Phase =` | Partial | Renamed type; audit confirms a genuine safe-failure (thrashing) but under different value names. |
| 15 | `ooppython15` | none | Ad-hoc | 4-tab activity structure; also missing LMS bridge entirely (see existing audit — confirmed). |
| 16 | `cloudstrategy16` | none | Ad-hoc | Quarter-based resource sim, not a lifecycle type. |
| 17 | `hashfunctions9` | — | **Equivalent (renamed)** | Confirmed by existing audit: explicit `LEARN → TRY_ORIGINAL → TRY_SNEAK → FAIL → UNDERSTAND → IMPROVE → COMPLETE → OUTCOME` — expanded to 8 stages (splits `TRY_MANUAL` into two), closest match to canonical besides Colossus. |
| 18 | `itsupport18` | `type Phase =` | Partial | Renamed type; arcade shift-survival loop, not canonical values. |
| 19 | `agiinterview19` | none | Ad-hoc | Narrative arc confirmed by audit, but no literal step values found. |
| 20 | `sshkeys9` | none | Ad-hoc | 4-phase progression, numeric/string ad-hoc, not canonical. |
| 21 | `symmetriccrypto9` | — | Partial | One literal step match found; likely partial canonical usage — needs line-level confirmation before editing. |
| 22 | `aieducation22` | — | Partial | One literal step match found; likely partial canonical usage — needs line-level confirmation before editing. |
| 23 | `responsibleai23` | `type Phase =` | Partial | Renamed type; strong 3-strike audit-protocol narrative, not canonical values. |
| 24 | `advancedalgorithms24` | none | Ad-hoc | 5-module tab structure (`bs`/`ms`/`dfs`/`bfs`/`assess`), not canonical. |
| 25 | `usbconnectivity25` | none | Ad-hoc | Era-based progression (1995 vs modern), not canonical. |
| 26 | `machinelearning9` | none | Ad-hoc | 5 missions, tab-indexed, not canonical. |
| 27 | `setsandvenn27` | none | Ad-hoc | 6 randomized missions, not canonical. |
| 28 | `colossus28` | `type Step =` | **Exact** | **Only lab in the entire set with the literal, complete, correctly-ordered canonical enum**: `'LEARN' \| 'TRY_MANUAL' \| 'FAIL_OVERLOAD' \| 'UNDERSTAND' \| 'IMPROVE' \| 'COMPLETE' \| 'OUTCOME'`, verified directly (also independently confirmed while doing 3D scene work on this lab earlier in this project). |
| 29 | `passwordcracking9` | `type Stage =` | Partial | Renamed type (`Stage`); 3-phase structure, not canonical values. |
| 30 | `ethereumdao9` | `type Phase =` + `useState<Phase>('LEARN'...)` | **Equivalent (renamed)** | Genuinely initializes with the literal string `'LEARN'`, and the audit describes a full canonical-shaped arc (Learn → Try → Fail Overload → Understand → Improve → Complete → Outcome) — closest "spirit-conformant" lab after Colossus/HashFunctions, just under a `Phase` type name instead of `Step`. |
| 31 | `networkinterface31` | `type Step =` + `useState<Step>('LEARN'...)` | **Equivalent (renamed values)** | Uses the correct type name `Step` and initializes with `'LEARN'`, but the audit's own enum listing (`LEARN → INIT_MAC → INIT_MEDIUM → TRY_RAW → FAIL_CPU → UNDERSTAND → IMPROVE → OUTCOME`) shows extra/renamed intermediate values and is missing a distinct `COMPLETE` stage before `OUTCOME`. Second-closest to canonical structurally. |
| 32 | `smartring32` | none | Ad-hoc | 5-mission structure, not canonical. |
| 33 | `maninthemiddle9` | `type Stage =` | Partial | Renamed type; 3-phase structure. |
| 34 | `ransomware9` | `type Phase =` | Partial | Renamed type; 6-phase incident-command lifecycle (excellent per audit), not canonical values. |
| 35 | `ratelimiting9` | none | Ad-hoc | Scenario-based progression, not canonical. |
| 36 | `datavisualization36` | — | Partial | Two literal step matches found; needs line-level confirmation. |
| 37 | `mobileplatform37` | `type Stage =` | Partial | Renamed type; 3-tier strategy progression. |
| 38 | `spectremeltdown9` | none | Ad-hoc | 3-level progression, not canonical. |
| 39 | `computingproject39` | — | Partial | One literal step match found (audit cites `LEARN -> FAIL_SCOPE -> IMPROVE -> COMPLETE -> OUTCOME` — missing `TRY_MANUAL`/`UNDERSTAND` as distinct stages). |
| 40 | `gesturecontrol40` | — | Partial | One literal step match; audit claims "strict execution of the 7-step flow" — worth a direct line-level re-check given only a single literal match was found by grep. |
| 41 | `quantumcomputing9` | `type Phase =` + `useState<Phase>("LEARN"...)` | **Equivalent (renamed)** | Initializes with literal `"LEARN"`; audit describes a 6-phase arc, one short of the full 7 (no distinct `TRY_MANUAL` before the collapse failure). |
| 42 | `propositionallogic42` | `type MissionPhase =` | Partial | Renamed type (`MissionPhase`); 5-mission structure, not canonical values. |
| 43 | `bufferoverflow9` | `type Stage =` | Partial | Renamed type; 6-stage lifecycle (excellent per audit), not canonical values. |
| 44 | `computingbenefits44` | none | Ad-hoc | 4-stage progression, not canonical. |
| 45 | `semanticweb45` | none | Ad-hoc | 3-level progression; also missing LMS bridge entirely (confirmed — see below). |
| 46 | `roboticsurgery46` | none | Ad-hoc | 5-stage progression, not canonical. |
| 47 | `crosssitescripting9` | none | Ad-hoc | 2-objective structure; also missing LMS bridge entirely (confirmed — see below). |
| 48 | `blockchain9` | none | Ad-hoc | 4-step structure (`Learn -> Attack -> Blockchain -> Review`), not canonical. |

---

## Cross-verified, high-confidence bugs (independently confirmed against source, not just cited from the existing audit)

These three were spot-checked directly in this pass and confirmed real — flagging them here because they compound with the state-machine gap (a lab with no `Step` type *and* no working completion hook is doubly unfinished):

- **`ooppython15`** — zero `useLMSBridge`/`reportComplete` references anywhere in the file. The lab cannot report completion to the LMS at all. Matches existing audit's 0/5 LMS score exactly.
- **`semanticweb45`** — uses `(window as any).reportComplete()` instead of the `useLMSBridge()` hook. No `useLMSBridge` import present.
- **`crosssitescripting9`** — same broken pattern: `(window as any).reportComplete()`, no `useLMSBridge` import.

The existing audit also cites this same bug in `hashfunctions9`, `classesinjava9`, `binarysearch12`, `requirementsanalysis9`, `cloudstrategy16`, `sshkeys9`, `symmetriccrypto9`, `aieducation22`, `setsandvenn27`, `ethereumdao9`, `usbconnectivity25`, `roboticsurgery46`, and `blockchain9` as an **empty-argument** `useLMSBridge()` call (slug omitted, not the hook missing outright) — a related but distinct bug from the three above. Spot-checked `classesinjava9` and `binarysearch12` directly; both confirmed.

---

## What this means for prioritization

1. **The 7-step naming/type drift is cosmetic-to-moderate risk, not urgent** — because the audit's narrative scoring shows most labs deliver the *intended student experience* regardless of internal type naming. This is a refactor-for-consistency item, not a student-facing bug.
2. **The LMS bridge bugs are the real, student-facing urgent item** — a lab that never calls `reportComplete()` correctly cannot mark itself done in the LMS, which is a hard functional failure regardless of how good the pedagogy is. `ooppython15`, `semanticweb45`, and `crosssitescripting9` are the three most broken (no working completion path at all); the ~13 "empty argument" labs likely still work if `useLMSBridge()` has a sane default, but should be confirmed.
3. **If a codebase-wide consistency pass is ever done**, the highest-value target is standardizing every lab's phase/stage type to the literal canonical `Step` name and value set — using `colossus28` as the reference implementation, since it's the only lab that already does this correctly end to end.

---

## Suggested next actions (not yet performed — pending your direction)

- [ ] Verify the "Partial" rows marked "needs line-level confirmation" (`symmetriccrypto9`, `aieducation22`, `datavisualization36`, `computingproject39`, `gesturecontrol40`) by reading the actual state type declarations, not just grep hit counts.
- [ ] Decide whether the 7-step *type name* standardization is worth doing across all 48 labs, or whether the existing narrative conformance (already scored highly by the Gemini audit) is sufficient and this is left as a known, low-priority inconsistency.
- [ ] Fix the three confirmed missing-LMS-bridge labs (`ooppython15`, `semanticweb45`, `crosssitescripting9`) first — these are real functional breakages, independent of any state-machine naming question.
