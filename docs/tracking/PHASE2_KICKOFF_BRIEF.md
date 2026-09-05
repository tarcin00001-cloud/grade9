# Phase 2 Kickoff Brief: Catalog Extension

> **To**: Gemini/Antigravity implementation agent
> **From**: Architect
> **Status**: Approved to start. This is the only Phase 2 work authorized right now — the other three items from the original 4-proposal plan (7-step standardization, mobile/theme pass, low-scoring lab rewrites) remain unscoped and unapproved. Do not start them without a separate go-ahead.

---

## 1. What this phase is

Phase 1 closed with all 48 canonical labs clean on LMS bridge, slugs, and audio. During that work, an audit found the router (`app/labs/[slug]/page.tsx`) has **58 slug branches but `data/labs.ts` registers only 48** — 10 fully-built labs are unreachable (404 before the router switch is even checked), plus one component (`ReverseProxies9`) that's imported but has no route branch wired to it at all.

**Decision made**: extend the catalog. These are finished, real labs with real titles, themes, and lesson numbers already baked into their own `LabShell` props — they read like an already-planned "Level 30s–40s" extension module that never got registered. Make them reachable rather than deleting completed work.

---

## 2. The 10 labs to register, plus the 1 to also route

Every one of these already has a working `LabShell` with a title and an "L##" lesson subtitle — this was almost certainly a planned sequence. Use that existing subtitle as the ordering signal, not the current alphabetical file order.

| File | Slug | Title (from its own `LabShell`) | Theme | Lesson # (from its own subtitle) |
|---|---|---|---|---|
| `MachineLearningTraining9.tsx` | `machinelearningtraining9` | Supervised ML (Gradient Descent) | `cosmos` | L36 |
| `TorRouting9.tsx` | `torrouting9` | The Onion Router (TOR) Network | `ocean` | L33 |
| `Microservices9.tsx` | `microservices9` | Microservices Architecture | `cosmos` | L34 |
| `ZeroDayExploit9.tsx` | `zerodayexploit9` | Zero-Day Exploits & Patching | `ocean` | L35 |
| `GraphQLBasics9.tsx` | `graphqlbasics9` | GraphQL Data Fetching | `forge` | L38 |
| `ReverseProxies9.tsx` | `reverseproxies9` | Reverse Proxies (NGINX) | `cosmos` | L43 |
| `OauthFlow9.tsx` | `oauthflow9` | OAuth 2.0 (SSO Identity) | `ocean` | L42 |
| `WebAssembly9.tsx` | `webassembly9` | WebAssembly (WASM) Speed | `studio` | L44 |
| `JwtTokens9.tsx` | `jwttokens9` | JSON Web Tokens (JWT) | `cosmos` | L45 |
| `ContinuousIntegration9.tsx` | `continuousintegration9` | Continuous Integration (CI/CD) | `studio` | L46 |
| `TestingStrategies43.tsx` | `testingstrategies43` | Testing Strategies & TestingScript | (uses `bgOverride`, not a `theme` prop — check what it actually renders before assigning one) | — |

Note the lesson numbers are **not sequential with each other or with the current 48** (L33–L46 overlapping the existing catalog's own numbering) — this confirms they were drafted independently and never reconciled. Do not try to preserve these L-numbers as the new catalog `n` values; assign fresh sequential `n` values continuing from 49 (see below), and keep the L-number only inside each lab's own subtitle text, unchanged.

`ReverseProxies9` needs **two** things, not one: a `data/labs.ts` entry (like the other 10) **and** a new `if (slug === "reverseproxies9") return <ReverseProxies9 />;` branch in `app/labs/[slug]/page.tsx` — it's the only one of the 11 missing the router branch entirely. Verify this by grepping the router file for `reverseproxies9` before and after your change; it should go from 0 matches to 1.

---

## 3. Exact changes required

### 3a. `data/labs.ts`
Add 11 new entries after the existing `n:48` entry, following the established schema exactly:
```ts
export interface LabDefinition { n: number; slug: string; title: string; lesson: string; desc: string; theme: LabTheme; archetype: string; status: LabStatus; }
```
- `n`: continue sequentially from 49 through 59.
- `slug`: exact match to the router's existing `if (slug === "...")` string (or the new one you add for `reverseproxies9`).
- `title`: use the exact string already in each lab's own `LabShell title="..."` prop — don't rewrite it.
- `theme`: use the exact value from each lab's own `LabShell theme="..."` prop. Confirm `TestingStrategies43` doesn't have one before inventing one.
- `lesson` / `desc`: write these fresh, grounded in what the lab actually teaches (read enough of each file to describe it honestly) — don't invent a textbook chapter citation. These are **real-world enrichment topics** (OAuth, JWT, CI/CD, GraphQL, WASM, reverse proxies, microservices, Tor, zero-days, testing pyramids, gradient descent) with no direct chapter in `docs/CURRICULUM_REFERENCE.md`. Say so honestly in the `desc` if relevant, the same way several already-registered enrichment labs do (check how `csrfattacks9`'s or `ransomware9`'s `desc` handles this — those are also enrichment-not-textbook labs already in the catalog, so there's a precedent to follow).
- `archetype`: match the existing convention (`"Simulation Sandbox"` is used almost everywhere in the current 48 — use that unless a lab is genuinely a different shape).
- `status`: `"live"` — these are finished, working labs, not stubs.

### 3b. `app/labs/[slug]/page.tsx`
Add one new line for `reverseproxies9`:
```tsx
if (slug === "reverseproxies9") return <ReverseProxies9 />;
```
Place it near the other newly-reachable slugs' existing branches (they're all already present in the file — you're not adding new branches for the other 10, just for this one). No other router changes needed.

### 3c. Do not touch
- Component source files for any of these 11 labs — they are already built and working. This phase is a catalog/router registration task, not a lab-content or design task.
- The existing 48 labs — nothing about their behavior should change.

---

## 4. Verification requirement

This carries forward the same standard from Phase 1 — a claim of "done" without independent verification will be re-checked and any gap found will be called out specifically, so verify thoroughly the first time:

1. `npx tsc --noEmit` — 0 new errors.
2. `node scripts/lint-labs.js` — 0 new violations (11 new files now enter lint scope for the first time; if any of them fail lint — banned words, emojis, `text-[Npx]` micro-type — fix those too, since they're now live catalog entries subject to the same standard as the other 48).
3. **Route reachability check, for all 11**: start the dev server, navigate to `/labs/<slug>` for each of the 11 slugs, confirm it renders (not a 404) and matches the title in the new catalog entry. A code-only check is not sufficient here — actually load each route.
4. Confirm the existing 48 labs are unaffected: spot-check 2–3 of them still load correctly after the catalog/router edits.
5. Whatever surfaces these labs to students (a dashboard, a lab list/grid page reading from `LABS`) should now show 59 entries instead of 48 — check that page renders correctly with the larger list and doesn't break its layout at the new count. If no such page exists yet or it's out of scope, say so explicitly in your report rather than silently skipping the check.

Report back per lab: the assigned `n`, confirmed working route, and a one-line honest description of what you found when you actually opened it (not just the title you copied from its `LabShell` prop).
