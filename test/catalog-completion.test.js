import { describe, expect, it, vi } from 'vitest'
import { createDefaultMotionService } from '../src/default-service.js'
import { createBuiltinMotionRegistry } from '../src/recipes/builtins.js'
import { createMotionRuntime } from '../src/recipe-runtime.js'

function behaviorDependencies() {
  const animation = () => ({
    eventCallback: vi.fn(() => animation()),
    from: vi.fn(() => animation()),
    fromTo: vi.fn(() => animation()),
    kill: vi.fn(),
    pause: vi.fn(),
    paused: vi.fn(),
    play: vi.fn(),
    reverse: vi.fn(),
    revert: vi.fn(),
    scrollTrigger: { kill: vi.fn() },
    to: vi.fn(() => animation()),
  })
  const timeline = animation()
  const quickTo = vi.fn()
  quickTo.tween = { kill: vi.fn() }
  let mediaCleanup
  const media = {
    add(_queries, callback) { mediaCleanup = callback({ conditions: { reduce: false, motion: true } }) },
    revert() { mediaCleanup?.() },
  }
  class SplitText {
    constructor(element) { this.words = [element]; this.lines = [element]; this.chars = [element] }
    revert() {}
    static create(element, options) {
      const instance = new SplitText(element)
      options.onSplit?.(instance)
      return instance
    }
  }
  return {
    gsap: {
      from: vi.fn(animation),
      fromTo: vi.fn(animation),
      matchMedia: () => media,
      quickTo: vi.fn(() => quickTo),
      set: vi.fn(animation),
      timeline: vi.fn(() => timeline),
      to: vi.fn(animation),
      utils: { interpolate: (start, end, progress) => start + (end - start) * progress },
    },
    ScrollTrigger: { create: vi.fn(animation), refresh: vi.fn() },
    SplitText,
    Flip: { getState: vi.fn(() => ({})), from: vi.fn(animation) },
    DrawSVGPlugin: {},
    MorphSVGPlugin: {},
    MotionPathPlugin: {},
  }
}

describe('production recipe catalog', () => {
  it('contains exactly five implemented recipes in each of twelve families', () => {
    const registry = createBuiltinMotionRegistry()
    const recipes = registry.list()
    const families = recipes.reduce((groups, recipe) => {
      const entries = groups.get(recipe.family) ?? []
      entries.push(recipe)
      groups.set(recipe.family, entries)
      return groups
    }, new Map())

    expect(recipes).toHaveLength(60)
    expect(families.size).toBe(12)
    for (const [family, entries] of families) expect(entries, family).toHaveLength(5)
    expect(recipes.every((recipe) => typeof recipe.setup === 'function')).toBe(true)
  })

  it('publishes resolvable, serializable fixtures with structurally ready markup', () => {
    const registry = createBuiltinMotionRegistry()
    const service = createDefaultMotionService()

    for (const recipe of registry.list()) {
      const fixtureIds = new Set(recipe.fixtures.map((fixture) => fixture.id))
      expect(fixtureIds.has(recipe.preview.fixture), recipe.id).toBe(true)
      expect(() => JSON.stringify(service.recipe(recipe.id))).not.toThrow()

      for (const fixture of recipe.fixtures) {
        const document = new DOMParser().parseFromString(fixture.markup, 'text/html')
        expect(document.querySelectorAll(recipe.root.selector), `${recipe.id}/${fixture.id} root`).toHaveLength(1)
        const scan = service.scanMarkup(fixture.markup).recipes.find((entry) => entry.id === recipe.id)
        expect(scan, `${recipe.id}/${fixture.id} scan`).toBeDefined()
        expect(scan.ready, `${recipe.id}/${fixture.id}: ${scan?.missingSlots?.join(', ')}`).toBe(true)
        expect(fixture.markup, `${recipe.id}/${fixture.id} generic copy`).not.toContain('Synced Motion preview')
      }
    }
  })

  it('mounts active behavior for every authored fixture instead of treating selector counts as readiness', () => {
    const registry = createBuiltinMotionRegistry()
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn(() => ({ matches: true }))

    for (const recipe of registry.list()) {
      for (const fixture of recipe.fixtures) {
        document.body.innerHTML = fixture.markup
        document.querySelectorAll('video').forEach((video) => {
          video.play = vi.fn(async () => {})
          video.pause = vi.fn()
        })
        const runtime = createMotionRuntime({ recipes: [recipe], dependencies: behaviorDependencies() })
        const diagnostics = runtime.inspect()
        expect(diagnostics.errors, `${recipe.id}/${fixture.id} errors`).toEqual([])
        expect(diagnostics.skipped, `${recipe.id}/${fixture.id} skipped`).toEqual([])
        expect(diagnostics.mounted.map((entry) => entry.id), `${recipe.id}/${fixture.id} mounted`).toEqual([recipe.id])
        runtime.destroy()
      }
    }

    window.matchMedia = originalMatchMedia
  })

  it('uses native semantic controls in interaction-heavy fixtures', () => {
    const registry = createBuiltinMotionRegistry()
    const expectations = {
      'horizontal-comparison-slider': ['input[type="range"]'],
      'video-poster-play': ['button[data-sf-video-trigger]', 'video[data-sf-video-element]'],
      'accordion-disclosure': ['details', 'summary'],
      'dialog-overlay': ['button[data-sf-overlay-trigger]', 'dialog[data-sf-overlay-dialog]'],
      'command-palette': ['dialog[data-sf-overlay-dialog]', 'input[data-sf-command-input]'],
      'layout-accordion-grid': ['button[data-sf-layout-trigger][aria-expanded]'],
      'pinned-statement': ['[data-sf-statement-lead]', '[data-sf-statement-hero-accent]'],
      'pinned-founder-story': ['[data-sf-founder-stat]', '[data-sf-founder-metrics-bg]'],
      'media-expand': ['img[alt]', 'figcaption[data-sf-media-expand-caption]'],
      'split-lines-rise': ['h2[data-sf-split="lines"]'],
      'split-words-cascade': ['h2[data-sf-split="words"]'],
      'split-chars-shimmer': ['h2[data-sf-chars-shimmer]'],
      'typewriter-announce': ['h2[data-sf-typewriter]'],
    }
    for (const [id, selectors] of Object.entries(expectations)) {
      const fixture = registry.get(id).fixtures[0]
      const page = new DOMParser().parseFromString(fixture.markup, 'text/html')
      selectors.forEach((selector) => expect(page.querySelector(selector), `${id}: ${selector}`).not.toBeNull())
    }
  })
})
