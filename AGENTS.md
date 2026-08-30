<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GRADE 9 EDUCATIONAL LAB REQUIREMENTS

For every Grade 9 lab, use this simple checklist:

1. **Learning goal** — Clearly state what the student will understand.
2. **Short instructions** — Explain what to do in simple language.
3. **Interactive task** — Student must make decisions, not only watch.
4. **Progressive challenge** — Start easy, then increase difficulty.
5. **Immediate feedback** — Explain why an answer succeeds or fails.
6. **Real-world connection** — Show where the concept is used.
7. **Visible outcome** — Produce a score, report, working system, or completed artifact.
8. **Final assessment** — Verify that the student understood the concept.
9. **Wow moment** — Include a meaningful animation, consequence, experiment, or reveal.
10. **Accessibility** — Support mobile, keyboard, tap, readable text, audio, and reduced motion.
11. **Reset and replay** — Reset must fully restore the lab.
12. **LMS completion** — Call `reportComplete()` once, using the correct lab ID.
13. **Responsive layout** — No clipping or inaccessible content at 390×844.
14. **Technical quality** — Build passes, timers are cleaned up, and no console errors occur.

## Lab Flow
A good lab flow is:
**Learn → Try → Fail safely → Understand why → Improve → Complete → See the outcome**.

## Mandatory Planning Protocol
Before writing or refactoring code for any lab, the agent MUST generate a plan covering these three phases:
1. **Concept Planning:** Map the lab strictly to the 7-step flow (**Learn → Try → Fail safely → Understand why → Improve → Complete → See the outcome**).
2. **Design Layout Planning:** Define the spatial layout (e.g., grid vs. flex, sidebar vs. full width) ensuring zero-scroll at 390x844.
3. **UI & UX Planning:** Define the specific visual feedback mechanisms (e.g., pulsing sockets, drag-and-drop elasticity, error shakes).

## Gold Standard Reference Labs
When in doubt about layout, UI/UX quality, or pedagogical flow, agents must read and emulate the following benchmark labs:
- `labs/csrfattacks9.tsx`
- `labs/roboticsurgery46.tsx`
- `labs/contentdeliverynetwork9.tsx`

## UI & UX Design Mandates (Learned)
1. **High Contrast Themes Only:** Never use low-contrast dark themes (like `cosmos`). Default to the `ocean` theme (Light) with crisp white cards, dark slate typography, and vibrant interactive colors (emerald/indigo).
2. **Compact Vertical Layout:** Do NOT pass a `subtitle` prop to `<LabShell>`. Instead, rely on the `instruction` prop and enable `compact={true}` to reclaim maximum vertical space for the interactive workspace.
3. **Responsive Grid Wrapping:** When rendering 8-10 draggable items or cards, always use wrapping grids (e.g., `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`) so they organically fill the available space instead of clipping horizontally.
4. **Tangible Visual Metaphors:** Never output abstract math (like "89% Error") as the primary lab feedback. Ground the math in a tangible visual interaction (e.g., classifying a Chihuahua vs. Muffin, or drawing physical glowing nodes).

## Curriculum & Content Mandate
1. **Curriculum Reference:** Always consult `docs/CURRICULUM_REFERENCE.md` for lesson grounding.
2. **Handle Misaligned Labs:** Be aware that 14 labs (mostly cybersecurity/crypto/quantum) have NO corresponding chapter in the textbook. Do not hallucinate a textbook connection for these topics. Conversely, 14 textbook chapters currently have no labs.


## Agent Behavior / Communication
1. **No Waiting / Scheduling:** Do NOT use the schedule tool or timers to explicitly wait for the user to respond. When finishing a task, simply end the turn and let the user reply naturally without adding artificial pauses or background waiting tasks.
