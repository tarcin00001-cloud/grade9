<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PERMANENT GRADE 9 COMPUTING LAB PROTOCOL — CANONICAL STANDARD

**Status:** Canonical Single Source of Truth  
**Scope:** Every Grade 9 Computing Lab and every future refinement cycle  
**Authority:** Governs all architectural, pedagogical, visual, interaction, and responsive decisions before and during implementation.

---

# 0. THE CORE PRINCIPLE: LIVING, ENGAGING & VISUALLY STRIKING LEARNING WORLDS

These labs are **not web pages containing educational content, nor are they two-column SaaS dashboards.** They are **vibrant, creative, tactile, visually striking interactive game worlds tailored for 14–15 year old students.**

The student should not:
> read text → click button → read result badge.

The intended experience is:
> **observe an animated physical system → physically manipulate a control → experience an immediate dramatic visual consequence in the same visual zone → discover the computing rule through that consequence → triumph.**

### The Fundamental Question for Every Lab:
> **"Could a 14-year-old understand what to do and what just happened by looking at the screen alone?"**
> If the answer is NO — redesign it.

---

# 0.5. ARCHITECT HELM: EXPERIENCE EXCELLENCE LAYER

Before any implementation agent writes code, the project architect/manager must hold the helm and raise the lab above surface-level UI. Compliance with the rules below is the minimum; the goal is a memorable interactive environment where a computing idea becomes physically visible.

## 0.5.1 World Before Screen

Every lab must begin as a world, not a layout. The architect must define:
- **Where the student is**: workshop, vault, clinic, launch pad, studio, city grid, museum, machine room, control deck.
- **What machine or living system they touch**: robot, tank, door, belt, lens, grid, tower, dial, pipe, card reader, signal path.
- **What rule the world obeys**: the actual computing relationship, represented honestly.
- **What physically changes when they act**: flow, motion, light, sound, pressure, position, shape, route, focus, count, lock state.
- **What triumph looks like**: a visible transformation, not a badge.

If the first sketch is "cards in a panel," stop and rebuild the idea around the physical world.

## 0.5.2 The Dominant Student Verb

Each lab must have one dominant physical verb that a 14-year-old can understand by sight:

> flip, drag, crank, wire, pour, stamp, launch, tune, repair, steer, punch, scan, connect, sort, test, aim, trim, route.

The verb drives the composition. If the dominant verb is merely "click," the lab is underdesigned unless it is a deliberately simple judgment lab and the click visibly affects an active framework.

## 0.5.3 Visual Consequence Ladder

Every meaningful student action must produce layered feedback in the same visual zone:
- **Tiny consequence**: snap, wiggle, glow, click, lift, liquid ripple, dial twitch.
- **Medium consequence**: belt moves, route lights, gate slides, robot acts, lens sharpens, signal travels, tank fills.
- **Signature consequence**: rocket fires, vault opens, city powers up, robot completes the mission, telescope image resolves, machine prints/counts/plays the student's result.

Do not substitute a text badge, toast, star, rank, or score for these consequences.

## 0.5.4 Failure Must Teach Visibly

Wrong choices must show why they are wrong through the world:
- a mismatched memory jar leaks or refuses to power the robot tool
- an unsafe setting shakes the machine or pushes a gauge into danger
- a wrong route sends a packet to a dead end
- a bad repair leaves the robot sputtering at the broken part
- a wrong sequence produces the visible wrong output

Failure is not a punishment and not a generic "try again." It is the explanation.

## 0.5.5 The No-Reading Test

Before a lab is accepted, inspect it as if all text were blurred. A viewer should still understand:
- what objects can be touched
- what changed after the touch
- whether the change helped or hurt
- where the system's rule is being revealed
- when the final success moment happened

If the lab fails this test, reduce text and strengthen the physical visual system.

## 0.5.6 Signature Moment Requirement

Every refined lab needs one memorable moment that belongs only to that lab. Examples: rocket ignition, vault shutters slamming, robot executing a belt, film reel playing the edit, punch-card dials tallying, city lights spreading, telescope image resolving, an automated factory producing exactly the student's loop count.

The signature moment must be earned by the student's interaction and must represent the concept truthfully.

## 0.5.7 Required Architect Treatment Card & Mandatory Planning

**CRITICAL MANDATE:** You must ALWAYS create an implementation plan and present the Architect Treatment Card to the user for approval BEFORE beginning any actual development or writing any code. Do not proceed with implementation until the user explicitly approves the plan.

Before implementation, create or state a concise treatment card (typically as an implementation_plan.md artifact):
- **Concept**
- **Likely misconception**
- **World metaphor**
- **Dominant student verb**
- **Main visual system**
- **Immediate consequence**
- **Failure behaviour**
- **Signature moment**
- **Completion evidence**
- **Responsive transformation**
- **Preserved contracts/assets**

