import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

/**
 * Every optional GSAP plugin the built-in recipes can use.
 *
 * Importing this module pulls all five plugins into your bundle. Import the
 * individual plugins instead when you only need some of them:
 *
 * ```js
 * import { SplitText } from 'gsap/SplitText'
 * createSyncedMotion({ dependencies: { SplitText } })
 * ```
 */
export const motionPlugins = Object.freeze({
  SplitText,
  Flip,
  DrawSVGPlugin,
  MorphSVGPlugin,
  MotionPathPlugin,
})

export { SplitText, Flip, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin }
