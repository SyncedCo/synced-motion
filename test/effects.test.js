import { describe, expect, it, vi } from 'vitest'
import { createClipWipeReveals, createDirectionalReveals, createScaleReveals } from '../src/patterns/reveal-effects.js'
import { createCharacterShimmers, createTextHighlightSweeps, createTypewriterAnnouncements } from '../src/patterns/text-effects.js'
import { createSplitText } from '../src/patterns/split-text.js'

function tween() {
  return { kill: vi.fn(), revert: vi.fn(), scrollTrigger: { kill: vi.fn() } }
}

describe('expanded reveal recipes', () => {
  it('creates transform-based directional and scale reveals', () => {
    document.body.innerHTML = `
      <div data-motion-reveal-directional="left"></div>
      <div data-motion-reveal-scale="0.9"></div>
    `
    const gsap = { from: vi.fn(() => tween()) }
    createDirectionalReveals({ gsap, root: document, reduced: false, debug: false })
    createScaleReveals({ gsap, root: document, reduced: false, debug: false })
    expect(gsap.from).toHaveBeenNthCalledWith(1, expect.any(Element), expect.objectContaining({ autoAlpha: 0, xPercent: -8, yPercent: 0 }))
    expect(gsap.from).toHaveBeenNthCalledWith(2, expect.any(Element), expect.objectContaining({ autoAlpha: 0, scale: 0.9 }))
  })

  it('reveals local content through a clip without changing document structure', () => {
    document.body.innerHTML = '<figure data-motion-reveal-clip="end"><img data-motion-reveal-clip-content></figure>'
    const gsap = { from: vi.fn(() => tween()) }
    createClipWipeReveals({ gsap, root: document, reduced: false, debug: false })
    expect(gsap.from).toHaveBeenCalledWith(document.querySelector('img'), expect.objectContaining({ clipPath: 'inset(0 0 0 100%)' }))
    expect(document.querySelector('figure').children).toHaveLength(1)
  })

  it('leaves authored final states untouched for reduced motion', () => {
    document.body.innerHTML = '<div data-motion-reveal-directional="up"></div>'
    const gsap = { from: vi.fn() }
    expect(createDirectionalReveals({ gsap, root: document, reduced: true })).toEqual([])
    expect(gsap.from).not.toHaveBeenCalled()
  })
})

describe('expanded typography recipes', () => {
  it('splits characters with accessible SplitText behavior and reverts cleanup', () => {
    document.body.innerHTML = '<h2 data-motion-chars-shimmer>Motion</h2>'
    const split = { chars: [document.createElement('span')], revert: vi.fn() }
    const SplitText = { create: vi.fn(() => split) }
    const createdTween = tween()
    const gsap = { from: vi.fn(() => createdTween) }
    const [cleanup] = createCharacterShimmers({ gsap, SplitText, root: document, reduced: false, debug: false })
    expect(SplitText.create).toHaveBeenCalledWith(expect.any(Element), { type: 'chars', aria: 'auto' })
    expect(document.querySelector('h2').getAttribute('aria-label')).toBe('Motion')
    cleanup()
    expect(split.revert).toHaveBeenCalledOnce()
    expect(createdTween.kill).toHaveBeenCalledOnce()
  })

  it('supports typewriter and semantic highlight effects', () => {
    document.body.innerHTML = `
      <p data-motion-typewriter data-motion-typewriter-load>Ready</p>
      <p data-motion-text-highlight><span data-motion-text-highlight-mark>Important</span></p>
    `
    const split = { chars: [document.createElement('span')], revert: vi.fn() }
    const SplitText = { create: vi.fn(() => split) }
    const gsap = { from: vi.fn(() => tween()) }
    createTypewriterAnnouncements({ gsap, SplitText, root: document, reduced: false, debug: false })
    createTextHighlightSweeps({ gsap, root: document, reduced: false, debug: false })
    expect(gsap.from).toHaveBeenNthCalledWith(1, split.chars, expect.objectContaining({ stagger: 0.035, ease: 'none', scrollTrigger: undefined }))
    expect(gsap.from).toHaveBeenNthCalledWith(2, expect.any(Element), expect.objectContaining({ scaleX: 0, transformOrigin: 'left center' }))
    expect(document.querySelector('[data-motion-typewriter]').getAttribute('aria-label')).toBe('Ready')
  })

  it('reasserts the accessible label whenever responsive split text rebuilds', () => {
    document.body.innerHTML = '<h2 data-motion-split="words">Readable words</h2>'
    const instance = { words: [document.createElement('span')] }
    const SplitText = {
      create: vi.fn((element, options) => {
        options.onSplit(instance)
        return instance
      }),
    }
    const gsap = { from: vi.fn(() => tween()) }
    createSplitText({ gsap, SplitText, root: document, reduced: false, debug: false, revealStart: 'top 85%' })
    expect(document.querySelector('h2').getAttribute('aria-label')).toBe('Readable words')
  })
})
