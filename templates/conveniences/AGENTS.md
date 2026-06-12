# Agent guide

This presentation was scaffolded with **slidash**: plain HTML/CSS/JS, no build
step, no runtime dependencies — `index.html` opens over `file://`.

Everything here is yours to edit, including the machinery (navigation, steps,
grid, presenter view, chrome). It's a working floor, not walls.

The look isn't documented here on purpose — it lives in `theme.css` (where you'll
be writing styles too) and in the slides themselves. Read what's there and build
on it; don't reinvent tokens that already exist. Reshaping the whole look is fair
game when that's what you're asked for — just do it in `theme.css`, not by
scattering one-off values.

## What lives where

- `index.html` — your slides. Where you spend your time.
- `theme.css` — the visual layer (color, type, spacing). Yours.
- `slidash.css` — machinery: chrome, transitions, step reveals, grid. Self-sufficient.
- `slidash.js` — machinery: navigation, steps, grid, presenter sync.
- `notes.html` — machinery: the presenter view window.
- `notes.js` — your speaker notes (see below).

## Conventions

The machinery relies on a few small markup agreements:

- A slide is `<section class="slide">…</section>`.
- `data-steps="N"` on a slide declares it has `N` reveal steps.
- `data-step="k"` on a child element reveals it once the viewer reaches step `k`
  (it gets the `.is-revealed` class; `k` counts from 1).
- `data-thumb-step="k"` picks which step the grid thumbnail shows (default: the
  last). Handy when a later step covers the slide — e.g. opens a popup — and an
  earlier state reads better as the thumbnail.

## Speaker notes

Presenter notes live in `notes.js`, one entry per slide. The one rule worth
stating: **faint-grey lines are private director cues — write them to be
scanned, never spoken.** It's what keeps you from reading a coaching note aloud
mid-talk. The rest of the shape is self-evident in the file.

It's a separate file, so it's yours to manage: if you ever need notes kept out of
a public deploy, gitignoring `notes.js` is safe — the presenter view simply
no-ops without it.
