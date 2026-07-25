# Declarative attribute API

Hand-written guide to the most commonly used recipes, with the reasoning behind
each contract. For the complete generated list of all sixty, see
[the recipe reference](RECIPE-REFERENCE.md).

Every attribute uses the `data-motion-` prefix.

## Reveal

```html
<h2 class="sf-text-h2" data-motion-reveal="up">Built for motion</h2>
```

Values: `fade`, `up`, `down`, `left`, `right`, or `scale`.

Optional attributes: `data-motion-duration`, `data-motion-delay`, `data-motion-ease`, `data-motion-start`, and `data-motion-once`.

### Directional, scale, and clip reveals

```html
<article data-motion-reveal-directional="left">...</article>
<figure data-motion-reveal-scale="0.94">...</figure>
<figure data-motion-reveal-clip="start">
  <img data-motion-reveal-clip-content src="project.jpg" alt="Project description" />
</figure>
```

Directional values are `left`, `right`, `up`, or `down`. Scale values are
unitless. Clip values are `start` or `end`. Each effect is applied only after
JavaScript initializes, clears its temporary presentation when complete, and
leaves the authored final state unchanged for reduced motion.

## Stagger

```html
<div class="sf-auto-grid" data-motion-stagger="0.08" data-motion-stagger-target=".card">
  <article class="card">...</article>
  <article class="card">...</article>
</div>
```

## Split text

```html
<h1
  data-motion-split="lines"
  data-motion-stagger="0.08"
  data-motion-split-mask="true"
>
  Editorial motion that follows the layout.
</h1>
```

Use `lines`, `words`, `chars`, or a comma-separated combination. Line splits automatically rebuild after font or width changes. Screen readers retain the unsplit accessible label. Masks are opt-in because tight editorial line-height can otherwise clip ascenders, descenders, and punctuation.

### Character, typewriter, and highlight treatments

```html
<h2 data-motion-chars-shimmer>Character rhythm</h2>
<p data-motion-typewriter data-motion-typewriter-speed="0.035">System ready</p>
<p data-motion-text-highlight>
  Motion follows <span data-motion-text-highlight-mark>meaning</span>.
</p>
```

Character and typewriter recipes use SplitText with its automatic accessible
label and revert the generated wrappers during cleanup. Add
`data-motion-typewriter-load` when a typewriter should start on load instead of on
viewport entry. The highlight recipe only scales the marked visual element;
the text remains present in document order at all times.

## Parallax

```html
<figure class="sf-frame" data-motion-parallax-scene>
  <img data-motion-parallax="10" alt="" />
</figure>
```

## Scroll progress and depth stack

```html
<article data-motion-scroll-progress>
  <span data-motion-scroll-progress-meter aria-hidden="true"></span>
  <output data-motion-scroll-progress-label aria-label="Reading progress"></output>
</article>

<section data-motion-scroll-depth-stack>
  <article data-motion-depth-card>...</article>
  <article data-motion-depth-card>...</article>
</section>
```

The meter uses scale rather than width. The label is optional. Depth cards use
only opacity and transform and remain fully visible for reduced motion.

## Pinned chapters and product explainers

```html
<section data-motion-pinned-chapters>
  <div data-motion-pin-target>...</div>
  <article data-motion-pinned-chapter>Chapter one</article>
  <figure data-motion-pinned-visual>...</figure>
</section>

<section data-motion-product-explainer>
  <div data-motion-pin-target>...</div>
  <article data-motion-product-step>Step one</article>
  <figure data-motion-product-media>...</figure>
</section>
```

The runtime synchronizes `data-active` and `aria-current`; consuming CSS owns
visibility and layout. Without motion, content remains in normal document flow.

## Horizontal galleries and comparison

```html
<section data-motion-horizontal-gallery>
  <div data-motion-horizontal-pin>
    <div data-motion-horizontal-viewport>
      <div data-motion-horizontal-track>
        <article data-motion-horizontal-card>...</article>
      </div>
    </div>
  </div>
</section>

<figure data-motion-comparison>
  <img src="before.jpg" alt="Before" />
  <div data-motion-comparison-after><img src="after.jpg" alt="After" /></div>
  <input data-motion-comparison-range type="range" min="0" max="100" value="50" aria-label="Compare before and after" />
</figure>
```

Use `data-motion-horizontal-snap`, `data-motion-horizontal-feature-rail`, or
`data-motion-horizontal-logo-reel` on the root for the related recipes. Horizontal
scroll movement is linear and transform-based. The comparison recipe retains a
native keyboard-operable range input.

