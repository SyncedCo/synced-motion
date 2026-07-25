import { describe, expect, it, vi } from 'vitest'
import { createHoverLifts, createMagneticActions } from '../src/patterns/hover-pointer.js'
import { createAccordionDisclosures, createDialogOverlays } from '../src/patterns/overlay-effects.js'
import { createMediaClipReveals, createVideoPosterPlayers } from '../src/patterns/media-effects.js'

describe('hover and pointer recipes', () => {
  it('uses the same lift state for pointer and keyboard focus and removes listeners', () => {
    document.body.innerHTML = '<a href="#" data-motion-hover-lift>Card</a>'
    const gsap = { to: vi.fn(), set: vi.fn() }
    const item = document.querySelector('a')
    const [cleanup] = createHoverLifts({ gsap, root: document, reduced: false })
    item.dispatchEvent(new Event('pointerenter'))
    item.dispatchEvent(new Event('focusin'))
    expect(gsap.to).toHaveBeenCalledTimes(2)
    cleanup()
    item.dispatchEvent(new Event('pointerenter'))
    expect(gsap.to).toHaveBeenCalledTimes(2)
  })

  it('only enables magnetic motion for a fine pointer', () => {
    document.body.innerHTML = '<div data-motion-magnetic><button data-motion-magnetic-action>Go</button></div>'
    const original = window.matchMedia
    window.matchMedia = vi.fn(() => ({ matches: true }))
    const xTo = vi.fn()
    const yTo = vi.fn()
    const gsap = { quickTo: vi.fn((_target, property) => property === 'x' ? xTo : yTo), set: vi.fn() }
    const scene = document.querySelector('[data-motion-magnetic]')
    scene.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 })
    const [cleanup] = createMagneticActions({ gsap, root: document, reduced: false })
    scene.dispatchEvent(new MouseEvent('pointermove', { clientX: 75, clientY: 25 }))
    expect(xTo).toHaveBeenCalledWith(5)
    expect(yTo).toHaveBeenCalledWith(-5)
    cleanup()
    window.matchMedia = original
  })
})

describe('overlay recipes', () => {
  it('opens and closes a dialog while maintaining trigger state and focus return', () => {
    document.body.innerHTML = `
      <div data-motion-dialog-overlay>
        <button data-motion-overlay-trigger>Open</button>
        <dialog data-motion-overlay-dialog><button data-motion-overlay-close>Close</button></dialog>
      </div>
    `
    const dialog = document.querySelector('dialog')
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''))
    dialog.close = vi.fn(() => { dialog.removeAttribute('open'); dialog.dispatchEvent(new Event('close')) })
    const gsap = { fromTo: vi.fn(), set: vi.fn() }
    const trigger = document.querySelector('[data-motion-overlay-trigger]')
    const [cleanup] = createDialogOverlays({ gsap, root: document, reduced: false })
    trigger.click()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(document.querySelector('[data-motion-overlay-close]'))
    cleanup()
    expect(dialog.close).toHaveBeenCalledOnce()
    expect(dialog.hasAttribute('open')).toBe(false)
    expect(trigger.hasAttribute('aria-expanded')).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('animates only the presentation of an open native disclosure', () => {
    document.body.innerHTML = '<details data-motion-accordion-motion open><summary>Title</summary><div data-motion-accordion-panel>Body</div></details>'
    const gsap = { fromTo: vi.fn(), set: vi.fn() }
    const disclosure = document.querySelector('details')
    createAccordionDisclosures({ gsap, root: document, reduced: false })
    disclosure.dispatchEvent(new Event('toggle'))
    expect(gsap.fromTo).toHaveBeenCalledWith(expect.any(Element), expect.objectContaining({ autoAlpha: 0 }), expect.objectContaining({ autoAlpha: 1 }))
  })
})

describe('media recipes', () => {
  it('creates a bounded clip reveal and skips it for reduced motion', () => {
    document.body.innerHTML = '<figure data-motion-media-clip><div data-motion-media-frame></div></figure>'
    const gsap = { from: vi.fn(() => ({})) }
    createMediaClipReveals({ gsap, root: document, reduced: false, debug: false })
    expect(gsap.from).toHaveBeenCalledWith(expect.any(Element), expect.objectContaining({ clipPath: 'inset(0 100% 0 0)' }))
    expect(createMediaClipReveals({ gsap, root: document, reduced: true })).toEqual([])
  })

  it('keeps native video controls and restores the poster during cleanup', async () => {
    document.body.innerHTML = `
      <figure data-motion-video-poster>
        <button data-motion-video-trigger aria-pressed="false">Play</button>
        <img data-motion-video-poster-image alt="">
        <video data-motion-video-element></video>
      </figure>
    `
    const video = document.querySelector('video')
    video.play = vi.fn(async () => {})
    video.pause = vi.fn()
    const gsap = { to: vi.fn(), set: vi.fn() }
    const [cleanup] = createVideoPosterPlayers({ gsap, root: document, reduced: false })
    document.querySelector('button').click()
    await Promise.resolve()
    expect(video.controls).toBe(true)
    expect(document.querySelector('button').getAttribute('aria-pressed')).toBe('true')
    cleanup()
    expect(video.pause).toHaveBeenCalledOnce()
    expect(document.querySelector('button').getAttribute('aria-pressed')).toBe('false')
  })
})
