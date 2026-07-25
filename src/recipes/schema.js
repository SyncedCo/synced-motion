export const MOTION_RECIPE_SCHEMA_VERSION = '1'

export const MOTION_TRIGGER_TYPES = Object.freeze([
  'load',
  'viewport',
  'scroll',
  'hover',
  'focus',
  'pointer',
  'click',
  'route',
  'state',
])

const PERFORMANCE_CLASSES = new Set(['low', 'medium', 'high'])
const PARAMETER_TYPES = new Set(['boolean', 'number', 'string', 'enum'])
const STEP_ACTIONS = new Set(['set', 'to', 'from', 'fromTo'])
const PREVIEW_VIEWPORTS = new Set(['compact', 'standard', 'wide', 'scroll'])
const PREVIEW_ACTIVATIONS = new Set(['auto', 'manual'])

export class MotionRecipeValidationError extends TypeError {
  constructor(issues, recipeId = 'unknown') {
    super(`Invalid motion recipe "${recipeId}": ${issues.join('; ')}`)
    this.name = 'MotionRecipeValidationError'
    this.issues = issues
    this.recipeId = recipeId
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]))
  return value
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const entry of Object.values(value)) deepFreeze(entry)
  return value
}

function validateSlots(slots, issues) {
  if (!Array.isArray(slots)) {
    issues.push('slots must be an array')
    return
  }

  const names = new Set()
  for (const slot of slots) {
    if (!isRecord(slot) || typeof slot.name !== 'string' || !slot.name.trim()) {
      issues.push('every slot requires a non-empty name')
      continue
    }
    if (names.has(slot.name)) issues.push(`slot name "${slot.name}" is duplicated`)
    names.add(slot.name)
    if (slot.name !== 'root' && typeof slot.selector !== 'string') {
      issues.push(`slot "${slot.name}" requires a selector`)
    }
    if (typeof slot.selector === 'string' && /(^|,)\s*(html|body|:root)\b/.test(slot.selector)) {
      issues.push(`slot "${slot.name}" may not target outside its recipe root`)
    }
  }
}

function validateParameters(parameters, issues) {
  if (!isRecord(parameters)) {
    issues.push('parameters must be an object')
    return
  }

  for (const [name, parameter] of Object.entries(parameters)) {
    if (!isRecord(parameter) || !PARAMETER_TYPES.has(parameter.type)) {
      issues.push(`parameter "${name}" requires a supported type`)
      continue
    }
    if (parameter.default === undefined) issues.push(`parameter "${name}" requires a default`)
    if (parameter.type === 'number') {
      if (!Number.isFinite(parameter.min) || !Number.isFinite(parameter.max)) {
        issues.push(`number parameter "${name}" requires finite min and max values`)
      } else if (parameter.min > parameter.max) {
        issues.push(`number parameter "${name}" has min greater than max`)
      }
    }
    if (parameter.type === 'enum' && (!Array.isArray(parameter.values) || !parameter.values.length)) {
      issues.push(`enum parameter "${name}" requires values`)
    }
  }
}

function validateTimeline(timeline, issues) {
  if (timeline === undefined) return
  if (!isRecord(timeline) || !Array.isArray(timeline.steps)) {
    issues.push('timeline requires a steps array')
    return
  }
  for (const [index, step] of timeline.steps.entries()) {
    if (!isRecord(step) || !STEP_ACTIONS.has(step.action)) {
      issues.push(`timeline step ${index} requires a supported action`)
    }
    if (typeof step?.target !== 'string') issues.push(`timeline step ${index} requires a target slot`)
    if (step?.action === 'fromTo' && (!isRecord(step.from) || !isRecord(step.to))) {
      issues.push(`timeline step ${index} fromTo requires from and to values`)
    } else if (step?.action !== 'fromTo' && !isRecord(step?.vars)) {
      issues.push(`timeline step ${index} requires vars`)
    }
  }
}

function validParameterValue(parameter, value) {
  if (parameter.type === 'boolean') return typeof value === 'boolean'
  if (parameter.type === 'string') return typeof value === 'string'
  if (parameter.type === 'enum') return parameter.values.includes(value)
  return Number.isFinite(value) && value >= parameter.min && value <= parameter.max
}

