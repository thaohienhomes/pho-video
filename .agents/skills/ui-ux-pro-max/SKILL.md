---
name: ui-ux-pro-max
description: Pro-level Design Intelligence & Checklist (Accessibility, Interaction, Aesthetics)
---

# UI/UX Pro Max - Design Intelligence

## Core Priorities
1. **Accessibility (CRITICAL):** Contrast 4.5:1, Focus States, aria-labels, semantic HTML.
2. **Interaction (CRITICAL):** Touch targets 44px+, `cursor-pointer`, Loading states.
3. **Performance (HIGH):** WebP images, Reduced motion support.
4. **Layout (HIGH):** Responsive, No horizontal scroll, correct z-indexes.

## Common Rules for Professional UI

### 1. Visual Quality
- **Icons:** Use consistent sets (Lucide/Heroicons). **NO EMOJIS** as icons.
- **Logos:** Use correct SVGs (Simple Icons).
- **Colors:** Use theme tokens (`bg-primary`) not raw values.
- **Glassmorphism:** Ensure visibility in both Light/Dark modes (e.g., `bg-black/40 backdrop-blur-md border-white/10`).

### 2. Interaction & Micro-animations
- **Cursor:** ALWAYS use `cursor: pointer` on interactive elements.
- **Feedback:** Hover states must be clear (scale, brightness, border).
- **Transitions:** Smooth (200ms-300ms) `transition-all`.
- **Loading:** Disable buttons during async. Use Skeletons for large content.

### 3. Typography & Spacing
- **Line Height:** 1.5 - 1.75 for body text.
- **Line Length:** 65-75 chars max for readability.
- **Gradients:** Use subtle text gradients for headings (e.g., `text-transparent bg-clip-text bg-gradient-to-r`).

### 4. Code Best Practices (Tailwind)
- **Cursors:** `cursor-pointer`
- **Transitions:** `transition-colors duration-200`
- **Glass:** `bg-white/10` or `bg-black/50`
- **Borders:** `border-white/10` (subtle)
- **Layout:** `max-w-7xl mx-auto` (Constraint)

## Pre-Delivery Checklist
- [ ] **Mobile:** Tested on 375px width? No horizontal scroll?
- [ ] **Dark Mode:** Do borders/backgrounds look good in dark mode?
- [ ] **Loading:** Is there a spinner or skeleton when waiting?
- [ ] **Errors:** Are error messages clear and close to the input?
- [ ] **Images:** Are they optimized and have `alt` tags?
