# Tier D Audit Brief: State-Machine Signal Survey (Audit Only — No Code)

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. **This is a research task, not an implementation task.** Do not modify any lab file. The deliverable is a report; nothing here authorizes touching source code.

---

## 1. Why this is happening now, and why it's audit-only

Phase 2B (visual baseline) and Phase 3 Tier B/C (10 labs' state-machine standardization) are both closed and independently verified. The original Phase 3 brief classified the remaining labs into a "Tier D" bucket — everything with no canonical `Step`-shaped signal — but that classification is now stale for two reasons:

1. **The catalog has grown.** The original audit covered 59 labs. The repo now has **73 real lab files** (`ls labs/*.tsx`, excluding the shared `PlannedLabPage.tsx` fallback shell). At least 13 files postdate that audit entirely: `Containerization9`, `DatabaseIndexing9`, `DigitalSignatures9`, `EdgeComputing9`, `EventSourcing9`, `PublicKeyInfrastructure9`, `ServerlessFunctions9`, `SmartContracts9`, `Subnetting9`, `TwoFactorAuth9`, `VectorDatabases9`, `WebSockets9`, `LoadBalancing9` — none of these have ever been checked for state-machine shape.
2. **Ten labs have since moved out of Tier D** via the Tier B/C batch (HashFunctions9, SymmetricCrypto9, AIEducation22, NetworkInterface31, DataVisualization36, ComputingProject39, GestureControl40, EthereumDao9, QuantumComputing9, AsymmetricCrypto9) and must not be re-audited or re-touched.

Given the scale (roughly 63 labs once the above are excluded) and that some of these may have genuinely no clean 7-stage narrative to standardize at all, a full go-ahead without fresh eyes on the actual current code would repeat the exact mistake already caught twice in this project: acting on a stale or assumed classification instead of the real state of the files. **Produce the audit; do not act on it.**

---

## 2. Scope

**Audit every `.tsx` file in `labs/` except:**
- The 10 labs closed in Phase 3 Tier B/C (listed above) — already standardized, do not re-touch or re-report.
- `JwtTokens9.tsx` — permanently excluded, already documented why (tamper/verify cycle, no honest mapping).
- `Ransomware9.tsx` and `Colossus28.tsx` — already canonical/pilot reference implementations, not audit targets.
- `PlannedLabPage.tsx` — shared fallback shell, not a real lab.

That leaves roughly 60 files to survey. Get the exact list yourself via `ls labs/*.tsx` at execution time rather than trusting any number in this brief — the catalog may have changed again since this was written.

---

## 3. What to capture per lab

For each in-scope file, report:

1. **Current state variable name and type** — e.g. `type SysState = 'IDLE' | 'PROCESSING' | ...`, `const [state, setState] = useState<SysState>(...)`. If there is no state variable driving a narrative flow at all (e.g. a lab that's just a static diagram or a single-shot form), say so explicitly — that's a valid finding, not a gap in your audit.
2. **Full value list** for that type, in the order they appear in the type declaration.
3. **Narrative read-through**: for each value, one short phrase on what actually happens on screen at that state (not guessed from the name — read the JSX that conditions on it, the way every Tier B/C exception in the last batch was verified against actual rendered behavior, not assumed from the label).
4. **Plausibility verdict** — one of:
   - **Clean fit**: the lab's real narrative already tracks something close to Learn→Try→Fail→Understand→Improve→Complete→Outcome, just under different names. Cite which method (A: additive derived type, or B: in-place rename) would apply, same as the Tier B/C playbook.
   - **Partial fit with documented gaps**: some canonical stages are genuinely absent from the narrative (like ComputingProject39's missing TRY_MANUAL/UNDERSTAND, or NetworkInterface31's missing COMPLETE) — say which, and whether that's a narrative gap worth accepting as an exception or a sign the lab doesn't really fit this model.
   - **No honest fit**: the lab's actual flow is not a learning-arc narrative at all — e.g. a single-request cycle, a toggle/comparison tool, a static visualization with no stages. Cite the specific reason, the way `JwtTokens9` was excluded (a real tamper/verify cycle, not evasion).
   - **Multi-stepper / combinator needed**: the lab tracks more than one independent state variable for a single narrative (like `AsymmetricCrypto9`'s two missions) and would need its own Method-C-style combinator design, not a batch fit.
5. **Any file where you're not confident in your own read** — flag it plainly rather than guessing. A wrong "clean fit" call here is worse than an honest "not sure, needs a second look."

---

## 4. What NOT to do

- Do not add, remove, or rename any type, state variable, or value in any file.
- Do not add a `data-step` attribute, a mapping function, or any other Phase-3-style scaffolding.
- Do not touch dark-token, subtitle, micro-typography, or lint concerns — all closed, out of scope here.
- Do not re-audit or report on the 10 already-closed Tier B/C labs, `Ransomware9`, `Colossus28`, or `JwtTokens9`.

---

## 5. Deliverable format

One table, one row per lab, columns: `slug | current type name | current values | plausibility verdict | notes`. Group by verdict (Clean fit / Partial fit / No honest fit / Multi-stepper) rather than alphabetically, so the architect can see the real distribution at a glance. Follow with a short summary: total count per verdict bucket, and a recommended next-batch candidate list (which labs, if any, look like the safest, lowest-risk next Tier B/C-style batch) — as a recommendation only, not a decision. The user and architect decide the next execution scope from this audit; this document does not pre-approve any of it.
