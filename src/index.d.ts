export type MotionTriggerType = 'load' | 'viewport' | 'scroll' | 'hover' | 'focus' | 'pointer' | 'click' | 'route' | 'state'
export type MotionPerformanceClass = 'low' | 'medium' | 'high'

export interface MotionRecipeSlot {
  name: string
  selector?: string
  required?: boolean
  multiple?: boolean
}

export interface MotionRecipeParameter {
  type: 'boolean' | 'number' | 'string' | 'enum'
  default: unknown
  min?: number
  max?: number
  values?: unknown[]
  description?: string
}

export interface MotionRecipeContext {
  gsap: unknown
  ScrollTrigger: unknown
  /** Present only when supplied through `dependencies`. */
  SplitText?: unknown
  Flip?: unknown
  DrawSVGPlugin?: unknown
  MorphSVGPlugin?: unknown
  MotionPathPlugin?: unknown
  root: Element
  scope: Element
  slots: Record<string, Element[]>
  parameters: Record<string, unknown>
  reduced: boolean
  debug: boolean
  recipe: MotionRecipe
}

export interface MotionRecipe {
  schemaVersion: '1'
  id: string
  version: string
  title: string
  description: string
  intent: string
  family: string
  tags: string[]
  root: { selector: string }
  slots: MotionRecipeSlot[]
  parameters: Record<string, MotionRecipeParameter>
  triggers: Array<{ type: MotionTriggerType; [key: string]: unknown }>
  timeline?: { steps: Array<Record<string, unknown>> }
  responsive?: Record<string, unknown>
  reducedMotion: { strategy: 'skip' | 'final' | 'custom'; [key: string]: unknown }
  noJs: { behavior: string; [key: string]: unknown }
  accessibility: { notes: string; [key: string]: unknown }
  performance: { class: MotionPerformanceClass; allowLayout?: boolean; [key: string]: unknown }
  dependencies: string[]
  preview: {
    fixture: string
    viewport?: 'compact' | 'standard' | 'wide' | 'scroll'
    activation?: 'auto' | 'manual'
    [key: string]: unknown
  }
  fixtures: MotionRecipeFixture[]
  setup?(context: MotionRecipeContext): void | false | (() => void) | { destroy(): void }
}

export interface MotionRecipeFixture {
  id: string
  label: string
  markup: string
  instructions?: string
  parameters?: Record<string, unknown>
}

/**
 * A recipe with only the fields the browser runtime reads. Authoring metadata
 * (title, description, intent, family, tags, accessibility, noJs, preview,
 * fixtures) is omitted so it never reaches a page bundle.
 */
export type MotionRuntimeRecipe =
  Omit<MotionRecipe, 'title' | 'description' | 'intent' | 'family' | 'tags' | 'accessibility' | 'noJs' | 'preview' | 'fixtures'>

export type MotionRegistryMode = 'complete' | 'runtime'

export interface MotionRegistryOptions {
  /** `runtime` accepts lean specs; `complete` (default) requires full manifests. */
  mode?: MotionRegistryMode
}

export interface MotionRegistry {
  mode: MotionRegistryMode
  register(recipe: MotionRecipe | MotionRuntimeRecipe): MotionRecipe
  has(id: string): boolean
  get(id: string): MotionRecipe | undefined
  list(): MotionRecipe[]
  resolve(ids?: string[]): MotionRecipe[]
  catalog(): { schemaVersion: '1'; count: number; recipes: Array<Record<string, unknown>> }
  validate(): { ok: boolean; issues: Array<Record<string, unknown>> }
}

export interface MotionRuntimeOptions {
  root?: Document | Element
  recipes?: MotionRecipe[]
  registry?: MotionRegistry
  debug?: boolean
  strict?: boolean
  autoMount?: boolean
  reducedMotionQuery?: string
  reducedMotion?: 'system' | 'reduce'
  parameterOverrides?: Record<string, Record<string, unknown>>
  dependencies?: { gsap?: unknown; ScrollTrigger?: unknown; SplitText?: unknown; Flip?: unknown; DrawSVGPlugin?: unknown; MorphSVGPlugin?: unknown; MotionPathPlugin?: unknown }
}

export interface MotionRuntime {
  gsap: unknown
  ScrollTrigger: unknown
  registry: MotionRegistry
  mount(): MotionRuntime
  mountRecipe(id: string, root?: Element, parameters?: Record<string, unknown>): string[]
  refresh(): void
  inspect(): Record<string, unknown>
  destroy(): void
}

