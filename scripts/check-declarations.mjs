// Verifies two things about the published types:
//
// 1. resolution -- a consumer on NodeNext can import the root and every
//    subpath, and the documented calls type-check; and
// 2. coverage -- every value the built JavaScript actually exports has a
//    declaration. The .d.ts files are hand-written, so without this a new
//    export silently ships untyped.
//
// Coverage is checked by generating a TypeScript file that references each
// real runtime export by name and letting tsc decide, rather than by parsing
// declarations ourselves.
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

const projectRoot = resolve(import.meta.dirname, '..')
const consumerRoot = mkdtempSync(resolve(tmpdir(), 'synced-motion-types-'))

/** Subpaths whose runtime exports must all be declared. */
const ENTRIES = [
  { specifier: '@syncedco/motion', dist: 'dist/index.js' },
  { specifier: '@syncedco/motion/full', dist: 'dist/full.js' },
  { specifier: '@syncedco/motion/plugins', dist: 'dist/plugins.js' },
  { specifier: '@syncedco/motion/recipes', dist: 'dist/recipes.js' },
  { specifier: '@syncedco/motion/lenis', dist: 'dist/lenis.js' },
  { specifier: '@syncedco/motion/mcp', dist: 'dist/mcp.js' },
  { specifier: '@syncedco/motion/svelte', dist: 'dist/svelte.js' },
  { specifier: '@syncedco/motion/astro', dist: 'dist/astro.js' },
  { specifier: '@syncedco/motion/wordpress', dist: 'dist/wordpress.js' },
]

const identifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/

try {
  const packageLink = resolve(consumerRoot, 'node_modules/@syncedco/motion')
  mkdirSync(dirname(packageLink), { recursive: true })
  symlinkSync(projectRoot, packageLink, 'dir')
  writeFileSync(resolve(consumerRoot, 'package.json'), '{"private":true,"type":"module"}\n')

  // --- 1. documented usage still type-checks -------------------------------
  writeFileSync(resolve(consumerRoot, 'consumer.ts'), `
import { createSyncedMotion, createMotionRuntime, createMotionRegistry, type MotionRecipe, type MotionRuntimeRecipe } from '@syncedco/motion'
import { createSyncedMotion as createFullSyncedMotion } from '@syncedco/motion/full'
import { motionPlugins } from '@syncedco/motion/plugins'
import { revealRise, builtinMotionSpecs } from '@syncedco/motion/recipes'
import { createLenisAdapter } from '@syncedco/motion/lenis'
import { createMotionMcpServer, createMotionToolHandlers, startMotionMcpServer } from '@syncedco/motion/mcp'
import { useSyncedMotion as useReactMotion } from '@syncedco/motion/react'
import { useSyncedMotion as useVueMotion } from '@syncedco/motion/vue'
import { syncedMotion } from '@syncedco/motion/svelte'
import { createAstroMotion } from '@syncedco/motion/astro'
import { createWordPressMotion } from '@syncedco/motion/wordpress'

declare const element: Element
declare const recipe: MotionRecipe
declare const spec: MotionRuntimeRecipe
createSyncedMotion({ root: element })
createFullSyncedMotion({ root: element })
createMotionRuntime({ root: element, recipes: [recipe] })
createMotionRuntime({ registry: createMotionRegistry([spec, revealRise], { mode: 'runtime' }) })
createSyncedMotion({ dependencies: motionPlugins })
builtinMotionSpecs.forEach((entry) => entry.id)
createLenisAdapter({ gsap: {} as never, ScrollTrigger: {} as never })
createMotionMcpServer()
createMotionToolHandlers()
startMotionMcpServer()
useReactMotion({ current: element })
useVueMotion({ value: element })
syncedMotion(element)
createAstroMotion({ root: element })
createWordPressMotion({ root: element })
`)

  // --- 2. every runtime export is declared ---------------------------------
  const coverage = []
  for (const [index, entry] of ENTRIES.entries()) {
    const module = await import(pathToFileURL(resolve(projectRoot, entry.dist)).href)
    const names = Object.keys(module).filter((name) => name !== 'default' && identifier.test(name))
    if (!names.length) continue
    // Alias per entry: the same name is legitimately exported by several
    // subpaths, and unaliased imports would collide instead of reporting a
    // genuinely missing declaration.
    const local = (name) => `e${index}_${name}`
    coverage.push(`// ${entry.specifier}`)
    coverage.push(`import { ${names.map((name) => `${name} as ${local(name)}`).join(', ')} } from '${entry.specifier}'`)
    coverage.push(names.map((name) => `void (${local(name)})`).join('\n'))
  }
  writeFileSync(resolve(consumerRoot, 'coverage.ts'), `${coverage.join('\n')}\n`)

  writeFileSync(resolve(consumerRoot, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      lib: ['DOM', 'ES2022'],
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      noEmit: true,
      skipLibCheck: false,
      strict: true,
      target: 'ES2022',
    },
    include: ['consumer.ts', 'coverage.ts'],
  }, null, 2))

  const tsc = resolve(projectRoot, 'node_modules/typescript/bin/tsc')
  const result = spawnSync(process.execPath, [tsc, '--project', resolve(consumerRoot, 'tsconfig.json')], {
    cwd: consumerRoot,
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    process.stderr.write(result.stdout)
    process.stderr.write(result.stderr)
    process.stderr.write('\nAn export is missing a declaration, or a declaration no longer matches the code.\n')
    process.exitCode = result.status ?? 1
  } else {
    const total = coverage.filter((line) => line.startsWith('import')).length
    process.stdout.write(`pass consumer TypeScript resolved every subpath; all runtime exports across ${total} entry points are declared.\n`)
  }
} finally {
  rmSync(consumerRoot, { recursive: true, force: true })
}
