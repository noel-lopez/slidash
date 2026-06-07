# slidash

A CLI that scaffolds the minimum skeleton to build an HTML/CSS/JS presentation agentically with an AI agent, handing you working baseline conveniences so the AI can focus on content and design.

## Language

**Presentation (presentación)**:
The whole thing — the set of slides plus the conveniences that drive them.
_Avoid_: deck, slideshow.

**Slide (slide / diapositiva)**:
A single full-viewport section of a presentation.

**Step (paso)**:
A reveal stage within a slide; advancing (→) walks through a slide's steps before moving to the next slide.

**Conveniences (comodidades)**:
The working baseline slidash drops into your folder — navigation, step reveals, grid, presenter view, chrome — editable, never enforced.
_Avoid_: runtime, framework, contract, engine.

**Conventions (convenciones)**:
The small markup agreements (how you mark a slide and its steps) the conveniences rely on.
_Avoid_: contract, spec, schema.

**Starter (base / punto de partida)**:
The visual layer slidash drops in — colours, type, spacing, cover, example slides — that you and the AI then change freely. Orthogonal to the conveniences.
_Avoid_: template, theme, preset, skin.

**Indigo Ink**:
The first starter: white background, near-black ink, a single indigo accent, generous whitespace, editorial-minimal type.

**Chrome (chrome / navegación inferior)**:
The bottom navigation furniture: clickable arrows, progress dots, and the slide counter N/total.
_Avoid_: toolbar, controls bar.

**Presenter view (vista de narrador)**:
A second window with speaker notes, a timer, the next slide's title and the slide number, synced with the live presentation.
_Avoid_: notes window, speaker mode.

**Grid (cuadrícula / vista general)**:
The overview that thumbnails every slide to jump around.
_Avoid_: overview mode, gallery.

**Agent guide (guía del agente)**:
The file that tells the AI how to work in the scaffold — the conventions, the tools, and the "this is yours, rebuild freely" philosophy.
_Avoid_: instructions file, prompt, README (for this purpose).

**Shot (captura)**:
A PNG of one slide at one step, produced by the vendored capture tool so the AI agent can see what it generated and correct itself.
_Avoid_: screenshot (in prose; the file/command can still say `shot`/`shoot`).
