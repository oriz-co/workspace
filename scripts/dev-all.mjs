#!/usr/bin/env node
// dev-all.mjs — start every oriz app in parallel as `pnpm dev` and open each in browser.
// Usage: node scripts/dev-all.mjs [--kind=apps|content|tools|hub] [--no-open]
//
// Why a script instead of a pnpm workspace `--parallel dev` invocation? We want
// (a) an explicit port per app so URLs are stable across restarts and (b) to
// open each in a browser tab automatically. pnpm parallel can do (a) only with
// per-app PORT env vars and can't do (b) at all.

import { spawn, exec } from 'node:child_process'
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(process.cwd())
const APPS_ROOT = join(ROOT, 'repos/oriz/own/prod/apps')
const NO_OPEN = process.argv.includes('--no-open')
const KIND = (process.argv.find((a) => a.startsWith('--kind=')) || '').split('=')[1]

// Stable port assignment — first app gets 4321, then +1, etc. Sorted so the
// mapping doesn't shuffle when a new app is added.
const apps = []
for (const cat of readdirSync(APPS_ROOT).sort()) {
  if (KIND && cat !== KIND) continue
  const catDir = join(APPS_ROOT, cat)
  if (!statSync(catDir).isDirectory()) continue
  for (const slug of readdirSync(catDir).sort()) {
    const appDir = join(catDir, slug)
    const pkg = join(appDir, 'package.json')
    if (!existsSync(pkg)) continue
    apps.push({ cat, slug, dir: appDir })
  }
}

console.log(`Found ${apps.length} apps under ${APPS_ROOT}`)
const BASE = 4321
const open = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open'

apps.forEach((a, i) => {
  const port = BASE + i
  const url = `http://localhost:${port}/`
  console.log(`[${String(i).padStart(2, ' ')}] :${port}  ${a.cat}/${a.slug}`)

  const proc = spawn('pnpm', ['exec', 'astro', 'dev', '--port', String(port), '--host', '127.0.0.1'], {
    cwd: a.dir,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port), FORCE_COLOR: '1' },
  })

  // Tag each line with the app slug so combined logs are readable.
  const tag = `[${a.slug}]`
  const print = (s) => process.stdout.write(s.toString().split('\n').filter(Boolean).map((l) => `${tag} ${l}\n`).join(''))
  proc.stdout.on('data', print)
  proc.stderr.on('data', print)
  proc.on('exit', (code) => console.log(`${tag} exited ${code}`))

  if (!NO_OPEN) {
    // Open after a small stagger so the dev server has time to come up.
    setTimeout(() => {
      exec(`${open} ${url}`, () => {})
    }, 2000 + i * 200)
  }
})

console.log(`\nLogs interleaved below. Ctrl+C kills all.`)

// Forward Ctrl+C to children.
process.on('SIGINT', () => {
  console.log('\nSIGINT — stopping all dev servers')
  process.exit(0)
})
