import '../../src/synced-flow.css'
import '../../src/styles.css'
import './gallery.css'
import {
  createBuiltinMotionRegistry,
  createMotionInspector,
  filterMotionCatalog,
} from '../../src/index.js'
import { restoreRecipeLinkFocus } from './gallery-state.js'

const registry = createBuiltinMotionRegistry()
const inspector = createMotionInspector({ registry })
const recipes = inspector.catalog.recipes
const elements = {
  filters: document.querySelector('#gallery-filters'),
  search: document.querySelector('#recipe-search'),
  family: document.querySelector('#family-filter'),
  performance: document.querySelector('#performance-filter'),
  count: document.querySelector('#recipe-count'),
  grid: document.querySelector('#recipe-grid'),
  empty: document.querySelector('#recipe-empty'),
  inspector: document.querySelector('#recipe-inspector'),
}
let replay = 0

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
const titleCase = (value) => value.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')
const params = () => new URLSearchParams(location.search)

for (const family of [...new Set(recipes.map((recipe) => recipe.family))].sort()) {
  elements.family.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(family)}">${escapeHtml(titleCase(family))}</option>`)
}

function syncFiltersFromUrl() {
  const query = params()
  elements.search.value = query.get('q') ?? ''
  elements.family.value = query.get('family') ?? ''
  elements.performance.value = query.get('performance') ?? ''
}

function recipeCard(recipe, selected) {
  const url = new URL(location.href)
  url.searchParams.set('recipe', recipe.id)
  return `<article class="sf-card sf-stack motion-recipe-card" data-recipe-id="${escapeHtml(recipe.id)}" ${selected ? 'aria-current="true"' : ''}>
    <div class="motion-recipe-card__meta"><span class="sf-badge">${escapeHtml(titleCase(recipe.family))}</span><span class="sf-badge">${escapeHtml(recipe.performance.class)} cost</span></div>
    <div class="sf-stack"><p class="sf-meta"><code>${escapeHtml(recipe.id)}</code></p><h3 class="sf-text-h3">${escapeHtml(recipe.title)}</h3><p>${escapeHtml(recipe.intent)}</p></div>
    <a class="sf-button motion-recipe-card__action" href="${escapeHtml(`${url.pathname}${url.search}`)}" data-inspect-recipe="${escapeHtml(recipe.id)}">Inspect recipe</a>
  </article>`
}

function renderCatalog() {
  const selected = params().get('recipe')
  const filtered = filterMotionCatalog(recipes, {
    query: elements.search.value,
    family: elements.family.value,
    performance: elements.performance.value,
  })
  elements.grid.innerHTML = filtered.map((recipe) => recipeCard(recipe, recipe.id === selected)).join('')
  elements.count.textContent = `${filtered.length} of ${recipes.length} recipes shown.`
  elements.empty.hidden = filtered.length > 0
}

function parameterControl(name, parameter, value) {
  const id = `motion-parameter-${name}`
  if (parameter.type === 'boolean') return `<label class="sf-check"><input id="${id}" name="${escapeHtml(name)}" type="checkbox" ${value ? 'checked' : ''}><span>${escapeHtml(titleCase(name))}</span></label>`
  if (parameter.type === 'enum') return `<label class="sf-field"><span class="sf-label">${escapeHtml(titleCase(name))}</span><select id="${id}" class="sf-select" name="${escapeHtml(name)}">${parameter.values.map((entry) => `<option ${entry === value ? 'selected' : ''}>${escapeHtml(entry)}</option>`).join('')}</select></label>`
  const type = parameter.type === 'number' ? 'number' : 'text'
  const bounds = parameter.type === 'number' ? `min="${parameter.min}" max="${parameter.max}" step="any"` : ''
  return `<label class="sf-field"><span class="sf-label">${escapeHtml(titleCase(name))}</span><input id="${id}" class="sf-input" name="${escapeHtml(name)}" type="${type}" value="${escapeHtml(value)}" ${bounds}></label>`
}

