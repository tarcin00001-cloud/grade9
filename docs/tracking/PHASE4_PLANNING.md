# Phase 4 Planning: From Infrastructure to Content Quality

> **Status**: Planning only. No developer handoff yet — this document scopes what Phase 4 should be, in priority order, before any execution brief is written.
> **Context**: Phase 2B (visual baseline, 73 labs) and Phase 3 (state-machine standardization, 21 labs) are both closed. Both were infrastructure passes — they made the codebase consistent and instrumentable, but neither touched whether any individual lab is actually good, reachable, or curriculum-aligned. Phase 4 is the first workstream aimed at the student-facing experience itself.

---

## 1. A finding that reorders the priority list

While scoping this, I checked the catalog (`data/labs.ts`, 60 entries) against the actual files on disk (`labs/*.tsx`, 74 files) the same way Phase 2 caught 11 unreachable labs and the Tier D audit caught 13 unaudited files. The same gap exists again, in a fresh batch:

**13 fully-built lab components exist with zero catalog entry and zero route.** Confirmed each is a complete, titled, themed component (not a stub) — verified via each file's own `<LabShell labId="..." theme="..." title="...">` call:

| Slug | Title (from the file itself) | Theme |
|---|---|---|
| `containerization9` | VMs vs Docker Containers | forge |
| `databaseindexing9` | Database Indexing Structures | studio |
| `digitalsignatures9` | Digital Signatures | neon |
| `edgecomputing9` | Edge Computing Latency | cosmos |
| `eventsourcing9` | Event Sourcing (CQRS) | ocean |
| `publickeyinfrastructure9` | SSL/TLS Certificates & PKI | forge |
| `serverlessfunctions9` | Serverless Computing (Lambda) | ocean |
| `smartcontracts9` | Smart Contracts Mechanics | studio |
| `subnetting9` | Subnetting & Broadcast Domains | forge |
| `twofactorauth9` | Multi-Factor Authentication | cosmos |
| `vectordatabases9` | Vector Databases & Embeddings | studio |
| `websockets9` | Real-Time Data: WebSockets vs Polling | neon |
| `loadbalancing9` | Load Balancing Algorithms | ocean |

A student cannot reach any of these 13 labs no matter what URL they type — they were built at some point and never wired in. This is the same defect class as the Phase 2 fix (which added 11 similarly-orphaned labs to the catalog), just a second, more recent batch.

**This should be Phase 4's first and highest-priority item — not an audit, a mechanical reconnection —** because:
- It requires no design judgment, unlike the rest of Phase 4.
- It's the highest-leverage fix available: 13 already-built labs go from 0 students able to reach them to fully live, for the cost of a `data/labs.ts` entry and a router branch each (the exact pattern already used for the Phase 2 batch).
- Several directly answer gaps the curriculum reference already flagged as missing content: `digitalsignatures9`/`publickeyinfrastructure9` (crypto gaps), `subnetting9` (Ch.17 Networking Protocols gap), `twofactorauth9` (Ch.13 Advanced Privacy gap — noted in the reference as "one of the most practically actionable chapters in the book" with no lab).

---

## 2. What Phase 4 actually is, once the reconnection is done

After the 13 labs are live, the remaining question is: **of the ~73 real labs, which ones are actually weak, broken, or poorly matched to the curriculum** — the class of defect that a palette pass or a state-machine rename can't catch, because it's about whether the lab teaches the right thing well, not whether its code is tidy.

This project already has two precedents for what this kind of defect looks like:
- The Hash Functions lab was rated "Tier 1 gold standard" by a prior audit that never actually rendered it — it was a broken text-input form. Found only by rendering it.
- Colossus28's 3D scene looked nothing like the real Bletchley Park machine until rebuilt against reference photos — a content-accuracy problem invisible to any code-level check.

Phase 4 needs the same discipline: **render and interact with labs, don't just read their source**, cross-referenced against `docs/CURRICULUM_REFERENCE.md`'s existing chapter-by-chapter analysis (1,258 lines, already built, already documents specific chapter/lab mismatches).

### 2a. The curriculum reference itself needs a refresh, not just a reuse

It was built against a 48-lab catalog snapshot. The catalog has grown to 73 real files since (61 by the time the 13 orphans above are reconnected, since one file, `RequirementAnalysis9`, appears to already be a naming mismatch worth checking against the catalog's `requirementsanalysis9` entry separately). Before trusting its gap list, a pass is needed to:
- Re-check whether any of its documented "no lab" chapter gaps (Ch.1/35 Data Structures, Ch.3 Digital Ethics, Ch.13 Advanced Privacy, Ch.17 Networking Protocols, Ch.21 Design Patterns, Ch.26 Firewall, Ch.29 Big Data/Bio, Ch.33 Software Development, Ch.34 IDEs/Git) are now covered by any of the newer files (`subnetting9` and `twofactorauth9` plausibly close two of these once reconnected — confirm the others don't already have a match too).
- Add entries for any of the newer 13 (or other post-48 additions) that don't map to an existing book chapter, the same way the original reference documented `asymmetriccrypto9`, `hashfunctions9`, etc. as "no chapter."

### 2b. Candidate audit lens for the ~60 remaining labs (post-reconnection)

Once the reference is current, the actual Phase 4 content audit should check each lab against three questions, not just one "is it good" judgment call:

1. **Does it render and function correctly at rest and through its interaction?** (The Hash Functions failure mode — a lab can look fine in source and be broken in practice.)
2. **Does its content genuinely match its stated curriculum topic**, or has the metaphor drifted from the real mechanism? (The Colossus28 failure mode — visually present but factually/conceptually off.)
3. **Is it a curriculum orphan** — teaching something the book never covers (like the 14 the reference already found: crypto/security/quantum labs) — and if so, is that acceptable as "supplementary" content or does it need a curriculum tie-in note?

This audit, like the Tier D one, should be **read-only / research-only** as a first pass — produce a scored/bucketed report, not code changes, so the architect and user can decide execution priority afterward. Given the Hash Functions precedent, this audit must include actual rendered screenshots per lab, not source-reading alone — a repeat of the "audited via reading, not rendering" mistake would defeat the entire purpose of this phase.

---

## 3. Recommended sequencing

1. **Reconnect the 13 orphaned labs** (mechanical, low-risk, immediate value — same pattern as the Phase 2 catalog extension). This alone should probably be its own quick handoff before anything else, since it's unambiguous and doesn't require any further planning.
2. **Refresh `CURRICULUM_REFERENCE.md`'s coverage summary** against the now-73-lab catalog (research task, not code).
3. **Run the render-verified content/quality audit** across the ~60-73 labs using the three-question lens above (research task, not code) — this becomes the actual Phase 4 execution scoping document, the same role the Tier D audit played for Phase 3.
4. **Only then** draft execution briefs for whichever labs the audit flags as genuinely needing fixes — likely in priority-ranked batches, same discipline as every phase so far (exact per-lab findings, not assumed defects, independent re-verification before any batch closes).

---

## 4. What this document is NOT

This is a plan, not an approval. Nothing here authorizes the developer to touch code yet. Step 1 (the 13-lab reconnection) is close to a "just do it" given how mechanical and precedented it is, but even that should get an explicit go-ahead before a handoff goes out, consistent with how every other phase in this project has been gated.
