import { builtinMotionSpecs } from './specs.js'

/**
 * Prose, preview and fixture metadata for the built-in recipes.
 *
 * This module is imported by the catalog, CLI, MCP server, gallery and
 * inspector. It is deliberately NOT imported by the browser runtime: it is
 * roughly sixty percent of the recipe payload and none of it is read while
 * animating.
 */

export const SHARED_NO_JS = /* @__PURE__ */ Object.freeze({
  behavior: 'Content and controls remain available in their authored final state.',
})

export const SHARED_ACCESSIBILITY = /* @__PURE__ */ Object.freeze({
  notes: 'Motion does not change document order; interactive semantics remain native.',
})

export const SHARED_PREVIEW = /* @__PURE__ */ Object.freeze({ fixture: 'default', viewport: 'standard', activation: 'auto' })

function attributesForSelector(selector) {
  return [...selector.matchAll(/\[([\w-]+)(?:=["']?([^\]"']+)["']?)?\]/g)]
    .map(([, name, value]) => value === undefined ? name : `${name}="${value}"`)
    .join(' ')
}

function fixtureElement(selector, label) {
  const attributes = attributesForSelector(selector)
  if (/range/.test(selector)) return `<input ${attributes} type="range" min="0" max="100" value="50" aria-label="${label}">`
  if (/video/.test(selector)) return `<video ${attributes} controls aria-label="${label}"></video>`
  if (/(?:trigger|control|button)/.test(selector)) return `<button ${attributes} type="button">${label}</button>`
  if (/link/.test(selector)) return `<a ${attributes} href="#">${label}</a>`
  if (/(?:heading|title)/.test(selector)) return `<h2 ${attributes}>${label}</h2>`
  if (/(?:card|panel|item|chapter|step|detail)/.test(selector)) return `<article ${attributes}><h3>${label}</h3><p>Readable supporting content.</p></article>`
  if (/(?:image|media)/.test(selector)) return `<figure ${attributes}><div role="img" aria-label="${label}"></div></figure>`
  return `<div ${attributes}>${label}</div>`
}

