import { describe, expect, it, vi } from 'vitest'
import { createProgressRings, createValueCounters } from '../src/patterns/ambient-effects.js'
import { createFlipFilterGrids, createFlipListReorders } from '../src/patterns/layout-transitions.js'
import { createPageLoadHeroes, createRouteFades } from '../src/patterns/page-transitions.js'
import { createSvgPathMorphs } from '../src/patterns/svg-effects.js'
import { createFounderScenes } from '../src/patterns/founder-scene.js'
import { createMediaExpansions } from '../src/patterns/media-expand.js'
import { createScrollStatements } from '../src/patterns/scroll-statement.js'

function cleanupHarness() {
  const timeline = {
    scrollTrigger: { kill: vi.fn() },
    to: vi.fn(() => timeline),
    revert: vi.fn(),
    kill: vi.fn(),
  }
  const gsap = {
    set: vi.fn(),
    timeline: vi.fn(() => timeline),
    utils: { interpolate: (start, end, progress) => start + (end - start) * progress },
  }
  return { gsap, timeline }
}

describe('advanced production recipe behavior', () => {
  it('clears direct initial GSAP mutations when statement, founder, and media patterns are called manually', () => {
    document.body.innerHTML = `
      <section data-sf-scroll-statement><div data-sf-statement-pin><h2 data-sf-statement-heading><span data-sf-statement-hero-accent></span><span data-sf-statement-inline-accent></span></h2><p data-sf-statement-lead></p><div data-sf-statement-details><p data-sf-statement-detail></p></div><span data-sf-statement-label></span></div></section>
      <section data-sf-founder-scene><div data-sf-founder-statement-bg></div><div data-sf-founder-metrics-bg></div><div data-sf-founder-content><h2 data-sf-founder-heading>Founder story</h2></div><div data-sf-founder-metrics><strong data-sf-founder-stat>10</strong><span data-sf-founder-stat-label>years</span><p data-sf-founder-detail>Detail</p></div></section>
      <figure data-sf-media-expand><p data-sf-media-expand-prompt>Scroll</p><span data-sf-media-expand-label="start">Start</span><div data-sf-media-expand-frame><img alt=""></div><span data-sf-media-expand-label="end">End</span><figcaption data-sf-media-expand-caption>Caption</figcaption></figure>
    `
    const statement = cleanupHarness()
    const [destroyStatement] = createScrollStatements({ ...statement, ScrollTrigger: {}, root: document, reduced: false })
    destroyStatement()
    expect(statement.gsap.set).toHaveBeenLastCalledWith(expect.any(Array), expect.objectContaining({ clearProps: expect.stringContaining('height') }))

    const founder = cleanupHarness()
    class SplitText {
      constructor(element) { this.words = [element] }
      revert = vi.fn()
    }
    const [destroyFounder] = createFounderScenes({ ...founder, ScrollTrigger: {}, SplitText, root: document, reduced: false })
    destroyFounder()
    expect(founder.gsap.set).toHaveBeenLastCalledWith(expect.any(Array), { clearProps: 'transform,opacity,visibility' })

    const media = cleanupHarness()
    const [destroyMedia] = createMediaExpansions({ ...media, root: document, reduced: false })
    destroyMedia()
    expect(media.gsap.set).toHaveBeenLastCalledWith(expect.any(Array), expect.objectContaining({ clearProps: expect.stringContaining('clipPath') }))
  })

  it('runs application-owned FLIP list mutations and removes the scoped listener', () => {
    document.body.innerHTML = '<ul data-sf-flip-list><li data-sf-flip-item>One</li><li data-sf-flip-item>Two</li></ul>'
    const Flip = { getState: vi.fn(() => ({})), from: vi.fn(() => ({ kill: vi.fn() })) }
    const list = document.querySelector('[data-sf-flip-list]')
    const [destroy] = createFlipListReorders({ Flip, root: document, reduced: false })
    const mutate = vi.fn((_list, items) => _list.append(...items.reverse()))
    list.dispatchEvent(new CustomEvent('sf:motion:reorder', { detail: { mutate } }))
    expect(mutate).toHaveBeenCalledOnce()
    expect(Flip.from).toHaveBeenCalledOnce()
    destroy()
    list.dispatchEvent(new CustomEvent('sf:motion:reorder', { detail: { mutate } }))
    expect(mutate).toHaveBeenCalledOnce()
  })

  it('filters a grid with native controls and uses GSAP for entering items', () => {
    document.body.innerHTML = `<section data-sf-flip-filter>
      <button data-sf-filter-control="all"></button><button data-sf-filter-control="news"></button>
      <article data-sf-filter-item="news"></article><article data-sf-filter-item="work"></article>
    </section>`
    const Flip = { getState: vi.fn(() => ({})), from: vi.fn((_state, options) => { options.onEnter?.([]); return { kill: vi.fn() } }) }
    const gsap = { fromTo: vi.fn(() => ({ kill: vi.fn() })) }
    const [destroy] = createFlipFilterGrids({ Flip, gsap, root: document, reduced: false })
    document.querySelector('[data-sf-filter-control="news"]').click()
    expect(document.querySelector('[data-sf-filter-item="work"]').hidden).toBe(true)
    expect(gsap.fromTo).toHaveBeenCalledOnce()
    destroy()
    expect(document.querySelector('[data-sf-filter-item="work"]').hidden).toBe(false)
  })

  it('morphs a controlled SVG state and restores its authored path', () => {
    document.body.innerHTML = `<section data-sf-svg-morph><svg>
      <path data-sf-svg-morph-source d="M0 0 L10 10"></path><path data-sf-svg-morph-target d="M0 10 L10 0"></path>
    </svg><button data-sf-svg-trigger></button></section>`
    const tween = { revert: vi.fn(), kill: vi.fn() }
    const gsap = { to: vi.fn(() => tween) }
    const [destroy] = createSvgPathMorphs({ gsap, root: document, reduced: false })
    document.querySelector('button').click()
    expect(gsap.to).toHaveBeenCalledWith(expect.any(Element), expect.objectContaining({ morphSVG: expect.any(Element) }))
    destroy()
    expect(document.querySelector('[data-sf-svg-morph-source]').getAttribute('d')).toBe('M0 0 L10 10')
  })

  it('preserves final counter and progress values under reduced motion', () => {
    document.body.innerHTML = `<output data-sf-counter data-sf-counter-to="120"><span data-sf-counter-value>0</span></output>
      <figure data-sf-progress-ring data-sf-progress="72"><svg><circle data-sf-progress-ring-value></circle></svg><output data-sf-progress-ring-label></output></figure>`
    const setResult = { revert: vi.fn(), kill: vi.fn() }
    const gsap = { set: vi.fn(() => setResult) }
    const [destroyCounter] = createValueCounters({ gsap, root: document, reduced: true })
    const [destroyRing] = createProgressRings({ gsap, root: document, reduced: true })
    expect(document.querySelector('[data-sf-counter-value]').textContent).toBe('120')
    expect(document.querySelector('[data-sf-progress-ring-label]').textContent).toBe('72%')
    destroyCounter(); destroyRing()
  })

  it('builds page-load and route timelines through scoped roots', () => {
    document.body.innerHTML = '<section data-sf-page-load-hero><h1 data-sf-page-load-item>Hero</h1></section><main data-sf-route-fade><div data-sf-route-outgoing></div><div data-sf-route-incoming></div></main>'
    const animation = { revert: vi.fn(), kill: vi.fn() }
    const timeline = { to: vi.fn(() => timeline), fromTo: vi.fn(() => timeline), revert: vi.fn(), kill: vi.fn() }
    const gsap = { from: vi.fn(() => animation), timeline: vi.fn(() => timeline) }
    expect(createPageLoadHeroes({ gsap, root: document, reduced: false })).toHaveLength(1)
    const [destroy] = createRouteFades({ gsap, root: document, reduced: false })
    document.querySelector('[data-sf-route-fade]').dispatchEvent(new CustomEvent('sf:motion:route', { detail: {} }))
    expect(gsap.timeline).toHaveBeenCalledOnce()
    destroy()
    expect(timeline.kill).toHaveBeenCalledOnce()
  })
})
