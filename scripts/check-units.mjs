import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const roots = ['src', 'example']
const extensions = new Set(['.css', '.js', '.html'])
const violations = []

async function visit(directory) {
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await visit(path)
    else if (extensions.has(extname(entry.name))) await inspect(path)
  }
}

async function inspect(path) {
  const lines = (await readFile(path, 'utf8')).split('\n')

  lines.forEach((line, index) => {
    const values = [...line.matchAll(/(-?\d*\.?\d+)px\b/g)]
    for (const match of values) {
      const value = Number.parseFloat(match[1])
      const approvedHairline = value === 1 && /(border|linear-gradient)/.test(line)
      if (!approvedHairline) {
        violations.push(`${relative(root, path)}:${index + 1}: ${match[0]}`)
      }
    }
  })
}

await Promise.all(roots.map((directory) => visit(join(root, directory))))

if (violations.length > 0) {
  console.error('Disallowed pixel units found. Use Synced Flow tokens or rem:\n')
  console.error(violations.join('\n'))
  process.exitCode = 1
} else {
  console.log('pass only approved 1px hairlines use px; all other fixed dimensions use tokens or rem.')
}
