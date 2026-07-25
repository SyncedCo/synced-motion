import type { MotionRuntime, MotionRuntimeOptions } from '../index.js'

export interface AstroMotionOptions extends Omit<MotionRuntimeOptions, 'root'> {
  document?: Document
  root?: Document | Element | string | (() => Document | Element | null | undefined)
}

export interface AstroMotionController {
  readonly runtime: MotionRuntime | undefined
  mount(): MotionRuntime | undefined
  refresh(): void
  destroy(): void
}

export declare function createAstroMotion(options?: AstroMotionOptions): AstroMotionController
