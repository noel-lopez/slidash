// snap.mjs — the agent's eyes. Captures a PNG of each state of the deck
// (slide + reveal step) by walking it with the real navigation, so the agent
// can see what it generated and correct itself.
//
// Not installed by scaffolding. Install on demand the first time you want eyes:
//   cd tools && npm install && npx playwright install chromium
//
// Usage:  node snap.mjs            capture the whole deck
//         node snap.mjs 2          only slide 2 (all its steps)
//         node snap.mjs 8 16       only slides 8 and 16
import { chromium } from 'playwright'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const deckPath = path.resolve(here, '..', 'index.html')
const outDir = path.resolve(here, 'snaps')

const only = new Set(process.argv.slice(2).map((n) => parseInt(n, 10)))

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1440, height: 810 }, // 16:9
  deviceScaleFactor: 1.3, // sharp without exceeding the ~2000px read limit
})

await page.goto('file://' + deckPath)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)

const steps = await page.$$eval('.slide', (els) =>
  els.map((e) => parseInt(e.dataset.steps, 10) || 0),
)
const total = steps.length
const lastStep = steps[total - 1]

// Reset the output dir only once we know the request can produce something:
// a typo'd or out-of-range slide number must not wipe earlier captures.
if (only.size && ![...only].some((n) => n >= 1 && n <= total)) {
  await browser.close()
  console.error(
    `No slides match ${[...only].join(', ')} — deck has ${total}. Nothing captured; existing snaps left untouched.`,
  )
  process.exit(1)
}

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })

const pad = (n) => String(n).padStart(2, '0')
const snaps = []

async function snap(slide, step) {
  if (only.size && !only.has(slide)) return
  await page.waitForTimeout(550) // let the 0.4s reveal/transition settle
  const file = `slide-${pad(slide)}-step-${step}.png`
  await page.screenshot({ path: path.join(outDir, file) })
  snaps.push(file)
}

let slide = 1
let step = 0
await snap(slide, step)

// Walk forward with → until the terminal state (last slide, last step),
// reading #counterCurrent to tell a step advance from a slide jump.
let guard = 0
while (!(slide === total && step === lastStep) && guard++ < 300) {
  await page.keyboard.press('ArrowRight')
  const cur = parseInt(await page.textContent('#counterCurrent'), 10)
  if (cur === slide) step += 1
  else {
    slide = cur
    step = 0
  }
  await snap(slide, step)
}

await browser.close()
console.log(`✓ ${snaps.length} snaps in ${outDir}`)
if (snaps.length) console.log(snaps.join('\n'))
