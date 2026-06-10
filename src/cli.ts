#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { input } from '@inquirer/prompts'
import { Command } from 'commander'
import { validateFolderInput } from './folder-input.js'
import { scaffold } from './scaffolder.js'

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }

async function promptForFolder(): Promise<string> {
  return input({
    message: 'Where should we create your slides?',
    default: './slides',
    validate: validateFolderInput,
  })
}

const program = new Command()

program
  .name('slidash')
  .description('Craft beautiful HTML/CSS slides with AI. No builder, no bloat.')
  .version(pkg.version)
  .argument(
    '[folder]',
    'folder to scaffold the presentation into (relative or absolute; prompted if omitted)',
  )
  .action(async (folder: string | undefined) => {
    const requested = (folder ?? (await promptForFolder())).trim()
    const targetDir = resolve(process.cwd(), requested)
    await scaffold({ targetDir, starter: 'none' })
    console.log(`Scaffolded a presentation in ${requested}`)
    console.log(`Open ${requested}/index.html in your browser to see it.`)
  })

program.parseAsync().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
