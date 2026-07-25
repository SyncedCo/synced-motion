import type { MotionRuntimeRecipe } from './index.js'

/**
 * Individually importable runtime recipe specs.
 *
 * Import only what a page uses so bundlers can drop the rest:
 *
 * ```js
 * import { revealRise, marquee } from '@syncedco/motion/recipes'
 * ```
 */

export declare const accessibleMenu: MotionRuntimeRecipe
export declare const accordionDisclosure: MotionRuntimeRecipe
export declare const ambientFloat: MotionRuntimeRecipe
export declare const commandPalette: MotionRuntimeRecipe
export declare const counterValue: MotionRuntimeRecipe
export declare const dialogOverlay: MotionRuntimeRecipe
export declare const expandPanels: MotionRuntimeRecipe
export declare const flipCardToDetail: MotionRuntimeRecipe
export declare const flipFilterGrid: MotionRuntimeRecipe
export declare const flipListReorder: MotionRuntimeRecipe
export declare const flipNavIndicator: MotionRuntimeRecipe
export declare const horizontalComparisonSlider: MotionRuntimeRecipe
export declare const horizontalFeatureRail: MotionRuntimeRecipe
export declare const horizontalGalleryScrub: MotionRuntimeRecipe
export declare const horizontalGallerySnap: MotionRuntimeRecipe
export declare const horizontalLogoReel: MotionRuntimeRecipe
export declare const hoverLift: MotionRuntimeRecipe
export declare const hoverMediaSwitch: MotionRuntimeRecipe
export declare const imageFocusPan: MotionRuntimeRecipe
export declare const layoutAccordionGrid: MotionRuntimeRecipe
export declare const loopingLogoBelt: MotionRuntimeRecipe
export declare const magneticAction: MotionRuntimeRecipe
export declare const marquee: MotionRuntimeRecipe
export declare const mediaClipReveal: MotionRuntimeRecipe
export declare const mediaCurtainSplit: MotionRuntimeRecipe
export declare const mediaExpand: MotionRuntimeRecipe
export declare const navActiveIndicator: MotionRuntimeRecipe
export declare const pageLoadBrandMark: MotionRuntimeRecipe
export declare const pageLoadHero: MotionRuntimeRecipe
export declare const pinnedChapterCrossfade: MotionRuntimeRecipe
export declare const pinnedFounderStory: MotionRuntimeRecipe
export declare const pinnedProductExplainer: MotionRuntimeRecipe
export declare const pinnedStatement: MotionRuntimeRecipe
export declare const pinnedSteps: MotionRuntimeRecipe
export declare const pointerSpotlight: MotionRuntimeRecipe
export declare const progressRing: MotionRuntimeRecipe
export declare const revealClipWipe: MotionRuntimeRecipe
export declare const revealDirectional: MotionRuntimeRecipe
export declare const revealRise: MotionRuntimeRecipe
export declare const revealScaleIn: MotionRuntimeRecipe
export declare const revealStaggerCascade: MotionRuntimeRecipe
export declare const routeFade: MotionRuntimeRecipe
export declare const routeScrollRestore: MotionRuntimeRecipe
export declare const routeSharedMedia: MotionRuntimeRecipe
export declare const scrollDepthStack: MotionRuntimeRecipe
export declare const scrollDrift: MotionRuntimeRecipe
export declare const scrollExit: MotionRuntimeRecipe
export declare const scrollParallax: MotionRuntimeRecipe
export declare const scrollProgressMeter: MotionRuntimeRecipe
export declare const splitCharsShimmer: MotionRuntimeRecipe
export declare const splitLinesRise: MotionRuntimeRecipe
export declare const splitWordsCascade: MotionRuntimeRecipe
export declare const svgIconState: MotionRuntimeRecipe
export declare const svgLineDraw: MotionRuntimeRecipe
export declare const svgOrbit: MotionRuntimeRecipe
export declare const svgPathMorph: MotionRuntimeRecipe
export declare const svgSignatureReveal: MotionRuntimeRecipe
export declare const textHighlightSweep: MotionRuntimeRecipe
export declare const typewriterAnnounce: MotionRuntimeRecipe
export declare const videoPosterPlay: MotionRuntimeRecipe

/** Every built-in spec. Importing this opts into all sixty recipes. */
export declare const builtinMotionSpecs: readonly MotionRuntimeRecipe[]
export declare const SHARED_REDUCED_MOTION: Readonly<{ strategy: 'final'; behavior: string }>
