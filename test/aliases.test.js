import { describe, expect, it, vi } from 'vitest'
import { normalizeMotionAliases } from '../src/core/aliases.js'
import { createRuntimeMotionRegistry } from '../src/recipes/runtime-registry.js'
import { builtinMotionSpecs } from '../src/recipes/specs.js'
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

const revealOnly = () => createRuntimeMotionRegistry(builtinMotionSpecs.filter((spec) => spec.id === 'reveal-rise'))

describe('data-motion attribute aliases', () => {
  it('mirrors data-motion-* onto the legacy data-sf-* names', () => {
    document.body.innerHTML = '<p data-motion-reveal="up" data-motion-duration="1.2">Readable</p>'
    const element = document.querySelector('p')

    const restore = normalizeMotionAliases(document)
    expect(element.getAttribute('data-sf-reveal')).toBe('up')
    expect(element.getAttribute('data-sf-duration')).toBe('1.2')

    restore()
    expect(element.hasAttribute('data-sf-reveal')).toBe(false)
    expect(element.getAttribute('data-motion-reveal')).toBe('up')
  })

  it('never overwrites an explicit legacy attribute', () => {
    document.body.innerHTML = '<p data-motion-reveal="up" data-sf-reveal="fade">Readable</p>'
    const element = document.querySelector('p')

    const restore = normalizeMotionAliases(document)
    expect(element.getAttribute('data-sf-reveal')).toBe('fade')

    restore()
    expect(element.getAttribute('data-sf-reveal')).toBe('fade')
  })

  it('normalises the scope element itself, not only its descendants', () => {
    document.body.innerHTML = '<section data-motion-reveal="up"><p>Readable</p></section>'
    const section = document.querySelector('section')

    normalizeMotionAliases(section)
    expect(section.getAttribute('data-sf-reveal')).toBe('up')
  })

  it('mounts a recipe authored entirely with data-motion-* attributes', () => {
    document.body.innerHTML = '<p data-motion-reveal="up">Readable</p>'
    const runtime = createMotionRuntime({ registry: revealOnly(), dependencies: stubDependencies() })

    expect(runtime.inspect().mounted.map((entry) => entry.id)).toEqual(['reveal-rise'])
    runtime.destroy()
  })

  it('restores authored markup on destroy', () => {
    document.body.innerHTML = '<p data-motion-reveal="up">Readable</p>'
    const element = document.querySelector('p')
    const runtime = createMotionRuntime({ registry: revealOnly(), dependencies: stubDependencies() })

    runtime.destroy()
    expect(element.hasAttribute('data-sf-reveal')).toBe(false)
    expect(element.getAttribute('data-motion-reveal')).toBe('up')
  })

  it('still mounts recipes authored with the legacy prefix', () => {
    document.body.innerHTML = '<p data-sf-reveal="up">Readable</p>'
    const runtime = createMotionRuntime({ registry: revealOnly(), dependencies: stubDependencies() })

    expect(runtime.inspect().mounted.map((entry) => entry.id)).toEqual(['reveal-rise'])
    runtime.destroy()
  })
})
