import { validateMotionRecipe } from '../recipes/schema.js'

function terms(value) {
  return new Set(String(value).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))
}

function score(recipe, requested) {
  const searchable = terms([recipe.id, recipe.title, recipe.description, recipe.intent, recipe.family, ...recipe.tags].join(' '))
  let result = 0
  for (const term of requested) if (searchable.has(term)) result += 1
  return result
}

function selectorToken(selector) {
  const match = /^\[([a-zA-Z0-9_-]+)(?:=["']?([^\]"']+)["']?)?\]$/.exec(selector.trim())
  return match ? { attribute: match[1], value: match[2] } : undefined
}

function sourceHasSelector(markup, selector) {
  const token = selectorToken(selector)
  if (!token) return false
  const escaped = token.attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (token.value === undefined) return new RegExp(`\\s${escaped}(?:\\s*=|\\s|>|/|$)`, 'i').test(markup)
  const value = token.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\s${escaped}\\s*=\\s*["']${value}["']`, 'i').test(markup)
}

function elementRegions(markup, selector) {
  const regions = []
  const stack = []
  const tags = /<\s*(\/)?\s*([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g
  let match
  while ((match = tags.exec(markup))) {
    const closing = Boolean(match[1])
    const tag = match[2].toLowerCase()
    if (closing) {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        if (stack[index].tag !== tag) continue
        const [node] = stack.splice(index, 1)
        if (node.matches) regions.push(markup.slice(node.start, tags.lastIndex))
        break
      }
      continue
    }

    const node = { tag, start: match.index, matches: sourceHasSelector(` ${match[3]}`, selector) }
    const voidElement = Boolean(match[4]) || ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(tag)
    if (voidElement) {
      if (node.matches) regions.push(match[0])
    } else stack.push(node)
  }
  for (const node of stack) if (node.matches) regions.push(markup.slice(node.start))
  return regions
}

export function createMotionService(registry) {
  if (!registry || typeof registry.catalog !== 'function') throw new TypeError('A motion registry is required.')

  return Object.freeze({
    catalog() {
      return registry.catalog()
    },
    recipe(id) {
      const recipe = registry.get(id)
      if (!recipe) return undefined
      const { setup, ...manifest } = recipe
      return { ...manifest, implementation: typeof setup === 'function' ? 'custom' : 'declarative' }
    },
    suggest(brief, options = {}) {
      const requested = terms(brief)
      const limit = options.limit ?? 8
      return registry.list()
        .map((recipe) => ({ recipe, score: score(recipe, requested) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.recipe.id.localeCompare(b.recipe.id))
        .slice(0, limit)
        .map(({ recipe, score: relevance }) => ({ id: recipe.id, relevance, intent: recipe.intent, family: recipe.family }))
    },
    validate(input) {
      if (input) return validateMotionRecipe(input)
      return registry.validate()
    },
    scanMarkup(markup) {
      if (typeof markup !== 'string') throw new TypeError('Markup must be a string.')
      return {
        recipes: registry.list().flatMap((recipe) => elementRegions(markup, recipe.root.selector).map((region, index) => {
          const missingSlots = recipe.slots
            .filter((slot) => slot.name !== 'root' && slot.required !== false && !sourceHasSelector(region, slot.selector))
            .map((slot) => slot.name)
          return { id: recipe.id, instance: index, root: recipe.root.selector, missingSlots, ready: missingSlots.length === 0 }
        })),
      }
    },
    compose(brief, options = {}) {
      const suggestions = this.suggest(brief, { limit: options.limit ?? 5 })
      const ids = suggestions.map((suggestion) => suggestion.id)
      const plan = this.plan(ids)
      const scan = typeof options.markup === 'string' ? this.scanMarkup(options.markup) : undefined
      const highCost = plan.recipes.filter((recipe) => recipe.performance.class === 'high')
      const warnings = []
      if (highCost.length > (options.maxHighCost ?? 2)) warnings.push(`Plan includes ${highCost.length} high-cost recipes.`)
      for (const entry of scan?.recipes ?? []) {
        if (!entry.ready) warnings.push(`${entry.id} is missing required slots: ${entry.missingSlots.join(', ')}`)
      }
      return { schemaVersion: '1', brief, suggestions, plan, scan, warnings }
    },
    plan(ids) {
      const recipes = registry.resolve(ids)
      return {
        schemaVersion: '1',
        recipes: recipes.map((recipe) => ({
          id: recipe.id,
          root: recipe.root,
          slots: recipe.slots,
          parameters: Object.fromEntries(Object.entries(recipe.parameters).map(([name, value]) => [name, value.default])),
          performance: recipe.performance,
          reducedMotion: recipe.reducedMotion,
        })),
      }
    },
  })
}
