import { describe, expect, it } from 'vitest'
import { runMotionCli } from '../src/cli.js'
import { packageVersion } from '../src/version.js'

function collect() {
  const out = []
  const err = []
  return { io: { log: (value) => out.push(String(value)), error: (value) => err.push(String(value)) }, out, err }
}

describe('synced-motion --version', () => {
  it('prints the package version for every spelling', async () => {
    for (const flag of ['--version', '-v', 'version']) {
      const { io, out } = collect()
      const result = await runMotionCli([flag], io)
      expect(result.code, flag).toBe(0)
      expect(out.join('\n'), flag).toBe(packageVersion)
    }
  })

  it('reports the real published version, not a hard-coded one', () => {
    expect(packageVersion).toMatch(/^\d+\.\d+\.\d+/)
  })
})

describe('synced-motion help', () => {
  it('lists every command at the root', async () => {
    const { io, out } = collect()
    await runMotionCli(['--help'], io)
    const text = out.join('\n')

    for (const command of ['add', 'catalog', 'recipe', 'suggest', 'plan', 'scan', 'compose', 'validate', 'doctor', 'mcp']) {
      expect(text, command).toContain(command)
    }
  })

  it('shows detailed help for a single command', async () => {
    const { io, out } = collect()
    await runMotionCli(['add', '--help'], io)

    expect(out.join('\n')).toContain('synced-motion add <id...>')
  })
})

describe('synced-motion add', () => {
  it('emits markup using the data-motion prefix', async () => {
    const { io, out } = collect()
    const result = await runMotionCli(['add', 'reveal-rise'], io)

    expect(result.code).toBe(0)
    expect(out.join('\n')).toContain('<section data-motion-reveal>')
    // There is no legacy vocabulary; nothing should emit the old prefix.
    expect(out.join('\n')).not.toContain('data-sf-')
  })

  it('includes every required slot', async () => {
    const { io, out } = collect()
    await runMotionCli(['add', 'pinned-steps'], io)
    const markup = out.join('\n')

    expect(markup).toContain('data-motion-pin-target')
    expect(markup).toContain('data-motion-step-link')
    expect(markup).toContain('data-motion-step-panel')
  })

  it('preserves attribute values in the root selector', async () => {
    const { io, out } = collect()
    await runMotionCli(['add', 'split-lines-rise'], io)

    expect(out.join('\n')).toContain('data-motion-split="lines"')
  })

  it('warns when a recipe needs an optional GSAP plugin', async () => {
    const { io, err } = collect()
    await runMotionCli(['add', 'split-lines-rise'], io)

    expect(err.join('\n')).toContain('SplitText')
    expect(err.join('\n')).toContain('@syncedco/motion/full')
  })

  it('supports several recipes at once', async () => {
    const { io, out } = collect()
    await runMotionCli(['add', 'reveal-rise', 'marquee'], io)

    expect(out.join('\n')).toContain('data-motion-reveal')
    expect(out.join('\n')).toContain('data-motion-marquee')
  })

  it('returns machine-readable output for agents', async () => {
    const { io, out } = collect()
    await runMotionCli(['add', 'reveal-rise', '--json'], io)
    const parsed = JSON.parse(out.join('\n'))

    expect(parsed.schemaVersion).toBe('1')
    expect(parsed.recipes[0].id).toBe('reveal-rise')
    expect(parsed.recipes[0].markup).toContain('data-motion-reveal')
  })

  it('fails with an actionable message for an unknown id', async () => {
    const { io, err } = collect()
    const result = await runMotionCli(['add', 'not-a-recipe'], io)

    expect(result.code).toBe(1)
    expect(err.join('\n')).toContain('synced-motion catalog')
  })

  it('fails when no id is supplied', async () => {
    const { io, err } = collect()
    const result = await runMotionCli(['add'], io)

    expect(result.code).toBe(1)
    expect(err.join('\n')).toContain('Pass one or more recipe ids')
  })
})
