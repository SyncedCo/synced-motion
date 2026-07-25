import '../../src/synced-flow.css'
import '../../src/styles.css'
import './preview.css'
import { createBuiltinMotionRegistry, createMotionRuntime } from '../../src/index.js'
import { motionPlugins } from '../../src/plugins.js'
import { renderPreviewError } from './preview-dom.js'

const query = new URLSearchParams(location.search)
const id = query.get('recipe')
const fixtureId = query.get('fixture')
const stage = document.querySelector('#preview-stage')
const title = document.querySelector('#preview-title')
const registry = createBuiltinMotionRegistry()
let runtime

function report(message, diagnostics) {
  parent.postMessage({ source: 'synced-motion-preview', message, diagnostics }, location.origin)
}

try {
  const recipe = registry.get(id)
  if (!recipe) throw new Error(`Unknown recipe "${id ?? ''}".`)
  const fixture = recipe.fixtures.find((entry) => entry.id === (fixtureId ?? recipe.preview.fixture))
  if (!fixture) throw new Error(`Unknown fixture "${fixtureId ?? ''}".`)
  const parameters = JSON.parse(query.get('parameters') ?? '{}')
  stage.innerHTML = fixture.markup
  document.title = `Preview: ${recipe.title}`
  title.textContent = `${recipe.title} preview`
  runtime = createMotionRuntime({
    root: document,
    recipes: [recipe],
    reducedMotion: query.get('reduced') === '1' ? 'reduce' : 'system',
    parameterOverrides: { [recipe.id]: parameters },
    // The gallery previews every recipe, so it needs every optional plugin.
    dependencies: motionPlugins,
  })
  const diagnostics = runtime.inspect()
  const message = diagnostics.errors.length
    ? `Preview error: ${diagnostics.errors[0].message}`
    : diagnostics.skipped.length ? `Preview skipped: ${diagnostics.skipped[0].reason === 'no-op' ? 'recipe produced no active behavior' : `missing ${diagnostics.skipped[0].slots.join(', ')}`}`
      : diagnostics.mounted.length === 0 ? 'Preview skipped: recipe produced no active behavior.'
        : `${query.get('reduced') === '1' ? 'Reduced-motion' : 'Motion'} preview ready.`
  report(message, diagnostics)
  document.fonts?.ready.then(() => runtime?.refresh())
} catch (error) {
  renderPreviewError(stage, error)
  report(`Preview error: ${error.message ?? error}`)
}

if (import.meta.hot) import.meta.hot.dispose(() => runtime?.destroy())
