import { getFocusable } from '../core/state.js'

export function createMenus({ gsap, root, reduced }) {
  return [...root.querySelectorAll('[data-sf-menu]')].map((menu) => {
    const ownerDocument = menu.ownerDocument
    const view = ownerDocument.defaultView
    const trigger = menu.querySelector('[data-sf-menu-trigger]')
    const panel = menu.querySelector('[data-sf-menu-panel]')
    const items = [...menu.querySelectorAll('[data-sf-menu-item]')]
    const closeControls = [...menu.querySelectorAll('[data-sf-menu-close]')]
    if (!trigger || !panel) return () => {}

    const authored = {
      hidden: panel.hidden,
      ariaHidden: panel.getAttribute('aria-hidden'),
      ariaExpanded: trigger.getAttribute('aria-expanded'),
      state: menu.dataset.state,
    }

    let open = false
    let focusTimer
    const timeline = gsap.timeline({ paused: true })
      .fromTo(panel, { autoAlpha: 0, yPercent: -4 }, {
        autoAlpha: 1,
        yPercent: 0,
        duration: reduced ? 0 : 0.45,
        ease: 'power3.out',
      })
      .from(items, {
        autoAlpha: 0,
        y: '1.25rem',
        stagger: reduced ? 0 : 0.06,
        duration: reduced ? 0 : 0.4,
        ease: 'power3.out',
      }, reduced ? 0 : '-=0.2')

    const setOpen = (next, options = {}) => {
      if (next === open) return
      const { restoreFocus = true } = options
      open = next
      trigger.setAttribute('aria-expanded', String(open))
      panel.setAttribute('aria-hidden', String(!open))
      ownerDocument.documentElement.toggleAttribute('data-sf-scroll-locked', open)

      if (open) {
        panel.hidden = false
        menu.dataset.state = 'open'
        timeline.play(0)
        focusTimer = view?.setTimeout(() => getFocusable(panel)[0]?.focus({ preventScroll: true }), reduced ? 0 : 180)
      } else {
        if (focusTimer) view?.clearTimeout(focusTimer)
        focusTimer = undefined
        menu.dataset.state = 'closing'
        timeline.eventCallback('onReverseComplete', () => {
          panel.hidden = true
          menu.dataset.state = 'closed'
        })
        timeline.reverse()
        // Only pull focus back when the menu owned it; a route change or an
        // outside click must not steal focus from wherever the user moved to.
        if (restoreFocus && panel.contains(ownerDocument.activeElement)) {
          trigger.focus({ preventScroll: true })
        }
      }
    }

    const onClick = () => setOpen(!open)
    const onClose = () => setOpen(false)
    const onPointerDown = (event) => {
      if (!open || menu.contains(event.target)) return
      setOpen(false, { restoreFocus: false })
    }
    const onKeydown = (event) => {
      if (event.key === 'Escape' && open) setOpen(false)
      if (event.key !== 'Tab' || !open) return

      const focusable = getFocusable(panel)
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && ownerDocument.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && ownerDocument.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    trigger.addEventListener('click', onClick)
    closeControls.forEach((control) => control.addEventListener('click', onClose))
    ownerDocument.addEventListener('keydown', onKeydown)
    ownerDocument.addEventListener('pointerdown', onPointerDown)
    menu.dataset.state = 'closed'
    panel.hidden = true
    trigger.setAttribute('aria-expanded', 'false')
    panel.setAttribute('aria-hidden', 'true')

    return () => {
      if (focusTimer) view?.clearTimeout(focusTimer)
      trigger.removeEventListener('click', onClick)
      closeControls.forEach((control) => control.removeEventListener('click', onClose))
      ownerDocument.removeEventListener('keydown', onKeydown)
      ownerDocument.removeEventListener('pointerdown', onPointerDown)
      ownerDocument.documentElement.removeAttribute('data-sf-scroll-locked')
      timeline.revert?.()
      timeline.kill()

      // Restore the authored markup rather than forcing the panel open. A
      // destroyed runtime must never leave an expanded menu on the page.
      if (authored.state === undefined) delete menu.dataset.state
      else menu.dataset.state = authored.state
      panel.hidden = authored.hidden
      if (authored.ariaHidden === null) panel.removeAttribute('aria-hidden')
      else panel.setAttribute('aria-hidden', authored.ariaHidden)
      if (authored.ariaExpanded === null) trigger.removeAttribute('aria-expanded')
      else trigger.setAttribute('aria-expanded', authored.ariaExpanded)
    }
  })
}