function defaultFixtureMarkup(id, selector, slots) {
  const root = attributesForSelector(selector)
  if (id === 'split-lines-rise') return `<h2 ${root}>Responsive lines reveal without changing the reading order.</h2>`
  if (id === 'split-words-cascade') return `<h2 ${root}>Each readable word enters in a measured sequence.</h2>`
  if (id === 'split-chars-shimmer') return `<h2 ${root}>Character rhythm with one accessible heading.</h2>`
  if (id === 'typewriter-announce') return `<h2 ${root}>The complete announcement remains available to assistive technology.</h2>`
  if (id === 'reveal-stagger-cascade') return `<ul ${root}><li data-sf-stagger-item>Discover</li><li data-sf-stagger-item>Compose</li><li data-sf-stagger-item>Ship</li></ul>`
  if (id === 'pinned-steps') return `<section ${root}><div data-sf-pin-target><nav aria-label="Story steps"><a href="#step-one" data-sf-step-link>Context</a><a href="#step-two" data-sf-step-link>Outcome</a></nav><article id="step-one" data-sf-step-panel><h2>Start with context</h2><p>The first state remains readable.</p></article><article id="step-two" data-sf-step-panel><h2>Show the outcome</h2><p>The second state follows in source order.</p></article></div></section>`
  if (id === 'pinned-statement') return `<section ${root}><div data-sf-statement-pin><p data-sf-statement-label>Our approach</p><h2 data-sf-statement-heading><span data-sf-statement-hero-accent aria-hidden="true">Build</span><span data-sf-statement-inline-accent>Build</span> for lasting clarity.</h2><p data-sf-statement-lead>One strong idea resolves into useful detail.</p><div data-sf-statement-details><p data-sf-statement-detail>Semantic structure stays intact.</p><p data-sf-statement-detail>Motion only guides attention.</p></div></div></section>`
  if (id === 'pinned-founder-story') return `<section ${root}><div data-sf-founder-statement-bg aria-hidden="true"></div><div data-sf-founder-metrics-bg aria-hidden="true"></div><div data-sf-founder-content><h2 data-sf-founder-heading>Built from first-hand experience.</h2></div><div data-sf-founder-metrics><strong data-sf-founder-stat>12</strong><span data-sf-founder-stat-label>years learning in public</span><p data-sf-founder-detail>One clear principle.</p><p data-sf-founder-detail>Many measured iterations.</p></div></section>`
  if (id === 'horizontal-comparison-slider') return `<figure ${root}><div aria-label="Before view">Before</div><div data-sf-comparison-after aria-label="After view">After</div><figcaption><label>Reveal after view <input data-sf-comparison-range type="range" min="0" max="100" value="50"></label></figcaption></figure>`
  if (id === 'media-expand') return `<figure ${root}><p data-sf-media-expand-prompt>Scroll to explore the full image</p><span data-sf-media-expand-label="start" aria-hidden="true">Detail</span><div data-sf-media-expand-frame><img alt="A workshop table prepared for a design review"></div><span data-sf-media-expand-label="end" aria-hidden="true">Context</span><figcaption data-sf-media-expand-caption>The full scene adds context without replacing the caption.</figcaption></figure>`
  if (id === 'image-focus-pan') return `<figure ${root}><img data-sf-focus-image alt="A landscape with a clear authored focal point"><figcaption>Subtle movement preserves the subject.</figcaption></figure>`
  if (id === 'video-poster-play') return `<figure ${root}><img data-sf-video-poster-image alt="Video poster showing the product workspace"><video data-sf-video-element aria-label="Product workspace walkthrough"></video><figcaption><button data-sf-video-trigger type="button" aria-pressed="false">Play walkthrough</button></figcaption></figure>`
  if (id === 'hover-media-switch') return `<section ${root}><div><button data-sf-hover-key="system" type="button">Motion system</button><button data-sf-hover-key="runtime" type="button">Runtime</button></div><figure data-sf-hover-media="system"><div role="img" aria-label="Motion system diagram"></div><figcaption>Compose named recipes.</figcaption></figure><figure data-sf-hover-media="runtime"><div role="img" aria-label="Runtime lifecycle diagram"></div><figcaption>Mount and clean up safely.</figcaption></figure></section>`
  if (id === 'expand-panels') return `<section ${root}><article data-sf-expand-panel><h2><a href="#contracts">Contracts</a></h2><p>Understand every semantic hook.</p></article><article data-sf-expand-panel><h2><a href="#cleanup">Cleanup</a></h2><p>Return to the authored state.</p></article></section>`
  if (id === 'hover-lift') return `<a ${root} href="#case-study"><strong>Read the case study</strong><span> See how the system behaves.</span></a>`
  if (id === 'magnetic-action') return `<div ${root}><button data-sf-magnetic-action type="button">Start composing</button></div>`
  if (id === 'accessible-menu') return `<nav ${root} aria-label="Preview navigation"><button data-sf-menu-trigger type="button" aria-expanded="false" aria-controls="preview-menu">Menu</button><div id="preview-menu" data-sf-menu-panel hidden><a data-sf-menu-item href="#work">Work</a><a data-sf-menu-item href="#about">About</a><button data-sf-menu-close type="button">Close menu</button></div></nav>`
  if (id === 'dialog-overlay') return `<div ${root}><button data-sf-overlay-trigger type="button" aria-expanded="false" aria-controls="preview-dialog">Open details</button><dialog id="preview-dialog" data-sf-overlay-dialog aria-labelledby="preview-dialog-title"><h2 id="preview-dialog-title">Project details</h2><p>The native dialog retains its focus and escape semantics.</p><button data-sf-overlay-close type="button">Close</button></dialog></div>`
  if (id === 'accordion-disclosure') return `<details ${root}><summary>What does motion own?</summary><div data-sf-accordion-panel><p>Animation orchestration, cleanup, and reduced-motion behavior.</p></div></details>`
  if (id === 'command-palette') return `<div ${root}><button data-sf-overlay-trigger type="button" aria-expanded="false" aria-controls="preview-palette">Open commands</button><dialog id="preview-palette" data-sf-overlay-dialog aria-labelledby="preview-palette-title"><h2 id="preview-palette-title">Commands</h2><label>Search commands <input data-sf-command-input type="search"></label><button data-sf-overlay-close type="button">Close</button></dialog></div>`
  if (id === 'nav-active-indicator') return `<nav ${root} aria-label="Section navigation"><a data-sf-nav-item aria-current="page" href="#overview">Overview</a><a data-sf-nav-item href="#recipes">Recipes</a><span data-sf-nav-active-indicator aria-hidden="true"></span></nav>`
  if (id === 'marquee') return `<section ${root} aria-label="Capabilities"><div data-sf-marquee-track><span>Semantic hooks · Reduced motion · Cleanup · </span><span aria-hidden="true">Semantic hooks · Reduced motion · Cleanup · </span></div></section>`
  if (id === 'counter-value') return `<output ${root} data-sf-counter-from="0" data-sf-counter-to="60"><span data-sf-counter-value>60</span> production recipes</output>`
  if (id === 'looping-logo-belt') return `<section ${root} aria-label="Compatible platforms"><div data-sf-logo-belt-track><span>React</span><span>Vue</span><span>Svelte</span><span>Astro</span><span aria-hidden="true">React</span><span aria-hidden="true">Vue</span></div></section>`
  if (id === 'flip-list-reorder') return `<ol ${root}><li data-sf-flip-item>Define the motion intent</li><li data-sf-flip-item>Choose semantic hooks</li><li data-sf-flip-item>Validate cleanup</li></ol>`
  if (id === 'flip-card-to-detail') return `<article ${root}><h2>Recipe contract</h2><button data-sf-flip-card-trigger type="button" aria-expanded="false" aria-controls="recipe-detail">Show details</button><div id="recipe-detail" data-sf-flip-card-detail><p>Slots, fallbacks, dependencies, and performance are explicit.</p></div></article>`
  if (id === 'flip-filter-grid') return `<section ${root}><div aria-label="Filter examples"><button data-sf-filter-control="all" type="button">All</button><button data-sf-filter-control="editorial" type="button">Editorial</button></div><article data-sf-filter-item="editorial"><h2>Founder story</h2></article><article data-sf-filter-item="product"><h2>Product explainer</h2></article></section>`
  if (id === 'flip-nav-indicator') return `<nav ${root} aria-label="Recipe families"><a data-sf-flip-nav-item aria-current="page" href="#reveals">Reveals<span data-sf-flip-nav-indicator aria-hidden="true"></span></a><a data-sf-flip-nav-item href="#overlays">Overlays</a></nav>`
  if (id === 'layout-accordion-grid') return `<section ${root} aria-label="Feature details"><article data-sf-layout-item><h2><button data-sf-layout-trigger type="button" aria-expanded="false">Motion contracts</button></h2><p>Typed recipes make intent explicit.</p></article><article data-sf-layout-item><h2><button data-sf-layout-trigger type="button" aria-expanded="false">Lifecycle safety</button></h2><p>Every mounted pattern has deterministic cleanup.</p></article></section>`
  if (id === 'progress-ring') return `<section ${root}><svg viewBox="0 0 120 120" role="img" aria-label="Progress"><circle data-sf-progress-ring-value cx="60" cy="60" r="48" fill="none" stroke="currentColor" stroke-width="8" /></svg><output data-sf-progress-ring-label>100%</output></section>`
  if (id === 'svg-line-draw') return `<section ${root}><svg viewBox="0 0 320 180" role="img" aria-label="Rising line"><path data-sf-svg-path d="M20 150 C90 30 210 150 300 30" fill="none" stroke="currentColor" stroke-width="6" /></svg></section>`
  if (id === 'svg-path-morph') return `<section ${root}><svg viewBox="0 0 200 200" role="img" aria-label="Morphing shape"><path data-sf-svg-morph-source d="M100 20 L180 180 L20 180 Z" /><path data-sf-svg-morph-target d="M100 15 A85 85 0 1 1 99.9 15" aria-hidden="true" hidden /></svg><button data-sf-svg-trigger type="button" aria-pressed="false">Change shape</button></section>`
  if (id === 'svg-icon-state') return `<section ${root}><svg viewBox="0 0 100 100" role="img" aria-label="Controlled icon"><path data-sf-svg-icon-source d="M20 50 L42 72 L82 25" fill="none" stroke="currentColor" stroke-width="10" /><path data-sf-svg-icon-target d="M22 22 L78 78 M78 22 L22 78" fill="none" stroke="currentColor" stroke-width="10" aria-hidden="true" hidden /></svg><button data-sf-svg-trigger type="button" aria-pressed="false">Toggle state</button></section>`
  if (id === 'svg-orbit') return `<section ${root}><svg viewBox="0 0 320 200" role="img" aria-label="Orbital path"><path data-sf-svg-orbit-path d="M30 100 C90 10 230 10 290 100 C230 190 90 190 30 100 Z" fill="none" stroke="currentColor" /><circle data-sf-svg-orbit-subject cx="30" cy="100" r="10" /></svg></section>`
  if (id === 'svg-signature-reveal') return `<section ${root}><svg viewBox="0 0 360 160" role="img" aria-label="Signature"><path d="M20 120 C60 10 70 150 120 70 S180 120 220 50" fill="none" stroke="currentColor" stroke-width="5" /><path d="M130 125 C200 105 270 110 340 90" fill="none" stroke="currentColor" stroke-width="4" /></svg></section>`
  const children = slots
    .filter((slot) => slot.name !== 'root' && slot.required !== false)
    .flatMap((slot) => Array.from({ length: slot.multiple ? 2 : 1 }, (_, index) => fixtureElement(slot.selector, `${slot.name} ${index + 1}`)))
    .join('')
  return `<section ${root}><header><h2>${id.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')}</h2><p>A semantic, readable authored state for this motion pattern.</p></header>${children}</section>`
}

