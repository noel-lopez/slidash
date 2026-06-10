# Agent guide

This is a **slidash** presentation: plain HTML/CSS/JS, no build, no runtime
dependencies. Open `index.html` with `file://` and it just works. Everything
here is **yours** — rebuild any of it freely.

## What lives where

- `index.html` — your slides. This is where you spend your time.
- `theme.css` — the visual layer (colors, type, spacing). Yours to shape.
- `slidash.css` — machinery: chrome, slide transitions, step reveals. Self-sufficient.
- `slidash.js` — machinery: navigation only. You don't have to write navigation logic.

`slidash.css` / `slidash.js` are the working floor, not walls. Edit them if you
need to — but you rarely should.

## Conventions

The machinery relies on a few small markup agreements:

- A slide is `<section class="slide">…</section>`.
- `data-steps="N"` on a slide declares it has `N` reveal steps.
- `data-step="k"` on a child element reveals it once the viewer reaches step `k`
  (it gets the `.is-revealed` class; `k` counts from 1).

## Navigation

- `←` / `→` (also `Space`, `PageUp`/`PageDown`) move between slides and steps.
- `Home` / `End` jump to the first / last slide.
- The bottom chrome (arrows, progress dots, `N/total` counter) is clickable.
