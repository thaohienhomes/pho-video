# Phở Video Design System

## 📐 Spacing Scale (4px Base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | No gap |
| `space-1` | 4px | Tight inline gaps |
| `space-2` | 8px | Icon-text gaps, button padding |
| `space-3` | 12px | Small card padding |
| `space-4` | 16px | Standard card padding |
| `space-6` | 24px | Section gaps, grid gaps |
| `space-8` | 32px | Large section padding |
| `space-12` | 48px | Section vertical margins |
| `space-16` | 64px | Page section spacing |
| `space-24` | 96px | Hero section padding |

**Rule:** All spacing must be divisible by 4px.

---

## 🔤 Typography Scale (1.2 Ratio)

| Level | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 12px | 1.5 | 400 | Labels, metadata |
| `text-sm` | 14px | 1.5 | 400-500 | Body small, buttons |
| `text-base` | 16px | 1.6 | 400 | Body default |
| `text-lg` | 18px | 1.6 | 500 | Subheading |
| `text-xl` | 20px | 1.5 | 600 | Card titles |
| `text-2xl` | 24px | 1.4 | 600 | Section headers |
| `text-4xl` | 36px | 1.2 | 700 | Page titles |
| `text-5xl` | 48px | 1.1 | 700 | Hero mobile |
| `text-7xl` | 72px | 1.0 | 700 | Hero desktop |

**Font Stack:**
- Headings: `var(--font-outfit)`, sans-serif
- Body: `var(--font-inter)`, sans-serif

---

## 🎨 Color Tokens

### Primary Palette
| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `primary` | #F0421C | 9 89% 53% | CTAs, Active states |
| `primary-foreground` | #FFFFFF | - | Text on primary |

### Neutral Palette
| Token | Usage |
|-------|-------|
| `background` | Page background (#0A0A0A) |
| `foreground` | Primary text |
| `muted` | Secondary backgrounds |
| `muted-foreground` | Secondary text |
| `border` | Borders, dividers |

### Semantic Colors
| Token | Usage |
|-------|-------|
| `destructive` | Error states, delete actions |
| `success` | #22C55E - Success indicators |
| `warning` | #EAB308 - Warning states |

---

## 📦 Component Standards

### Buttons
```css
/* Standard: h-10, rounded-md */
.btn-standard {
  @apply h-10 px-4 rounded-md text-sm font-medium;
}

/* Large: h-12, rounded-lg */
.btn-large {
  @apply h-12 px-6 rounded-lg text-base font-semibold;
}
```

### Inputs
```css
/* All inputs: h-10 unified height */
.input-standard {
  @apply h-10 px-3 rounded-md border text-sm;
  @apply bg-white/5 border-white/10;
  @apply focus:border-primary/50 focus:ring-1 focus:ring-primary/20;
}
```

### Cards
```css
.card-glass {
  @apply bg-black/40 backdrop-blur-xl;
  @apply border border-white/10 rounded-xl;
  @apply p-4; /* Standard: 16px padding */
}
```

---

## 📐 Layout Tokens

### Container Max Widths
| Token | Value | Usage |
|-------|-------|-------|
| `max-w-4xl` | 56rem | Hero text content |
| `max-w-7xl` | 80rem | Page sections |
| `max-w-screen-2xl` | 1536px | Full-width layouts |

### Grid System
```css
/* 12-column grid for Bento layouts */
.grid-bento {
  @apply grid grid-cols-12 gap-6;
}

/* Feature items */
.bento-feature { @apply col-span-12 md:col-span-8 lg:col-span-6; }
.bento-secondary { @apply col-span-6 md:col-span-4 lg:col-span-3; }
```

### Fixed-Fluid-Fixed Layout (Studio)
```css
.studio-layout {
  @apply flex h-full;
}

.studio-sidebar {
  @apply w-80 flex-shrink-0 sticky top-0;
  @apply bg-[#0A0A0A] border-r border-white/5;
}

.studio-canvas {
  @apply flex-1 overflow-auto;
}
```

---

## ✅ Enforcement Rules

1. **Spacing:** No arbitrary values (e.g., `p-5`). Use scale tokens only.
2. **Heights:** All interactive elements use `h-10` (40px) for consistency.
3. **Radii:** `rounded-md` for inputs/buttons, `rounded-xl` for cards.
4. **Gaps:** `gap-6` (24px) between grid items, `gap-4` (16px) within cards.
