import { createBuiltinMotionRegistry } from './recipes/builtins.js'
import { createMotionService } from './services/motion-service.js'

export function createDefaultMotionService() {
  return createMotionService(createBuiltinMotionRegistry())
}
