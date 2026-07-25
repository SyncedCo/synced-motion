export function createMediaClipReveals({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-media-clip]')].map((scene) => {
    const frame = scene.querySelector('[data-sf-media-frame]') ?? scene
    return gsap.from(frame, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 0.9,
      ease: 'power3.inOut',
      clearProps: 'clipPath',
      scrollTrigger: { trigger: scene, start: 'top 85%', once: true, markers: debug },
    })
  })
}

export function createMediaCurtainSplits({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-media-curtain]')].map((scene) => {
    const start = scene.querySelector('[data-sf-curtain-start]')
    const end = scene.querySelector('[data-sf-curtain-end]')
    if (!start || !end) return undefined
    const timeline = gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top 85%', once: true, markers: debug } })
    timeline.to(start, { scaleX: 0, transformOrigin: 'left center', duration: 0.75, ease: 'power3.inOut' }, 0)
      .to(end, { scaleX: 0, transformOrigin: 'right center', duration: 0.75, ease: 'power3.inOut' }, 0)
    return timeline
  }).filter(Boolean)
}

export function createImageFocusPans({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-image-focus-pan]')].map((scene) => {
    const image = scene.querySelector('img, [data-sf-focus-image]')
    if (!image) return undefined
    return gsap.fromTo(image, { scale: 1.08, xPercent: -2, yPercent: -2 }, {
      scale: 1,
      xPercent: 2,
      yPercent: 2,
      ease: 'none',
      scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 1, markers: debug },
    })
  }).filter(Boolean)
}

export function createVideoPosterPlayers({ gsap, root, reduced }) {
  return [...root.querySelectorAll('[data-sf-video-poster]')].map((scene) => {
    const trigger = scene.querySelector('[data-sf-video-trigger]')
    const poster = scene.querySelector('[data-sf-video-poster-image]')
    const video = scene.querySelector('[data-sf-video-element], video')
    if (!trigger || !video) return undefined
    const play = async () => {
      trigger.setAttribute('aria-pressed', 'true')
      video.controls = true
      try { await video.play() } catch { trigger.setAttribute('aria-pressed', 'false'); return }
      if (poster) reduced ? gsap.set(poster, { autoAlpha: 0 }) : gsap.to(poster, { autoAlpha: 0, duration: 0.25 })
    }
    trigger.addEventListener('click', play)
    return () => {
      trigger.removeEventListener('click', play)
      video.pause()
      trigger.setAttribute('aria-pressed', 'false')
      if (poster) gsap.set(poster, { clearProps: 'opacity,visibility' })
    }
  }).filter(Boolean)
}
