import { describe, expect, it, vi } from 'vitest'
import {
  MotionRecipeValidationError,
  createSyncedMotion,
  createMotionRegistry,
  createMotionRuntime,
  createMotionService,
  createBuiltinMotionRegistry,
  compileMotionRecipe,
  defineMotionRecipe,
  validateMotionRecipe,
} from '../src/index.js'

function recipe(overrides = {}) {
  return {
    schemaVersion: '1',
    id: 'test-reveal',
    version: '1.0.0',
    title: 'Test reveal',
    description: 'Reveals a fixture.',
    intent: 'Reveal content as it enters the viewport.',
    family: 'reveals',
    tags: ['reveal', 'entrance'],
    root: { selector: '[data-motion-test]' },
    slots: [
      { name: 'root' },
      { name: 'item', selector: '[data-motion-item]', multiple: true },
    ],
    parameters: {
      duration: { type: 'number', default: 0.6, min: 0, max: 2 },
    },
    triggers: [{ type: 'viewport', start: 'top 85%' }],
    reducedMotion: { strategy: 'final' },
    noJs: { behavior: 'Content remains visible in its authored final state.' },
    accessibility: { notes: 'Motion does not change reading or focus order.' },
    performance: { class: 'low' },
    dependencies: ['gsap', 'ScrollTrigger'],
    preview: { fixture: 'default', viewport: 'standard', activation: 'auto' },
    fixtures: [{ id: 'default', label: 'Default', markup: '<section data-motion-test><div data-motion-item></div></section>', parameters: {} }],
    setup: vi.fn(() => vi.fn()),
    ...overrides,
  }
}

function runtimeDependencies(reduced = false) {
  let mediaCleanup
  const media = {
    add: vi.fn((_conditions, callback) => {
      mediaCleanup = callback({ conditions: { reduce: reduced, motion: !reduced } })
    }),
    revert: vi.fn(() => mediaCleanup?.()),
  }
  return {
    media,
    gsap: { matchMedia: vi.fn(() => media) },
    ScrollTrigger: { refresh: vi.fn() },
    SplitText: {},
  }
}

describe('motion recipe schema', () => {
  it('defines and freezes a valid recipe', () => {
    const defined = defineMotionRecipe(recipe())
    expect(defined.id).toBe('test-reveal')
    expect(Object.isFrozen(defined)).toBe(true)
    expect(Object.isFrozen(defined.slots)).toBe(true)
  })

  it('rejects unsafe roots and incomplete lifecycle metadata', () => {
    const invalid = recipe({ root: { selector: 'body' }, reducedMotion: undefined })
    expect(() => defineMotionRecipe(invalid)).toThrow(MotionRecipeValidationError)
    const result = validateMotionRecipe(invalid)
    expect(result.ok).toBe(false)
    expect(result.issues).toContain('root.selector may not target html, body, or :root')
    expect(result.issues).toContain('reducedMotion.strategy must be skip, final, or custom')
  })

  it('requires bounds for numeric parameters', () => {
    const invalid = recipe({ parameters: { distance: { type: 'number', default: 10 } } })
    expect(validateMotionRecipe(invalid).issues).toContain('number parameter "distance" requires finite min and max values')
  })

  it('deeply freezes safety-critical manifest data', () => {
    const defined = defineMotionRecipe(recipe())
    expect(Object.isFrozen(defined.root)).toBe(true)
    expect(Object.isFrozen(defined.parameters.duration)).toBe(true)
    expect(() => { defined.root.selector = 'body' }).toThrow()
  })

  it('requires an explicit reduced timeline for declarative custom fallback', () => {
    const invalid = recipe({
      setup: undefined,
      timeline: { steps: [{ action: 'to', target: 'item', vars: { autoAlpha: 1 } }] },
      reducedMotion: { strategy: 'custom' },
    })
    expect(validateMotionRecipe(invalid).issues).toContain('declarative custom reduced motion requires reducedMotion.timeline')
  })

  it('applies layout safeguards to explicit reduced-motion timelines', () => {
    const invalid = defineMotionRecipe(recipe({
      setup: undefined,
      timeline: { steps: [{ action: 'to', target: 'item', vars: { autoAlpha: 1 } }] },
      reducedMotion: {
        strategy: 'custom',
        timeline: { steps: [{ action: 'to', target: 'item', vars: { height: 'auto' } }] },
      },
    }))
    expect(() => compileMotionRecipe(invalid)).toThrow('reducedMotion.timeline step 0 animates layout property "height"')
  })
})

