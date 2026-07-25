import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { createMotionController, resolveMotionRoot } from './shared.js'

gsap.registerPlugin(useGSAP)

export function useSyncedMotion(rootRef, options = {}, watch = []) {
  const controllerRef = useRef()
  useGSAP(() => {
    const root = resolveMotionRoot(rootRef)
    if (!root) return undefined
    const controller = createMotionController(root, options)
    controller.mount()
    controllerRef.current = controller
    return () => {
      controller.destroy()
      if (controllerRef.current === controller) controllerRef.current = undefined
    }
  }, { scope: rootRef, dependencies: watch, revertOnUpdate: true })
  return controllerRef
}
