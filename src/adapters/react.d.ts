import type { MotionRuntime, MotionRuntimeOptions } from '../index.js'

export declare function useSyncedMotion(
  rootRef: { current: Element | null },
  options?: Omit<MotionRuntimeOptions, 'root'>,
  watch?: readonly unknown[],
): { readonly current: MotionRuntime | undefined }
