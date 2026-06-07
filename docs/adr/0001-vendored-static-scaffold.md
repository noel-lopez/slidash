# Vendored static scaffold, no runtime dependency

`slidash` scaffolds a presentation by copying real, standalone files into the target folder (the conveniences JS, a base CSS, starter `index.html`/`notes.html`, and an agent guide). The presentation opens via `file://` with zero build step, zero `node_modules` at runtime, and no dependency on slidash continuing to exist.

We chose this over having the presentation import slidash from an npm package / CDN at runtime. The vendored model fits the product premise ("no builder, no bloat", `file://`-openable) and the principle that the presentation is *yours*: it survives on its own and the AI can read and edit everything in front of it. The trade-off — updating the conveniences in an old presentation means re-copying files — is acceptable and arguably desirable: a finished presentation should not change underneath you.
