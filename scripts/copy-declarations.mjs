import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const declarations = {
  'src/index.d.ts': 'dist/index.d.ts',
  'src/lenis.d.ts': 'dist/lenis.d.ts',
  'src/mcp.d.ts': 'dist/mcp.d.ts',
  'src/adapters/react.d.ts': 'dist/react.d.ts',
  'src/adapters/vue.d.ts': 'dist/vue.d.ts',
  'src/adapters/svelte.d.ts': 'dist/svelte.d.ts',
  'src/adapters/astro.d.ts': 'dist/astro.d.ts',
  'src/adapters/wordpress.d.ts': 'dist/wordpress.d.ts',
}

for (const [source, destination] of Object.entries(declarations)) {
  copyFileSync(resolve(source), resolve(destination))
  if (source.startsWith('src/adapters/')) {
    const output = resolve(destination)
    writeFileSync(output, readFileSync(output, 'utf8').replaceAll("'../index.js'", "'./index.js'"))
  }
}
