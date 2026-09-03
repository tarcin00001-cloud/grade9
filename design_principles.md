# Grade 9 Labs: Premium UI & UX Design System

This document serves as the "North Star" for all Grade 9 lab development, derived directly from our successful layout pivots and user feedback.

## 1. UI Principles: The Premium Aesthetic

> [!IMPORTANT]
> **Dynamic Theme Adaptation**
> You are empowered to choose the overarching theme (`theme` prop in `<LabShell>`) based on the specific narrative and curriculum of the lab. 
> Supported themes include: `"circuit" | "cosmos" | "ocean" | "forge" | "garden" | "studio" | "neon" | "grade9"`.

*   **Readability is King:** While you have freedom to use dark themes (like `cosmos` for Quantum Computing or `neon` for Hacking), you **must** ensure maximum typography legibility. Use stark white text on dark backgrounds, or deep slate/sky-950 on light backgrounds. Never use muddy or low-contrast text.
*   **Semantic Accents:** Regardless of the base theme, semantic UI elements must pop and convey immediate meaning. 
    *   🟢 `emerald` = Success / Safe / Authorized
    *   🟠 `amber` = Warning / Bias / In Progress
    *   🔴 `rose` = Critical Threat / Privacy Breach / Denied
    *   🔵 `sky/indigo` = Neutral Information / Hardware
*   **Tactile Skeuomorphism:** Flat, abstract boxes are forbidden. Interactive elements must feel physical. Use shadows (`shadow-sm`, `shadow-lg`), glowing LEDs, raised buttons, and recessed screens to make the interface feel like a premium tool or game.

---

## 2. Spatial Engineering: The Zero-Scroll Layout

> [!CAUTION]
> **No Clipping, No Scrolling, No Empty Oceans**
> The UI must fit perfectly within a 390x844 mobile viewport without triggering native scrollbars, and must scale elegantly to massive 4K desktop screens without leaving vast pillars of empty space.

*   **Split-Screen Desktop Architecture:** Do NOT lock the entire central UI to a narrow column (like `max-w-3xl`) if it leaves massive empty margins on ultra-wide screens. Instead, utilize `flex-col lg:flex-row` wrappers (e.g., `max-w-7xl`). Assign the large visual/interactive element to the `flex-1` left side, and the text/tools to a fixed-width right column (`lg:w-[450px]`).
*   **Fluid Constraints:** Rely exclusively on `flex-1 min-h-0 w-full` inner architectures. Let the flexbox engine compress the UI naturally for mobile.
*   **Dynamic Visual Sizing:** When applying split-screen layouts, use CSS transforms (e.g., `scale-125 lg:scale-150`) or fluid SVG sizing so that vector graphics grow to fill their massive desktop containers, rather than looking like tiny icons floating in a void.

---

## 3. UX Principles: The Pedagogical Flow

Every lab must strictly follow the **7-Step Flow**: *Learn → Try → Fail safely → Understand why → Improve → Complete → See the outcome.*

*   **Tangible Visual Metaphors:** Do not output abstract math or generic stick figures. Ground success/failure in physical consequences (e.g., a physical sticky note for a password breach, or an animated employee silhouette).
*   **Immediate Contextual Feedback:** If a student makes an error, the system must pause and explain *why* before they can proceed. 
*   **Progressive Challenge:** Present clear, obvious examples first, then introduce more nuanced, tricky cases as the student progresses.
