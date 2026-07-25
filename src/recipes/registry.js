import { defineMotionRecipe, validateMotionRecipe } from './schema.js'

function publicRecipe(recipe) {
  const { setup, ...manifest } = recipe
  return {
    ...manifest,
    implementation: typeof setup === 'function' ? 'custom' : 'declarative',
  }
}

/**
 * @param {object[]} initialRecipes
 * @param {{ mode?: 'complete' | 'runtime' }} [options]
 *   `runtime` accepts lean specs that omit prose and fixture metadata. The
 *   browser runtime uses it; documentation tooling uses the default.
 */
export function createMotionRegistry(initialRecipes = [], options = {}) {
  const mode = options.mode ?? 'complete'
  const recipes = new Map()

  const register = (input) => {
    const recipe = defineMotionRecipe(input, { mode })
    if (recipes.has(recipe.id)) throw new Error(`Motion recipe "${recipe.id}" is already registered.`)
    recipes.set(recipe.id, recipe)
    return recipe
  }

  initialRecipes.forEach(register)

  return Object.freeze({
    register,
    has(id) {
      return recipes.has(id)
    },
    get(id) {
      return recipes.get(id)
    },
    list() {
      return [...recipes.values()]
    },
    resolve(ids) {
      const requested = ids ?? [...recipes.keys()]
      return requested.map((id) => {
        const recipe = recipes.get(id)
        if (!recipe) throw new Error(`Unknown motion recipe "${id}".`)
        return recipe
      })
    },
    mode,
    catalog() {
      return {
        schemaVersion: '1',
        count: recipes.size,
        recipes: [...recipes.values()].map(publicRecipe),
      }
    },
    validate() {
      const issues = []
      for (const recipe of recipes.values()) {
        const result = validateMotionRecipe(recipe, { mode })
        if (!result.ok) issues.push({ id: recipe.id, issues: result.issues })
      }
      return { ok: issues.length === 0, issues }
    },
  })
}

export function resolveMotionRecipes(registry, ids) {
  if (!registry || typeof registry.resolve !== 'function') throw new TypeError('A motion registry is required.')
  return registry.resolve(ids)
}
