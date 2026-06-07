# slidash

> **Prompt it. Dash it. Present it.**

Build beautiful HTML/CSS slides with AI. No builder, no bloat.

Generating HTML and CSS has never been cheaper. Slidash hands you the skeleton, AI fills it with a presentation as unique as your idea. Today your agent writes that markup blind, reinventing the same navigation plumbing every time — slidash hands over the working machinery so the agent can focus on content and design.

## What you get

### For the presenter

- **Keyboard navigation** (← →) and clickable bottom chrome: arrows, progress dots, and a counter showing which slide you're on out of the total.
- **Step-by-step reveals.** Pressing → reveals a slide's elements one at a time before moving on to the next slide, so you pace what the audience sees.
- **A grid overview** that thumbnails every slide to jump around quickly.
- **A presenter view** (press `P`) with speaker notes, a timer and the next slide's title, synced with the live presentation.

### For the agent

- **Eyes.** A vendored `shot` tool captures a PNG of any slide at any step, so the agent can run a generate → look → correct loop instead of writing blind.
- **Minimal conventions.** A slide is `.slide`; reveals are `data-steps` / `data-step`. That's the whole vocabulary — the navigation plumbing is already done.
- **A short agent guide.** It explains the conventions and the tools, and nothing more, so it never bloats the agent's context.

### And it's all yours

Everything slidash drops in is standalone and vendored. The presentation opens straight from `file://` — zero build, zero runtime dependencies — and every file is editable. The conveniences are the floor you start from, not walls. Your presentation survives on its own, with or without slidash.

## Status

🚧 In active development. The scaffold, domain docs and ADRs are in place; the MVP CLI is in progress.

The MVP will:

- Scaffold a working presentation into your folder with a single command.
- Let you pick a starter — **Indigo Ink** (an editorial-minimal aesthetic) or start from scratch on a blank-but-working canvas.
- Run with zero build and zero runtime dependencies, openable from `file://`.
- Ship the agent's eyes (`shot`) and a minimal agent guide.

Full scope and decisions live in the [MVP PRD (#1)](https://github.com/noel-lopez/slidash/issues/1).

## License

MIT
