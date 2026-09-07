# Timer + Marks Batch 2 Handoff

## Summary
This batch successfully completes the deployment of the 5-minute timer and marks tracking across the remaining 50 non-canonical labs in the catalog. 

Following the audit provided, we divided the 50 labs into two distinct treatments:
1. **Group 1 (11 Labs)**: Stage-based partial credit with real one-way progressions.
2. **Group 2 (~39 Labs)**: Pass/fail timer only (100 marks on completion, 0 on timeout), as they are primarily sandboxes, mode toggles, or continuous simulations with no genuine intermediate progress metrics.

No fabricated partial credit metrics were invented.

## Group 1 Classifications (Partial Credit)
The audit classifications held up during implementation, with custom formulas mapping their internal states to 0-100 marks:
* `BinarySearch12`: Derived from a combination of `level` (1-3) and `phase`.
* `EdgeComputing9`: Derived from `Phase` progression.
* `OauthFlow9`: Derived from `Phase` progression.
* `PublicKeyInfrastructure9`: Derived from `Phase` progression.
* `TorRouting9`: Derived from `Phase` progression.
* `ZeroDayExploit9`: Derived from `Phase` progression.
* `ComputingBenefits44`: Derived from `stage` (1-4).
* `SshKeys9`: Derived from `level` (1-3) and block state.
* `SmartRing32`: Actually derived from `completedTabs` array rather than `day`, as the `day` variable ran continuous mini-simulations inside those tabs.
* `FoldableSmartphone11`: Derived from a 0/50/100 split based on `hardwarePassed` and `softwarePassed` spanning its two missions.
* `CsrfAttacks9`: Bespoke fractional marks based on the 8-boolean `missions` sandbox array.

## Group 2 Classifications (Pass/Fail Timer)
All ~39 remaining labs (including `JwtTokens9`) received the generic pass/fail timer treatment. 
- Timer pill renders in the `navExtra` slot.
- On completion: `reportComplete({ points: 100 })` is fired.
- On timeout: A generic "Time's up!" modal fires, invoking `reportComplete({ points: 0 })` without the partial credit text, and offers a `window.location.reload()` refresh.

## Verification
* `tsc --noEmit` returns 0 errors site-wide.
* `lint-labs.js` passes site-wide.
* **No `use client` duplication** or bundler-crashing injections occurred.
* Tested route loading to ensure `200 OK`.

This closes the catalog-wide rollout of the Timer + Marks feature.
