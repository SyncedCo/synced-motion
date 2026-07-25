const FORBIDDEN_VARS = new Set(['height', 'left', 'margin', 'padding', 'top', 'width'])

function selectRoots(root, selector) {
  const roots = []
  if (root instanceof Element && root.matches(selector)) roots.push(root)
  roots.push(...root.querySelectorAll(selector))
  return [...new Set(roots)]
}

function selectSlots(recipe, recipeRoot) {
  const slots = { root: [recipeRoot] }
  const missing = []

  for (const slot of recipe.slots) {
    if (slot.name === 'root') continue
    const matches = [...recipeRoot.querySelectorAll(slot.selector)]
    slots[slot.name] = matches
    if (slot.required !== false && matches.length === 0) missing.push(slot.name)
    if (!slot.multiple && matches.length > 1) slots[slot.name] = matches.slice(0, 1)
  }

  return { slots, missing }
}

function validateStepProperties(recipe) {
  const issues = []
  for (const [timelineName, timeline] of [['timeline', recipe.timeline], ['reducedMotion.timeline', recipe.reducedMotion?.timeline]]) {
    for (const [index, step] of (timeline?.steps ?? []).entries()) {
      const values = step.action === 'fromTo' ? { ...step.from, ...step.to } : step.vars
      for (const property of Object.keys(values ?? {})) {
        if (FORBIDDEN_VARS.has(property) && recipe.performance.allowLayout !== true) {
          issues.push(`${timelineName} step ${index} animates layout property "${property}" without performance.allowLayout`)
        }
      }
    }
  }
  return issues
}

function createTimelineSetup(recipe) {
  return ({ gsap, ScrollTrigger, root, slots, reduced, parameters }) => {
    if (reduced && recipe.reducedMotion.strategy !== 'custom') return undefined
    const authoredTimeline = reduced ? recipe.reducedMotion.timeline : recipe.timeline

    const primaryTrigger = recipe.triggers[0]
    const timelineOptions = {}
    if (primaryTrigger.type === 'viewport' || primaryTrigger.type === 'scroll') {
      timelineOptions.scrollTrigger = {
        trigger: root,
        start: primaryTrigger.start ?? 'top 85%',
        end: primaryTrigger.end,
        scrub: primaryTrigger.type === 'scroll' ? (primaryTrigger.scrub ?? true) : undefined,
        once: primaryTrigger.type === 'viewport' ? (primaryTrigger.once ?? true) : undefined,
        markers: false,
      }
    }

    const timeline = gsap.timeline(timelineOptions)
    for (const step of authoredTimeline.steps) {
      const targets = slots[step.target] ?? []
      const position = step.at
      const vars = { ...(step.vars ?? {}), ...(step.parameterVars?.(parameters) ?? {}) }
      if (step.action === 'fromTo') timeline.fromTo(targets, step.from, step.to, position)
      else timeline[step.action](targets, vars, position)
    }

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.revert?.()
      timeline.kill?.()
    }
  }
}

export function compileMotionRecipe(recipe) {
  const propertyIssues = validateStepProperties(recipe)
  if (propertyIssues.length) throw new Error(`Cannot compile motion recipe "${recipe.id}": ${propertyIssues.join('; ')}`)

  return Object.freeze({
    recipe,
    selectRoots(root) {
      return selectRoots(root, recipe.root.selector)
    },
    selectSlots(recipeRoot) {
      return selectSlots(recipe, recipeRoot)
    },
    setup: recipe.setup ?? createTimelineSetup(recipe),
  })
}
