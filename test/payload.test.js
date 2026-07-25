import { describe, expect, it, vi } from 'vitest'
import { createMotionRegistry } from '../src/recipes/registry.js'
import { createRuntimeMotionRegistry } from '../src/recipes/runtime-registry.js'
import { createBuiltinMotionRegistry } from '../src/recipes/builtins.js'
import { builtinMotionSpecs, marquee, revealRise } from '../src/recipes/specs.js'
import { validateMotionRecipe } from '../src/recipes/schema.js'
import { createMotionRuntime } from '../src/recipe-runtime.js'

function stubDependencies() {
  const animation = () => ({
    eventCallback: vi.fn(() => animation()),
    from: vi.fn(() => animation()),
    fromTo: vi.fn(() => animation()),
    kill: vi.fn(),
    paused: vi.fn(),
    play: vi.fn(),
    reverse: vi.fn(),
    revert: vi.fn(),
    scrollTrigger: { kill: vi.fn() },
    to: vi.fn(() => animation()),
  })
  let mediaCleanup
  return {
    gsap: {
      from: vi.fn(animation),
      fromTo: vi.fn(animation),
      set: vi.fn(animation),
      timeline: vi.fn(animation),
      to: vi.fn(animation),
      registerPlugin: vi.fn(),
      matchMedia: () => ({
        add(_queries, callback) { mediaCleanup = callback({ conditions: { reduce: false, motion: true } }) },
        revert() { mediaCleanup?.() },
      }),
    },
    ScrollTrigger: { create: vi.fn(animation), refresh: vi.fn() },
  }
}

describe('runtime payload', () => {
  it('registers the same sixty recipe ids as the documentation catalog', () => {
    const runtimeIds = createRuntimeMotionRegistry().list().map((recipe) => recipe.id).sort()
    const catalogIds = createBuiltinMotionRegistry().list().map((recipe) => recipe.id).sort()

    expect(runtimeIds).toHaveLength(60)
    expect(runtimeIds).toEqual(catalogIds)
  })

  it('keeps authoring metadata out of every runtime spec', () => {
    const authoringFields = ['title', 'description', 'intent', 'family', 'tags', 'accessibility', 'noJs', 'preview', 'fixtures']

    for (const spec of builtinMotionSpecs) {
      for (const field of authoringFields) {
        expect(spec[field], `${spec.id}.${field}`).toBeUndefined()
      }
    }
  })

  it('keeps every field the runtime actually reads', () => {
    for (const spec of builtinMotionSpecs) {
      expect(spec.root.selector, spec.id).toBeTypeOf('string')
      expect(spec.slots.length, spec.id).toBeGreaterThan(0)
      expect(spec.performance.class, spec.id).toBeTypeOf('string')
      expect(Array.isArray(spec.dependencies), spec.id).toBe(true)
      expect(spec.setup ?? spec.timeline, spec.id).toBeDefined()
    }
  })

  it('rejects lean specs in complete mode and accepts them in runtime mode', () => {
    expect(validateMotionRecipe(revealRise).ok).toBe(false)
    expect(validateMotionRecipe(revealRise, { mode: 'runtime' }).ok).toBe(true)
  })

  it('rejects an unknown validation mode', () => {
    expect(() => validateMotionRecipe(revealRise, { mode: 'partial' })).toThrow(/Unknown motion recipe validation mode/)
  })

  it('mounts a registry built from individually imported specs', () => {
    document.body.innerHTML = '<p data-sf-reveal="up">Readable</p>'
    const registry = createMotionRegistry([revealRise, marquee], { mode: 'runtime' })
    const runtime = createMotionRuntime({ registry, dependencies: stubDependencies() })

    expect(registry.list()).toHaveLength(2)
    expect(runtime.inspect().mounted.map((entry) => entry.id)).toContain('reveal-rise')
    runtime.destroy()
  })
})

describe('optional plugin dependencies', () => {
  it('skips a recipe whose plugin was not supplied, with an actionable fix', () => {
    document.body.innerHTML = '<h2 data-sf-split="lines">A heading that needs SplitText</h2>'
    const registry = createRuntimeMotionRegistry(builtinMotionSpecs.filter((spec) => spec.id === 'split-lines-rise'))
    const runtime = createMotionRuntime({ registry, dependencies: stubDependencies() })

    const [skip] = runtime.inspect().skipped
    expect(skip.id).toBe('split-lines-rise')
    expect(skip.reason).toBe('missing-dependency')
    expect(skip.dependencies).toContain('SplitText')
    expect(skip.fix).toMatch(/@syncedco\/motion\/full/)
    expect(runtime.inspect().mounted).toHaveLength(0)
    runtime.destroy()
  })

  it('mounts the same recipe once the plugin is supplied', () => {
    document.body.innerHTML = '<h2 data-sf-split="lines">A heading that needs SplitText</h2>'
    class SplitText {
      constructor(element) { this.lines = [element]; this.words = [element]; this.chars = [element] }
      revert() {}
      static create(element, options) {
        const instance = new SplitText(element)
        options.onSplit?.(instance)
        return instance
      }
    }
    const registry = createRuntimeMotionRegistry(builtinMotionSpecs.filter((spec) => spec.id === 'split-lines-rise'))
    const runtime = createMotionRuntime({ registry, dependencies: { ...stubDependencies(), SplitText } })

    expect(runtime.inspect().skipped).toHaveLength(0)
    expect(runtime.inspect().mounted.map((entry) => entry.id)).toEqual(['split-lines-rise'])
    runtime.destroy()
  })

  it('does not report a missing plugin when the page has no markup for that recipe', () => {
    document.body.innerHTML = '<p>Nothing to animate.</p>'
    const registry = createRuntimeMotionRegistry(builtinMotionSpecs.filter((spec) => spec.id === 'split-lines-rise'))
    const runtime = createMotionRuntime({ registry, dependencies: stubDependencies() })

    expect(runtime.inspect().skipped).toHaveLength(0)
    runtime.destroy()
  })
})
