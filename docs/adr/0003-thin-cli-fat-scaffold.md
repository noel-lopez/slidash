# Thin CLI, fat scaffold

The `slidash` CLI does one thing — `init` (scaffold a presentation) — and then gets out of the way. Capabilities used _during_ development (notably the `snap` tool that gives the AI agent eyes) are vendored into the generated folder as standalone tooling and documented in the agent guide, rather than exposed as CLI subcommands.

We rejected a persistent companion CLI (`slidash snap`, `slidash serve`, …). It follows directly from the vendored-static principle (ADR-0001): if everything lives in your folder and is yours, the agent's tools should too — the agent reads the guide and runs `node tools/snap.mjs 8` itself, with no dependency on the CLI being present. The default answer to "should this be a CLI command?" is therefore "no — vendor it into the scaffold and document it in the agent guide."

(Future exception under consideration: `init` itself growing an interactive prompt for which agent(s) you use, to emit agent-specific guides and skills. That is still part of `init`, not a new command.)
