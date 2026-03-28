```markdown
# Design System: The Digital Archivist’s Garden

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Archivist's Garden"**

This design system is a study in "Cozy-Tech"—a bridge between the sterile precision of a technical archive and the organic, tactile warmth of a personal garden. We are moving away from the "SaaS-standard" look. Instead of rigid grids and high-contrast lines, we embrace **Soft Minimalism**. 

The system breaks the template through intentional asymmetry. Elements should feel "placed" rather than "slotted," utilizing generous whitespace and hand-drawn floral motifs to disrupt mathematical perfection. It is a space that feels curated over time, combining the archival soul of a monospaced typeface with a palette that feels like sun-bleached parchment and moss.

---

## 2. Colors & Surface Philosophy

The palette is derived from muted, organic tones—warm creams, soft stone greys, and desaturated botanical greens.

### The "No-Line" Rule
To achieve a high-end editorial feel, **1px solid borders are strictly prohibited for sectioning.** Structural boundaries must be defined through background color shifts or tonal transitions.
- Use `surface-container-low` (#fdfaeb) to define a secondary content area against the main `background` (#fffbff).
- Boundaries should feel like a change in paper stock, not a drawn line.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. Depth is achieved by nesting surface tokens:
1.  **Base:** `surface` (#fffbff)
2.  **Sectioning:** `surface-container-low` (#fdfaeb)
3.  **Components/Cards:** `surface-container` (#f7f4e2) or `surface-container-high` (#f1efd9)
4.  **Interactive Elements:** `surface-container-highest` (#ebe9d0)

### Glass & Signature Textures
For floating navigation or "archival tags," use **Glassmorphism**. Apply a semi-transparent `surface` color with a 12px–20px backdrop blur. 
- **Signature Gradient:** For primary Call-to-Actions (CTAs), use a subtle linear gradient from `primary` (#5c5f58) to `primary-dim` (#50534d). This adds a "weighted" feel that flat color cannot replicate.

---

## 3. Typography

All text uses **Space Grotesk** (monospaced feel) to maintain the technical, archival aesthetic while remaining legible at scale.

*   **Display (lg/md/sm):** Used for "Garden Landmarks"—the beginning of major sections. Set in lowercase for an indie, approachable feel.
*   **Headline & Title:** Used for cataloging content. These should feel authoritative yet airy, utilizing wide letter spacing (`tracking-wide`).
*   **Body (lg/md/sm):** The workhorse for archival descriptions. High line-height is mandatory (1.6+).
*   **Label:** Small, technical metadata. Use for timestamps, tags, or "File No." identifiers.

The contrast between the rigid, monospaced letterforms and the organic, soft background colors creates the "Cozy-Tech" tension that defines this system.

---

## 4. Elevation & Depth

Standard material shadows are too aggressive for this system. We use **Tonal Layering** and **Ambient Light**.

### The Layering Principle
Depth is primarily achieved by stacking. A `surface-container-lowest` card sitting on a `surface-container-low` background creates a natural, soft lift.

### Ambient Shadows
When an element must float (e.g., a modal or floating menu), use a shadow with a high blur (30px+) and low opacity (4%–8%). The shadow color must be a tinted version of `on-surface` (#383927) to mimic natural light filtered through a garden canopy, rather than a neutral grey.

### The "Ghost Border" Fallback
If a border is required for accessibility, it must be a **Ghost Border**: use `outline-variant` (#bbbaa3) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** Subtle gradient (`primary` to `primary-dim`), white text (`on-primary`), `md` (0.375rem) roundedness.
*   **Secondary:** `surface-container-highest` background, no border, `primary` text.
*   **Tertiary:** Text-only with an underline that only appears on hover.

### Input Fields
Inputs should look like archival entries. Use a `surface-container-low` background with a `Ghost Border` on the bottom edge only. Labels should be `label-sm` and sit above the field, never inside.

### Cards & Lists
**Prohibit divider lines.** Separate list items using the spacing scale (e.g., `spacing-6`) or a alternating subtle background shift. 
*   **Hand-Drawn Motifs:** Cards may feature a single, hand-drawn floral motif in the corner using `outline` (#82826c) at 30% opacity to break the digital grid.

### Archival Tags (Chips)
Small, `full` rounded containers using `secondary-container` (#e6e2d6). Use for categorization (e.g., "Perennial," "Draft," "Archived").

---

## 6. Do's and Don'ts

### Do
*   **Embrace Asymmetry:** Offset images and text blocks. Let the layout breathe.
*   **Use Whitespace as Structure:** Use `spacing-16` or `20` to separate major conceptual "islands" of content.
*   **Lowercase Headers:** Use lowercase for headlines to maintain the "indie/hand-crafted" vibe.
*   **Organic Motifs:** Use hand-drawn garden sketches sparingly to "soften" technical data.

### Don't
*   **No Hard Edges:** Avoid `rounded-none`. Everything should have at least a `sm` or `md` radius to feel approachable.
*   **No Pure Black:** Never use #000000. Use `on-surface` (#383927) for all dark elements to maintain the warmth of the palette.
*   **No Grid-Lock:** Avoid perfectly centered, symmetrical grids that look like a generic bootstrap site.
*   **No Heavy Borders:** If a section feels messy, increase the whitespace before reaching for a border.

---

## 7. Spacing & Rhythm
Rhythm should feel slow and intentional. Use the spacing scale to create "breathing room." Hero sections should utilize `spacing-24` (8.5rem) of padding to isolate the "archival entry" and make it feel precious.```