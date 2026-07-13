import '../src/synced-flow.css'
import '../src/styles.css'
import './showcase.css'
import { createSyncedMotion } from '../src/index.js'

const motion = createSyncedMotion({ smoothScroll: true })

if (import.meta.env.DEV) {
  window.syncedMotion = motion
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => motion.destroy())
}
