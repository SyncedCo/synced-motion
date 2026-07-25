import { createBuiltinMotionRegistry } from './recipes/builtins.js'
import { createMotionService } from './services/motion-service.js'

export function filterMotionCatalog(recipes, filters = {}) {
  const query = String(filters.query ?? '').trim().toLowerCase()
  return recipes.filter((recipe) => {
    if (filters.family && recipe.family !== filters.family) return false
    if (filters.performance && recipe.performance.class !== filters.performance) return false
    if (!query) return true
    return [recipe.id, recipe.title, recipe.intent, recipe.description, recipe.family, ...recipe.tags]
      .join(' ').toLowerCase().includes(query)
  })
}

export function coerceMotionParameter(parameter, value) {
  if (parameter.type === 'boolean') return value === true || value === 'true' || value === 'on'
  if (parameter.type === 'number') {
    const number = Number(value)
    if (!Number.isFinite(number)) throw new TypeError('Expected a finite number.')
    return Math.min(parameter.max, Math.max(parameter.min, number))
  }
  if (parameter.type === 'enum') {
    if (!parameter.values.includes(value)) throw new TypeError(`Expected one of: ${parameter.values.join(', ')}.`)
    return value
  }
  return String(value)
}

export function createMotionInspector({ registry = createBuiltinMotionRegistry(), runtime } = {}) {
  const service = createMotionService(registry)
  const listeners = new Set()
  let selectedId
  let selectedFixture
  let parameters = {}
  let currentRuntime = runtime

  const notify = () => {
    const value = inspector.snapshot()
    listeners.forEach((listener) => listener(value))
    return value
  }
  const inspector = Object.freeze({
    catalog: service.catalog(),
    select(id, fixtureId) {
      const recipe = registry.get(id)
      if (!recipe) throw new Error(`Unknown motion recipe "${id}".`)
      const fixture = recipe.fixtures.find((entry) => entry.id === (fixtureId ?? recipe.preview.fixture))
      if (!fixture) throw new Error(`Unknown fixture "${fixtureId}" for recipe "${id}".`)
      selectedId = id
      selectedFixture = fixture.id
      parameters = Object.fromEntries(Object.entries(recipe.parameters).map(([name, parameter]) => [name, fixture.parameters?.[name] ?? parameter.default]))
      return notify()
    },
    setParameter(name, value) {
      const recipe = registry.get(selectedId)
      const parameter = recipe?.parameters[name]
      if (!parameter) throw new Error(`Unknown parameter "${name}".`)
      parameters = { ...parameters, [name]: coerceMotionParameter(parameter, value) }
      return notify()
    },
    reset() {
      if (!selectedId) return inspector.snapshot()
      return inspector.select(selectedId, selectedFixture)
    },
    attachRuntime(nextRuntime) {
      currentRuntime = nextRuntime
      return notify()
    },
    subscribe(listener) {
      if (typeof listener !== 'function') throw new TypeError('Inspector listener must be a function.')
      listeners.add(listener)
      listener(inspector.snapshot())
      return () => listeners.delete(listener)
    },
    snapshot() {
      const recipe = selectedId ? service.recipe(selectedId) : undefined
      const fixture = recipe?.fixtures.find((entry) => entry.id === selectedFixture)
      return {
        selectedId,
        fixture,
        parameters: { ...parameters },
        recipe,
        diagnostics: currentRuntime?.inspect?.() ?? { active: false, mounted: [], skipped: [], errors: [] },
      }
    },
    destroy() {
      listeners.clear()
      currentRuntime = undefined
    },
  })
  return inspector
}
