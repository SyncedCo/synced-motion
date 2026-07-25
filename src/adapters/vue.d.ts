import type { MotionRuntime, MotionRuntimeOptions } from '../index.js'

export interface VueMotionController {
  runtime: { value: MotionRuntime | undefined }
  mount(): Promise<MotionRuntime | undefined>
  refresh(): void
  destroy(): void
}

export declare function useSyncedMotion(
  rootRef: Element | { value?: Element | null },
  options?: Omit<MotionRuntimeOptions, 'root'>,
): VueMotionController
