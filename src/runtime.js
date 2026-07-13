import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { mergeOptions } from './core/options.js'
import { createHoverMedia } from './patterns/hover-media.js'
import { createFounderScenes } from './patterns/founder-scene.js'
import { createExpandPanels } from './patterns/expand-panels.js'
import { createMenus } from './patterns/menu.js'
import { createMediaExpansions } from './patterns/media-expand.js'
import { createParallax } from './patterns/parallax.js'
import { createReveals } from './patterns/reveal.js'
import { createScrollSteps } from './patterns/scroll-steps.js'
import { createScrollExits } from './patterns/scroll-exit.js'
import { createScrollDrifts } from './patterns/scroll-drift.js'
import { createScrollStatements } from './patterns/scroll-statement.js'
import { createStaggers } from './patterns/stagger.js'
import { createSplitText } from './patterns/split-text.js'
import { createLenisAdapter } from './lenis.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function createSyncedMotion(options = {}) {
  if (typeof document === 'undefined') {
    throw new Error('Synced Motion requires a browser document.')
  }

  const settings = mergeOptions(options)
  const root = settings.root || document
  const cleanups = []
  const media = gsap.matchMedia()
  let smoothScroll

  media.add({
    reduce: settings.reducedMotionQuery,
    motion: '(prefers-reduced-motion: no-preference)',
  }, (context) => {
    const reduced = context.conditions.reduce
    const shared = {
      gsap,
      ScrollTrigger,
      SplitText,
      root,
      reduced,
      debug: settings.debug,
      revealStart: settings.revealStart,
    }

    createReveals(shared)
    createFounderScenes(shared)
    createSplitText(shared)
    createStaggers(shared)
    createParallax(shared)
    createMediaExpansions(shared)
    createScrollExits(shared)
    createScrollDrifts(shared)
    createScrollStatements(shared)
    createScrollSteps(shared)
    cleanups.push(...createHoverMedia(shared), ...createExpandPanels(shared), ...createMenus(shared))

    root.documentElement?.toggleAttribute('data-sf-reduced-motion', reduced)
    return () => cleanups.splice(0).forEach((cleanup) => cleanup?.())
  })

  if (settings.smoothScroll && !window.matchMedia(settings.reducedMotionQuery).matches) {
    smoothScroll = createLenisAdapter({
      gsap,
      ScrollTrigger,
      options: typeof settings.smoothScroll === 'object' ? settings.smoothScroll : {},
    })
  }

  document.documentElement.setAttribute('data-sf-motion', 'ready')

  const refresh = () => ScrollTrigger.refresh()
  if (document.fonts?.ready) document.fonts.ready.then(refresh)
  window.addEventListener('load', refresh, { once: true })

  return {
    gsap,
    ScrollTrigger,
    smoothScroll,
    refresh,
    destroy() {
      window.removeEventListener('load', refresh)
      smoothScroll?.destroy()
      media.revert()
      document.documentElement.removeAttribute('data-sf-motion')
      document.documentElement.removeAttribute('data-sf-reduced-motion')
      document.documentElement.removeAttribute('data-sf-scroll-locked')
    },
  }
}
