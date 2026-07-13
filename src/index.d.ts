export interface SyncedMotionOptions {
  root?: Document | Element
  debug?: boolean
  smoothScroll?: boolean | Record<string, unknown>
  revealStart?: string
  reducedMotionQuery?: string
}

export interface SyncedMotionInstance {
  gsap: unknown
  ScrollTrigger: unknown
  smoothScroll?: unknown
  refresh(): void
  destroy(): void
}

export declare function createSyncedMotion(options?: SyncedMotionOptions): SyncedMotionInstance
export declare function createLenisAdapter(options: Record<string, unknown>): unknown
export declare function clampIndex(progress: number, length: number): number
export declare function setActiveState(elements: Element[], activeIndex: number, options?: Record<string, unknown>): void
export declare const defaults: Readonly<Record<string, unknown>>

