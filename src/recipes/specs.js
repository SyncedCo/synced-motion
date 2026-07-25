import { createExpandPanels } from '../patterns/expand-panels.js'
import { createFounderScenes } from '../patterns/founder-scene.js'
import { createHoverMedia } from '../patterns/hover-media.js'
import { createHoverLifts, createMagneticActions, createPointerSpotlights } from '../patterns/hover-pointer.js'
import {
  createHorizontalComparisonSliders,
  createHorizontalFeatureRails,
  createHorizontalGalleryScrubs,
  createHorizontalGallerySnaps,
  createHorizontalLogoReels,
} from '../patterns/horizontal.js'
import { createMarquees } from '../patterns/marquee.js'
import { createAmbientFloats, createLoopingLogoBelts, createProgressRings, createValueCounters } from '../patterns/ambient-effects.js'
import { createFlipCardDetails, createFlipFilterGrids, createFlipListReorders, createFlipNavIndicators, createLayoutAccordionGrids } from '../patterns/layout-transitions.js'
import { createMediaExpansions } from '../patterns/media-expand.js'
import { createImageFocusPans, createMediaClipReveals, createMediaCurtainSplits, createVideoPosterPlayers } from '../patterns/media-effects.js'
import { createMenus } from '../patterns/menu.js'
import { createAccordionDisclosures, createCommandPalettes, createDialogOverlays, createNavActiveIndicators } from '../patterns/overlay-effects.js'
import { createParallax } from '../patterns/parallax.js'
import { createPinnedChapterCrossfades, createPinnedProductExplainers } from '../patterns/pinned-sequence.js'
import { createReveals } from '../patterns/reveal.js'
import { createClipWipeReveals, createDirectionalReveals, createScaleReveals } from '../patterns/reveal-effects.js'
import { createScrollDrifts } from '../patterns/scroll-drift.js'
import { createScrollExits } from '../patterns/scroll-exit.js'
import { createScrollStatements } from '../patterns/scroll-statement.js'
import { createScrollSteps } from '../patterns/scroll-steps.js'
import { createScrollDepthStacks, createScrollProgressMeters } from '../patterns/scroll-progress.js'
import { createSplitText } from '../patterns/split-text.js'
import { createStaggers } from '../patterns/stagger.js'
import { createPageLoadBrandMarks, createPageLoadHeroes, createRouteFades, createRouteScrollRestores, createRouteSharedMedia } from '../patterns/page-transitions.js'
import { createSvgIconStates, createSvgLineDraws, createSvgOrbits, createSvgPathMorphs, createSvgSignatureReveals } from '../patterns/svg-effects.js'
import { createCharacterShimmers, createTextHighlightSweeps, createTypewriterAnnouncements } from '../patterns/text-effects.js'

function withScopedElement(root, callback) {
  const ownDescriptor = Object.getOwnPropertyDescriptor(root, 'querySelectorAll')
  const queryDescendants = root.querySelectorAll.bind(root)
  Object.defineProperty(root, 'querySelectorAll', {
  configurable: true,
  value(selector) {
      const descendants = [...queryDescendants(selector)]
      return root.matches(selector) ? [root, ...descendants] : descendants
  },
})
  try {
  return callback(root)
  } finally {
  if (ownDescriptor) Object.defineProperty(root, 'querySelectorAll', ownDescriptor)
  else delete root.querySelectorAll
  }
}

function disposeResults(results) {
  for (const result of Array.isArray(results) ? results : [results]) {
  if (typeof result === 'function') result()
  else if (typeof result?.destroy === 'function') result.destroy()
  else {
      result?.scrollTrigger?.kill?.()
      result?.revert?.()
      result?.kill?.()
  }
  }
}

function /* @__PURE__ */ setupFactory(factory, extend = (context) => context) {
  return (context) => {
  const results = withScopedElement(context.root, (root) => factory({ ...extend(context), root }))
  const activeResults = (Array.isArray(results) ? results : [results]).filter(Boolean)
  if (!activeResults.length && !context.reduced) return false
  return () => disposeResults(activeResults)
  }
}