## Marquee

```html
<div data-motion-marquee data-motion-marquee-duration="24">
  <div data-motion-marquee-track>
    <div>Semantic motion · Fluid systems ·</div>
    <div aria-hidden="true">Semantic motion · Fluid systems ·</div>
  </div>
</div>
```

The track contains two identical groups so its transform can loop seamlessly. `data-motion-marquee-duration` sets the loop duration in seconds; add `data-motion-marquee-direction="right"` to reverse it. Marquees pause while off-screen, restore their authored state during cleanup, and remain static when reduced motion is requested.

## Scroll steps

```html
<section data-motion-scroll-steps data-motion-end="bottom bottom">
  <div data-motion-pin-target>
    <nav>
      <a data-motion-step-link>One</a>
      <a data-motion-step-link>Two</a>
    </nav>
    <div data-motion-step-panel>First panel</div>
    <div data-motion-step-panel>Second panel</div>
  </div>
</section>
```

The runtime only toggles `data-active` and `aria-current`. Synced Flow or project CSS owns the colors and layout.

## Scroll exit

```html
<section data-motion-scroll-exit-scene>
  <div
    data-motion-scroll-exit="down"
    data-motion-exit-distance="9rem"
    data-motion-exit-end="bottom 35%"
  >
    ...
  </div>
</section>
```

The element translates `down` or `up` and fades as the scene leaves the viewport. The motion is scrubbed, uses `rem` distances, and is disabled when reduced motion is requested.

## Scroll statement

```html
<section data-motion-scroll-statement data-motion-scrub="0.8">
  <div data-motion-statement-pin>
    <p data-motion-statement-label>A short label</p>
    <h2 data-motion-statement-heading>
      <span data-motion-statement-lead>The complete thought </span>
      <span data-motion-statement-inline-accent>with emphasis.</span>
    </h2>
    <span data-motion-statement-hero-accent aria-hidden="true">emphasis</span>
    <div data-motion-statement-details>
      <p data-motion-statement-detail>Supporting content</p>
    </div>
  </div>
</section>
```

The section pins while scrolling and begins with an oversized standalone accent. That accent contracts and crossfades into the full centered statement before the collapsed details expand and reveal in sequence. The markup remains readable without JavaScript and the pinned scrub sequence is disabled for reduced motion.

## Scroll drift

```html
<section data-motion-scroll-drift data-motion-scrub="0.8">
  <div data-motion-drift-layer aria-hidden="true">Oversized background mark</div>
  <div>Readable foreground content</div>
</section>
```

The decorative layer moves from `x: 10%` and transparent to its resting position at ten-percent opacity while the section travels from below to above the viewport. Optional `data-motion-drift-from` and `data-motion-drift-opacity` attributes override those defaults. Reduced motion leaves the decorative layer in its authored CSS state.

## Founder statement

```html
<section data-motion-founder-scene data-motion-scrub="0.8">
  <div class="sticky-frame">
    <img src="background.avif" alt="" />
    <div data-motion-founder-content>
      <h2 data-motion-founder-heading>A centered statement revealed word by word.</h2>
    </div>
  </div>
</section>
```

The first content layer fades in while SplitText words rise from below with the measured Union Jack AI timing, holds briefly, then moves down and fades away. The statement background crossfades into a second locally owned background while an oversized metric, label, and three detail columns scale and rise into view. The consuming site owns the sticky frame, content, and background styling. Reduced motion leaves the unsplit heading and authored layout visible.

## Media expansion

```html
<section data-motion-media-expand data-motion-scrub="0.8">
  <div class="sticky-frame">
    <p data-motion-media-expand-prompt>Keep scrolling</p>
    <span data-motion-media-expand-label="start">©2026</span>
    <span data-motion-media-expand-label="end">Showreel</span>
    <figure data-motion-media-expand-frame>
      <img src="sample.jpg" alt="Sample project artwork" />
      <figcaption data-motion-media-expand-caption>Play showreel</figcaption>
    </figure>
  </div>
</section>
```

The image begins as a cropped central pill, expands to the viewport edges through a scrubbed clip-path, and gently scales its contents down. One shared expansion value calculates both the media inset and label anchors on every update, keeping each label immediately outside the true mask edge. When a gutter can no longer contain a label, that label exits the viewport instead of moving behind or over the image. The prompt exits early, the media action appears midway, and the CSS-sticky frame releases to reveal the following footer or section. Reduced motion keeps the authored full media frame readable.

## Hover media

