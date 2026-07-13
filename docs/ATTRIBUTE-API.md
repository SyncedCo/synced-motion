# Declarative attribute API

## Reveal

```html
<h2 class="sf-text-h2" data-sf-reveal="up">Built for motion</h2>
```

Values: `fade`, `up`, `down`, `left`, `right`, or `scale`.

Optional attributes: `data-sf-duration`, `data-sf-delay`, `data-sf-ease`, `data-sf-start`, and `data-sf-once`.

## Stagger

```html
<div class="sf-auto-grid" data-sf-stagger="0.08" data-sf-stagger-target=".card">
  <article class="card">...</article>
  <article class="card">...</article>
</div>
```

## Split text

```html
<h1
  data-sf-split="lines"
  data-sf-stagger="0.08"
  data-sf-split-mask="true"
>
  Editorial motion that follows the layout.
</h1>
```

Use `lines`, `words`, `chars`, or a comma-separated combination. Line splits automatically rebuild after font or width changes. Screen readers retain the unsplit accessible label. Masks are opt-in because tight editorial line-height can otherwise clip ascenders, descenders, and punctuation.

## Parallax

```html
<figure class="sf-frame" data-sf-parallax-scene>
  <img data-sf-parallax="10" alt="" />
</figure>
```

## Scroll steps

```html
<section data-sf-scroll-steps data-sf-end="bottom bottom">
  <div data-sf-pin-target>
    <nav>
      <a data-sf-step-link>One</a>
      <a data-sf-step-link>Two</a>
    </nav>
    <div data-sf-step-panel>First panel</div>
    <div data-sf-step-panel>Second panel</div>
  </div>
</section>
```

The runtime only toggles `data-active` and `aria-current`. Synced Flow or project CSS owns the colors and layout.

## Scroll exit

```html
<section data-sf-scroll-exit-scene>
  <div
    data-sf-scroll-exit="down"
    data-sf-exit-distance="9rem"
    data-sf-exit-end="bottom 35%"
  >
    ...
  </div>
</section>
```

The element translates `down` or `up` and fades as the scene leaves the viewport. The motion is scrubbed, uses `rem` distances, and is disabled when reduced motion is requested.

## Scroll statement

```html
<section data-sf-scroll-statement data-sf-scrub="0.8">
  <div data-sf-statement-pin>
    <p data-sf-statement-label>A short label</p>
    <h2 data-sf-statement-heading>
      <span data-sf-statement-lead>The complete thought </span>
      <span data-sf-statement-inline-accent>with emphasis.</span>
    </h2>
    <span data-sf-statement-hero-accent aria-hidden="true">emphasis</span>
    <div data-sf-statement-details>
      <p data-sf-statement-detail>Supporting content</p>
    </div>
  </div>
</section>
```

The section pins while scrolling and begins with an oversized standalone accent. That accent contracts and crossfades into the full centered statement before the collapsed details expand and reveal in sequence. The markup remains readable without JavaScript and the pinned scrub sequence is disabled for reduced motion.

## Scroll drift

```html
<section data-sf-scroll-drift data-sf-scrub="0.8">
  <div data-sf-drift-layer aria-hidden="true">Oversized background mark</div>
  <div>Readable foreground content</div>
</section>
```

The decorative layer moves from `x: 10%` and transparent to its resting position at ten-percent opacity while the section travels from below to above the viewport. Optional `data-sf-drift-from` and `data-sf-drift-opacity` attributes override those defaults. Reduced motion leaves the decorative layer in its authored CSS state.

## Founder statement

```html
<section data-sf-founder-scene data-sf-scrub="0.8">
  <div class="sticky-frame">
    <img src="background.avif" alt="" />
    <div data-sf-founder-content>
      <h2 data-sf-founder-heading>A centered statement revealed word by word.</h2>
    </div>
  </div>
</section>
```

The first content layer fades in while SplitText words rise from below with the measured Union Jack AI timing, holds briefly, then moves down and fades away. The statement background crossfades into a second locally owned background while an oversized metric, label, and three detail columns scale and rise into view. The consuming site owns the sticky frame, content, and background styling. Reduced motion leaves the unsplit heading and authored layout visible.

## Media expansion

```html
<section data-sf-media-expand data-sf-scrub="0.8">
  <div class="sticky-frame">
    <p data-sf-media-expand-prompt>Keep scrolling</p>
    <span data-sf-media-expand-label="start">©2026</span>
    <span data-sf-media-expand-label="end">Showreel</span>
    <figure data-sf-media-expand-frame>
      <img src="sample.jpg" alt="Sample project artwork" />
      <figcaption data-sf-media-expand-caption>Play showreel</figcaption>
    </figure>
  </div>
</section>
```

The image begins as a cropped central pill, expands to the viewport edges through a scrubbed clip-path, and gently scales its contents down. One shared expansion value calculates both the media inset and label anchors on every update, keeping each label immediately outside the true mask edge. When a gutter can no longer contain a label, that label exits the viewport instead of moving behind or over the image. The prompt exits early, the media action appears midway, and the CSS-sticky frame releases to reveal the following footer or section. Reduced motion keeps the authored full media frame readable.

## Hover media

```html
<div data-sf-hover-group>
  <a data-sf-hover-key="mission">Mission</a>
  <a data-sf-hover-key="work">Work</a>
  <img data-sf-hover-media="mission" alt="" />
  <img data-sf-hover-media="work" alt="" />
</div>
```

Keyboard focus and pointer hover use the same state path.

## Menu

```html
<nav data-sf-menu>
  <button data-sf-menu-trigger aria-controls="main-menu">Menu</button>
  <div id="main-menu" data-sf-menu-panel>
    <a data-sf-menu-item href="/work">Work</a>
  </div>
</nav>
```

The controller owns `aria-expanded`, `aria-hidden`, Escape handling, focus containment, focus return, and scroll locking.

## Expanding panels

```html
<div data-sf-expand-group data-sf-expand-default="3">
  <article tabindex="0" data-sf-expand-panel>...</article>
  <article tabindex="0" data-sf-expand-panel>...</article>
  <article tabindex="0" data-sf-expand-panel>...</article>
  <article tabindex="0" data-sf-expand-panel>...</article>
</div>
```

Pointer hover and keyboard focus toggle `data-active` on exactly one panel. The consuming site controls expansion sizes, artwork, and content visibility with CSS.