export interface SyncedMotionOptions {
  root?: Document | Element
  debug?: boolean
  smoothScroll?: boolean | Record<string, unknown>
  revealStart?: string
  reducedMotionQuery?: string
  reducedMotion?: 'system' | 'reduce'
  parameterOverrides?: Record<string, Record<string, unknown>>
  dependencies?: MotionRuntimeOptions['dependencies']
  strict?: boolean
}

export interface SyncedMotionInstance {
  gsap: unknown
  ScrollTrigger: unknown
  smoothScroll?: unknown
  registry: MotionRegistry
  inspect(): Record<string, unknown>
  mountRecipe(id: string, root?: Element, parameters?: Record<string, unknown>): string[]
  refresh(): void
  destroy(): void
}

export declare const MOTION_RECIPE_SCHEMA_VERSION: '1'
export declare const MOTION_TRIGGER_TYPES: readonly MotionTriggerType[]
export declare class MotionRecipeValidationError extends TypeError {
  issues: string[]
  recipeId: string
}
export declare function defineMotionRecipe(recipe: MotionRecipe, options?: MotionRegistryOptions): Readonly<MotionRecipe>
export declare function validateMotionRecipe(recipe: unknown, options?: MotionRegistryOptions): { ok: boolean; issues: string[] }
export declare function createMotionRegistry(
  recipes?: Array<MotionRecipe | MotionRuntimeRecipe>,
  options?: MotionRegistryOptions,
): MotionRegistry
export declare function resolveMotionRecipes(registry: MotionRegistry, ids?: string[]): MotionRecipe[]
export declare const builtinMotionRecipes: readonly MotionRecipe[]
export declare function createBuiltinMotionRegistry(): MotionRegistry
export declare const builtinMotionSpecs: readonly MotionRuntimeRecipe[]
export declare function createRuntimeMotionRegistry(specs?: readonly MotionRuntimeRecipe[]): MotionRegistry
/** Plugin names the core does not import; supply them via `dependencies`. */
export declare const OPTIONAL_MOTION_PLUGINS: readonly string[]
export declare function compileMotionRecipe(recipe: MotionRecipe): Record<string, unknown>
export declare function createMotionRuntime(options?: MotionRuntimeOptions): MotionRuntime
export declare function createDefaultMotionRuntime(options?: MotionRuntimeOptions): MotionRuntime
export declare function createMotionService(registry: MotionRegistry): Record<string, (...args: any[]) => unknown>
export declare function createDefaultMotionService(): Record<string, (...args: any[]) => unknown>
export declare function filterMotionCatalog(recipes: Array<Record<string, any>>, filters?: { query?: string; family?: string; performance?: string }): Array<Record<string, any>>
export declare function coerceMotionParameter(parameter: MotionRecipeParameter, value: unknown): unknown
export declare function createMotionInspector(options?: { registry?: MotionRegistry; runtime?: MotionRuntime }): {
  catalog: ReturnType<MotionRegistry['catalog']>
  select(id: string, fixtureId?: string): Record<string, unknown>
  setParameter(name: string, value: unknown): Record<string, unknown>
  reset(): Record<string, unknown>
  attachRuntime(runtime?: MotionRuntime): Record<string, unknown>
  subscribe(listener: (snapshot: Record<string, unknown>) => void): () => void
  snapshot(): Record<string, unknown>
  destroy(): void
}
export declare function createSyncedMotion(options?: SyncedMotionOptions): SyncedMotionInstance
export declare function createLenisAdapter(options: Record<string, unknown>): unknown
export declare function createMarquees(options: Record<string, unknown>): Array<() => void>
export declare function createValueCounters(options: Record<string, unknown>): Array<() => void>
export declare function createProgressRings(options: Record<string, unknown>): Array<() => void>
export declare function createAmbientFloats(options: Record<string, unknown>): Array<() => void>
export declare function createLoopingLogoBelts(options: Record<string, unknown>): Array<() => void>
export declare function createFlipListReorders(options: Record<string, unknown>): Array<() => void>
export declare function createFlipCardDetails(options: Record<string, unknown>): Array<() => void>
export declare function createFlipFilterGrids(options: Record<string, unknown>): Array<() => void>
export declare function createFlipNavIndicators(options: Record<string, unknown>): Array<() => void>
export declare function createLayoutAccordionGrids(options: Record<string, unknown>): Array<() => void>
export declare function createSvgLineDraws(options: Record<string, unknown>): unknown[]
export declare function createSvgPathMorphs(options: Record<string, unknown>): Array<() => void>
export declare function createSvgIconStates(options: Record<string, unknown>): Array<() => void>
export declare function createSvgOrbits(options: Record<string, unknown>): unknown[]
export declare function createSvgSignatureReveals(options: Record<string, unknown>): unknown[]
export declare function createPageLoadHeroes(options: Record<string, unknown>): unknown[]
export declare function createPageLoadBrandMarks(options: Record<string, unknown>): unknown[]
export declare function createRouteFades(options: Record<string, unknown>): Array<() => void>
export declare function createRouteSharedMedia(options: Record<string, unknown>): Array<() => void>
export declare function createRouteScrollRestores(options: Record<string, unknown>): Array<() => void>
export declare function createDirectionalReveals(options: Record<string, unknown>): unknown[]
export declare function createScaleReveals(options: Record<string, unknown>): unknown[]
export declare function createClipWipeReveals(options: Record<string, unknown>): unknown[]
export declare function createCharacterShimmers(options: Record<string, unknown>): Array<() => void>
export declare function createTypewriterAnnouncements(options: Record<string, unknown>): Array<() => void>
export declare function createTextHighlightSweeps(options: Record<string, unknown>): unknown[]
export declare function createScrollProgressMeters(options: Record<string, unknown>): unknown[]
export declare function createScrollDepthStacks(options: Record<string, unknown>): unknown[]
export declare function createPinnedChapterCrossfades(options: Record<string, unknown>): Array<() => void>
export declare function createPinnedProductExplainers(options: Record<string, unknown>): Array<() => void>
export declare function createHorizontalGalleryScrubs(options: Record<string, unknown>): unknown[]
export declare function createHorizontalGallerySnaps(options: Record<string, unknown>): unknown[]
export declare function createHorizontalFeatureRails(options: Record<string, unknown>): unknown[]
export declare function createHorizontalLogoReels(options: Record<string, unknown>): unknown[]
export declare function createHorizontalComparisonSliders(options: Record<string, unknown>): Array<() => void>
export declare function createHoverLifts(options: Record<string, unknown>): Array<() => void>
export declare function createMagneticActions(options: Record<string, unknown>): Array<() => void>
export declare function createPointerSpotlights(options: Record<string, unknown>): Array<() => void>
export declare function createDialogOverlays(options: Record<string, unknown>): Array<() => void>
export declare function createCommandPalettes(options: Record<string, unknown>): Array<() => void>
export declare function createNavActiveIndicators(options: Record<string, unknown>): Array<() => void>
export declare function createAccordionDisclosures(options: Record<string, unknown>): Array<() => void>
export declare function createMediaClipReveals(options: Record<string, unknown>): unknown[]
export declare function createMediaCurtainSplits(options: Record<string, unknown>): unknown[]
export declare function createImageFocusPans(options: Record<string, unknown>): unknown[]
export declare function createVideoPosterPlayers(options: Record<string, unknown>): Array<() => void>
export declare function createExpandPanels(options: Record<string, unknown>): Array<() => void>
export declare function createFounderScenes(options: Record<string, unknown>): unknown[]
export declare function createHoverMedia(options: Record<string, unknown>): Array<() => void>
export declare function createMediaExpansions(options: Record<string, unknown>): unknown[]
export declare function createMenus(options: Record<string, unknown>): Array<() => void>
export declare function createParallax(options: Record<string, unknown>): unknown[]
export declare function createReveals(options: Record<string, unknown>): unknown[]
export declare function createScrollDrifts(options: Record<string, unknown>): unknown[]
export declare function createScrollExits(options: Record<string, unknown>): unknown[]
export declare function createScrollStatements(options: Record<string, unknown>): unknown[]
export declare function createScrollSteps(options: Record<string, unknown>): Array<() => void>
export declare function createSplitText(options: Record<string, unknown>): unknown[]
export declare function createStaggers(options: Record<string, unknown>): unknown[]
export declare function clampIndex(progress: number, length: number): number
export declare function setActiveState(elements: Element[], activeIndex: number, options?: Record<string, unknown>): void
export declare const defaults: Readonly<Record<string, unknown>>

