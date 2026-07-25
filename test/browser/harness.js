// Test-only harness. Exposes a small imperative API on `window.motionHarness`
// so Playwright can mount a real recipe fixture in a real engine, inspect the
// runtime, and verify that teardown restores the authored DOM.
import '../../src/styles.css'
import { createBuiltinMotionRegistry, createMotionRuntime } from '../../src/index.js'
import { motionPlugins } from '../../src/plugins.js'

const registry = createBuiltinMotionRegistry()
const stage = document.querySelector('#stage')

let runtime

function reset() {
  runtime?.destroy()
  runtime = undefined
  stage.innerHTML = ''
}

window.motionHarness = {
  ids: () => registry.list().map((recipe) => recipe.id),

  families: () => [...new Set(registry.list().map((recipe) => recipe.family))],

  recipesByFamily(family) {
    return registry.list().filter((recipe) => recipe.family === family).map((recipe) => recipe.id)
  },

  /** Render a recipe's fixture and mount it. Returns runtime diagnostics. */
  mount(id, { reduced = false, fixtureId } = {}) {
    reset()
    const recipe = registry.get(id)
    if (!recipe) throw new Error(`Unknown recipe "${id}".`)
    const fixture = recipe.fixtures.find((entry) => entry.id === (fixtureId ?? recipe.preview.fixture))
    stage.innerHTML = fixture.markup

    runtime = createMotionRuntime({
      root: document,
      recipes: [recipe],
      reducedMotion: reduced ? 'reduce' : 'system',
      dependencies: motionPlugins,
      strict: false,
    })
    return runtime.inspect()
  },

  inspect: () => runtime?.inspect(),

  /** Serialise the stage so teardown can be compared against the authored DOM. */
  stageHtml: () => stage.innerHTML,

  /** Visibility and geometry of the first element matching a selector. */
  measure(selector) {
    const element = stage.querySelector(selector) ?? stage.firstElementChild
    if (!element) return undefined
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return {
      opacity: Number(style.opacity),
      visibility: style.visibility,
      display: style.display,
      transform: style.transform,
      width: rect.width,
      height: rect.height,
      top: rect.top,
    }
  },

  /** Text content, used to prove motion never removes readable content. */
  text: () => stage.textContent.replace(/\s+/g, ' ').trim(),

  /**
   * Perceivable content: visible text plus accessible names. Graphics-only
   * recipes (SVG draws, orbits) carry their meaning in aria-label rather than
   * text nodes, and both count as content a user can still get to.
   */
  perceivableContent() {
    const text = stage.textContent.replace(/\s+/g, ' ').trim()
    const labels = [...stage.querySelectorAll('[aria-label], title, img[alt]')]
      .map((element) => element.getAttribute('aria-label') ?? element.getAttribute('alt') ?? element.textContent)
      .filter(Boolean)
      .join(' ')
      .trim()
    return `${text} ${labels}`.trim()
  },

  destroy() {
    runtime?.destroy()
    runtime = undefined
  },

  reset,
}

document.documentElement.dataset.harnessReady = 'true'