function previewUrl(snapshot, standalone = false) {
  const url = new URL('./preview.html', location.href)
  url.searchParams.set('recipe', snapshot.recipe.id)
  url.searchParams.set('fixture', snapshot.fixture.id)
  url.searchParams.set('parameters', JSON.stringify(snapshot.parameters))
  if (document.querySelector('#simulate-reduced')?.checked) url.searchParams.set('reduced', '1')
  url.searchParams.set('replay', String(replay))
  return standalone ? url.href : `${url.pathname}${url.search}`
}

function renderInspector(snapshot, focus = false) {
  const { recipe, fixture, parameters } = snapshot
  if (!recipe) return
  const systemReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  elements.inspector.innerHTML = `<div class="sf-stack">
    <a class="sf-link motion-inspector__back" href="${escapeHtml(location.pathname)}" data-close-inspector>← Back to recipes</a>
    <div><p class="sf-kicker">${escapeHtml(titleCase(recipe.family))}</p><h2 id="inspector-title" class="sf-text-h2" tabindex="-1">${escapeHtml(recipe.title)}</h2><p><code>${escapeHtml(recipe.id)}</code></p></div>
    <p>${escapeHtml(recipe.description)}</p>
    <iframe id="motion-preview" class="motion-inspector__preview" title="Preview: ${escapeHtml(recipe.title)}" src="${escapeHtml(previewUrl(snapshot))}"></iframe>
    <p id="preview-status" class="sf-status" role="status" aria-live="polite">Preview mounting…</p>
    <label class="sf-check"><input id="simulate-reduced" type="checkbox" ${systemReduced ? 'checked disabled' : ''}><span>${systemReduced ? 'Reduced motion active from system preference' : 'Simulate reduced motion'}</span></label>
    ${Object.keys(recipe.parameters).length ? `<form id="motion-parameters"><fieldset class="motion-parameter-list"><legend class="sf-text-h4">Parameters</legend>${Object.entries(recipe.parameters).map(([name, parameter]) => parameterControl(name, parameter, parameters[name])).join('')}</fieldset></form>` : ''}
    <div class="motion-inspector__actions">
      <button class="sf-button" type="button" data-gallery-action="replay">Replay</button>
      <button class="sf-button sf-button--outline" type="button" data-gallery-action="reset">Reset parameters</button>
      <button class="sf-button sf-button--outline" type="button" data-gallery-action="copy-markup">Copy markup</button>
      <button class="sf-button sf-button--outline" type="button" data-gallery-action="copy-code">Copy integration</button>
      <button class="sf-button sf-button--outline" type="button" data-gallery-action="copy-json">Copy JSON</button>
      <a id="standalone-preview" class="sf-button sf-button--outline" href="${escapeHtml(previewUrl(snapshot, true))}" target="_blank" rel="noopener">Open standalone</a>
    </div>
    <dl class="motion-inspector__definition">
      <dt>Intent</dt><dd>${escapeHtml(recipe.intent)}</dd>
      <dt>Triggers</dt><dd>${escapeHtml(recipe.triggers.map((trigger) => trigger.type).join(', '))}</dd>
      <dt>Root</dt><dd><code>${escapeHtml(recipe.root.selector)}</code></dd>
      <dt>Slots</dt><dd>${escapeHtml(recipe.slots.filter((slot) => slot.name !== 'root').map((slot) => `${slot.name}${slot.required === false ? ' (optional)' : ''}`).join(', ') || 'Root only')}</dd>
      <dt>Dependencies</dt><dd>${escapeHtml(recipe.dependencies.join(', ') || 'Browser APIs only')}</dd>
      <dt>Performance</dt><dd>${escapeHtml(recipe.performance.class)} cost</dd>
      <dt>Reduced motion</dt><dd>${escapeHtml(recipe.reducedMotion.strategy)} — ${escapeHtml(recipe.reducedMotion.behavior)}</dd>
      <dt>No JavaScript</dt><dd>${escapeHtml(recipe.noJs.behavior)}</dd>
      <dt>Accessibility</dt><dd>${escapeHtml(recipe.accessibility.notes)}</dd>
    </dl>
  </div>`
  document.body.setAttribute('data-recipe-selected', 'true')
  if (focus) elements.inspector.querySelector('#inspector-title')?.focus()
}

