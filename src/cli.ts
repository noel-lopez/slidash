#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { input, select } from '@inquirer/prompts'
import { Command } from 'commander'
import { scaffold } from './scaffolder.js'
import { listStarters, type StarterId } from './starter-registry.js'
import {
  resolveTargetDirectory,
  validateTargetDirectoryInput,
} from './target-directory.js'

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }

async function promptForDirectory(): Promise<string> {
  return input({
    message: 'Where should we create your slides?',
    default: './slides',
    validate: validateTargetDirectoryInput,
  })
}

async function promptForStarter(): Promise<StarterId> {
  return select<StarterId>({
    message: 'Pick a starter to build on',
    choices: listStarters().map((s) => ({
      name: s.label,
      value: s.id,
      description: s.description,
    })),
  })
}

const program = new Command()

program
  .name('slidash')
  .description('Craft beautiful HTML/CSS slides with AI. No builder, no bloat.')
  .version(pkg.version)
  .argument(
    '[directory]',
    'directory to scaffold the presentation into (relative or absolute; prompted if omitted)',
  )
  .action(async (directory: string | undefined) => {
    const result = await resolveTargetDirectory(
      directory ?? (await promptForDirectory()),
    )
    if (!result.ok) throw new Error(result.error)

    const { target } = result
    const starter = await promptForStarter()
    await scaffold({ target, starter })
    console.log(`Scaffolded a presentation in ${target.requested}`)
    console.log(
      `Open ${target.requested}/index.html in your browser to see it.`,
    )
  })

program.parseAsync().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
