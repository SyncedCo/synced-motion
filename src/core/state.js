export function setActiveState(elements, activeIndex, options = {}) {
  const { attribute = 'data-active', ariaCurrent = false } = options

  elements.forEach((element, index) => {
    const active = index === activeIndex
    element.toggleAttribute(attribute, active)

    if (ariaCurrent) {
      if (active) element.setAttribute('aria-current', 'true')
      else element.removeAttribute('aria-current')
    }
  })
}

export function getFocusable(container) {
  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
}

