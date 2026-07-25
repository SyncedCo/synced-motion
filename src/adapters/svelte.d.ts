import type { MotionRuntime, MotionRuntimeOptions } from '../index.js'

export interface SvelteMotionAction {
  readonly runtime: MotionRuntime | undefined
  update(options?: Omit<MotionRuntimeOptions, 'root'>): void
  refresh(): void
  destroy(): void
}

export declare function syncedMotion(node: Element, options?: Omit<MotionRuntimeOptions, 'root'>): SvelteMotionAction
