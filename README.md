# Between Two Ruins — Web Experience

An interactive dual-reader web experience for the novel *Between Two Ruins*. Two parallel worlds rendered side by side; as the reader scrolls through Part III, the boundary between them begins to break.

Built with React, TypeScript, Vite, and Tailwind CSS. Frontend only.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) once the dev server is running.

---

## What's in the Box

Phase 1 + Phase 2 of the plan are scaffolded and working:

- ✅ Cover page with split-screen aesthetic
- ✅ Dual reader with synchronized scrolling between worlds
- ✅ Themed typography per world (warm cream for the human, deep midnight for the demon)
- ✅ Responsive layout — desktop shows both panes, mobile shows one at a time with a world toggle
- ✅ Chapter pair system (human ↔ demon)
- ✅ Reader state persisted via localStorage (resume where you left off)
- ✅ Reading progress indicator
- ✅ Routing for chapter navigation
- ✅ Chapter 1 (Josef) loaded as a working chapter
- ⬜ Chapter 2 (Demon) is a placeholder ready for prose

The skeleton hooks for **Phase 5 (the Bleed)** are present and typed, ready to be filled in.

---

## File Structure

```
src/
├── components/
│   ├── layout/         # ReaderHeader, ReaderFooter
│   ├── pages/          # CoverPage
│   ├── reader/         # DualReader, DualPane, TextPane, Divider, BleedOverlay
│   └── ui/             # ProgressBar, WorldToggle
├── content/
│   └── chapters/       # Chapter content (.tsx files) + index manifest
├── hooks/              # useScrollSync, useChapter, useBleedTrigger, useViewport
├── store/              # Zustand reader store (persisted)
├── styles/             # Global CSS + Tailwind layers
├── types/              # TypeScript types (Chapter, World, etc.)
├── App.tsx             # Routes
└── main.tsx            # Entry point
```

---

## Design System

### Colors

Two complete color worlds defined in `tailwind.config.ts`:

| Token              | Human (Josef)         | Demon (Fallen)        |
|--------------------|-----------------------|-----------------------|
| `bg`               | warm cream `#F5EFE6`  | midnight `#0A0E1A`    |
| `surface`          | sand `#EBE3D5`        | deep blue `#141826`   |
| `text`             | brown-black `#1F1812` | bone `#E8DDD0`        |
| `muted`            | sepia `#5C4F42`       | smoke `#7E7468`       |
| `accent`           | ochre `#A87F32`       | crimson `#8B2C2C`     |
| `line`             | parchment `#C9BBA6`   | midnight line `#2A2F40` |

### Typography

- **Display** — Fraunces (literary, characterful, optical-size aware)
- **Body** — Cormorant Garamond (elegant, book-grade serif)
- **UI** — Inter Tight (minimal, used only for small UI labels)

Loaded from Google Fonts.

---

## Adding Chapters

1. Create `src/content/chapters/ch03-josef.tsx` (and the demon pair).
2. Use the same shape as `ch01-josef.tsx`: export a `Chapter` object with content, world, pairId, etc.
3. Register both in `src/content/chapters/index.ts` as a new `ChapterPair`.

The reader will pick them up automatically. Pair IDs determine which chapters play in parallel.

---

## Roadmap

See `between_two_ruins_web_plan.md` (in the original handoff) for the full phased plan:

- **Phase 1** — Foundation ✅
- **Phase 2** — Dual layout + responsive ✅
- **Phase 3** — Content system (more chapters, navigation) 🚧 partial
- **Phase 4** — Scroll sync ✅ basic, refine in Phase 5
- **Phase 5** — The Bleed effect ⬜
- **Phase 6** — Polish, lazy loading, accessibility ⬜

---

## Technical Notes

### Why mobile uses single-pane instead of stacking

The two worlds are *parallel.* Stacking them vertically on mobile loses the simultaneity that the desktop layout depends on. Single-pane with a toggle preserves the metaphor: on mobile you must choose which world to inhabit. That's thematic, not a compromise.

### The Bleed Effect (Phase 5 — not yet implemented)

`useBleedTrigger` returns a value 0–1 based on the current chapter's `bleedIntensity`. Components react to this:

- `Divider` fades toward invisibility
- `BleedOverlay` activates with cross-pane text echoes (to be implemented)
- Color temperature blends across the divide

Each Part III chapter increases `bleedIntensity`. Chapter 8 (confrontation) hits ~0.85. Chapter 10 (aftermath) collapses to a single pane — the resolution.

---

*A small offering for a story about loss, love, and the things we cannot forgive.*
