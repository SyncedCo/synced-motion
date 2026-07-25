export const CANONICAL_ATTRIBUTE_PREFIX = 'data-motion-'
export const LEGACY_ATTRIBUTE_PREFIX = 'data-sf-'

/**
 * Mirror `data-motion-*` authoring attributes onto the `data-sf-*` names the
 * pattern implementations read.
 *
 * `data-motion-*` is the documented prefix: the package is usable on any site,
 * not only ones built on Synced Flow. `data-sf-*` remains fully supported, and
 * an element that already carries the legacy attribute is left alone so an
 * explicit value always wins.
 *
 * Normalising once at the runtime boundary keeps a single vocabulary inside the
 * patterns instead of doubling every selector, and the returned function undoes
 * every attribute this pass added so teardown restores the authored markup.
 *
 * @param {Document | Element} scope
 * @returns {() => void} restores the authored markup
 */
export function normalizeMotionAliases(scope) {
  const undo = []
  const roots = scope.nodeType === 1 ? [scope, ...scope.querySelectorAll('*')] : [...scope.querySelectorAll('*')]

  for (const element of roots) {
    // Snapshot the names: setAttribute mutates the live NamedNodeMap.
    const names = element.attributes.length
      ? [...element.attributes].map((attribute) => attribute.name)
      : []

    for (const name of names) {
      if (!name.startsWith(CANONICAL_ATTRIBUTE_PREFIX)) continue
      const legacy = `${LEGACY_ATTRIBUTE_PREFIX}${name.slice(CANONICAL_ATTRIBUTE_PREFIX.length)}`
      if (element.hasAttribute(legacy)) continue
      element.setAttribute(legacy, element.getAttribute(name))
      undo.push(() => element.removeAttribute(legacy))
    }
  }

  return () => {
    for (const restore of undo) restore()
    undo.length = 0
  }
}

/** Translate a `data-sf-*` selector into its documented `data-motion-*` form. */
export function canonicalSelector(selector) {
  return selector.replaceAll(LEGACY_ATTRIBUTE_PREFIX, CANONICAL_ATTRIBUTE_PREFIX)
}