export const SHARED_REDUCED_MOTION = /* @__PURE__ */ Object.freeze({
  strategy: 'final',
  behavior: 'Preserve the authored readable final state.',
})

/**
 * Runtime-only recipe spec. Prose, preview and fixture metadata live in
 * ./authoring.js so they are never pulled into a browser bundle.
 */
function spec({
  id,
  selector,
  slots = [],
  parameters = {},
  triggers,
  performance = 'medium',
  dependencies = ['gsap'],
  setup,
}) {
  return Object.freeze({
  schemaVersion: '1',
  id,
  version: '1.0.0',
  root: { selector },
  slots: [{ name: 'root' }, ...slots],
  parameters,
  triggers,
  reducedMotion: SHARED_REDUCED_MOTION,
  performance: { class: performance },
  dependencies,
  setup,
})
}

export const revealRise = /* @__PURE__ */ spec({
  id: 'reveal-rise',
  selector: '[data-motion-reveal]', parameters: { start: { type: 'string', default: 'top 85%' } },
  triggers: [{ type: 'viewport', start: 'top 85%' }], dependencies: ['gsap', 'ScrollTrigger'],
  setup: /* @__PURE__ */ setupFactory(createReveals, (context) => ({ ...context, revealStart: context.parameters.start })),
})

export const revealStaggerCascade = /* @__PURE__ */ spec({
  id: 'reveal-stagger-cascade',
  selector: '[data-motion-stagger]', slots: [{ name: 'items', selector: '[data-motion-stagger-item]', required: false, multiple: true }],
  parameters: { start: { type: 'string', default: 'top 85%' } }, triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'],
  setup: /* @__PURE__ */ setupFactory(createStaggers, (context) => ({ ...context, revealStart: context.parameters.start })),
})

export const revealDirectional = /* @__PURE__ */ spec({
  id: 'reveal-directional',
  selector: '[data-motion-reveal-directional]', triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createDirectionalReveals),
})

export const revealScaleIn = /* @__PURE__ */ spec({
  id: 'reveal-scale-in',
  selector: '[data-motion-reveal-scale]', triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScaleReveals),
})

export const revealClipWipe = /* @__PURE__ */ spec({
  id: 'reveal-clip-wipe',
       selector: '[data-motion-reveal-clip]',
  slots: [{ name: 'content', selector: '[data-motion-reveal-clip-content]', required: false }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createClipWipeReveals),
})

export const splitLinesRise = /* @__PURE__ */ spec({
  id: 'split-lines-rise',
  selector: '[data-motion-split="lines"]', parameters: { start: { type: 'string', default: 'top 85%' } }, triggers: [{ type: 'viewport' }],
  dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSplitText, (context) => ({ ...context, revealStart: context.parameters.start })),
})

export const splitWordsCascade = /* @__PURE__ */ spec({
  id: 'split-words-cascade',
  selector: '[data-motion-split="words"]', parameters: { start: { type: 'string', default: 'top 85%' } }, triggers: [{ type: 'viewport' }],
  dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSplitText, (context) => ({ ...context, revealStart: context.parameters.start })),
})

export const splitCharsShimmer = /* @__PURE__ */ spec({
  id: 'split-chars-shimmer',
       selector: '[data-motion-chars-shimmer]',
  triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createCharacterShimmers),
})

export const typewriterAnnounce = /* @__PURE__ */ spec({
  id: 'typewriter-announce',
       selector: '[data-motion-typewriter]',
  triggers: [{ type: 'viewport' }, { type: 'load' }], dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createTypewriterAnnouncements),
})

