// Speaker notes for the presenter view (key P), one entry per slide, in order.
// Each entry is { eyebrow?, title?, note }: title falls back to the slide's own
// heading when omitted, and note renders as HTML with newlines as line breaks.
// The convention these examples follow: director cues in grey (never read
// aloud), <strong> for the word that should land, <code> for names. Rewrite freely.
window.slidashNotes = [
  {
    eyebrow: 'Cover',
    title: 'Prompt it. Dash it. Present it.',
    note: `<span style='color:#6b6f80'>▸ Your opening slide. These notes are an example — make them yours.</span>

• Welcome the room. Land the <strong>one promise</strong>: beautiful slides, built by talking to your agent.
• Indigo Ink is just a starting point — the whole look is yours to keep or change.

<span style='color:#6b6f80'>▸ Grey cues like this one stay between us — never read them aloud. Press → to continue.</span>`,
  },
  {
    eyebrow: 'A quick tour',
    title: 'What it is, and how you drive it',
    note: `<span style='color:#6b6f80'>▸ Four cards, revealed one per →. Touch each, don't read it verbatim; keep the room with you.</span>

<strong>Step 1 · Yours forever</strong> — plain files, no lock-in.
<strong>Step 2 · Edit anything</strong> — every pixel is yours.
<strong>Step 3 · Navigate</strong> — <code>← →</code> for slides and steps, <code>G</code> for the grid.
<strong>Step 4 · Presenter view</strong> — <code>P</code> for notes, timer and what's next.

<span style='color:#6b6f80'>▸ This is the dense slide on purpose — the next one breathes.</span>`,
  },
  {
    eyebrow: 'The idea',
    title: 'Describe it. Your agent builds it.',
    note: `<span style='color:#6b6f80'>▸ The quiet slide. Let it sit for a beat before you speak.</span>

• The core idea: you <strong>describe</strong> it, the agent builds and refines it.
• You stay in charge of the content and the story — the craft is handled.`,
  },
  {
    eyebrow: 'Your turn',
    title: 'A blank canvas that already works',
    note: `<span style='color:#6b6f80'>▸ Closing slide. They're already looking at a working deck — nothing to set up. End on the invitation, then stop talking.</span>

• Hand it over: tell your agent what you're presenting and <strong>watch it take shape</strong>.`,
  },
]
