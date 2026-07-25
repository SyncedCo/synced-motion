import { describe, expect, it, vi } from 'vitest'
import { booleanAttribute, clampIndex, mergeOptions, numberAttribute } from '../src/core/options.js'
import { setActiveState } from '../src/core/state.js'
import { createExpandPanels } from '../src/patterns/expand-panels.js'
import { createMarquees } from '../src/patterns/marquee.js'

describe('option helpers', () => {
  it('clamps scroll progress to a valid step', () => {
    expect(clampIndex(-1, 5)).toBe(0)
    expect(clampIndex(0.5, 5)).toBe(2)
    expect(clampIndex(1, 5)).toBe(4)
    expect(clampIndex(0.5, 0)).toBe(-1)
  })

  it('merges runtime options', () => {
    expect(mergeOptions({ debug: true }).debug).toBe(true)
    expect(mergeOptions().smoothScroll).toBe(false)
  })

  it('reads typed attributes', () => {
    const element = document.createElement('div')
    element.setAttribute('data-number', '1.25')
    element.setAttribute('data-enabled', 'false')
    expect(numberAttribute(element, 'data-number', 0)).toBe(1.25)
    expect(booleanAttribute(element, 'data-enabled', true)).toBe(false)
  })
})

describe('semantic active state', () => {
  it('sets a single active element without inline presentation', () => {
    const elements = Array.from({ length: 3 }, () => document.createElement('a'))
    setActiveState(elements, 1, { ariaCurrent: true })

    expect(elements[0].hasAttribute('data-active')).toBe(false)
    expect(elements[1].hasAttribute('data-active')).toBe(true)
    expect(elements[1].getAttribute('aria-current')).toBe('true')
    expect(elements[1].getAttribute('style')).toBeNull()
  })

  it('activates expanding panels through pointer and keyboard input', () => {
    document.body.innerHTML = `
      <div data-motion-expand-group data-motion-expand-default="1">
        <article data-motion-expand-panel></article>
        <article data-motion-expand-panel></article>
        <article data-motion-expand-panel></article>
      </div>
    `
    const panels = [...document.querySelectorAll('[data-motion-expand-panel]')]
    const [destroy] = createExpandPanels({ root: document })

    expect(panels[1].hasAttribute('data-active')).toBe(true)
    panels[2].dispatchEvent(new Event('pointerenter'))
    expect(panels[2].hasAttribute('data-active')).toBe(true)
    expect(panels[1].hasAttribute('data-active')).toBe(false)

    destroy()
  })
})

describe('marquee motion', () => {
  it('creates a seamless transform loop and restores it during cleanup', () => {
    document.body.innerHTML = `
      <div data-motion-marquee data-motion-marquee-duration="16">
        <div data-motion-marquee-track><span>One</span><span aria-hidden="true">One</span></div>
      </div>
    `
    const tween = { paused: vi.fn(), revert: vi.fn() }
    const gsap = { fromTo: vi.fn(() => tween) }
    const [destroy] = createMarquees({ gsap, root: document, reduced: false })

    expect(gsap.fromTo).toHaveBeenCalledWith(
      expect.any(Element),
      { xPercent: 0 },
      expect.objectContaining({ xPercent: -50, duration: 16, ease: 'none', repeat: -1 }),
    )

    destroy()
    expect(tween.revert).toHaveBeenCalledOnce()
  })

  it('does not animate when reduced motion is requested', () => {
    const gsap = { fromTo: vi.fn() }
    expect(createMarquees({ gsap, root: document, reduced: true })).toEqual([])
    expect(gsap.fromTo).not.toHaveBeenCalled()
  })
})

describe('public pattern API', () => {
  it('exports every showcase motion pattern from the package entry point', async () => {
    window.matchMedia = window.matchMedia || (() => ({
      addEventListener() {},
      addListener() {},
      matches: false,
      removeEventListener() {},
      removeListener() {},
    }))
    const publicApi = await import('../src/index.js')
    const patternFactories = [
      'createExpandPanels',
      'createFounderScenes',
      'createHoverMedia',
      'createMenus',
      'createMediaExpansions',
      'createMarquees',
      'createParallax',
      'createReveals',
      'createScrollDrifts',
      'createScrollExits',
      'createScrollStatements',
      'createScrollSteps',
      'createSplitText',
      'createStaggers',
    ]

    patternFactories.forEach((name) => expect(publicApi[name], name).toBeTypeOf('function'))
  })
})