Implementation begins only after this card is presented to the user, explicitly approved, and aligned with the tracker priority.
## 0.5.8 Single-Surface Visual World Rule

The main visual world must also be the main interaction surface. Do not split the experience into a passive illustration on one side and a separate answer/control panel on the other. If the student touches a switch, tile, tool, dial, socket, route, or machine, that object must live inside the world or be physically docked to it.

Allowed patterns:
- levers bolted to the rocket, machine, rover board, vault, or robot
- tools hanging from the medical bay arm that are dragged directly onto the broken part
- dials mounted on the factory machine, not floating in a separate form area
- plugs, wires, routes, locks, jars, and switches visibly connected to the system they affect
- small utility strips for reset/audio/progress when required by the shell

Rejected patterns:
- left visual card plus right answer-card stack
- separate "choose the command" or MCQ panel driving a distant picture
- modal-by-modal teaching flow where the world pauses for reading
- large white/gray rounded panels that contain most of the interaction
- passive mascot art that does not change when the student acts

A screenshot should read as one cohesive simulation, machine, scene, or game board. If it reads as a classroom worksheet with decoration, reject it.

## 0.5.9 Visual Definition Depth

Every concept-bearing object must have a visual definition with four parts:
- **Form**: what it physically is in the world, such as a jar, gear, cable, gate, tank, route, lens, stamp, or socket.
- **State**: how its current value/status is visible, such as fill level, glow color, lock position, path light, angle, pressure, count marks, or damage.
- **Affordance**: how the student can tell it can be touched, such as handles, grooves, hinges, rails, magnets, sockets, hover lift, or grab tabs.
- **Consequence**: what changes in the same zone when it is manipulated.

Labels may clarify, but labels cannot be the definition. A rectangle named "Repair Tile" is not enough; the tile must look and behave like the repair it represents.

## 0.5.10 Learning-Play Balance

A lab fails if it is a beautiful simulation that does not teach the computing concept. A lab also fails if it teaches accurately but feels like a quiz, worksheet, or dashboard. The accepted target is playful concept discovery: the fun action must be the same action that reveals the rule.

Each lab must pass both tests:
- **Concept truth test**: the mechanic honestly models the computing idea and exposes the misconception.
- **Curiosity test**: the student wants to touch, test, and watch the system before being told what it means.

## 0.5.11 Anti-Surface-Level Rejection Rule

Reject the first implementation pass if any of these are true:
- the dominant work is selecting from text cards
- the most detailed part of the screen is headers, labels, badges, or status bars
- the visual world could be removed and the lab would still function
- success is communicated mainly by a banner, badge, score, or text line
- the scene contains generic rounded boxes instead of bespoke physical objects
- the interaction is only click-to-select followed by click-to-run, with no direct manipulation of the world

Execution agents must spend most implementation effort on the physical visual system, its state changes, and its responsive composition, not on copy, chrome, counters, or panel styling.
## 0.5.12 No Cheap Text-Box Visual Construction

A lab fails when its main construction is made from large text boxes, card grids, rectangular slabs, or rounded panels that merely contain labels. This remains a failure even if the colors are bright, the borders are thick, and the theme names a robot, rocket, factory, or mission.

Student-facing concept objects cannot be generic boxes, cards, panels, answer tiles, or code blocks with labels. If an object teaches the concept, it must be drawn or constructed as a physical thing with recognizable form, state, affordance, and consequence.

Banned as primary student-facing objects:
- text boxes for tools, commands, values, bugs, loop targets, stations, or answers
- code terminals as the largest learning surface
- rectangular card grids as the main interaction
- oversized HUD strips that crowd out the world
- labels substituting for shape, motion, or cause/effect
- malformed or stretched boxes with awkward empty space and text floating in the middle

Required instead: pipes, valves, tanks, sockets, wires, belts, gears, jars, glass chambers, clamps, rails, dials, cranks, levers, tracks, lenses, gates, machine arms, repair tools, and other bespoke scene geometry.

Build the object itself:
- a valve is a lever, hinge, pipe, handle, and flow state
- a jar is glass, lid, fill, highlight, socket, and accepted/rejected contents
- a repair part is a clamp, chip, ring, cable, plug, or tool with a visible use location
- a route is a path, wire, rail, light pulse, switch, gate, and destination
- a loop machine is a dial, crank, moving arm, mold, belt, and output

Text belongs on believable surfaces: tiny monitor readouts, engraved plates, dial markings, gauge labels, stickers, wire tags, and tool stamps. Text cannot be the object, the mechanic, or the main visual mass.

Reject any lab where the first impression is "boxes with text" rather than "I want to touch that machine."

---
# 1. ABSOLUTE RULES

1. **NO EMOJIS ANYWHERE**: Never use emoji characters in code, JSX, UI strings, button labels, titles, or feedback strings. Use Lucide icons, bespoke animated SVGs, or CSS geometry.