describe('motion registry and shared service', () => {
  it('publishes a serializable catalog without executable setup code', () => {
    const registry = createMotionRegistry([recipe()])
    const catalog = registry.catalog()
    expect(catalog.count).toBe(1)
    expect(catalog.recipes[0]).not.toHaveProperty('setup')
    expect(catalog.recipes[0].implementation).toBe('custom')
  })

  it('uses one service seam for catalog, suggestions, validation, and plans', () => {
    const registry = createMotionRegistry([recipe()])
    const service = createMotionService(registry)
    expect(service.suggest('soft viewport reveal')).toEqual([
      expect.objectContaining({ id: 'test-reveal', family: 'reveals' }),
    ])
    expect(service.validate()).toEqual({ ok: true, issues: [] })
    expect(service.plan(['test-reveal']).recipes[0]).toEqual(expect.objectContaining({ id: 'test-reveal' }))
  })

  it('rejects duplicate ids', () => {
    expect(() => createMotionRegistry([recipe(), recipe()])).toThrow('already registered')
  })

  it('does not trust arbitrary frozen input as a defined recipe', () => {
    expect(() => createMotionRegistry([Object.freeze({ id: 'bad' })])).toThrow(MotionRecipeValidationError)
  })
})

describe('root-scoped motion runtime', () => {
  it('keeps the legacy createSyncedMotion entry point on the complete built-in registry', () => {
    const recipe = createBuiltinMotionRegistry().get('reveal-rise')
    document.body.innerHTML = recipe.fixtures[0].markup
    const dependencies = runtimeDependencies()
    dependencies.gsap.from = vi.fn(() => ({ kill: vi.fn(), revert: vi.fn(), scrollTrigger: { kill: vi.fn() } }))
    const motion = createSyncedMotion({ dependencies })

    expect(motion.registry.list()).toHaveLength(60)
    expect(motion.inspect().mounted).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'reveal-rise' }),
    ]))
    expect(document.querySelector('[data-motion-reveal]').getAttribute('data-motion-recipe')).toBe('reveal-rise')

    motion.destroy()
    expect(document.querySelector('[data-motion-reveal]').hasAttribute('data-motion-recipe')).toBe(false)
  })

  it('passes actual recipe root Elements to built-ins and activates fine-pointer recipes', () => {
    document.body.innerHTML = `
      <div data-motion-magnetic><button data-motion-magnetic-action>Move</button></div>
      <div data-motion-pointer-spotlight><span data-motion-spotlight></span></div>
    `
    const dependencies = runtimeDependencies()
    const quickTo = vi.fn(() => vi.fn())
    dependencies.gsap.quickTo = quickTo
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn(() => ({ matches: true }))
    const registry = createBuiltinMotionRegistry()
    const runtime = createMotionRuntime({
      recipes: [registry.get('magnetic-action'), registry.get('pointer-spotlight')],
      dependencies,
    })

    expect(quickTo).toHaveBeenCalledTimes(4)
    expect(quickTo.mock.calls.every(([target]) => target instanceof Element)).toBe(true)
    expect(runtime.inspect().mounted.map((entry) => entry.id)).toEqual(['magnetic-action', 'pointer-spotlight'])
    expect(runtime.inspect().skipped).toEqual([])

    runtime.destroy()
    window.matchMedia = originalMatchMedia
  })

  it('mounts matching roots, exposes diagnostics, refreshes, and cleans up', () => {
    document.body.innerHTML = `
      <section data-motion-test><div data-motion-item></div></section>
      <div data-motion-item id="outside"></div>
    `
    const setup = vi.fn(() => vi.fn())
    const defined = defineMotionRecipe(recipe({ setup }))
    const dependencies = runtimeDependencies()
    const runtime = createMotionRuntime({ recipes: [defined], dependencies })

    expect(setup).toHaveBeenCalledOnce()
    const context = setup.mock.calls[0][0]
    expect(context.slots.item).toHaveLength(1)
    expect(context.slots.item[0].id).not.toBe('outside')
    expect(runtime.inspect()).toEqual(expect.objectContaining({
      active: true,
      registered: ['test-reveal'],
      mounted: [expect.objectContaining({ id: 'test-reveal' })],
      errors: [],
    }))
    expect(() => structuredClone(runtime.inspect())).not.toThrow()
    expect(() => JSON.stringify(runtime.inspect())).not.toThrow()

    runtime.refresh()
    expect(dependencies.ScrollTrigger.refresh).toHaveBeenCalledOnce()
    runtime.destroy()
    expect(dependencies.media.revert).toHaveBeenCalledOnce()
    expect(document.querySelector('[data-motion-test]').hasAttribute('data-motion-recipe')).toBe(false)
    expect(document.documentElement.hasAttribute('data-motion-runtime')).toBe(false)
  })

  it('skips a root with missing required slots without hiding its content', () => {
    document.body.innerHTML = '<section data-motion-test><p>Still readable</p></section>'
    const setup = vi.fn()
    const runtime = createMotionRuntime({
      recipes: [defineMotionRecipe(recipe({ setup }))],
      dependencies: runtimeDependencies(),
      strict: false,
    })

    expect(setup).not.toHaveBeenCalled()
    expect(runtime.inspect().skipped).toEqual([
      expect.objectContaining({ id: 'test-reveal', reason: 'missing-slots', slots: ['item'] }),
    ])
    expect(document.body.textContent).toContain('Still readable')
    runtime.destroy()
  })

  it('passes reduced-motion state into typed custom recipes', () => {
    document.body.innerHTML = '<section data-motion-test><div data-motion-item></div></section>'
    const setup = vi.fn(() => vi.fn())
    const runtime = createMotionRuntime({
      recipes: [defineMotionRecipe(recipe({ setup }))],
      dependencies: runtimeDependencies(true),
    })

    expect(setup.mock.calls[0][0].reduced).toBe(true)
    expect(document.documentElement.hasAttribute('data-motion-reduced')).toBe(true)
    runtime.destroy()
  })

  it('passes declarative parameter overrides through automatic mounting', () => {
    document.body.innerHTML = '<section data-motion-test><div data-motion-item></div></section>'
    const setup = vi.fn(() => vi.fn())
    const runtime = createMotionRuntime({
      recipes: [defineMotionRecipe(recipe({ setup }))],
      dependencies: runtimeDependencies(),
      parameterOverrides: { 'test-reveal': { duration: 1.4 } },
    })

    expect(setup.mock.calls[0][0].parameters.duration).toBe(1.4)
    runtime.destroy()
  })

  it('rejects unknown and out-of-bounds runtime parameter overrides', () => {
    document.body.innerHTML = '<section data-motion-test><div data-motion-item></div></section>'
    expect(() => createMotionRuntime({
      recipes: [defineMotionRecipe(recipe())],
      dependencies: runtimeDependencies(),
      parameterOverrides: { 'test-reveal': { duration: 4 } },
    })).toThrow('Invalid value for parameter "duration"')
    expect(() => createMotionRuntime({
      recipes: [defineMotionRecipe(recipe())],
      dependencies: runtimeDependencies(),
      parameterOverrides: { 'test-reveal': { unknown: true } },
    })).toThrow('Unknown parameter "unknown"')
  })

  it('cleans up manual mounts when automatic mounting is disabled', () => {
    document.body.innerHTML = '<section data-motion-test><div data-motion-item></div></section>'
    const dispose = vi.fn()
    const runtime = createMotionRuntime({
      recipes: [defineMotionRecipe(recipe({ setup: () => dispose }))],
      dependencies: runtimeDependencies(),
      autoMount: false,
    })
    runtime.mountRecipe('test-reveal', document.querySelector('[data-motion-test]'))
    runtime.destroy()
    expect(dispose).toHaveBeenCalledOnce()
    expect(document.querySelector('[data-motion-test]').hasAttribute('data-motion-recipe')).toBe(false)
  })

  it('rolls back previously mounted recipes when strict setup fails', () => {
    document.body.innerHTML = '<section data-motion-test><div data-motion-item></div></section>'
    const dispose = vi.fn()
    const first = defineMotionRecipe(recipe({ id: 'first-recipe', setup: vi.fn(() => dispose) }))
    const second = defineMotionRecipe(recipe({ id: 'second-recipe', setup: vi.fn(() => { throw new Error('setup failed') }) }))

    expect(() => createMotionRuntime({ recipes: [first, second], dependencies: runtimeDependencies() })).toThrow('setup failed')
    expect(dispose).toHaveBeenCalledOnce()
    expect(document.querySelector('[data-motion-test]').hasAttribute('data-motion-recipe')).toBe(false)
    expect(document.documentElement.hasAttribute('data-motion-runtime')).toBe(false)
  })

  it('preserves the receiver for object-form cleanup', () => {
    document.body.innerHTML = '<section data-motion-test><div data-motion-item></div></section>'
    const cleanup = {
      destroyed: false,
      destroy() { this.destroyed = true },
    }
    const runtime = createMotionRuntime({
      recipes: [defineMotionRecipe(recipe({ setup: () => cleanup }))],
      dependencies: runtimeDependencies(),
    })
    runtime.destroy()
    expect(cleanup.destroyed).toBe(true)
  })

  it('rejects manual mounts outside the runtime scope or against the wrong root selector', () => {
    document.body.innerHTML = `
      <main id="scope"><section data-motion-test><div data-motion-item></div></section><div id="wrong"></div></main>
      <section id="outside" data-motion-test><div data-motion-item></div></section>
    `
    const runtime = createMotionRuntime({
      root: document.querySelector('#scope'),
      recipes: [defineMotionRecipe(recipe())],
      dependencies: runtimeDependencies(),
      autoMount: false,
    })
    expect(() => runtime.mountRecipe('test-reveal', document.querySelector('#outside'))).toThrow('outside the runtime root')
    expect(() => runtime.mountRecipe('test-reveal', document.querySelector('#wrong'))).toThrow('must match')
  })
})
