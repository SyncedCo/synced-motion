import { numberAttribute } from '../core/options.js'

export function createMediaExpansions({ gsap, root, debug, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-motion-media-expand]')].map((scene) => {
    const frame = scene.querySelector('[data-motion-media-expand-frame]')
    const image = frame?.querySelector('img')
    const prompt = scene.querySelector('[data-motion-media-expand-prompt]')
    const caption = scene.querySelector('[data-motion-media-expand-caption]')
    const startLabel = scene.querySelector('[data-motion-media-expand-label="start"]')
    const endLabel = scene.querySelector('[data-motion-media-expand-label="end"]')
    if (!frame || !image || !prompt || !caption || !startLabel || !endLabel) return null
    const view = scene.ownerDocument.defaultView

    const expansion = { progress: 0 }
    const syncExpansion = () => {
      const width = view.innerWidth
      const height = view.innerHeight
      const rem = Number.parseFloat(view.getComputedStyle(scene.ownerDocument.documentElement).fontSize) || 16
      const gap = rem * 0.75
      const horizontalInset = gsap.utils.interpolate(width * 0.466, rem, expansion.progress)
      const verticalInset = gsap.utils.interpolate(height * 0.478, rem, expansion.progress)
      const radius = gsap.utils.interpolate(rem * 0.7, rem, expansion.progress)

      gsap.set(frame, { clipPath: `inset(${verticalInset}px ${horizontalInset}px round ${radius}px)` })
      gsap.set(startLabel, { right: width - horizontalInset + gap, x: 0 })
      gsap.set(endLabel, { left: width - horizontalInset + gap, x: 0 })
    }

    gsap.set(frame, { y: '9svh' })
    gsap.set(image, { scale: 1.16 })
    gsap.set(caption, { autoAlpha: 0, y: '1.5rem' })
    gsap.set([startLabel, endLabel], { y: '9svh' })
    syncExpansion()

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'clamp(top top)',
        end: 'clamp(bottom bottom)',
        scrub: numberAttribute(scene, 'data-motion-scrub', 0.8),
        invalidateOnRefresh: true,
        markers: debug,
        onRefresh: syncExpansion,
      },
    })

    timeline
      .to(prompt, { autoAlpha: 0, y: '-1.5rem', duration: 0.12, ease: 'none' }, 0)
      .to([startLabel, endLabel], { y: 0, duration: 0.18, ease: 'power2.out' }, 0)
      .to(frame, { y: 0, duration: 0.18, ease: 'power2.out' }, 0)
      .to(expansion, { progress: 1, duration: 0.72, ease: 'none', onUpdate: syncExpansion }, 0.12)
      .to(image, { scale: 1, duration: 0.72, ease: 'none' }, 0.12)
      .to(caption, { autoAlpha: 1, y: 0, duration: 0.16, ease: 'none' }, 0.4)
      .to([startLabel, endLabel], { autoAlpha: 0, duration: 0.12, ease: 'none' }, 0.76)

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.revert?.()
      timeline.kill()
      gsap.set([frame, image, prompt, caption, startLabel, endLabel], {
        clearProps: 'transform,opacity,visibility,clipPath,left,right',
      })
    }
  }).filter(Boolean)
}