2. **NO BLAND DEVELOPER DASHBOARDS / DARK CYBERPUNK / MUTED FORM CARDS**: No generic two-column gray boxes, no `bg-slate-900` dark terminal styling, no boring SaaS layouts. Computing concepts are represented through bright, saturated, sunlit, playful, tactile physical environments with personality.

3. **CAUSE-AND-EFFECT MUST BE IMMEDIATE AND IN THE SAME VISUAL ZONE**: When a student flips a switch, drags a block, or presses a button, the consequence must happen **instantly and dramatically in the same part of the screen** — not as a number updating in a separate panel or a badge appearing after reading a result. The consequence IS the lesson.

4. **NO FAKE AI DELAYS**: Do not add fake `setTimeout` spinners or randomised "Confidence %" displays. Show the real rule or decision boundary directly and continuously.

5. **DO NOT DESIGN THE UI FIRST**: Never start with "I'll make a two-column card layout." Start with the **physical game world**, its mechanical metaphor, and what the student physically does. Layout follows from the world's natural shape.

6. **PRESERVE ESTABLISHED INTEGRATION CONTRACTS**: Never alter `LabShell` contracts, `useLMSBridge` completion hooks (`reportComplete()` called once on genuine victory), `useLabAudio` hooks, or global celebration overlays.

7. **CONCEPT FIDELITY — NEVER DRIFT FROM THE ORIGINAL LAB DEFINITION**: Every lab has a canonical `title`, `lesson`, and `desc` in `data/labs.ts`. These are the **immutable source of truth** for what a lab teaches and what the student does. No agent, refinement wave, visual overhaul, or world-metaphor redesign may ever:
   - Change or paraphrase the lab `title` (shown in `LabShell`)
   - Replace the learning objective described in `desc` with a different concept
   - Substitute a different computing idea in place of the one defined in `lesson`
   - Invent scenarios, faults, or interactions whose content belongs to a different lesson entirely

   **Before writing a single line of lab code**, the agent MUST read the lab's entry in `data/labs.ts` and verify that the mechanic, the student action, and the win condition all faithfully represent `desc`. If there is any doubt, stop and ask — do not guess.

   **Concept drift examples that are permanently banned:**
   - Binary-to-Decimal lab → reframed as fuel-pouring without showing the binary number being constructed
   - Error Messages lab → reframed as robot surgery with no actual error messages displayed
   - Junior Programmer lab → reframed as Mars hardware repair instead of logical code debugging
   - Simple Loops lab → reframed as product stamping with no character reaching a goal
   - Variables lab → showing raw values instead of variable name-value declarations

   The **world metaphor, visual style, and physical interaction** are all free to be creative and vivid. The **concept content, student task, and learning objective** are locked to `data/labs.ts`.

---

# 2. ZERO JARGON — BANNED WORDS IN STUDENT-FACING UI

**Never use these terms in any visible student-facing text** — titles, headers, labels, buttons, hints, instructions, speech bubbles, or badges:

> Array, Sorted Array, Binary Word, Binary Bus, Positional, Sequential, MegaWatts, Conduit, Candidates, Active Span, Sorted, Index notation `[0...8]`, `N=9`, frequency units (kHz, MHz), "Script Execution", "Automation", "Harness", "Cartridge", "Bootloader", "Firmware", Technical abbreviations (BIOS, TCP/IP, etc.)

**Never show raw code syntax as the primary label** on interactive elements. `print("Hello, Python!")` is not a card label for a child. Use plain English:
- "Say something" instead of `print()`
- "Remember a number" instead of variable assignment syntax
- "Repeat 3 times" instead of `for i in range(3):`
- "Check if..." instead of `if score >= 50:`

**What to use instead:** Numbers, colors, simple action verbs students know ("flip", "fill", "find", "drag", "launch", "check"), and plain nouns students understand ("tank", "rocket", "door", "robot", "switch").

---

# 3. PHYSICAL MANIPULATION IS THE INTERACTION

**Students must physically manipulate the world** — drag, flip, slide, crank, or touch objects — not click text buttons that produce text result badges.

Interaction affordances must be:
- **Self-evident from the visual** (a lever looks like it flips; a slot looks like you drop things into it)
- **Large enough to be satisfying** (not a tiny `+` button inside a card)
- **Immediately reactive** (the visual changes the instant the student touches it)

Banned interaction patterns:
- Clicking a `+` button to add a code block to a list
- Clicking a text button that produces a text badge in a separate panel
- Reading a result → clicking "Next" → reading the next result

---

# 4. VISUAL / ART & INTERACTION STANDARD (STUDENT-CENTRIC GRADE 9 DESIGN)

