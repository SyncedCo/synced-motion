import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { compileMotionRecipe } from './recipes/compiler.js'
import { createMotionRegistry } from './recipes/registry.js'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin)

const DEFAULT_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function parameterValues(recipe, overrides = {}) {
  for (const name of Object.keys(overrides)) {
    if (!recipe.parameters[name]) throw new TypeError(`Unknown parameter "${name}" for motion recipe "${recipe.id}".`)
  }
  return Object.fromEntries(Object.entries(recipe.parameters).map(([name, parameter]) => {
    const value = overrides[name] ?? parameter.default
    const valid = parameter.type === 'boolean' ? typeof value === 'boolean'
      : parameter.type === 'number' ? Number.isFinite(value) && value >= parameter.min && value <= parameter.max
        : parameter.type === 'enum' ? parameter.values.includes(value)
          : typeof value === 'string'
    if (!valid) throw new TypeError(`Invalid value for parameter "${name}" in motion recipe "${recipe.id}".`)
    return [name, value]
  }))
}

function documentElementFor(root) {
  return root.nodeType === 9 ? root.documentElement : root.ownerDocument?.documentElement
}

function rootDescription(element, selector) {
  return {
    selector,
    tag: element.localName,
    id: element.id || undefined,
  }
}

export function createMotionRuntime(options = {}) {
  if (typeof document === 'undefined') throw new Error('Synced Motion requires a browser document.')

  const root = options.root ?? document
  const registry = options.registry ?? createMotionRegistry(options.recipes ?? [])
  const dependencies = {
    gsap: options.dependencies?.gsap ?? gsap,
    ScrollTrigger: options.dependencies?.ScrollTrigger ?? ScrollTrigger,
    SplitText: options.dependencies?.SplitText ?? SplitText,
    Flip: options.dependencies?.Flip ?? Flip,
    DrawSVGPlugin: options.dependencies?.DrawSVGPlugin ?? DrawSVGPlugin,
    MorphSVGPlugin: options.dependencies?.MorphSVGPlugin ?? MorphSVGPlugin,
    MotionPathPlugin: options.dependencies?.MotionPathPlugin ?? MotionPathPlugin,
  }
  const reducedMotionQuery = options.reducedMotionQuery ?? DEFAULT_REDUCED_MOTION_QUERY
  const view = root.nodeType === 9 ? root.defaultView : root.ownerDocument?.defaultView
  const media = dependencies.gsap.matchMedia()
  const cleanup = new Set()
  const mounted = new Map()
  const skipped = []
  const errors = []
  let reduced = options.reducedMotion === 'reduce' || Boolean(view?.matchMedia?.(reducedMotionQuery).matches)
  let active = false

  function teardownMounted() {
    for (const dispose of [...cleanup].reverse()) {
      try {
        dispose?.()
      } catch (error) {
        errors.push({ phase: 'destroy', message: error instanceof Error ? error.message : String(error) })
      }
    }
    cleanup.clear()
    mounted.clear()
  }

  function mountCompiled(compiled, mountRoot, overrides = {}) {
    const recipe = compiled.recipe
    const { slots, missing } = compiled.selectSlots(mountRoot)
    if (missing.length) {
      skipped.push({ id: recipe.id, root: rootDescription(mountRoot, recipe.root.selector), reason: 'missing-slots', slots: missing })
      return undefined
    }

    const key = `${recipe.id}:${mounted.size}`
    try {
      const result = compiled.setup({
        ...dependencies,
        root: mountRoot,
        scope: mountRoot,
        slots,
        parameters: parameterValues(recipe, overrides),
        reduced,
        debug: Boolean(options.debug),
        recipe,
      })
      if (result === false) {
        skipped.push({ id: recipe.id, root: rootDescription(mountRoot, recipe.root.selector), reason: 'no-op', slots: [] })
        return undefined
      }
      const dispose = typeof result === 'function' ? result : (typeof result?.destroy === 'function' ? () => result.destroy() : undefined)
      if (typeof dispose === 'function') cleanup.add(dispose)
      mounted.set(key, { id: recipe.id, root: rootDescription(mountRoot, recipe.root.selector), slots: Object.keys(slots), performance: recipe.performance.class })
      mountRoot.setAttribute('data-sf-motion-recipe', recipe.id)
      cleanup.add(() => mountRoot.removeAttribute('data-sf-motion-recipe'))
      return key
    } catch (error) {
      errors.push({ id: recipe.id, phase: 'mount', message: error instanceof Error ? error.message : String(error) })
      if (options.strict !== false) throw error
      return undefined
    }
  }

  function mountRecipe(id, mountRoot, overrides) {
    const recipe = registry.get(id)
    if (!recipe) throw new Error(`Unknown motion recipe "${id}".`)
    const compiled = compileMotionRecipe(recipe)
    if (mountRoot) {
      const contained = root.nodeType === 9
        ? root.documentElement.contains(mountRoot)
        : root === mountRoot || root.contains(mountRoot)
      if (!contained) throw new Error(`Motion recipe "${id}" cannot mount outside the runtime root.`)
      if (!mountRoot.matches(recipe.root.selector)) {
        throw new Error(`Motion recipe "${id}" root must match "${recipe.root.selector}".`)
      }
    }
    const targets = mountRoot ? [mountRoot] : compiled.selectRoots(root)
    return targets.map((target) => mountCompiled(compiled, target, overrides)).filter(Boolean)
  }

  function mount() {
    if (active) return runtime
    active = true
    const rootElement = documentElementFor(root)
    rootElement?.setAttribute('data-sf-motion', 'ready')

    try {
      media.add({
        reduce: reducedMotionQuery,
        motion: '(prefers-reduced-motion: no-preference)',
      }, (context) => {
        reduced = options.reducedMotion === 'reduce' || Boolean(context.conditions.reduce)
        rootElement?.toggleAttribute('data-sf-reduced-motion', reduced)
        try {
          for (const recipe of registry.list()) mountRecipe(recipe.id, undefined, options.parameterOverrides?.[recipe.id])
        } catch (error) {
          teardownMounted()
          rootElement?.removeAttribute('data-sf-reduced-motion')
          throw error
        }
        return teardownMounted
      })
    } catch (error) {
      active = false
      teardownMounted()
      rootElement?.removeAttribute('data-sf-motion')
      rootElement?.removeAttribute('data-sf-reduced-motion')
      throw error
    }

    return runtime
  }

  const runtime = Object.freeze({
    gsap: dependencies.gsap,
    ScrollTrigger: dependencies.ScrollTrigger,
    registry,
    mount,
    mountRecipe,
    refresh() {
      dependencies.ScrollTrigger.refresh()
    },
    inspect() {
      return {
        active,
        reduced,
        registered: registry.list().map((recipe) => recipe.id),
        mounted: [...mounted.values()].map((entry) => ({ ...entry })),
        skipped: skipped.map((entry) => ({ ...entry })),
        errors: errors.map((entry) => ({ ...entry })),
      }
    },
    destroy() {
      active = false
      media.revert?.()
      teardownMounted()
      const rootElement = documentElementFor(root)
      rootElement?.removeAttribute('data-sf-motion')
      rootElement?.removeAttribute('data-sf-reduced-motion')
    },
  })

  if (options.autoMount !== false) runtime.mount()
  return runtime
}