function validateFixtures(recipe, issues) {
  if (!isRecord(recipe.preview) || typeof recipe.preview.fixture !== 'string' || !recipe.preview.fixture.trim()) {
    issues.push('preview.fixture must reference a fixture id')
  }
  if (recipe.preview?.viewport !== undefined && !PREVIEW_VIEWPORTS.has(recipe.preview.viewport)) {
    issues.push('preview.viewport must be compact, standard, wide, or scroll')
  }
  if (recipe.preview?.activation !== undefined && !PREVIEW_ACTIVATIONS.has(recipe.preview.activation)) {
    issues.push('preview.activation must be auto or manual')
  }
  if (!Array.isArray(recipe.fixtures) || !recipe.fixtures.length) {
    issues.push('fixtures must contain at least one fixture')
    return
  }

  const ids = new Set()
  for (const fixture of recipe.fixtures) {
    if (!isRecord(fixture)) {
      issues.push('every fixture must be an object')
      continue
    }
    if (typeof fixture.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fixture.id)) {
      issues.push('every fixture id must use lowercase kebab-case')
    } else if (ids.has(fixture.id)) issues.push(`fixture id "${fixture.id}" is duplicated`)
    else ids.add(fixture.id)
    if (typeof fixture.label !== 'string' || !fixture.label.trim()) issues.push(`fixture "${fixture.id ?? 'unknown'}" requires a label`)
    if (typeof fixture.markup !== 'string' || !fixture.markup.trim()) issues.push(`fixture "${fixture.id ?? 'unknown'}" requires markup`)
    if (fixture.parameters !== undefined && !isRecord(fixture.parameters)) {
      issues.push(`fixture "${fixture.id ?? 'unknown'}" parameters must be an object`)
    } else {
      for (const [name, value] of Object.entries(fixture.parameters ?? {})) {
        const parameter = recipe.parameters?.[name]
        if (!parameter) issues.push(`fixture "${fixture.id}" uses unknown parameter "${name}"`)
        else if (!validParameterValue(parameter, value)) issues.push(`fixture "${fixture.id}" has invalid value for parameter "${name}"`)
      }
    }
  }
  if (typeof recipe.preview?.fixture === 'string' && !ids.has(recipe.preview.fixture)) {
    issues.push(`preview.fixture "${recipe.preview.fixture}" does not exist`)
  }
}

/**
 * Validate a motion recipe.
 *
 * `mode: 'complete'` (the default) requires the full manifest, including the
 * prose, preview and fixture metadata that documentation tooling depends on.
 * `mode: 'runtime'` validates only what the browser runtime actually reads, so
 * lean specs can be mounted without shipping authoring metadata to visitors.
 */
export function validateMotionRecipe(recipe, options = {}) {
  const mode = options.mode ?? 'complete'
  if (mode !== 'complete' && mode !== 'runtime') throw new TypeError(`Unknown motion recipe validation mode "${mode}".`)
  const complete = mode === 'complete'
  const issues = []
  if (!isRecord(recipe)) return { ok: false, issues: ['recipe must be an object'] }

  if (recipe.schemaVersion !== MOTION_RECIPE_SCHEMA_VERSION) issues.push(`schemaVersion must be "${MOTION_RECIPE_SCHEMA_VERSION}"`)
  const requiredStrings = complete
    ? ['id', 'version', 'title', 'description', 'intent', 'family']
    : ['id', 'version']
  for (const field of requiredStrings) {
    if (typeof recipe[field] !== 'string' || !recipe[field].trim()) issues.push(`${field} must be a non-empty string`)
  }
  if (typeof recipe.id === 'string' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.id)) {
    issues.push('id must use lowercase kebab-case')
  }
  if (complete && !Array.isArray(recipe.tags)) issues.push('tags must be an array')
  if (!isRecord(recipe.root) || typeof recipe.root.selector !== 'string' || !recipe.root.selector.trim()) {
    issues.push('root.selector must be a non-empty string')
  } else if (/(^|,)\s*(html|body|:root)\b/.test(recipe.root.selector)) {
    issues.push('root.selector may not target html, body, or :root')
  }

  validateSlots(recipe.slots, issues)
  validateParameters(recipe.parameters, issues)

  if (!Array.isArray(recipe.triggers) || !recipe.triggers.length) {
    issues.push('triggers must contain at least one trigger')
  } else {
    for (const trigger of recipe.triggers) {
      if (!isRecord(trigger) || !MOTION_TRIGGER_TYPES.includes(trigger.type)) {
        issues.push('every trigger requires a supported type')
      }
    }
  }

  if (!isRecord(recipe.reducedMotion) || !['skip', 'final', 'custom'].includes(recipe.reducedMotion.strategy)) {
    issues.push('reducedMotion.strategy must be skip, final, or custom')
  }
  if (complete && (!isRecord(recipe.noJs) || typeof recipe.noJs.behavior !== 'string')) {
    issues.push('noJs.behavior is required')
  }
  if (complete && (!isRecord(recipe.accessibility) || typeof recipe.accessibility.notes !== 'string')) {
    issues.push('accessibility.notes is required')
  }
  if (!isRecord(recipe.performance) || !PERFORMANCE_CLASSES.has(recipe.performance.class)) {
    issues.push('performance.class must be low, medium, or high')
  }
  if (!Array.isArray(recipe.dependencies)) issues.push('dependencies must be an array')
  if (complete) validateFixtures(recipe, issues)
  if (typeof recipe.setup !== 'function' && recipe.timeline === undefined) {
    issues.push('recipe requires setup(context) or a declarative timeline')
  }
  if (typeof recipe.setup !== 'function' && recipe.reducedMotion?.strategy === 'custom' && !recipe.reducedMotion?.timeline) {
    issues.push('declarative custom reduced motion requires reducedMotion.timeline')
  }
  validateTimeline(recipe.timeline, issues)
  if (recipe.reducedMotion?.timeline) validateTimeline(recipe.reducedMotion.timeline, issues)

  return { ok: issues.length === 0, issues }
}

export function defineMotionRecipe(recipe, options = {}) {
  const result = validateMotionRecipe(recipe, options)
  if (!result.ok) throw new MotionRecipeValidationError(result.issues, recipe?.id)

  const cloned = cloneValue(recipe)
  cloned.slots = cloned.slots.map((slot) => ({ required: true, multiple: false, ...slot }))
  return deepFreeze(cloned)
}