1. **BESPOKE PHYSICAL & GAMIFIED METAPHORS**: Every lab is built around a vivid, memorable physical metaphor:
   - Binary Logic → Rocket fuel switches, power levers, arcade breakers
   - Algorithms → Vault-cracking, treasure maps, sonar sweeps
   - Programming → Robot automation, game character control, mission programming
   - Networking → Living town infrastructure, delivery vehicles, signal towers

2. **SATURATED, CHEERFUL & TACTILE PALETTES**: Bright electric cyan, sunshine gold/amber, fresh emerald green, coral rose, glossy white chassis with saturated color borders. High-contrast, 3D candy-like buttons and chunky toggles.

3. **ANIMATION AS SYSTEM BEHAVIOUR — NOT DECORATION**:
   - Use `framer-motion` for spring-loaded interactions, sliding gates, rotating dials, animated fills, and glowing energy pulses.
   - Every animation must **encode information** about the system state, not just look pretty.
   - Example: fuel rising in a tank encodes the binary sum directly; a vault barrier slamming encodes elimination.

4. **CLEAR VISUAL HIERARCHY**:
   - **Dominant (>70% screen)**: The animated physical world / game scene itself, including the main interaction surface
   - **Secondary**: Large, obvious, tactile controls embedded inside or physically docked to the world
   - **Tertiary**: Minimal text feedback (numbers, simple status words)
   - **None**: Explanatory paragraph text, jargon labels, MCQ options, detached answer panels

5. **VARIATION ACROSS LABS**: No two labs share the same layout template. Different concepts produce different environments.

---

# 5. DRAG AND DROP — CANONICAL STANDARD

When a lab uses drag-and-drop as the primary mechanic:

1. **Use `framer-motion` `drag` prop** with `dragMomentum={false}` and `dragElastic={0.05}` for precise control.
2. **Spring-back on failed drop**: Set `animate={{ x: 0, y: 0 }}` with `transition={{ type: "spring", stiffness: 350, damping: 28 }}` so cards return to their library position if dropped outside a valid zone.
3. **Drop zone detection**: Use `useRef` arrays pointing to each drop zone element; in `onDrag`, compute `getBoundingClientRect()` intersection to highlight the active drop zone; in `onDragEnd`, use the last detected zone.
4. **Visual feedback during drag**: The dragged card lifts (`scale: 1.08`, strong `boxShadow`), source card dims to `opacity: 0.4`. Valid drop zones pulse their border (`ring` animation). Invalid zones do not respond.
5. **Occupied slot behaviour**: Dragging onto an occupied slot returns the existing card to the library first, then places the new card.
6. **Remove from belt**: Dragging an already-placed belt card back over the library area removes it from the belt and returns it to available.
7. **Touch handling**: `framer-motion` drag handles touch events natively — no additional touch event handlers needed.
8. **Accessibility fallback**: Every draggable element also responds to a single **tap/click** to "select" it, followed by a tap on a drop zone to "place" it.

---

# 6. RESPONSIVE / VIEWPORT RULES (FLUID SIZING ARCHITECTURE)

1. **VIEWPORT-FIRST CONTAINMENT**:
   - Structural sizing must use: `%`, `vw`, `vh`, `clamp()`, `min()`, `max()`, `flex`, `grid`, `minmax()`, and `aspect-ratio`.
   - Avoid fixed `px` containers for structural elements.
   - Interactive elements (switches, vault doors, cards) use `flex-1` or grid fraction sizing to fill their allocated space.

2. **THE 7 MANDATORY VIEWPORT CHECKPOINTS**:
   1. `1600x900` (Large Desktop)
   2. `1366x768` (Standard Desktop)
   3. `1024x768` (Compact Laptop)
   4. `900x600` (Tablet Landscape)
   5. `768x1024` (Tablet Portrait)
   6. `600x800` (Narrow Mobile/Tablet)
   7. `1024x450` (Short Embedded Landscape - 100% contained, zero scrollbars)

3. **RESPONSIVE COMPOSITION MODES**:
   - **Large desktop**: the full interactive environment dominates; controls sit naturally around or beside it without shrinking the world.
   - **Standard desktop / compact laptop**: world and controls remain simultaneously visible; supporting panels become tighter, not dominant.
   - **Tablet landscape**: the primary world remains first; dense sidebars may dock below or become compact rails.
   - **Tablet portrait**: stack the world first, then the controls; any essential reference becomes a compact top strip near the interaction.
   - **Narrow mobile/tablet**: one-hand touch targets, reduced secondary detail, no hidden primary consequence.
   - **Short embedded landscape (`1024x450`)**: cockpit mode; preserve the core world, controls, and consequence while dropping decorative extras.
---

# 7. IMPLEMENTATION & QUALITY GATES