export const textHighlightSweep = /* @__PURE__ */ spec({
  id: 'text-highlight-sweep',
       selector: '[data-motion-text-highlight]',
  slots: [{ name: 'mark', selector: '[data-motion-text-highlight-mark]' }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createTextHighlightSweeps),
})

export const scrollParallax = /* @__PURE__ */ spec({
  id: 'scroll-parallax',
  selector: '[data-motion-parallax]', triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createParallax),
})

export const scrollExit = /* @__PURE__ */ spec({
  id: 'scroll-exit',
  selector: '[data-motion-scroll-exit]', triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollExits),
})

export const scrollDrift = /* @__PURE__ */ spec({
  id: 'scroll-drift',
       selector: '[data-motion-scroll-drift]',
  slots: [{ name: 'layer', selector: '[data-motion-drift-layer]' }], triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollDrifts),
})

export const scrollProgressMeter = /* @__PURE__ */ spec({
  id: 'scroll-progress-meter',
       selector: '[data-motion-scroll-progress]',
  slots: [{ name: 'meter', selector: '[data-motion-scroll-progress-meter]' }, { name: 'label', selector: '[data-motion-scroll-progress-label]', required: false }],
  triggers: [{ type: 'scroll' }], performance: 'low', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollProgressMeters),
})

export const scrollDepthStack = /* @__PURE__ */ spec({
  id: 'scroll-depth-stack',
       selector: '[data-motion-scroll-depth-stack]',
  slots: [{ name: 'cards', selector: '[data-motion-depth-card]', multiple: true }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollDepthStacks),
})

