import type { MotionRuntime, MotionRuntimeOptions } from '../index.js'

export interface WordPressMotionOptions extends Omit<MotionRuntimeOptions, 'root'> {
  document?: Document
  root?: Document | Element | string | (() => Document | Element | null | undefined)
}

export interface WordPressMotionController {
  readonly runtime: MotionRuntime | undefined
  mount(root?: Document | Element): MotionRuntime | undefined
  refresh(): void
  destroy(): void
}

export declare function createWordPressMotion(options?: WordPressMotionOptions): WordPressMotionController
