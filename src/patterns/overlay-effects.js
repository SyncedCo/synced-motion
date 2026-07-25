function focusable(dialog) {
  return dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
}

function createDialogControllers({ gsap, root, reduced, selector, shortcut = false }) {
  return [...root.querySelectorAll(selector)].map((scene) => {
    const trigger = scene.querySelector('[data-sf-overlay-trigger]')
    const dialog = scene.querySelector('dialog, [data-sf-overlay-dialog]')
    const closeControls = [...scene.querySelectorAll('[data-sf-overlay-close]')]
    if (!dialog) return undefined
    const ownerDocument = scene.ownerDocument
    const initialOpen = dialog.hasAttribute('open')
    const initialExpanded = trigger?.getAttribute('aria-expanded')
    const initialFocus = ownerDocument.activeElement
    let opener
    const open = () => {
      opener = ownerDocument.activeElement === ownerDocument.body ? trigger : ownerDocument.activeElement
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
      trigger?.setAttribute('aria-expanded', 'true')
      if (!reduced) gsap.fromTo(dialog, { autoAlpha: 0, y: '1rem' }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' })
      focusable(dialog)?.focus()
    }
    const close = () => {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close()
      else dialog.removeAttribute('open')
      trigger?.setAttribute('aria-expanded', 'false')
      opener?.focus?.()
    }
    const syncClosed = () => {
      trigger?.setAttribute('aria-expanded', 'false')
      opener?.focus?.()
    }
    const keydown = (event) => {
      if (shortcut && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        dialog.hasAttribute('open') ? close() : open()
      }
    }
    trigger?.addEventListener('click', open)
    closeControls.forEach((control) => control.addEventListener('click', close))
    dialog.addEventListener('close', syncClosed)
    ownerDocument.addEventListener('keydown', keydown)
    return () => {
      trigger?.removeEventListener('click', open)
      closeControls.forEach((control) => control.removeEventListener('click', close))
      ownerDocument.removeEventListener('keydown', keydown)
      if (!initialOpen && dialog.hasAttribute('open')) close()
      dialog.removeEventListener('close', syncClosed)
      dialog.toggleAttribute('open', initialOpen)
      if (trigger) {
        if (initialExpanded === null) trigger.removeAttribute('aria-expanded')
        else trigger.setAttribute('aria-expanded', initialExpanded)
      }
      const focusTarget = opener?.isConnected ? opener : initialFocus?.isConnected ? initialFocus : undefined
      if (dialog.contains(ownerDocument.activeElement) || !initialOpen) focusTarget?.focus?.()
      gsap.set(dialog, { clearProps: 'transform,opacity,visibility' })
    }
  }).filter(Boolean)
}

export function createDialogOverlays(context) {
  return createDialogControllers({ ...context, selector: '[data-sf-dialog-overlay]' })
}

export function createCommandPalettes(context) {
  return createDialogControllers({ ...context, selector: '[data-sf-command-palette]', shortcut: true })
}

export function createNavActiveIndicators({ gsap, root, reduced }) {
  return [...root.querySelectorAll('[data-sf-nav-indicator]')].map((nav) => {
    const items = [...nav.querySelectorAll('[data-sf-nav-item]')]
    const indicator = nav.querySelector('[data-sf-nav-active-indicator]')
    if (!items.length || !indicator) return undefined
    const activate = (item) => {
      items.forEach((entry) => entry.toggleAttribute('data-active', entry === item))
      const navRect = nav.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      const vars = { x: itemRect.left - navRect.left, scaleX: itemRect.width / Math.max(1, indicator.getBoundingClientRect().width), transformOrigin: 'left center' }
      reduced ? gsap.set(indicator, vars) : gsap.to(indicator, { ...vars, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
    }
    const listeners = items.map((item) => {
      const handler = () => activate(item)
      item.addEventListener('focus', handler)
      item.addEventListener('pointerenter', handler)
      item.addEventListener('click', handler)
      return [item, handler]
    })
    activate(items.find((item) => item.getAttribute('aria-current') === 'page') ?? items[0])
    return () => {
      listeners.forEach(([item, handler]) => {
        item.removeEventListener('focus', handler)
        item.removeEventListener('pointerenter', handler)
        item.removeEventListener('click', handler)
        item.removeAttribute('data-active')
      })
      gsap.set(indicator, { clearProps: 'transform' })
    }
  }).filter(Boolean)
}

export function createAccordionDisclosures({ gsap, root, reduced }) {
  return [...root.querySelectorAll('[data-sf-accordion-motion]')].map((disclosure) => {
    const panel = disclosure.querySelector('[data-sf-accordion-panel]')
    if (!panel) return undefined
    const toggle = () => {
      const open = disclosure.hasAttribute('open') || disclosure.getAttribute('aria-expanded') === 'true'
      if (open && !reduced) gsap.fromTo(panel, { autoAlpha: 0, y: '-0.5rem' }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' })
    }
    disclosure.addEventListener('toggle', toggle)
    return () => {
      disclosure.removeEventListener('toggle', toggle)
      gsap.set(panel, { clearProps: 'transform,opacity,visibility' })
    }
  }).filter(Boolean)
}
