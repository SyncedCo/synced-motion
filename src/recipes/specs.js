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
  selector: '[data-sf-reveal]', parameters: { start: { type: 'string', default: 'top 85%' } },
  triggers: [{ type: 'viewport', start: 'top 85%' }], dependencies: ['gsap', 'ScrollTrigger'],
  setup: /* @__PURE__ */ setupFactory(createReveals, (context) => ({ ...context, revealStart: context.parameters.start })),
})

export const revealStaggerCascade = /* @__PURE__ */ spec({
  id: 'reveal-stagger-cascade',
  selector: '[data-sf-stagger]', slots: [{ name: 'items', selector: '[data-sf-stagger-item]', required: false, multiple: true }],
  parameters: { start: { type: 'string', default: 'top 85%' } }, triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'],
  setup: /* @__PURE__ */ setupFactory(createStaggers, (context) => ({ ...context, revealStart: context.parameters.start })),
})

export const revealDirectional = /* @__PURE__ */ spec({
  id: 'reveal-directional',
  selector: '[data-sf-reveal-directional]', triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createDirectionalReveals),
})

export const revealScaleIn = /* @__PURE__ */ spec({
  id: 'reveal-scale-in',
  selector: '[data-sf-reveal-scale]', triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScaleReveals),
})

export const revealClipWipe = /* @__PURE__ */ spec({
  id: 'reveal-clip-wipe',
       selector: '[data-sf-reveal-clip]',
  slots: [{ name: 'content', selector: '[data-sf-reveal-clip-content]', required: false }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createClipWipeReveals),
})

export const splitLinesRise = /* @__PURE__ */ spec({
  id: 'split-lines-rise',
  selector: '[data-sf-split="lines"]', parameters: { start: { type: 'string', default: 'top 85%' } }, triggers: [{ type: 'viewport' }],
  dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSplitText, (context) => ({ ...context, revealStart: context.parameters.start })),
})

export const splitWordsCascade = /* @__PURE__ */ spec({
  id: 'split-words-cascade',
  selector: '[data-sf-split="words"]', parameters: { start: { type: 'string', default: 'top 85%' } }, triggers: [{ type: 'viewport' }],
  dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSplitText, (context) => ({ ...context, revealStart: context.parameters.start })),
})

export const splitCharsShimmer = /* @__PURE__ */ spec({
  id: 'split-chars-shimmer',
       selector: '[data-sf-chars-shimmer]',
  triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createCharacterShimmers),
})

export const typewriterAnnounce = /* @__PURE__ */ spec({
  id: 'typewriter-announce',
       selector: '[data-sf-typewriter]',
  triggers: [{ type: 'viewport' }, { type: 'load' }], dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createTypewriterAnnouncements),
})

export const textHighlightSweep = /* @__PURE__ */ spec({
  id: 'text-highlight-sweep',
       selector: '[data-sf-text-highlight]',
  slots: [{ name: 'mark', selector: '[data-sf-text-highlight-mark]' }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createTextHighlightSweeps),
})

export const scrollParallax = /* @__PURE__ */ spec({
  id: 'scroll-parallax',
  selector: '[data-sf-parallax]', triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createParallax),
})

export const scrollExit = /* @__PURE__ */ spec({
  id: 'scroll-exit',
  selector: '[data-sf-scroll-exit]', triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollExits),
})

export const scrollDrift = /* @__PURE__ */ spec({
  id: 'scroll-drift',
       selector: '[data-sf-scroll-drift]',
  slots: [{ name: 'layer', selector: '[data-sf-drift-layer]' }], triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollDrifts),
})

export const scrollProgressMeter = /* @__PURE__ */ spec({
  id: 'scroll-progress-meter',
       selector: '[data-sf-scroll-progress]',
  slots: [{ name: 'meter', selector: '[data-sf-scroll-progress-meter]' }, { name: 'label', selector: '[data-sf-scroll-progress-label]', required: false }],
  triggers: [{ type: 'scroll' }], performance: 'low', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollProgressMeters),
})

export const scrollDepthStack = /* @__PURE__ */ spec({
  id: 'scroll-depth-stack',
       selector: '[data-sf-scroll-depth-stack]',
  slots: [{ name: 'cards', selector: '[data-sf-depth-card]', multiple: true }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollDepthStacks),
})