1. **CLEAN TYPESCRIPT & LINTING**: `npx tsc --noEmit` must pass with 0 errors; `node scripts/lint-labs.js` must pass with 0 violations.
2. **ARCHITECT TREATMENT CARD**: Every new or refined lab must have the treatment card from Section 0.5.7 before implementation begins.
3. **7-VIEWPORT VISUAL AUDIT**: Every lab must pass visual inspection at all 7 checkpoints confirming:
   - Zero dead/empty void space in the main world or embedded controls
   - Zero overflow or clipping
   - Every interactive element is large, obvious, and usable
   - Task goal is communicable without reading paragraph text
   - Cause-and-effect consequence is visible in the same zone as the interaction
   - No detached visual panel plus answer/control panel split
   - The no-reading test passes
   - The signature moment is visible, conceptually honest, and responsive
---

# 9. FULL-BLEED WORLD ARCHITECTURE (ZERO BUBBLE CAPSULE)

The lab world must **fill the entire available viewport area** provided by `LabShell`. There is no centered card. There is no floating rounded rectangle on a colored void. The lab **is** the environment.

**Rules:**

1. **No outer centered container**: Never use `max-w-*`, `mx-auto`, or a centered `rounded-3xl bg-white border-*` wrapper as the primary world container. The world is not inside a card — the world IS the canvas.

2. **Full-bleed canvas pattern** (required):
   ```tsx
   // REQUIRED — fills the LabShell canvas edge-to-edge
   <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden relative">
     <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-amber-700" />
     {/* world layers */}
   </div>
   ```
   ```tsx
   // BANNED — creates bubble capsule on cyan void
   <div className="w-full flex-1 p-2 max-w-5xl mx-auto">
     <div className="rounded-3xl bg-white border-4 border-cyan-300 ...">
   ```

3. **Background defines space, not borders**: Use absolute-positioned gradient divs and SVG landscape layers to define the environment. Space is communicated by color, texture, and illustration — never by a rounded white card with a colored border.

4. **Docked panels connect flush to world edges**: Bottom control strips, side rails, and embedded consoles must use `w-full` and connect flush to scene edges. They should look built into the world, not floating below a card.

5. **Dead space = failure**: At `1366×768`, any contiguous region of LabShell background color wider than `80px` or taller than `60px` outside the nav header is a **FAIL**. Rebuild the layout and expand.

> [!CAUTION]
> A lab that places its world inside a centered `max-w-5xl rounded-3xl` white card fails §9 and must be rebuilt. The card is not the world.

---

# 10. PHYSICAL INTERACTION AUTHENTICITY — GESTURE-FIRST MECHANICS

Every interactive element must be illustrated as the real physical object it represents and respond to the real physical gesture that object would require.

## 10.1 Material Object Form

Every interactive control must be **illustrated as the real physical object** it is. The shape and material carry the identity — not a text label:

| What it IS | What it must LOOK like |
|---|---|
| Rotary dial | SVG circular face with numbered positions around perimeter, rotating pointer hand, ribbed grip ring |
| Pull crank / handle | SVG T-bar handle on a rope/chain attached to a wall bracket; visible mechanical detail |
| Rocker switch | SVG pivot lever inside a housing; "1" (ON) at top end, "0" (OFF) at bottom end; lever physically rotates ±25–35° on toggle |
| Rubber-band wire | SVG cubic bezier line extending from a cylindrical plug head on the tool to the cursor; plug head circles confirm socket proximity |
| PCB / Memory chip | SVG gold rectangle with visible pin legs, trace lines, and component markings |
| Fuel valve / pipe | SVG pipe nozzle below switch housing; animated liquid flow when open |
| Railway lever | SVG large lever arm mounted on terrain; dragged downward and holds position |

A colored `<button>` or `<div>` with a word label is **not** a physical object.

## 10.2 Gesture-First Mechanics Table (Canonical)

| Real Object | Required Student Gesture | Implementation |
|---|---|---|
| **Rotary Dial** | Drag pointer in circular arc around dial center | Track `Math.atan2(dy, dx)` from dial center; map angle to value; snap pointer hand to nearest value; call `setPointerCapture` for smooth off-element tracking |
| **Pull Crank** | Drag handle downward; spring returns on release | `framer-motion` `drag="y"` with `dragConstraints={{ top: 0, bottom: 120 }}`; fire action at ≥70% pull; `animate={{ y: 0 }}` for spring return |
| **Rocker Switch** | Click to toggle; lever physically pivots | `framer-motion` `motion.div` with `animate={{ rotate: isOn ? -28 : 28 }}` spring; value text on lever face |
| **Rubber-Band Wire** | PointerDown on tool port → wire stretches to cursor → PointerUp on socket | SVG `<path>` cubic bezier from port to cursor via `onPointerMove` on lab container; `setPointerCapture` on down; hit-test sockets on up |
| **Hex Plug Connector** | Drag plug body to matching socket | `framer-motion` drag; socket ref hit-detection in `onDragEnd`; spring-back on wrong socket |
| **Railway Lever** | Drag downward; stays locked in pulled position | `drag="y"` with `dragConstraints`; no spring return; `animate` to locked-down position |