export const motionRecipeAuthoring = /* @__PURE__ */ Object.freeze({
  'reveal-rise': {
    title: 'Reveal rise',
    description: 'Reveal content upward with opacity.',
    intent: 'Introduce an element as it enters the viewport.',
    family: 'reveals-entrances',
    tags: ['reveal', 'entrance', 'viewport'],
  },
  'reveal-stagger-cascade': {
    title: 'Stagger cascade',
    description: 'Cascade a local group into view.',
    intent: 'Introduce related items in a readable sequence.',
    family: 'reveals-entrances',
    tags: ['stagger', 'cascade', 'list'],
  },
  'reveal-directional': {
    title: 'Directional reveal',
    description: 'Reveal content from a semantic direction.',
    intent: 'Introduce content with a restrained directional offset.',
    family: 'reveals-entrances',
    tags: ['reveal', 'direction', 'entrance'],
  },
  'reveal-scale-in': {
    title: 'Scale reveal',
    description: 'Gently scale and fade a focal element into view.',
    intent: 'Introduce a focal card or media element without changing layout.',
    family: 'reveals-entrances',
    tags: ['reveal', 'scale', 'entrance'],
  },
  'reveal-clip-wipe': {
    title: 'Clip wipe reveal',
    description: 'Reveal content through a bounded inline clip.',
    intent: 'Uncover media or editorial content with a directional wipe.',
    family: 'reveals-entrances',
    tags: ['reveal', 'clip', 'wipe'],
  },
  'split-lines-rise': {
    title: 'Split lines rise',
    description: 'Split text into responsive lines and reveal it.',
    intent: 'Give editorial headings a line-by-line entrance.',
    family: 'split-text-typography',
    tags: ['text', 'lines', 'split'],
  },
  'split-words-cascade': {
    title: 'Split words cascade',
    description: 'Split text into words and stagger its entrance.',
    intent: 'Emphasize a statement word by word.',
    family: 'split-text-typography',
    tags: ['text', 'words', 'split'],
  },
  'split-chars-shimmer': {
    title: 'Character shimmer',
    description: 'Reveal a statement through a restrained character cascade.',
    intent: 'Add character-level rhythm to short display text.',
    family: 'split-text-typography',
    tags: ['text', 'characters', 'shimmer'],
  },
  'typewriter-announce': {
    title: 'Typewriter announcement',
    description: 'Progressively reveal a short announcement while retaining complete accessible text.',
    intent: 'Give a short label or announcement a typed entrance.',
    family: 'split-text-typography',
    tags: ['text', 'typewriter', 'announcement'],
  },
  'text-highlight-sweep': {
    title: 'Text highlight sweep',
    description: 'Sweep a visual highlight behind readable text.',
    intent: 'Emphasize a phrase without replacing its semantic text.',
    family: 'split-text-typography',
    tags: ['text', 'highlight', 'sweep'],
  },
  'scroll-parallax': {
    title: 'Scroll parallax',
    description: 'Scrub a decorative layer against page movement.',
    intent: 'Add depth to a scene without changing its reading order.',
    family: 'scroll-parallax',
    tags: ['scroll', 'parallax', 'depth'],
  },
  'scroll-exit': {
    title: 'Scroll exit',
    description: 'Move and fade content as its scene leaves.',
    intent: 'Resolve a section as the next one takes focus.',
    family: 'scroll-parallax',
    tags: ['scroll', 'exit', 'fade'],
  },
  'scroll-drift': {
    title: 'Scroll drift',
    description: 'Drift a decorative layer through a bounded scene.',
    intent: 'Create subtle scroll-linked atmosphere.',
    family: 'scroll-parallax',
    tags: ['scroll', 'drift', 'ambient'],
  },
  'scroll-progress-meter': {
    title: 'Scroll progress meter',
    description: 'Map local reading progress to a nonessential indicator.',
    intent: 'Show progress through a long section without controlling navigation.',
    family: 'scroll-parallax',
    tags: ['scroll', 'progress', 'meter'],
  },
  'scroll-depth-stack': {
    title: 'Scroll depth stack',
    description: 'Introduce stacked cards with restrained depth.',
    intent: 'Give a grouped card stack depth as it enters the viewport.',
    family: 'scroll-parallax',
    tags: ['scroll', 'cards', 'depth'],
  },
  'pinned-steps': {
    title: 'Pinned steps',
    description: 'Pin a narrative and activate linked panels by scroll progress.',
    intent: 'Turn sequential content into a controlled scroll story.',
    family: 'pinned-storytelling',
    tags: ['pin', 'steps', 'story'],
  },
  'pinned-statement': {
    title: 'Pinned statement',
    description: 'Transform an oversized accent into a complete statement.',
    intent: 'Reveal a large editorial message through scroll.',
    family: 'pinned-storytelling',
    tags: ['pin', 'statement', 'editorial'],
  },
  'pinned-founder-story': {
    title: 'Pinned founder story',
    description: 'Sequence an editorial story into a metrics scene.',
    intent: 'Tell a long-form story through coordinated pinned states.',
    family: 'pinned-storytelling',
    tags: ['pin', 'story', 'metrics'],
  },
  'pinned-chapter-crossfade': {
    title: 'Pinned chapter crossfade',
    description: 'Advance narrative chapters around a stable visual anchor.',
    intent: 'Tell a chaptered story while a visual remains pinned.',
    family: 'pinned-storytelling',
    tags: ['pin', 'chapters', 'crossfade'],
  },
  'pinned-product-explainer': {
    title: 'Pinned product explainer',
    description: 'Coordinate product steps with a stable media region.',
    intent: 'Explain product states in a controlled scroll sequence.',
    family: 'pinned-storytelling',
    tags: ['pin', 'product', 'steps'],
  },
  'horizontal-gallery-scrub': {
    title: 'Horizontal gallery scrub',
    description: 'Translate a native row through a pinned viewport.',
    intent: 'Explore an editorial card gallery through vertical scroll.',
    family: 'horizontal-galleries',
    tags: ['horizontal', 'gallery', 'scrub'],
  },
  'horizontal-gallery-snap': {
    title: 'Horizontal gallery snap',
    description: 'Scrub and snap a horizontal card gallery.',
    intent: 'Create clear chapter stops inside a horizontal scroll scene.',
    family: 'horizontal-galleries',
    tags: ['horizontal', 'gallery', 'snap'],
  },
  'horizontal-feature-rail': {
    title: 'Horizontal feature rail',
    description: 'Move a feature rail and synchronize semantic active states.',
    intent: 'Present features as an active horizontal editorial sequence.',
    family: 'horizontal-galleries',
    tags: ['horizontal', 'features', 'rail'],
  },
  'horizontal-logo-reel': {
    title: 'Horizontal logo reel',
    description: 'Move partner or case-study marks through a bounded region.',
    intent: 'Add scroll-linked movement to a readable logo list.',
    family: 'horizontal-galleries',
    tags: ['horizontal', 'logos', 'reel'],
  },
  'horizontal-comparison-slider': {
    title: 'Horizontal comparison slider',
    description: 'Reveal equivalent media states with a native range input.',
    intent: 'Compare before and after media with pointer and keyboard control.',
    family: 'horizontal-galleries',
    tags: ['horizontal', 'comparison', 'range'],
  },
  'media-expand': {
    title: 'Media expand',
    description: 'Expand cropped media while preserving its caption and labels.',
    intent: 'Turn a compact media preview into an immersive scene.',
    family: 'media-mask-clip',
    tags: ['media', 'expand', 'scroll'],
  },
  'media-clip-reveal': {
    title: 'Media clip reveal',
    description: 'Reveal media through a bounded inline clip.',
    intent: 'Uncover media without changing its layout box.',
    family: 'media-mask-clip',
    tags: ['media', 'clip', 'reveal'],
  },
  'media-curtain-split': {
    title: 'Media curtain split',
    description: 'Open two decorative curtains around media.',
    intent: 'Stage an editorial media reveal with paired curtains.',
    family: 'media-mask-clip',
    tags: ['media', 'curtain', 'reveal'],
  },
  'image-focus-pan': {
    title: 'Image focus pan',
    description: 'Scrub a restrained image focal movement through a scene.',
    intent: 'Add depth to decorative media while retaining its authored focal point.',
    family: 'media-mask-clip',
    tags: ['image', 'pan', 'scroll'],
  },
  'video-poster-play': {
    title: 'Video poster play',
    description: 'Transition a poster into native video playback.',
    intent: 'Start an accessible controlled video from a poster action.',
    family: 'media-mask-clip',
    tags: ['video', 'poster', 'play'],
  },
  'hover-media-switch': {
    title: 'Hover media switch',
    description: 'Synchronize pointer and keyboard focus with media state.',
    intent: 'Preview related media from a semantic list of triggers.',
    family: 'hover-focus-pointer',
    tags: ['hover', 'focus', 'media'],
  },
  'expand-panels': {
    title: 'Expand panels',
    description: 'Expand one panel from pointer or keyboard focus.',
    intent: 'Explore a compact group while keeping every panel accessible.',
    family: 'hover-focus-pointer',
    tags: ['hover', 'focus', 'panels'],
  },
  'hover-lift': {
    title: 'Hover lift',
    description: 'Lift a self-contained item on pointer hover or keyboard focus.',
    intent: 'Give a card or action restrained responsive feedback.',
    family: 'hover-focus-pointer',
    tags: ['hover', 'focus', 'lift'],
  },
  'magnetic-action': {
    title: 'Magnetic action',
    description: 'Draw an action gently toward a fine pointer.',
    intent: 'Add fine-pointer feedback without changing button semantics.',
    family: 'hover-focus-pointer',
    tags: ['pointer', 'magnetic', 'action'],
  },
  'pointer-spotlight': {
    title: 'Pointer spotlight',
    description: 'Move a decorative spotlight inside a bounded region.',
    intent: 'Add local pointer atmosphere without affecting interaction.',
    family: 'hover-focus-pointer',
    tags: ['pointer', 'spotlight', 'ambient'],
  },
  'accessible-menu': {
    title: 'Accessible menu',
    description: 'Animate a controlled menu without weakening its keyboard behavior.',
    intent: 'Open and close a navigation overlay with managed focus.',
    family: 'navigation-overlay',
    tags: ['menu', 'overlay', 'keyboard'],
  },
  'dialog-overlay': {
    title: 'Dialog overlay',
    description: 'Present a native dialog with a restrained entrance and focus return.',
    intent: 'Open modal content without replacing native dialog semantics.',
    family: 'navigation-overlay',
    tags: ['dialog', 'overlay', 'focus'],
  },
  'nav-active-indicator': {
    title: 'Navigation active indicator',
    description: 'Move a visual indicator between semantic navigation items.',
    intent: 'Reinforce current and focused navigation state.',
    family: 'navigation-overlay',
    tags: ['navigation', 'indicator', 'focus'],
  },
  'accordion-disclosure': {
    title: 'Accordion disclosure',
    description: 'Animate native disclosure content with transform and opacity.',
    intent: 'Give a native accordion restrained open-state feedback.',
    family: 'navigation-overlay',
    tags: ['accordion', 'disclosure', 'toggle'],
  },
  'command-palette': {
    title: 'Command palette',
    description: 'Open a searchable native dialog from a trigger or keyboard shortcut.',
    intent: 'Provide a fast keyboard-accessible command surface.',
    family: 'navigation-overlay',
    tags: ['command', 'dialog', 'keyboard'],
  },
  'marquee': {
    title: 'Marquee',
    description: 'Run a seamless transform driven content loop.',
    intent: 'Create a pauseable, reduced-motion-safe horizontal loop.',
    family: 'loops-progress-ambient',
    tags: ['marquee', 'loop', 'logos'],
  },
  'counter-value': {
    title: 'Value counter',
    description: 'Count a readable value toward its authored result.',
    intent: 'Emphasize a metric without replacing its accessible output.',
    family: 'loops-progress-ambient',
    tags: ['counter', 'metric', 'progress'],
  },
  'progress-ring': {
    title: 'Progress ring',
    description: 'Draw an SVG progress ring to a bounded value.',
    intent: 'Show nonessential progress with a readable text equivalent.',
    family: 'loops-progress-ambient',
    tags: ['progress', 'ring', 'svg'],
  },
  'ambient-float': {
    title: 'Ambient float',
    description: 'Float a decorative element while it is in view.',
    intent: 'Add restrained ambient movement without changing layout.',
    family: 'loops-progress-ambient',
    tags: ['ambient', 'float', 'loop'],
  },
  'looping-logo-belt': {
    title: 'Looping logo belt',
    description: 'Loop a duplicated logo track with viewport pausing.',
    intent: 'Present partner marks in a continuous reduced-motion-safe belt.',
    family: 'loops-progress-ambient',
    tags: ['logos', 'belt', 'loop'],
  },
  'flip-list-reorder': {
    title: 'FLIP list reorder',
    description: 'Animate application-owned list reordering through FLIP.',
    intent: 'Preserve spatial context when a semantic list changes order.',
    family: 'flip-layout',
    tags: ['flip', 'list', 'reorder'],
  },
  'flip-card-to-detail': {
    title: 'FLIP card to detail',
    description: 'Expand a card detail while retaining spatial continuity.',
    intent: 'Reveal card detail from a native action without disorienting layout jumps.',
    family: 'flip-layout',
    tags: ['flip', 'card', 'detail'],
  },
  'flip-filter-grid': {
    title: 'FLIP filter grid',
    description: 'Animate a semantic filtered grid between result sets.',
    intent: 'Keep items spatially understandable while native filter controls update results.',
    family: 'flip-layout',
    tags: ['flip', 'filter', 'grid'],
  },
  'flip-nav-indicator': {
    title: 'FLIP navigation indicator',
    description: 'Move an inert indicator between semantic navigation items.',
    intent: 'Reinforce navigation focus and current state without changing semantics.',
    family: 'flip-layout',
    tags: ['flip', 'navigation', 'indicator'],
  },
  'layout-accordion-grid': {
    title: 'Layout accordion grid',
    description: 'Animate one expanded grid item while controls retain native semantics.',
    intent: 'Explore dense content with clear spatial continuity.',
    family: 'flip-layout',
    tags: ['flip', 'accordion', 'grid'],
  },
  'svg-line-draw': {
    title: 'SVG line draw',
    description: 'Draw stroked SVG geometry as it enters the viewport.',
    intent: 'Introduce explanatory line art without hiding its meaning.',
    family: 'svg-path-morph',
    tags: ['svg', 'draw', 'line'],
  },
  'svg-path-morph': {
    title: 'SVG path morph',
    description: 'Morph between compatible SVG path states from a native action.',
    intent: 'Show a meaningful visual state change in a compact illustration.',
    family: 'svg-path-morph',
    tags: ['svg', 'path', 'morph'],
  },
  'svg-icon-state': {
    title: 'SVG icon state',
    description: 'Morph a controlled icon between two pressed states.',
    intent: 'Reinforce a button state without replacing its accessible name.',
    family: 'svg-path-morph',
    tags: ['svg', 'icon', 'state'],
  },
  'svg-orbit': {
    title: 'SVG orbit',
    description: 'Move a decorative subject along an authored SVG path.',
    intent: 'Connect scroll progress to a bounded explanatory path.',
    family: 'svg-path-morph',
    tags: ['svg', 'orbit', 'path'],
  },
  'svg-signature-reveal': {
    title: 'SVG signature reveal',
    description: 'Draw a multi-stroke signature in authored order.',
    intent: 'Reveal a decorative signature while leaving the complete mark available without motion.',
    family: 'svg-path-morph',
    tags: ['svg', 'signature', 'draw'],
  },
  'page-load-hero': {
    title: 'Page-load hero',
    description: 'Sequence local hero content after the page becomes interactive.',
    intent: 'Establish hierarchy with a restrained initial page entrance.',
    family: 'page-load-route',
    tags: ['page', 'load', 'hero'],
  },
  'page-load-brand-mark': {
    title: 'Page-load brand mark',
    description: 'Introduce a local brand mark without blocking content.',
    intent: 'Give a brand signature a short, nonblocking entrance.',
    family: 'page-load-route',
    tags: ['page', 'load', 'brand'],
  },
  'route-fade': {
    title: 'Route fade',
    description: 'Coordinate outgoing and incoming route regions through a scoped event.',
    intent: 'Soften application-owned route replacement without owning navigation.',
    family: 'page-load-route',
    tags: ['route', 'fade', 'transition'],
  },
  'route-shared-media': {
    title: 'Route shared media',
    description: 'Animate application-owned shared media placement through FLIP.',
    intent: 'Preserve visual continuity while a router changes page structure.',
    family: 'page-load-route',
    tags: ['route', 'shared', 'flip'],
  },
  'route-scroll-restore': {
    title: 'Route scroll restore',
    description: 'Restore application-provided scroll position after route completion.',
    intent: 'Keep route navigation position predictable and refresh scroll measurements.',
    family: 'page-load-route',
    tags: ['route', 'scroll', 'restore'],
  },
})

/** Build the default fixture for a runtime spec. */
export function fixturesForSpec(spec) {
  return [{
    id: 'default',
    label: 'Default',
    markup: defaultFixtureMarkup(spec.id, spec.root.selector, spec.slots.filter((slot) => slot.name !== 'root')),
    parameters: {},
  }]
}

/** Merge a runtime spec with its authoring metadata into a complete recipe. */
export function describeSpec(spec) {
  const prose = motionRecipeAuthoring[spec.id]
  if (!prose) throw new Error(`Missing authoring metadata for motion recipe "${spec.id}".`)
  return {
    ...spec,
    ...prose,
    noJs: SHARED_NO_JS,
    accessibility: SHARED_ACCESSIBILITY,
    preview: SHARED_PREVIEW,
    fixtures: fixturesForSpec(spec),
  }
}

/** Complete, documentation-grade manifests for every built-in recipe. */
export function describeBuiltinSpecs() {
  return builtinMotionSpecs.map(describeSpec)
}
