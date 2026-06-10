#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Command } from 'commander'
import { scaffold } from './scaffolder.js'

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }

const program = new Command()

program
  .name('slidash')
  .description('Craft beautiful HTML/CSS slides with AI. No builder, no bloat.')
  .version(pkg.version)
  .argument('<folder>', 'folder to scaffold the presentation into')
  .action(async (folder: string) => {
    const targetDir = resolve(process.cwd(), folder)
    await scaffold({ targetDir, starter: 'none' })
    console.log(`Scaffolded a presentation in ${folder}`)
    console.log(`Open ${folder}/index.html in your browser to see it.`)
  })

program.parseAsync().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