## 10.3 Pointer Capture Rule

For gestures that extend beyond the source element (wire dragging, dial rotation):
- Always call `e.currentTarget.setPointerCapture(e.pointerId)` on `pointerdown`.
- Handle all subsequent movement and up events on the **lab root container**, not the source element.
- This ensures smooth tracking even if the pointer moves off the element at high speed.

## 10.4 Banned Interaction Surrogates

The following patterns are **permanently banned** as primary interaction mechanics in any lab with a physical world:

- A row of text buttons `1x 2x 3x 4x 5x` substituting for a rotary dial
- A `<button>` labeled "PULL CRANK TO RUN" substituting for a draggable pull crank
- A colored card ("Wire Clamp Bridge") substituting for an illustrated tool with SVG form
- Any `<button>` or `<div>` whose visual identity is its **text content** rather than its **illustrated material form**
- A dashed border rectangle with text "DROP TOOL HERE" substituting for a visually defined physical socket
- MCQ-style text option rows as the primary interaction for anything that maps to a physical action

## 10.5 Student-First UX for Physical Gestures

- **Large affordance targets**: Dials ≥160px diameter; switch housings ≥60px wide; pull handles ≥48px tall
- **Immediate micro-feedback**: The object responds visually the instant interaction begins (crank starts moving, dial pointer moves, wire appears on first pixel of drag)
- **Snap to valid states**: Rotary dials snap to nearest value on pointer-up (no free floating); wires snap to socket on proximity
- **No hidden affordance**: The interactive nature of every object must be visible at rest — cranks have a handle grip shape, dials have a visible pointer, switches have a visible pivot, sockets have a visible opening

---

# 11. NEGATIVE SPACE ELIMINATION RULE

Every lab at every viewport must be inspected for **negative space** — large areas of uniform LabShell background color that contain no world content.

**Test**: At `1366×768`, any contiguous region of LabShell background color wider than `80px` or taller than `60px` outside the nav strip is a **FAIL**.

**Fixes**:
- Extend background gradients or illustrated layers (`absolute inset-0`) to fill every void
- Make docked control panels `w-full` and flush to bottom/side world edges
- Remove `max-w-*` width caps on world containers
- Remove outer `p-1 p-2` padding that creates a visible gap around the world
- On tablet portrait (`768×1024`): stack world on top and controls below, but horizontal fill must be 100% at every breakpoint

**This rule is checked in the §7 7-viewport visual audit.** A lab that passes overflow tests but fails negative-space inspection is not CLOSED.

---

# 12. BRIGHT, SUNLIT & VIBRANT PALETTE MANDATE (PERMANENT DARK VOID BAN)

Grade 9 Computing Labs are designed for 14–15 year old students. They must be **visually striking, vibrant, sunlit, saturated, and full of personality**.

### 12.1 Permanent Ban on Generic Dark/Cyberpunk Voids
- **BANNED**: Pitch-black, muddy brown, dark-blue empty voids (`#050518`, `#060b14`, `#0f172a`, `bg-slate-900`, `bg-slate-950`).
- **BANNED**: The "dark terminal sci-fi" aesthetic where objects float in a black vacuum with neon glowing borders.
- **BANNED**: Gloomy, flat, low-contrast UI cards that look like adult developer dashboards.

### 12.2 Approved Color & Material Aesthetic
- **Skies & Atmospheres**: Vibrant cyan/azure blue, warm sunny day gradients, saturated orange/amber twilight skies with clouds, bright emerald/mint workshop lighting, warm studio cream/gold.
- **World Materials**: Clean glossy chassis (snow white, brushed metal, hazard yellow, vibrant cyan, cobalt blue), wooden benches, grassy hills, textured industrial floors, brass fixtures.
- **High-Contrast Affordance**: Saturated candy toggles, 3D glossy levers, bright glowing signal lines, bold readable typography.

---

# 13. SPATIAL LAYOUT & MOTION FLOW ARCHITECTURE (VECTOR-BASED SPACE PLANNING)

Every lab must begin with a **Ground Spatial Vector Analysis** before writing code. Layout follows the natural physical movement of the learning concept:

### 13.1 Spatial Vector Archetypes

1. **Vertical Vector (Rocket Launch, Tank Fill, Gantry Crane, Altitude)**:
   - **Primary Stage (50–65% Width, 100% Height)**: The vertical system (tower, rocket, launch gantry, pipe manifold) occupies a full-height column extending from ground to sky.
   - **Controls (Docked Side or Bottom Deck)**: Switches, dials, and readouts are mounted on a physical console docked flush to the side or bottom, framing the vertical world.