function selectFromUrl({ focus = false } = {}) {
  const id = params().get('recipe')
  if (!id) {
    document.body.removeAttribute('data-recipe-selected')
    elements.inspector.innerHTML = '<div class="sf-stack"><p class="sf-kicker">Inspector</p><h2 id="inspector-title" class="sf-text-h2" tabindex="-1">Choose a recipe</h2><p>Select any catalog card to inspect its live fixture, semantic contract, fallbacks, and integration code.</p></div>'
    renderCatalog()
    return
  }
  try { renderInspector(inspector.select(id), focus) }
  catch {
    elements.inspector.innerHTML = '<div class="sf-empty-state"><h2 id="inspector-title" class="sf-text-h3">Recipe unavailable</h2><p>This recipe ID is not in the current production catalog.</p><a class="sf-button" href="./">Return to all recipes</a></div>'
  }
  renderCatalog()
}

function updatePreview() {
  const snapshot = inspector.snapshot()
  const frame = document.querySelector('#motion-preview')
  if (frame && snapshot.recipe) frame.src = previewUrl(snapshot)
  const standalone = document.querySelector('#standalone-preview')
  if (standalone && snapshot.recipe) standalone.href = previewUrl(snapshot, true)
  const status = document.querySelector('#preview-status')
  if (status) status.textContent = 'Preview mounting…'
}

async function copy(value) {
  const status = document.querySelector('#preview-status')
  try {
    await navigator.clipboard.writeText(value)
    if (status) status.textContent = 'Copied to clipboard.'
  } catch {
    if (status) status.textContent = 'Copy failed. Select the content manually.'
  }
}

elements.filters.addEventListener('input', () => {
  const url = new URL(location.href)
  for (const [name, value] of [['q', elements.search.value], ['family', elements.family.value], ['performance', elements.performance.value]]) {
    value ? url.searchParams.set(name, value) : url.searchParams.delete(name)
  }
  history.replaceState({}, '', url)
  renderCatalog()
})
elements.filters.addEventListener('reset', () => setTimeout(() => { history.replaceState({}, '', location.pathname); selectFromUrl() }))
elements.grid.addEventListener('click', (event) => {
  const link = event.target.closest('[data-inspect-recipe]')
  if (!link) return
  event.preventDefault()
  const url = new URL(location.href)
  url.searchParams.set('recipe', link.dataset.inspectRecipe)
  history.pushState({}, '', url)
  selectFromUrl({ focus: true })
})
elements.inspector.addEventListener('click', (event) => {
  const close = event.target.closest('[data-close-inspector]')
  if (close) {
    event.preventDefault()
    const originatingRecipe = params().get('recipe')
    const url = new URL(location.href)
    url.searchParams.delete('recipe')
    history.pushState({}, '', url)
    selectFromUrl()
    restoreRecipeLinkFocus(elements.grid, originatingRecipe)
    return
  }
  const action = event.target.closest('[data-gallery-action]')?.dataset.galleryAction
  if (!action) return
  const snapshot = inspector.snapshot()
  if (action === 'replay') { replay += 1; updatePreview() }
  if (action === 'reset') { renderInspector(inspector.reset()); updatePreview() }
  if (action === 'copy-markup') copy(snapshot.fixture.markup)
  if (action === 'copy-code') copy(`${snapshot.fixture.markup}\n\nimport { createSyncedMotion } from '@syncedco/motion'\nconst motion = createSyncedMotion()\n// motion.destroy() on route disposal`)
  if (action === 'copy-json') copy(JSON.stringify(snapshot.recipe, null, 2))
})
elements.inspector.addEventListener('change', (event) => {
  if (event.target.id === 'simulate-reduced') { updatePreview(); return }
  if (!event.target.closest('#motion-parameters')) return
  inspector.setParameter(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value)
  updatePreview()
})
window.addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.data?.source !== 'synced-motion-preview') return
  const status = document.querySelector('#preview-status')
  if (status) status.textContent = event.data.message
})
window.addEventListener('popstate', () => { syncFiltersFromUrl(); selectFromUrl() })

syncFiltersFromUrl()
selectFromUrl()
