#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { input, select } from '@inquirer/prompts'
import { Command } from 'commander'
import { scaffold } from './scaffolder.js'
import { listStarters, type StarterId } from './starter-registry.js'
import {
  clearDirectoryExceptGit,
  resolveTargetDirectory,
  type TargetDirectory,
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

type NonEmptyAction = 'cancel' | 'remove' | 'ignore'

async function promptForNonEmptyAction(
  targetDir: string,
): Promise<NonEmptyAction> {
  return select<NonEmptyAction>({
    message: `Target directory "${targetDir}" is not empty. Please choose how to proceed:`,
    choices: [
      { name: 'Cancel operation', value: 'cancel' },
      { name: 'Remove existing files and continue', value: 'remove' },
      { name: 'Ignore files and continue', value: 'ignore' },
    ],
  })
}

async function resolveNonEmptyTarget(
  target: TargetDirectory,
): Promise<TargetDirectory | null> {
  if (!process.stdin.isTTY) {
    throw new Error(
      `Target directory is not empty: ${target.targetDir}. Refusing to overwrite existing files. Run slidash in an interactive terminal to choose how to proceed.`,
    )
  }

  const action = await promptForNonEmptyAction(target.targetDir)
  if (action === 'cancel') return null
  if (action === 'remove') await clearDirectoryExceptGit(target.targetDir)
  return target
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
    if (result.status === 'invalid') throw new Error(result.error)

    let target = result.target
    if (result.status === 'not-empty') {
      const resolved = await resolveNonEmptyTarget(target)
      if (!resolved) {
        console.log('Operation cancelled.')
        return
      }
      target = resolved
    }

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
