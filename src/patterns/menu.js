import { getFocusable } from '../core/state.js'

export function createMenus({ gsap, root, reduced }) {
  return [...root.querySelectorAll('[data-sf-menu]')].map((menu) => {
    const trigger = menu.querySelector('[data-sf-menu-trigger]')
    const panel = menu.querySelector('[data-sf-menu-panel]')
    const items = [...menu.querySelectorAll('[data-sf-menu-item]')]
    const closeControls = [...menu.querySelectorAll('[data-sf-menu-close]')]
    if (!trigger || !panel) return () => {}

    let open = false
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

    const setOpen = (next) => {
      open = next
      menu.dataset.state = open ? 'open' : 'closed'
      trigger.setAttribute('aria-expanded', String(open))
      panel.setAttribute('aria-hidden', String(!open))
      document.documentElement.toggleAttribute('data-sf-scroll-locked', open)

      if (open) {
        panel.hidden = false
        menu.dataset.state = 'open'
        timeline.play(0)
        window.setTimeout(() => getFocusable(panel)[0]?.focus({ preventScroll: true }), reduced ? 0 : 180)
      } else {
        menu.dataset.state = 'closing'
        timeline.eventCallback('onReverseComplete', () => {
          panel.hidden = true
          menu.dataset.state = 'closed'
        })
        timeline.reverse()
        trigger.focus({ preventScroll: true })
      }
    }

    const onClick = () => setOpen(!open)
    const onClose = () => setOpen(false)
    const onKeydown = (event) => {
      if (event.key === 'Escape' && open) setOpen(false)
      if (event.key !== 'Tab' || !open) return

      const focusable = getFocusable(panel)
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    trigger.addEventListener('click', onClick)
    closeControls.forEach((control) => control.addEventListener('click', onClose))
    document.addEventListener('keydown', onKeydown)
    menu.dataset.state = 'closed'
    panel.hidden = true
    trigger.setAttribute('aria-expanded', 'false')
    panel.setAttribute('aria-hidden', 'true')

    return () => {
      trigger.removeEventListener('click', onClick)
      closeControls.forEach((control) => control.removeEventListener('click', onClose))
      document.removeEventListener('keydown', onKeydown)
      timeline.kill()
    }
  })
}
