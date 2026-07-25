import type {
  MotionRuntime,
  MotionRuntimeOptions,
  SyncedMotionInstance,
  SyncedMotionOptions,
} from './index.js'

export * from './index.js'

/** `createSyncedMotion` with every optional GSAP plugin pre-registered. */
export declare function createSyncedMotion(options?: SyncedMotionOptions): SyncedMotionInstance
export declare function createDefaultMotionRuntime(options?: MotionRuntimeOptions): MotionRuntime
export declare const motionPlugins: Readonly<Record<string, unknown>>