2. **Horizontal Vector (Rover Journey, Robot Path, Packet Routing, Timeline)**:
   - **Primary Stage (100% Width, 50–65% Height)**: Full-width panoramic terrain with multi-layered landscape (sky, distant hills, track line, stepping tiles, goal beacon).
   - **Controls (Docked Command Deck)**: Levers, dials, and patch modules are mounted in a flush 100%-width bottom deck directly connected to the terrain.

3. **Central Workbench / Anatomy Vector (Robot Surgery, Computer Chassis, Memory Jars)**:
   - **Primary System (70%+ Canvas Area)**: The main character, robot, or device fills the center of the viewport with arms, chassis, and attached equipment extending outward.
   - **Flanking Tool Trays & Racks**: Tools, capsules, and plugs hang on physical racks docked flush to the canvas edges. Zero floating island cards!

### 13.2 Zero-Scrollbar & Fluid Fit Rule
- Never allow inner scrollbars (`overflow-y-auto` causing scrollbars in control strips is a **FAIL**).
- Use `clamp()`, `flex`, and `minmax()` so all controls and visual stages scale smoothly together across all 7 viewports.

---

# 14. THE CANONICAL GRADE 9 LAB QUALITY GATE CHECKLIST

Before any lab can be marked **CLOSED** in `docs/tracking/GRADE9_MASTER_LAB_TRACKER.md`, it must pass all 10 mandatory checks:

| # | Checkpoint | Requirement | Pass Criteria |
|---|---|---|---|
| 1 | **Title & Concept Fidelity** | Exact `title`, `subtitle`, and `desc` from `data/labs.ts` preserved without drift. | Rule 7 verified |
| 2 | **Bright & Vibrant Palette** | Zero dark voids; rich sunlit / saturated game aesthetic. | §12 verified |
| 3 | **Spatial Vector Planning** | Vertical vs horizontal motion planned; zero floating island cards. | §13 verified |
| 4 | **Dominant Physical Verb** | Large physical control (dial, crank, lever, wire, switch) drives action. | §10 verified |
| 5 | **Direct Visual Consequence** | Immediate dramatic reaction in the same visual zone. | §0 verified |
| 6 | **Zero Adult Jargon & Clutter** | No raw syntax labels; no paragraph walls; plain English verbs. | §2 verified |
| 7 | **Single-Surface Architecture** | Controls are embedded or docked flush into the world. | §0.5.8 verified |
| 8 | **Negative Space Elimination** | 0 empty dead space wider than 80px / taller than 60px. | §11 verified |
| 9 | **7-Viewport Containment** | 0 H/V overflow across all 7 viewports (`1600x900` to `1024x450`); zero scrollbars. | §6 verified |
| 10 | **Clean Code & Zero Lints** | `npx tsc --noEmit` and `node scripts/lint-labs.js` pass with 0 errors / 0 emojis. | §7 verified |

---

# 8. MASTER PROGRESS TRACKER & HANDOFF

The canonical, living tracker for all 48 Grade 9 labs is located at:
`docs/tracking/GRADE9_MASTER_LAB_TRACKER.md`

**Agent Mandate:**
- Always inspect `docs/tracking/GRADE9_MASTER_LAB_TRACKER.md` before beginning work to identify the next priority batch.
- Every newly refined lab must meet all standards in this protocol (§0–§16) and pass the Quality Gate Checklist.
- Upon completing and verifying any lab, update `docs/tracking/GRADE9_MASTER_LAB_TRACKER.md` (move lab from Pending to Closed, update metrics).

---

# 15. UNIVERSAL VOICE ASSISTANT STANDARD

Every lab must feature a crisp, encouraging background voice assistant to guide the student. 
- **Audio Profile**: The voice must be pronounced in an Indian English accent (`en-IN` locale) or a clear, friendly fallback voice best understandable by Indian students.
- **Role**: Provides short, crisp guidance, encouragement, and context for what to do next or why an action succeeded/failed.
- **Zero UI Disruption**: The voice assistant must operate seamlessly in the background without affecting the visual layout. Do not add bulky helper buttons, massive text bubbles, or avatars that break the single-surface world.
- **Implementation**: Use the Web Speech API (`window.speechSynthesis`) or the existing audio hooks (like `useLabAudio` if it provides TTS) to trigger these voice lines automatically on key state changes, errors, and successes.

---

# 16. UNIVERSAL COMPLETION MODAL

Every lab must implement a singular, consistent completion modal triggered upon final success.
- **Content**: A simple, triumphant message: "Congrats! You have completed [Lab Name]."
- **No Clutter**: Do not include unnecessary buttons, complex score breakdowns, or extra navigation unless structurally required by the LMS bridge.
- **Consistency**: It must look and feel identical across all 48 labs, acting as the definitive signal that the student has conquered the concept and the LMS webhook has fired.