export const pinnedSteps = /* @__PURE__ */ spec({
  id: 'pinned-steps',
       selector: '[data-motion-scroll-steps]',
  slots: [{ name: 'pin', selector: '[data-motion-pin-target]' }, { name: 'links', selector: '[data-motion-step-link]', multiple: true }, { name: 'panels', selector: '[data-motion-step-panel]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollSteps),
})

export const pinnedStatement = /* @__PURE__ */ spec({
  id: 'pinned-statement',
       selector: '[data-motion-scroll-statement]',
  slots: [{ name: 'pin', selector: '[data-motion-statement-pin]' }, { name: 'heading', selector: '[data-motion-statement-heading]' }, { name: 'details', selector: '[data-motion-statement-details]' }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollStatements),
})

export const pinnedFounderStory = /* @__PURE__ */ spec({
  id: 'pinned-founder-story',
       selector: '[data-motion-founder-scene]',
  slots: [{ name: 'content', selector: '[data-motion-founder-content]' }, { name: 'heading', selector: '[data-motion-founder-heading]' }, { name: 'metrics', selector: '[data-motion-founder-metrics]' }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createFounderScenes),
})

export const pinnedChapterCrossfade = /* @__PURE__ */ spec({
  id: 'pinned-chapter-crossfade',
       selector: '[data-motion-pinned-chapters]',
  slots: [{ name: 'pin', selector: '[data-motion-pin-target]' }, { name: 'chapters', selector: '[data-motion-pinned-chapter]', multiple: true }, { name: 'visuals', selector: '[data-motion-pinned-visual]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createPinnedChapterCrossfades),
})

export const pinnedProductExplainer = /* @__PURE__ */ spec({
  id: 'pinned-product-explainer',
       selector: '[data-motion-product-explainer]',
  slots: [{ name: 'pin', selector: '[data-motion-pin-target]' }, { name: 'steps', selector: '[data-motion-product-step]', multiple: true }, { name: 'media', selector: '[data-motion-product-media]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createPinnedProductExplainers),
})

export const horizontalGalleryScrub = /* @__PURE__ */ spec({
  id: 'horizontal-gallery-scrub',
       selector: '[data-motion-horizontal-gallery]',
  slots: [{ name: 'track', selector: '[data-motion-horizontal-track]' }, { name: 'cards', selector: '[data-motion-horizontal-card]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createHorizontalGalleryScrubs),
})

export const horizontalGallerySnap = /* @__PURE__ */ spec({
  id: 'horizontal-gallery-snap',
       selector: '[data-motion-horizontal-snap]',
  slots: [{ name: 'track', selector: '[data-motion-horizontal-track]' }, { name: 'cards', selector: '[data-motion-horizontal-card]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createHorizontalGallerySnaps),
})

export const horizontalFeatureRail = /* @__PURE__ */ spec({
  id: 'horizontal-feature-rail',
       selector: '[data-motion-horizontal-feature-rail]',
  slots: [{ name: 'track', selector: '[data-motion-horizontal-track]' }, { name: 'cards', selector: '[data-motion-horizontal-card]', multiple: true }, { name: 'labels', selector: '[data-motion-horizontal-label]', required: false, multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createHorizontalFeatureRails),
})

export const horizontalLogoReel = /* @__PURE__ */ spec({
  id: 'horizontal-logo-reel',
       selector: '[data-motion-horizontal-logo-reel]',
  slots: [{ name: 'track', selector: '[data-motion-horizontal-track]' }], triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createHorizontalLogoReels),
})

export const horizontalComparisonSlider = /* @__PURE__ */ spec({
  id: 'horizontal-comparison-slider',
       selector: '[data-motion-comparison]',
  slots: [{ name: 'after', selector: '[data-motion-comparison-after]' }, { name: 'range', selector: '[data-motion-comparison-range]' }],
  triggers: [{ type: 'pointer' }, { type: 'focus' }], dependencies: [], setup: /* @__PURE__ */ setupFactory(createHorizontalComparisonSliders),
})

export const mediaExpand = /* @__PURE__ */ spec({
  id: 'media-expand',
       selector: '[data-motion-media-expand]',
  slots: [{ name: 'frame', selector: '[data-motion-media-expand-frame]' }, { name: 'caption', selector: '[data-motion-media-expand-caption]', required: false }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createMediaExpansions),
})

export const mediaClipReveal = /* @__PURE__ */ spec({
  id: 'media-clip-reveal',
       selector: '[data-motion-media-clip]',
  slots: [{ name: 'frame', selector: '[data-motion-media-frame]', required: false }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createMediaClipReveals),
})

export const mediaCurtainSplit = /* @__PURE__ */ spec({
  id: 'media-curtain-split',
       selector: '[data-motion-media-curtain]',
  slots: [{ name: 'start', selector: '[data-motion-curtain-start]' }, { name: 'end', selector: '[data-motion-curtain-end]' }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createMediaCurtainSplits),
})

export const imageFocusPan = /* @__PURE__ */ spec({
  id: 'image-focus-pan',
       selector: '[data-motion-image-focus-pan]',
  slots: [{ name: 'image', selector: '[data-motion-focus-image]', required: false }], triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createImageFocusPans),
})

export const videoPosterPlay = /* @__PURE__ */ spec({
  id: 'video-poster-play',
       selector: '[data-motion-video-poster]',
  slots: [{ name: 'trigger', selector: '[data-motion-video-trigger]' }, { name: 'video', selector: '[data-motion-video-element]' }], triggers: [{ type: 'click' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createVideoPosterPlayers),
})

export const hoverMediaSwitch = /* @__PURE__ */ spec({
  id: 'hover-media-switch',
       selector: '[data-motion-hover-group]',
  slots: [{ name: 'triggers', selector: '[data-motion-hover-key]', multiple: true }, { name: 'media', selector: '[data-motion-hover-media]', multiple: true }],
  triggers: [{ type: 'hover' }, { type: 'focus' }], performance: 'low', dependencies: [], setup: /* @__PURE__ */ setupFactory(createHoverMedia),
})

export const expandPanels = /* @__PURE__ */ spec({
  id: 'expand-panels',
       selector: '[data-motion-expand-group]',
  slots: [{ name: 'panels', selector: '[data-motion-expand-panel]', multiple: true }], triggers: [{ type: 'hover' }, { type: 'focus' }], performance: 'low', dependencies: [], setup: /* @__PURE__ */ setupFactory(createExpandPanels),
})

export const hoverLift = /* @__PURE__ */ spec({
  id: 'hover-lift',
       selector: '[data-motion-hover-lift]',
  triggers: [{ type: 'hover' }, { type: 'focus' }], performance: 'low', dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createHoverLifts),
})

export const magneticAction = /* @__PURE__ */ spec({
  id: 'magnetic-action',
       selector: '[data-motion-magnetic]',
  slots: [{ name: 'action', selector: '[data-motion-magnetic-action]', required: false }], triggers: [{ type: 'pointer' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createMagneticActions),
})

export const pointerSpotlight = /* @__PURE__ */ spec({
  id: 'pointer-spotlight',
       selector: '[data-motion-pointer-spotlight]',
  slots: [{ name: 'spotlight', selector: '[data-motion-spotlight]' }], triggers: [{ type: 'pointer' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createPointerSpotlights),
})

export const accessibleMenu = /* @__PURE__ */ spec({
  id: 'accessible-menu',
       selector: '[data-motion-menu]',
  slots: [{ name: 'trigger', selector: '[data-motion-menu-trigger]' }, { name: 'panel', selector: '[data-motion-menu-panel]' }, { name: 'items', selector: '[data-motion-menu-item]', multiple: true }],
  triggers: [{ type: 'click' }, { type: 'focus' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createMenus),
})

export const dialogOverlay = /* @__PURE__ */ spec({
  id: 'dialog-overlay',
       selector: '[data-motion-dialog-overlay]',
  slots: [{ name: 'trigger', selector: '[data-motion-overlay-trigger]', required: false }, { name: 'dialog', selector: '[data-motion-overlay-dialog]' }], triggers: [{ type: 'click' }, { type: 'focus' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createDialogOverlays),
})

export const navActiveIndicator = /* @__PURE__ */ spec({
  id: 'nav-active-indicator',
       selector: '[data-motion-nav-indicator]',
  slots: [{ name: 'items', selector: '[data-motion-nav-item]', multiple: true }, { name: 'indicator', selector: '[data-motion-nav-active-indicator]' }], triggers: [{ type: 'focus' }, { type: 'pointer' }, { type: 'click' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createNavActiveIndicators),
})

export const accordionDisclosure = /* @__PURE__ */ spec({
  id: 'accordion-disclosure',
       selector: '[data-motion-accordion-motion]',
  slots: [{ name: 'panel', selector: '[data-motion-accordion-panel]' }], triggers: [{ type: 'click' }], performance: 'low', dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createAccordionDisclosures),
})

export const commandPalette = /* @__PURE__ */ spec({
  id: 'command-palette',
       selector: '[data-motion-command-palette]',
  slots: [{ name: 'dialog', selector: '[data-motion-overlay-dialog]' }, { name: 'input', selector: '[data-motion-command-input]' }], triggers: [{ type: 'click' }, { type: 'focus' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createCommandPalettes),
})

export const marquee = /* @__PURE__ */ spec({
  id: 'marquee',
       selector: '[data-motion-marquee]',
  slots: [{ name: 'track', selector: '[data-motion-marquee-track]' }], triggers: [{ type: 'load' }, { type: 'viewport' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createMarquees),
})

export const counterValue = /* @__PURE__ */ spec({
  id: 'counter-value',
       selector: '[data-motion-counter]',
  slots: [{ name: 'value', selector: '[data-motion-counter-value]', required: false }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createValueCounters),
})

export const progressRing = /* @__PURE__ */ spec({
  id: 'progress-ring',
       selector: '[data-motion-progress-ring]',
  slots: [{ name: 'ring', selector: '[data-motion-progress-ring-value]' }, { name: 'label', selector: '[data-motion-progress-ring-label]', required: false }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'DrawSVGPlugin', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createProgressRings),
})

export const ambientFloat = /* @__PURE__ */ spec({
  id: 'ambient-float',
       selector: '[data-motion-ambient-float]',
  triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createAmbientFloats),
})

export const loopingLogoBelt = /* @__PURE__ */ spec({
  id: 'looping-logo-belt',
       selector: '[data-motion-logo-belt]',
  slots: [{ name: 'track', selector: '[data-motion-logo-belt-track]' }], triggers: [{ type: 'load' }, { type: 'viewport' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createLoopingLogoBelts),
})

export const flipListReorder = /* @__PURE__ */ spec({
  id: 'flip-list-reorder',
       selector: '[data-motion-flip-list]',
  slots: [{ name: 'items', selector: '[data-motion-flip-item]', multiple: true }], triggers: [{ type: 'state' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createFlipListReorders),
})

export const flipCardToDetail = /* @__PURE__ */ spec({
  id: 'flip-card-to-detail',
       selector: '[data-motion-flip-card]',
  slots: [{ name: 'trigger', selector: '[data-motion-flip-card-trigger]' }, { name: 'detail', selector: '[data-motion-flip-card-detail]' }], triggers: [{ type: 'click' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createFlipCardDetails),
})

export const flipFilterGrid = /* @__PURE__ */ spec({
  id: 'flip-filter-grid',
       selector: '[data-motion-flip-filter]',
  slots: [{ name: 'controls', selector: '[data-motion-filter-control]', multiple: true }, { name: 'items', selector: '[data-motion-filter-item]', multiple: true }], triggers: [{ type: 'click' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createFlipFilterGrids),
})

export const flipNavIndicator = /* @__PURE__ */ spec({
  id: 'flip-nav-indicator',
       selector: '[data-motion-flip-nav]',
  slots: [{ name: 'items', selector: '[data-motion-flip-nav-item]', multiple: true }, { name: 'indicator', selector: '[data-motion-flip-nav-indicator]' }], triggers: [{ type: 'focus' }, { type: 'click' }], dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createFlipNavIndicators),
})

export const layoutAccordionGrid = /* @__PURE__ */ spec({
  id: 'layout-accordion-grid',
       selector: '[data-motion-layout-accordion-grid]',
  slots: [{ name: 'items', selector: '[data-motion-layout-item]', multiple: true }, { name: 'triggers', selector: '[data-motion-layout-trigger]', multiple: true }], triggers: [{ type: 'click' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createLayoutAccordionGrids),
})

export const svgLineDraw = /* @__PURE__ */ spec({
  id: 'svg-line-draw',
       selector: '[data-motion-svg-line-draw]',
  triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'DrawSVGPlugin', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSvgLineDraws),
})

export const svgPathMorph = /* @__PURE__ */ spec({
  id: 'svg-path-morph',
       selector: '[data-motion-svg-morph]',
  slots: [{ name: 'source', selector: '[data-motion-svg-morph-source]' }, { name: 'target', selector: '[data-motion-svg-morph-target]' }, { name: 'trigger', selector: '[data-motion-svg-trigger]' }], triggers: [{ type: 'click' }], dependencies: ['gsap', 'MorphSVGPlugin'], setup: /* @__PURE__ */ setupFactory(createSvgPathMorphs),
})

export const svgIconState = /* @__PURE__ */ spec({
  id: 'svg-icon-state',
       selector: '[data-motion-svg-icon-state]',
  slots: [{ name: 'source', selector: '[data-motion-svg-icon-source]' }, { name: 'target', selector: '[data-motion-svg-icon-target]' }, { name: 'trigger', selector: '[data-motion-svg-trigger]' }], triggers: [{ type: 'click' }], dependencies: ['gsap', 'MorphSVGPlugin'], setup: /* @__PURE__ */ setupFactory(createSvgIconStates),
})

export const svgOrbit = /* @__PURE__ */ spec({
  id: 'svg-orbit',
       selector: '[data-motion-svg-orbit]',
  slots: [{ name: 'subject', selector: '[data-motion-svg-orbit-subject]' }, { name: 'path', selector: '[data-motion-svg-orbit-path]' }], triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'MotionPathPlugin', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSvgOrbits),
})

export const svgSignatureReveal = /* @__PURE__ */ spec({
  id: 'svg-signature-reveal',
       selector: '[data-motion-svg-signature]',
  triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'DrawSVGPlugin', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSvgSignatureReveals),
})

export const pageLoadHero = /* @__PURE__ */ spec({
  id: 'page-load-hero',
       selector: '[data-motion-page-load-hero]',
  slots: [{ name: 'items', selector: '[data-motion-page-load-item]', multiple: true }], triggers: [{ type: 'load' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createPageLoadHeroes),
})

export const pageLoadBrandMark = /* @__PURE__ */ spec({
  id: 'page-load-brand-mark',
       selector: '[data-motion-page-load-brand]',
  slots: [{ name: 'mark', selector: '[data-motion-brand-mark]', required: false }], triggers: [{ type: 'load' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createPageLoadBrandMarks),
})

export const routeFade = /* @__PURE__ */ spec({
  id: 'route-fade',
       selector: '[data-motion-route-fade]',
  slots: [{ name: 'outgoing', selector: '[data-motion-route-outgoing]', required: false }, { name: 'incoming', selector: '[data-motion-route-incoming]', required: false }], triggers: [{ type: 'route' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createRouteFades),
})

export const routeSharedMedia = /* @__PURE__ */ spec({
  id: 'route-shared-media',
       selector: '[data-motion-route-shared-media]',
  slots: [{ name: 'media', selector: '[data-motion-shared-media]', multiple: true }], triggers: [{ type: 'route' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createRouteSharedMedia),
})

export const routeScrollRestore = /* @__PURE__ */ spec({
  id: 'route-scroll-restore',
       selector: '[data-motion-route-scroll-restore]',
  triggers: [{ type: 'route' }], dependencies: ['ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createRouteScrollRestores),
})

/** Every built-in spec. Importing this array opts into all sixty recipes. */
export const builtinMotionSpecs = /* @__PURE__ */ Object.freeze([
  revealRise,
  revealStaggerCascade,
  revealDirectional,
  revealScaleIn,
  revealClipWipe,
  splitLinesRise,
  splitWordsCascade,
  splitCharsShimmer,
  typewriterAnnounce,
  textHighlightSweep,
  scrollParallax,
  scrollExit,
  scrollDrift,
  scrollProgressMeter,
  scrollDepthStack,
  pinnedSteps,
  pinnedStatement,
  pinnedFounderStory,
  pinnedChapterCrossfade,
  pinnedProductExplainer,
  horizontalGalleryScrub,
  horizontalGallerySnap,
  horizontalFeatureRail,
  horizontalLogoReel,
  horizontalComparisonSlider,
  mediaExpand,
  mediaClipReveal,
  mediaCurtainSplit,
  imageFocusPan,
  videoPosterPlay,
  hoverMediaSwitch,
  expandPanels,
  hoverLift,
  magneticAction,
  pointerSpotlight,
  accessibleMenu,
  dialogOverlay,
  navActiveIndicator,
  accordionDisclosure,
  commandPalette,
  marquee,
  counterValue,
  progressRing,
  ambientFloat,
  loopingLogoBelt,
  flipListReorder,
  flipCardToDetail,
  flipFilterGrid,
  flipNavIndicator,
  layoutAccordionGrid,
  svgLineDraw,
  svgPathMorph,
  svgIconState,
  svgOrbit,
  svgSignatureReveal,
  pageLoadHero,
  pageLoadBrandMark,
  routeFade,
  routeSharedMedia,
  routeScrollRestore,
])
