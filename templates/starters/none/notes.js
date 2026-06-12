// Speaker notes for the presenter view (key P), one entry per slide, in order.
// Each entry is { eyebrow?, title?, note }: title falls back to the slide's own
// heading when omitted, and note renders as HTML with newlines as line breaks.
// The convention these examples follow: director cues in grey (never read
// aloud), <strong> for the word that should land, <code> for names. Rewrite freely.
window.slidashNotes = [
  {
    eyebrow: 'Opening',
    title: 'Your presentation starts here',
    note: `<span style='color:#6b6f80'>▸ Your opening slide. These notes are an example, make them yours.</span>

• Welcome. Today we're talking about <strong>your topic</strong>.
• This deck is plain HTML, so I shaped it like code.

<span style='color:#6b6f80'>▸ Grey cues like this one stay between us — never read them aloud. Press → to continue.</span>`,
  },
  {
    eyebrow: 'Step reveals',
    title: 'Reveal things step by step',
    note: `<span style='color:#6b6f80'>▸ This slide reveals in two steps. Press → once per point so the room keeps pace with you.</span>

<strong>Step 1</strong>
• First the setup, one idea at a time.

<strong>Step 2</strong>
• Then the payoff, once the first has landed.

<span style='color:#6b6f80'>▸ Pace reveals with <code>data-step</code> on the elements in index.html.</span>`,
  },
]