```html
<div data-motion-hover-group>
  <a data-motion-hover-key="mission">Mission</a>
  <a data-motion-hover-key="work">Work</a>
  <img data-motion-hover-media="mission" alt="" />
  <img data-motion-hover-media="work" alt="" />
</div>
```

Keyboard focus and pointer hover use the same state path.

## Menu

```html
<nav data-motion-menu>
  <button data-motion-menu-trigger aria-controls="main-menu">Menu</button>
  <div id="main-menu" data-motion-menu-panel>
    <a data-motion-menu-item href="/work">Work</a>
  </div>
</nav>
```

The controller owns `aria-expanded`, `aria-hidden`, Escape handling, focus containment, focus return, and scroll locking.

## Expanding panels

```html
<div data-motion-expand-group data-motion-expand-default="3">
  <article tabindex="0" data-motion-expand-panel>...</article>
  <article tabindex="0" data-motion-expand-panel>...</article>
  <article tabindex="0" data-motion-expand-panel>...</article>
  <article tabindex="0" data-motion-expand-panel>...</article>
</div>
```

Pointer hover and keyboard focus toggle `data-active` on exactly one panel. The consuming site controls expansion sizes, artwork, and content visibility with CSS.

## Counters, progress, and ambient loops

```html
<output data-motion-counter data-motion-counter-from="0" data-motion-counter-to="120" data-motion-counter-value>120</output>
<figure data-motion-progress-ring data-motion-progress="72">
  <svg viewBox="0 0 120 120"><circle data-motion-progress-ring-value cx="60" cy="60" r="48" /></svg>
  <output data-motion-progress-ring-label>72%</output>
</figure>
<span aria-hidden="true" data-motion-ambient-float></span>
<div data-motion-logo-belt><div data-motion-logo-belt-track>Two identical logo groups</div></div>
```

Counters preserve their complete output for assistive technology. Progress
rings retain a text label. Infinite ambient and logo motion pauses off-screen
and becomes static under reduced motion.

## FLIP and layout transitions

Use `data-motion-flip-card`, `data-motion-flip-card-trigger`, and
`data-motion-flip-card-detail` for a controlled card expansion. Filtered grids use
`data-motion-flip-filter`, `data-motion-filter-control`, and `data-motion-filter-item`.
Navigation indicators use `data-motion-flip-nav`, `data-motion-flip-nav-item`, and an
inert `data-motion-flip-nav-indicator`. Accordion grids use
`data-motion-layout-accordion-grid`, `data-motion-layout-item`, and native
`data-motion-layout-trigger` buttons.

Application-owned list reorder logic remains outside Motion. Dispatch a scoped
event after declaring the mutation callback:

```js
list.dispatchEvent(new CustomEvent('sf:motion:reorder', {
  detail: { mutate(list, items) { list.append(...items.reverse()) } },
}))
```

Synced Motion captures the prior geometry, runs the callback synchronously,
and animates spatial continuity. Reduced motion runs only the mutation.

## SVG drawing, morphing, and motion paths

```html
<figure data-motion-svg-line-draw><svg><path data-motion-svg-path d="..." /></svg></figure>
<figure data-motion-svg-morph>
  <svg><path data-motion-svg-morph-source d="..." /><path data-motion-svg-morph-target d="..." hidden /></svg>
  <button data-motion-svg-trigger type="button" aria-pressed="false">Change shape</button>
</figure>
<figure data-motion-svg-orbit><svg><path data-motion-svg-orbit-path d="..." /><circle data-motion-svg-orbit-subject /></svg></figure>
<figure data-motion-svg-signature><svg><path d="..." /></svg></figure>
```

`data-motion-svg-icon-state` uses the equivalent `data-motion-svg-icon-source` and
`data-motion-svg-icon-target` slots. Authored paths require visible strokes for
drawing recipes, and morph source/target paths should have compatible intent.

## Page-load and route motion

Page entrances use `data-motion-page-load-hero` with repeated
`data-motion-page-load-item` children, or `data-motion-page-load-brand` with an optional
`data-motion-brand-mark`.

Routers keep ownership of navigation and DOM replacement. A route fade listens
for `sf:motion:route` on `data-motion-route-fade`; pass optional `outgoing`,
`incoming`, and `complete` values in `event.detail`. A shared-media root listens
for `sf:motion:route-shared` and requires a synchronous `detail.mutate`
callback. `data-motion-route-scroll-restore` listens for
`sf:motion:route-complete` with `detail.top`, then refreshes ScrollTrigger.

Every route listener is root-scoped and removed by runtime cleanup.
