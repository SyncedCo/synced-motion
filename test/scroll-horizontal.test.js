import { describe, expect, it, vi } from 'vitest'
import { createPinnedChapterCrossfades } from '../src/patterns/pinned-sequence.js'
import { createScrollDepthStacks, createScrollProgressMeters } from '../src/patterns/scroll-progress.js'
import { createHorizontalComparisonSliders, createHorizontalGalleryScrubs } from '../src/patterns/horizontal.js'

describe('scroll progress and depth recipes', () => {
  it('links a local progress meter to scroll and updates an optional label', () => {
    document.body.innerHTML = '<section data-motion-scroll-progress><span data-motion-scroll-progress-meter></span><output data-motion-scroll-progress-label></output></section>'
    const instance = { kill: vi.fn(), revert: vi.fn() }
    const gsap = { fromTo: vi.fn(() => instance) }
    createScrollProgressMeters({ gsap, root: document, reduced: false, debug: false })
    const vars = gsap.fromTo.mock.calls[0][2]
    expect(vars).toEqual(expect.objectContaining({ scaleX: 1, ease: 'none' }))
    vars.scrollTrigger.onUpdate({ progress: 0.42 })
    expect(document.querySelector('output').textContent).toBe('42%')
  })

  it('introduces only cards inside the depth-stack root', () => {
    document.body.innerHTML = '<section data-motion-scroll-depth-stack><article data-motion-depth-card></article><article data-motion-depth-card></article></section>'
    const gsap = { from: vi.fn(() => ({})) }
    createScrollDepthStacks({ gsap, root: document, reduced: false, debug: false })
    expect(gsap.from.mock.calls[0][0]).toHaveLength(2)
    expect(gsap.from.mock.calls[0][1]).toEqual(expect.objectContaining({ autoAlpha: 0, yPercent: 12, scale: 0.96 }))
  })
})

describe('pinned sequence recipes', () => {
  it('coordinates semantic chapter and visual state and cleans it up', () => {
    document.body.innerHTML = `
      <section data-motion-pinned-chapters>
        <div data-motion-pin-target></div>
        <article data-motion-pinned-chapter></article><article data-motion-pinned-chapter></article>
        <figure data-motion-pinned-visual></figure><figure data-motion-pinned-visual></figure>
      </section>
    `
    let config
    const instance = { kill: vi.fn() }
    const ScrollTrigger = { create: vi.fn((value) => { config = value; return instance }) }
    const [cleanup] = createPinnedChapterCrossfades({ ScrollTrigger, root: document, reduced: false, debug: false })
    config.onUpdate({ progress: 1 })
    expect(document.querySelectorAll('[data-motion-pinned-chapter]')[1].hasAttribute('data-active')).toBe(true)
    expect(document.querySelectorAll('[data-motion-pinned-visual]')[1].hasAttribute('data-active')).toBe(true)
    cleanup()
    expect(instance.kill).toHaveBeenCalledOnce()
    expect(document.querySelector('[data-active]')).toBeNull()
  })
})

describe('horizontal recipes', () => {
  it('builds a transform-only pinned gallery with linear scroll mapping', () => {
    document.body.innerHTML = `
      <section data-motion-horizontal-gallery>
        <div data-motion-horizontal-pin><div data-motion-horizontal-viewport><div data-motion-horizontal-track><article data-motion-horizontal-card></article></div></div></div>
      </section>
    `
    const viewport = document.querySelector('[data-motion-horizontal-viewport]')
    const track = document.querySelector('[data-motion-horizontal-track]')
    Object.defineProperty(viewport, 'clientWidth', { value: 400 })
    Object.defineProperty(track, 'scrollWidth', { value: 1200 })
    const gsap = { to: vi.fn(() => ({})) }
    createHorizontalGalleryScrubs({ gsap, root: document, reduced: false, debug: false })
    const vars = gsap.to.mock.calls[0][1]
    expect(vars.ease).toBe('none')
    expect(vars.x()).toBe(-800)
    expect(vars.scrollTrigger).toEqual(expect.objectContaining({ scrub: 1, pin: document.querySelector('[data-motion-horizontal-pin]') }))
  })

  it('keeps comparison input keyboard-native and restores presentation on cleanup', () => {
    document.body.innerHTML = `
      <figure data-motion-comparison>
        <div data-motion-comparison-after></div>
        <input data-motion-comparison-range type="range" min="0" max="100" value="35">
      </figure>
    `
    const scene = document.querySelector('[data-motion-comparison]')
    const range = document.querySelector('input')
    const after = document.querySelector('[data-motion-comparison-after]')
    const [cleanup] = createHorizontalComparisonSliders({ root: document })
    expect(after.style.clipPath).toBe('inset(0 65% 0 0)')
    range.value = '70'
    range.dispatchEvent(new Event('input'))
    expect(scene.getAttribute('data-motion-comparison-value')).toBe('70')
    cleanup()
    expect(after.style.clipPath).toBe('')
    expect(scene.hasAttribute('data-motion-comparison-value')).toBe(false)
  })
})
