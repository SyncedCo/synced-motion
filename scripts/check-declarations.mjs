import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const projectRoot = resolve(import.meta.dirname, '..')
const consumerRoot = mkdtempSync(resolve(tmpdir(), 'synced-motion-types-'))
const packageLink = resolve(consumerRoot, 'node_modules/@syncedco/motion')

try {
  mkdirSync(dirname(packageLink), { recursive: true })
  symlinkSync(projectRoot, packageLink, 'dir')
  writeFileSync(resolve(consumerRoot, 'package.json'), '{"private":true,"type":"module"}\n')
  writeFileSync(resolve(consumerRoot, 'consumer.ts'), `
import { createSyncedMotion, createMotionRuntime, type MotionRecipe } from '@syncedco/motion'
import { createLenisAdapter } from '@syncedco/motion/lenis'
import { createMotionMcpServer, createMotionToolHandlers, startMotionMcpServer } from '@syncedco/motion/mcp'
import { useSyncedMotion as useReactMotion } from '@syncedco/motion/react'
import { useSyncedMotion as useVueMotion } from '@syncedco/motion/vue'
import { syncedMotion } from '@syncedco/motion/svelte'
import { createAstroMotion } from '@syncedco/motion/astro'
import { createWordPressMotion } from '@syncedco/motion/wordpress'

declare const element: Element
declare const recipe: MotionRecipe
createSyncedMotion({ root: element })
createMotionRuntime({ root: element, recipes: [recipe] })
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
    include: ['consumer.ts'],
  }, null, 2))

  const tsc = resolve(projectRoot, 'node_modules/typescript/bin/tsc')
  const result = spawnSync(process.execPath, [tsc, '--project', resolve(consumerRoot, 'tsconfig.json')], {
    cwd: consumerRoot,
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    process.stderr.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exitCode = result.status ?? 1
  } else {
    process.stdout.write('pass consumer TypeScript resolved root and all published JavaScript subpaths.\n')
  }
} finally {
  rmSync(consumerRoot, { recursive: true, force: true })
}
