# Phase 4 Kickoff: Reconnect 13 Orphaned Labs

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to execute now. This is the first Phase 4 item — mechanical, low-risk, same pattern as the Phase 2 catalog extension that added `torrouting9`, `reverseproxies9`, `testingstrategies43`, and 8 others. Read `PHASE4_PLANNING.md` for the full context on why this is Phase 4's first priority.

---

## 1. What this is

13 fully-built, complete `labs/*.tsx` components exist with **zero entry in `data/labs.ts` and zero route in `app/labs/[slug]/page.tsx`.** Confirmed each is a real, finished lab (not a stub) via its own `<LabShell labId="..." theme="..." title="...">` call and its own `instruction=` copy. A student cannot reach any of these 13 no matter what URL they type.

| Slug | File | Title (from file) | Theme (from file) |
|---|---|---|---|
| `containerization9` | `Containerization9.tsx` | VMs vs Docker Containers | forge |
| `databaseindexing9` | `DatabaseIndexing9.tsx` | Database Indexing Structures | studio |
| `digitalsignatures9` | `DigitalSignatures9.tsx` | Digital Signatures | neon |
| `edgecomputing9` | `EdgeComputing9.tsx` | Edge Computing Latency | cosmos |
| `eventsourcing9` | `EventSourcing9.tsx` | Event Sourcing (CQRS) | ocean |
| `publickeyinfrastructure9` | `PublicKeyInfrastructure9.tsx` | SSL/TLS Certificates & PKI | forge |
| `serverlessfunctions9` | `ServerlessFunctions9.tsx` | Serverless Computing (Lambda) | ocean |
| `smartcontracts9` | `SmartContracts9.tsx` | Smart Contracts Mechanics | studio |
| `subnetting9` | `Subnetting9.tsx` | Subnetting & Broadcast Domains | forge |
| `twofactorauth9` | `TwoFactorAuth9.tsx` | Multi-Factor Authentication | cosmos |
| `vectordatabases9` | `VectorDatabases9.tsx` | Vector Databases & Embeddings | studio |
| `websockets9` | `WebSockets9.tsx` | Real-Time Data: WebSockets vs Polling | neon |
| `loadbalancing9` | `LoadBalancing9.tsx` | Load Balancing Algorithms | ocean |

---

## 2. Exact task: two files, two edits each

### `data/labs.ts`
Add 13 new entries, `n:60` through `n:72` (current highest is `n:59`). Follow the exact schema used by every existing entry — `{n, slug, title, lesson, desc, theme, archetype, status:"live"}`. Example from the Phase 2 batch, for format reference only:

```ts
{n:49, slug:"torrouting9", title:"The Onion Router (TOR) Network", lesson:"Network Privacy", desc:"Interactive simulation of multi-layered onion routing, node-by-node cryptographic peeling, and untraceable traffic transit.", theme:"ocean", archetype:"Simulation Sandbox", status:"live"},
```

**Do not invent `lesson`/`desc`/`archetype` values.** Derive them the same way every existing catalog entry was written — read each lab's own `instruction=` prop and surrounding copy, and write a `desc` that honestly summarizes what the lab does. `title` and `theme` are already confirmed correct from the table above (pulled directly from each file) — reuse them verbatim, don't rephrase. Assign `lesson` (the topic-category label shown elsewhere in the UI) based on what fits closest to how existing `lesson` values are named (e.g. "Network Privacy", "Software Testing" — check the current lesson vocabulary in `data/labs.ts` before inventing a new one, reuse an existing one if it genuinely fits, only add a new one if none does).

For `archetype`, check what values already exist in the file (`"Simulation Sandbox"` appears frequently) and use the closest honest fit — don't invent a new archetype category without checking existing ones first.

### `app/labs/[slug]/page.tsx`
Add 13 new `if (slug === "...") return <...9 />;` branches, matching the exact pattern already used for all 59 existing labs, plus the corresponding import at the top of the file if not already present (check first — some of these may already be imported but just missing the route branch, the way `reverseproxies9` was in the Phase 2 batch).

---

## 3. What NOT to do

- Don't touch any of the 21 already-standardized state-machine labs, or any visual/typography/lint work — all separately closed.
- Don't modify any of the 13 lab component files themselves. This is catalog + router wiring only.
- Don't add these to any homepage thumbnail logic that assumes image assets exist for every slug — check `app/page.tsx`'s `hasSampleImage` gating logic (added in Phase 2 specifically to handle this) and confirm the same fallback gradient-card behavior applies here rather than causing new 404s.

---

## 4. Verification requirement

1. `npx tsc --noEmit` — 0 new errors.
2. `node scripts/lint-labs.js` — must still pass (this touches `data/labs.ts` and the router file, not `labs/*.tsx`, so it shouldn't trip lab-specific rules, but confirm).
3. For all 13 new slugs: confirm the route actually resolves (render each at `http://localhost:PORT/labs/<slug>` and screenshot, confirming the correct lab component appears, not a 404 or the `PlannedLabPage` fallback).
4. Confirm the homepage (`/`) renders all 13 new cards without console errors or broken image requests, same check as the original Phase 2 catalog extension.
5. Report back: the exact `lesson`/`desc`/`archetype` chosen for each of the 13, with a one-line justification tying it back to the lab's own instruction copy — same specificity standard held throughout this project, not just "added metadata."

---

## 5. After this lands

Per `PHASE4_PLANNING.md`, next is a research-only refresh of `docs/CURRICULUM_REFERENCE.md`'s coverage summary against the now-larger catalog, then a render-verified content/quality audit across the full lab set. Neither of those is approved yet — this reconnection is the only item currently greenlit.