# 17. SEAMLESS BACKGROUND BLENDING (NO BOX-IN-A-BOX)
The `flex-1` world container inside LabShell MUST use `bg-transparent`. 
Never apply a hardcoded background color (like `bg-slate-900`, `bg-slate-100`, or `bg-sky-100`) to the main world container along with borders and border-radius, as this creates an ugly "cut out" box inside the LabShell's native padding. 
The lab content must float natively and seamlessly on the LabShell background. 

**CRITICAL RULE ON LABSHELL THEMES**:
Do NOT use a `theme` prop on `LabShell` (e.g., `theme="ocean"`) if that theme resolves to a dark background. This violates the Permanent Dark Void Ban. If you need a bright, sunlit background (e.g., a sky or a bright canvas), you MUST use the `bgOverride` prop on `LabShell` (e.g., `bgOverride="bg-sky-100"`) and keep the inner lab container `bg-transparent`. This ensures the bright background fills the screen edge-to-edge (Full-Bleed) without creating a floating bubble capsule.

# 18. HIGHLY MODERN FLUID RESPONSIVENESS
Responsiveness and multi-device viewport capability MUST NEVER be compromised. 
- Never hardcode fixed vertical heights (h-96, h-[26rem]) that cause vertical clipping on small laptop screens (e.g., 1366x768). 
- Use fluid flexbox sizing: lex-1, min-h-0, percentages, and spect-ratio to ensure the layout compresses gracefully.
- A lab's content must perfectly fit within the available viewport without scrollbars, scaling down internal elements rather than clipping them.

# 19. TACTILE ACTION INTIMATION (FEEDBACK LOOP)
Every student action MUST have an immediate, obvious, and satisfying visual intimation (feedback).
- **Hover/Drag-over**: Drop zones must react prominently when an object is dragged over them (glow, expand, highlight).
- **Success/Ingest**: Dropping a correct item must trigger a satisfying ingest animation (e.g., flash of green, "ACCEPTED" overlay, object sucked in). Do not just let an object vanish silently.
- **Error/Reject**: Dropping an incorrect item must trigger a clear rejection (e.g., flash of red, "REJECTED", shake animation, and bounce back).

# 11. THE LMS IFRAME CONSTRAINT (HOST SYSTEM INTEGRATION)

**CRITICAL ARCHITECTURAL CONTEXT**: Our labs do NOT run as standalone, full-screen browser applications. They are hosted inside a third-party Learning Management System (LMS) ecosystem (e.g., Karky Academy / Thambaa Computing). 

The lab is embedded inside a constrained content panel (iframe/component slot) alongside heavy host-system UI (sidebars, activity trackers, top navs). 

**Mathematical Implication**:
The lab only receives approximately **65% of the physical screen width** and **75% of the physical screen height**. 
On a standard 1366x768 laptop, the actual viewport provided to our lab might be as small as 850x450.

**Implementation Mandates**:
1. **Aggressive min-h-0 Chaining**: Every single nested flex-column from the root to the deepest container MUST have min-h-0 applied. This is the only way CSS Flexbox allows content to dynamically squash below its intrinsic height instead of blowing out the bottom of the iframe.
2. **Zero Hardcoded Vertical Heights**: Never use h-96, h-[30rem], or fixed pixel heights for structural layout panels. Use mathematical fractions (h-[40%], lex-[2]) to ensure the layout perfectly subdivides whatever arbitrary small box the host LMS gives us.
3. **No Iframe Scrollbars**: The lab must fluidly squash to fit 1024x450 entirely above the fold. Scrollbars inside an embedded iframe look disjointed and broken. If content overflows, apply scrollbars strictly to the *inner content list* (like a list of cards or code blocks) using overflow-y-auto, NEVER to the structural world.

# 12. NO INTERNAL SCROLLBARS (THE ANTI-DASHBOARD RULE)

**NEVER use overflow-y-auto or overflow-x-auto to create internal scrolling panels for structural UI elements.** 

If your lab layout results in a grid of items, a list of choices, or a set of drop zones that is so tall or wide that it requires an internal scrollbar to fit inside the min-h-0 constraints, **your layout is fundamentally wrong for a Grade 9 immersive experience.**

Scrollbars belong in SaaS dashboards, not physical game worlds. 

**How to fix:**
- Switch from vertical stacking (which consumes precious iframe height) to **horizontal side-by-side layouts**.
- Reduce the number of items or scale their size down using flex fractions.
- Make the items part of the physical machine (e.g., scattered on a workbench, slotted in a rotary dial) rather than a CSS list.
- A lab must fit 100% of its interactive elements into the constrained iframe (e.g., 1024x450) entirely above the fold, at all times, with zero scrolling.

## 11. Gentle Error Nudges
Make it a protocol to always provide friendly, very short, specific nudges when a student makes a mistake (e.g., "Oops! 100 is a Number, not a Word."). Use unobtrusive toast notifications or speech bubbles. Failure is not a punishment, but a chance for a friendly micro-correction.
