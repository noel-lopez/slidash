/**
 * The placeholder banner printed by the CLI until the real `init` scaffolding
 * lands in the next slice. Kept as a pure function so it can be tested without
 * running the entry point.
 */
export function banner(version: string): string {
  return `
  Slidash v${version} — Prompt it. Dash it. Present it.
  Craft beautiful HTML/CSS slides with AI. No builder, no bloat.

  🚧 Early days. The CLI is still cooking.
  Follow along: https://github.com/noel-lopez/slidash
`
}
