// Measures what a consumer actually ships for representative entry points and
// fails when a budget regresses.
//
// The package is linked into a throwaway node_modules so bundlers apply the
// published `exports` map and `sideEffects` field exactly as they would for a
// real install. Measuring ./src instead would understate tree-shaking, because
// esbuild only honours `sideEffects` for packages inside node_modules.
//
// GSAP is a peer dependency and stays external; the trailing column lists the
// GSAP plugin modules each scenario forces into the consumer's bundle, which is
// where most of the real weight lives.
import { build } from 'esbuild'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const projectRoot = resolve(import.meta.dirname, '..')

const SCENARIOS = [
  {
    id: 'core-all-recipes',
    description: 'createSyncedMotion() with all sixty recipes',
    source: "import { createSyncedMotion } from '@syncedco/motion'\ncreateSyncedMotion()\n",
    budget: 17_500,
  },
  {
    id: 'full-all-recipes',
    description: 'the batteries-included entry point',
    source: "import { createSyncedMotion } from '@syncedco/motion/full'\ncreateSyncedMotion()\n",
    budget: 17_500,
  },
  {
    id: 'three-recipes',
    description: 'three individually imported recipes',
    source: [
      "import { createMotionRuntime, createMotionRegistry } from '@syncedco/motion'",
      "import { revealRise, revealStaggerCascade, marquee } from '@syncedco/motion/recipes'",
      "createMotionRuntime({ registry: createMotionRegistry([revealRise, revealStaggerCascade, marquee], { mode: 'runtime' }) })",
      '',
    ].join('\n'),
    budget: 6_500,
  },
]

const EXTERNAL = ['gsap', 'gsap/*', 'lenis', 'react', 'vue', '@gsap/react']

const consumerRoot = mkdtempSync(resolve(tmpdir(), 'synced-motion-size-'))
let failed = false

try {
  const packageLink = resolve(consumerRoot, 'node_modules/@syncedco/motion')
  mkdirSync(dirname(packageLink), { recursive: true })
  symlinkSync(projectRoot, packageLink, 'dir')
  writeFileSync(resolve(consumerRoot, 'package.json'), '{"private":true,"type":"module"}\n')

  const rows = []
  for (const scenario of SCENARIOS) {
    const result = await build({
      stdin: { contents: scenario.source, resolveDir: consumerRoot, loader: 'js' },
      absWorkingDir: consumerRoot,
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2022',
      minify: true,
      metafile: true,
      external: EXTERNAL,
    })

    const bytes = gzipSync(result.outputFiles[0].contents).length
    const plugins = [...new Set(Object.values(result.metafile.outputs)
      .flatMap((output) => output.imports ?? [])
      .filter((entry) => entry.external && entry.path.startsWith('gsap/'))
      .map((entry) => entry.path.replace('gsap/', '')))].sort()
    const ok = bytes <= scenario.budget
    if (!ok) failed = true
    rows.push({ ok, bytes, plugins, ...scenario })
  }

  const pad = (value, width) => String(value).padStart(width)
  for (const row of rows) {
    process.stdout.write(
      `${row.ok ? 'pass' : 'FAIL'} ${row.id.padEnd(18)} ${pad(row.bytes, 6)} B gzip `
      + `(budget ${pad(row.budget, 6)})  ${row.plugins.join(', ') || 'gsap core only'}\n`,
    )
  }
} finally {
  rmSync(consumerRoot, { recursive: true, force: true })
}

if (failed) {
  process.stderr.write('\nA bundle budget regressed. Reduce the payload or raise the budget deliberately.\n')
  process.exitCode = 1
}