export const pinnedSteps = /* @__PURE__ */ spec({
  id: 'pinned-steps',
       selector: '[data-sf-scroll-steps]',
  slots: [{ name: 'pin', selector: '[data-sf-pin-target]' }, { name: 'links', selector: '[data-sf-step-link]', multiple: true }, { name: 'panels', selector: '[data-sf-step-panel]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollSteps),
})

export const pinnedStatement = /* @__PURE__ */ spec({
  id: 'pinned-statement',
       selector: '[data-sf-scroll-statement]',
  slots: [{ name: 'pin', selector: '[data-sf-statement-pin]' }, { name: 'heading', selector: '[data-sf-statement-heading]' }, { name: 'details', selector: '[data-sf-statement-details]' }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createScrollStatements),
})

export const pinnedFounderStory = /* @__PURE__ */ spec({
  id: 'pinned-founder-story',
       selector: '[data-sf-founder-scene]',
  slots: [{ name: 'content', selector: '[data-sf-founder-content]' }, { name: 'heading', selector: '[data-sf-founder-heading]' }, { name: 'metrics', selector: '[data-sf-founder-metrics]' }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'SplitText', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createFounderScenes),
})

export const pinnedChapterCrossfade = /* @__PURE__ */ spec({
  id: 'pinned-chapter-crossfade',
       selector: '[data-sf-pinned-chapters]',
  slots: [{ name: 'pin', selector: '[data-sf-pin-target]' }, { name: 'chapters', selector: '[data-sf-pinned-chapter]', multiple: true }, { name: 'visuals', selector: '[data-sf-pinned-visual]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createPinnedChapterCrossfades),
})

export const pinnedProductExplainer = /* @__PURE__ */ spec({
  id: 'pinned-product-explainer',
       selector: '[data-sf-product-explainer]',
  slots: [{ name: 'pin', selector: '[data-sf-pin-target]' }, { name: 'steps', selector: '[data-sf-product-step]', multiple: true }, { name: 'media', selector: '[data-sf-product-media]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createPinnedProductExplainers),
})

export const horizontalGalleryScrub = /* @__PURE__ */ spec({
  id: 'horizontal-gallery-scrub',
       selector: '[data-sf-horizontal-gallery]',
  slots: [{ name: 'track', selector: '[data-sf-horizontal-track]' }, { name: 'cards', selector: '[data-sf-horizontal-card]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createHorizontalGalleryScrubs),
})

export const horizontalGallerySnap = /* @__PURE__ */ spec({
  id: 'horizontal-gallery-snap',
       selector: '[data-sf-horizontal-snap]',
  slots: [{ name: 'track', selector: '[data-sf-horizontal-track]' }, { name: 'cards', selector: '[data-sf-horizontal-card]', multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createHorizontalGallerySnaps),
})

export const horizontalFeatureRail = /* @__PURE__ */ spec({
  id: 'horizontal-feature-rail',
       selector: '[data-sf-horizontal-feature-rail]',
  slots: [{ name: 'track', selector: '[data-sf-horizontal-track]' }, { name: 'cards', selector: '[data-sf-horizontal-card]', multiple: true }, { name: 'labels', selector: '[data-sf-horizontal-label]', required: false, multiple: true }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createHorizontalFeatureRails),
})

export const horizontalLogoReel = /* @__PURE__ */ spec({
  id: 'horizontal-logo-reel',
       selector: '[data-sf-horizontal-logo-reel]',
  slots: [{ name: 'track', selector: '[data-sf-horizontal-track]' }], triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createHorizontalLogoReels),
})

export const horizontalComparisonSlider = /* @__PURE__ */ spec({
  id: 'horizontal-comparison-slider',
       selector: '[data-sf-comparison]',
  slots: [{ name: 'after', selector: '[data-sf-comparison-after]' }, { name: 'range', selector: '[data-sf-comparison-range]' }],
  triggers: [{ type: 'pointer' }, { type: 'focus' }], dependencies: [], setup: /* @__PURE__ */ setupFactory(createHorizontalComparisonSliders),
})

export const mediaExpand = /* @__PURE__ */ spec({
  id: 'media-expand',
       selector: '[data-sf-media-expand]',
  slots: [{ name: 'frame', selector: '[data-sf-media-expand-frame]' }, { name: 'caption', selector: '[data-sf-media-expand-caption]', required: false }],
  triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createMediaExpansions),
})

export const mediaClipReveal = /* @__PURE__ */ spec({
  id: 'media-clip-reveal',
       selector: '[data-sf-media-clip]',
  slots: [{ name: 'frame', selector: '[data-sf-media-frame]', required: false }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createMediaClipReveals),
})

export const mediaCurtainSplit = /* @__PURE__ */ spec({
  id: 'media-curtain-split',
       selector: '[data-sf-media-curtain]',
  slots: [{ name: 'start', selector: '[data-sf-curtain-start]' }, { name: 'end', selector: '[data-sf-curtain-end]' }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createMediaCurtainSplits),
})

export const imageFocusPan = /* @__PURE__ */ spec({
  id: 'image-focus-pan',
       selector: '[data-sf-image-focus-pan]',
  slots: [{ name: 'image', selector: '[data-sf-focus-image]', required: false }], triggers: [{ type: 'scroll' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createImageFocusPans),
})

export const videoPosterPlay = /* @__PURE__ */ spec({
  id: 'video-poster-play',
       selector: '[data-sf-video-poster]',
  slots: [{ name: 'trigger', selector: '[data-sf-video-trigger]' }, { name: 'video', selector: '[data-sf-video-element]' }], triggers: [{ type: 'click' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createVideoPosterPlayers),
})

export const hoverMediaSwitch = /* @__PURE__ */ spec({
  id: 'hover-media-switch',
       selector: '[data-sf-hover-group]',
  slots: [{ name: 'triggers', selector: '[data-sf-hover-key]', multiple: true }, { name: 'media', selector: '[data-sf-hover-media]', multiple: true }],
  triggers: [{ type: 'hover' }, { type: 'focus' }], performance: 'low', dependencies: [], setup: /* @__PURE__ */ setupFactory(createHoverMedia),
})

export const expandPanels = /* @__PURE__ */ spec({
  id: 'expand-panels',
       selector: '[data-sf-expand-group]',
  slots: [{ name: 'panels', selector: '[data-sf-expand-panel]', multiple: true }], triggers: [{ type: 'hover' }, { type: 'focus' }], performance: 'low', dependencies: [], setup: /* @__PURE__ */ setupFactory(createExpandPanels),
})

export const hoverLift = /* @__PURE__ */ spec({
  id: 'hover-lift',
       selector: '[data-sf-hover-lift]',
  triggers: [{ type: 'hover' }, { type: 'focus' }], performance: 'low', dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createHoverLifts),
})

export const magneticAction = /* @__PURE__ */ spec({
  id: 'magnetic-action',
       selector: '[data-sf-magnetic]',
  slots: [{ name: 'action', selector: '[data-sf-magnetic-action]', required: false }], triggers: [{ type: 'pointer' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createMagneticActions),
})

export const pointerSpotlight = /* @__PURE__ */ spec({
  id: 'pointer-spotlight',
       selector: '[data-sf-pointer-spotlight]',
  slots: [{ name: 'spotlight', selector: '[data-sf-spotlight]' }], triggers: [{ type: 'pointer' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createPointerSpotlights),
})

export const accessibleMenu = /* @__PURE__ */ spec({
  id: 'accessible-menu',
       selector: '[data-sf-menu]',
  slots: [{ name: 'trigger', selector: '[data-sf-menu-trigger]' }, { name: 'panel', selector: '[data-sf-menu-panel]' }, { name: 'items', selector: '[data-sf-menu-item]', multiple: true }],
  triggers: [{ type: 'click' }, { type: 'focus' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createMenus),
})

export const dialogOverlay = /* @__PURE__ */ spec({
  id: 'dialog-overlay',
       selector: '[data-sf-dialog-overlay]',
  slots: [{ name: 'trigger', selector: '[data-sf-overlay-trigger]', required: false }, { name: 'dialog', selector: '[data-sf-overlay-dialog]' }], triggers: [{ type: 'click' }, { type: 'focus' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createDialogOverlays),
})

export const navActiveIndicator = /* @__PURE__ */ spec({
  id: 'nav-active-indicator',
       selector: '[data-sf-nav-indicator]',
  slots: [{ name: 'items', selector: '[data-sf-nav-item]', multiple: true }, { name: 'indicator', selector: '[data-sf-nav-active-indicator]' }], triggers: [{ type: 'focus' }, { type: 'pointer' }, { type: 'click' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createNavActiveIndicators),
})

export const accordionDisclosure = /* @__PURE__ */ spec({
  id: 'accordion-disclosure',
       selector: '[data-sf-accordion-motion]',
  slots: [{ name: 'panel', selector: '[data-sf-accordion-panel]' }], triggers: [{ type: 'click' }], performance: 'low', dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createAccordionDisclosures),
})

export const commandPalette = /* @__PURE__ */ spec({
  id: 'command-palette',
       selector: '[data-sf-command-palette]',
  slots: [{ name: 'dialog', selector: '[data-sf-overlay-dialog]' }, { name: 'input', selector: '[data-sf-command-input]' }], triggers: [{ type: 'click' }, { type: 'focus' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createCommandPalettes),
})

export const marquee = /* @__PURE__ */ spec({
  id: 'marquee',
       selector: '[data-sf-marquee]',
  slots: [{ name: 'track', selector: '[data-sf-marquee-track]' }], triggers: [{ type: 'load' }, { type: 'viewport' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createMarquees),
})

export const counterValue = /* @__PURE__ */ spec({
  id: 'counter-value',
       selector: '[data-sf-counter]',
  slots: [{ name: 'value', selector: '[data-sf-counter-value]', required: false }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createValueCounters),
})

export const progressRing = /* @__PURE__ */ spec({
  id: 'progress-ring',
       selector: '[data-sf-progress-ring]',
  slots: [{ name: 'ring', selector: '[data-sf-progress-ring-value]' }, { name: 'label', selector: '[data-sf-progress-ring-label]', required: false }], triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'DrawSVGPlugin', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createProgressRings),
})

export const ambientFloat = /* @__PURE__ */ spec({
  id: 'ambient-float',
       selector: '[data-sf-ambient-float]',
  triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createAmbientFloats),
})

export const loopingLogoBelt = /* @__PURE__ */ spec({
  id: 'looping-logo-belt',
       selector: '[data-sf-logo-belt]',
  slots: [{ name: 'track', selector: '[data-sf-logo-belt-track]' }], triggers: [{ type: 'load' }, { type: 'viewport' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createLoopingLogoBelts),
})

export const flipListReorder = /* @__PURE__ */ spec({
  id: 'flip-list-reorder',
       selector: '[data-sf-flip-list]',
  slots: [{ name: 'items', selector: '[data-sf-flip-item]', multiple: true }], triggers: [{ type: 'state' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createFlipListReorders),
})

export const flipCardToDetail = /* @__PURE__ */ spec({
  id: 'flip-card-to-detail',
       selector: '[data-sf-flip-card]',
  slots: [{ name: 'trigger', selector: '[data-sf-flip-card-trigger]' }, { name: 'detail', selector: '[data-sf-flip-card-detail]' }], triggers: [{ type: 'click' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createFlipCardDetails),
})

export const flipFilterGrid = /* @__PURE__ */ spec({
  id: 'flip-filter-grid',
       selector: '[data-sf-flip-filter]',
  slots: [{ name: 'controls', selector: '[data-sf-filter-control]', multiple: true }, { name: 'items', selector: '[data-sf-filter-item]', multiple: true }], triggers: [{ type: 'click' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createFlipFilterGrids),
})

export const flipNavIndicator = /* @__PURE__ */ spec({
  id: 'flip-nav-indicator',
       selector: '[data-sf-flip-nav]',
  slots: [{ name: 'items', selector: '[data-sf-flip-nav-item]', multiple: true }, { name: 'indicator', selector: '[data-sf-flip-nav-indicator]' }], triggers: [{ type: 'focus' }, { type: 'click' }], dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createFlipNavIndicators),
})

export const layoutAccordionGrid = /* @__PURE__ */ spec({
  id: 'layout-accordion-grid',
       selector: '[data-sf-layout-accordion-grid]',
  slots: [{ name: 'items', selector: '[data-sf-layout-item]', multiple: true }, { name: 'triggers', selector: '[data-sf-layout-trigger]', multiple: true }], triggers: [{ type: 'click' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createLayoutAccordionGrids),
})

export const svgLineDraw = /* @__PURE__ */ spec({
  id: 'svg-line-draw',
       selector: '[data-sf-svg-line-draw]',
  triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'DrawSVGPlugin', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSvgLineDraws),
})

export const svgPathMorph = /* @__PURE__ */ spec({
  id: 'svg-path-morph',
       selector: '[data-sf-svg-morph]',
  slots: [{ name: 'source', selector: '[data-sf-svg-morph-source]' }, { name: 'target', selector: '[data-sf-svg-morph-target]' }, { name: 'trigger', selector: '[data-sf-svg-trigger]' }], triggers: [{ type: 'click' }], dependencies: ['gsap', 'MorphSVGPlugin'], setup: /* @__PURE__ */ setupFactory(createSvgPathMorphs),
})

export const svgIconState = /* @__PURE__ */ spec({
  id: 'svg-icon-state',
       selector: '[data-sf-svg-icon-state]',
  slots: [{ name: 'source', selector: '[data-sf-svg-icon-source]' }, { name: 'target', selector: '[data-sf-svg-icon-target]' }, { name: 'trigger', selector: '[data-sf-svg-trigger]' }], triggers: [{ type: 'click' }], dependencies: ['gsap', 'MorphSVGPlugin'], setup: /* @__PURE__ */ setupFactory(createSvgIconStates),
})

export const svgOrbit = /* @__PURE__ */ spec({
  id: 'svg-orbit',
       selector: '[data-sf-svg-orbit]',
  slots: [{ name: 'subject', selector: '[data-sf-svg-orbit-subject]' }, { name: 'path', selector: '[data-sf-svg-orbit-path]' }], triggers: [{ type: 'scroll' }], performance: 'high', dependencies: ['gsap', 'MotionPathPlugin', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSvgOrbits),
})

export const svgSignatureReveal = /* @__PURE__ */ spec({
  id: 'svg-signature-reveal',
       selector: '[data-sf-svg-signature]',
  triggers: [{ type: 'viewport' }], dependencies: ['gsap', 'DrawSVGPlugin', 'ScrollTrigger'], setup: /* @__PURE__ */ setupFactory(createSvgSignatureReveals),
})

export const pageLoadHero = /* @__PURE__ */ spec({
  id: 'page-load-hero',
       selector: '[data-sf-page-load-hero]',
  slots: [{ name: 'items', selector: '[data-sf-page-load-item]', multiple: true }], triggers: [{ type: 'load' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createPageLoadHeroes),
})

export const pageLoadBrandMark = /* @__PURE__ */ spec({
  id: 'page-load-brand-mark',
       selector: '[data-sf-page-load-brand]',
  slots: [{ name: 'mark', selector: '[data-sf-brand-mark]', required: false }], triggers: [{ type: 'load' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createPageLoadBrandMarks),
})

export const routeFade = /* @__PURE__ */ spec({
  id: 'route-fade',
       selector: '[data-sf-route-fade]',
  slots: [{ name: 'outgoing', selector: '[data-sf-route-outgoing]', required: false }, { name: 'incoming', selector: '[data-sf-route-incoming]', required: false }], triggers: [{ type: 'route' }], dependencies: ['gsap'], setup: /* @__PURE__ */ setupFactory(createRouteFades),
})

export const routeSharedMedia = /* @__PURE__ */ spec({
  id: 'route-shared-media',
       selector: '[data-sf-route-shared-media]',
  slots: [{ name: 'media', selector: '[data-sf-shared-media]', multiple: true }], triggers: [{ type: 'route' }], performance: 'high', dependencies: ['gsap', 'Flip'], setup: /* @__PURE__ */ setupFactory(createRouteSharedMedia),
})

export const routeScrollRestore = /* @__PURE__ */ spec({
  id: 'route-scroll-restore',
       selector: '[data-sf-route-scroll-restore]',
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
