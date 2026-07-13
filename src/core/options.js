export const defaults = Object.freeze({
  debug: false,
  smoothScroll: false,
  revealStart: 'top 84%',
  reducedMotionQuery: '(prefers-reduced-motion: reduce)',
})

export function mergeOptions(options = {}) {
  return { ...defaults, ...options }
}

export function numberAttribute(element, name, fallback) {
  const value = Number.parseFloat(element.getAttribute(name) ?? '')
  return Number.isFinite(value) ? value : fallback
}

export function booleanAttribute(element, name, fallback = false) {
  const value = element.getAttribute(name)
  if (value === null) return fallback
  return value !== 'false'
}

export function clampIndex(progress, length) {
  if (length <= 0) return -1
  const bounded = Math.min(1, Math.max(0, progress))
  return Math.min(length - 1, Math.floor(bounded * length))
}

