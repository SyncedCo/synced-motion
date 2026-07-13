# Synced Motion capability blueprint

Synced Motion reproduces the published-page capabilities that make Webflow useful for animated marketing sites, while keeping layout and visual identity inside Synced Flow.

It is not intended to recreate Webflow's hosted visual Designer, billing platform, hosting, or collaborative SaaS interface.

## System ownership

| Concern | Owner |
|---|---|
| Fluid layout, typography, spacing, colors | Synced Flow |
| Semantic application state | Consuming application |
| Timed animation and sequencing | GSAP through Synced Motion |
| Scroll progress, pinning, scrub and triggers | ScrollTrigger |
| Optional smooth scrolling | Lenis adapter |
| Editable content | Static data or a headless CMS |
| Localization | Application router or CMS |
| Testing and personalization | Dedicated analytics/experimentation service |

## Webflow capability mapping

| Webflow capability | Synced implementation |
|---|---|
| Designer variables | Synced Flow semantic tokens |
| Global colors | OKLCH `--sf-colour-*` tokens |
| Responsive breakpoints | Fluid values, intrinsic layout and container queries |
| Components | Semantic templates or framework components |
| Interaction timeline | GSAP timelines and reusable patterns |
| Scroll reveals | `data-sf-reveal` and ScrollTrigger |
| Stagger sequences | `data-sf-stagger` |
| Scroll-linked motion | ScrollTrigger scrub patterns |
| Pinned storytelling | `data-sf-scroll-steps` and `data-sf-pin-target` |
| Hover-driven imagery | `data-sf-hover-group` |
| Menus and overlays | Accessible `data-sf-menu` controller |
| Smooth scrolling | Optional Lenis adapter |
| Interaction element IDs | Readable semantic `data-sf-*` hooks |
| CMS Collections | JSON, Markdown or a headless CMS |
| Collection pages | Reusable application templates |
| Conditional visibility | Component or template logic |
| Localize | Locale routing and CMS localization |
| Optimize | Separate experimentation integration |

## Included first-release patterns

- entrance and viewport reveals;
- responsive SplitText line, word, and character reveals;
- staggered child reveals;
- scroll-linked parallax;
- scrubbed directional scroll exits for hero and editorial content;
- two-stage founder narratives with local background crossfades, word reveals, oversized metrics, and staggered detail groups;
- full-height editorial offer panels with scrubbed horizontal background drift;
- pinned mission statements that contract a standalone accent into a complete headline before revealing supporting metrics;
- pinned media expansions that grow a cropped image pill into a full-viewport feature while pushing adjacent labels outward;
- pinned multi-step narratives with semantic active states;
- hover/focus-driven media switching;
- pointer and keyboard-driven expanding panel groups;
- accessible animated navigation menus;
- optional Lenis integration with the GSAP ticker;
- automatic reduced-motion handling;
- cleanup for page transitions and hot reload;
- Synced Flow semantic color integration.

## Planned expansion

- horizontal scroll galleries;
- clip-path and mask transitions;
- cursor-follow and magnetic interactions;
- SVG drawing and morphing recipes;
- FLIP-powered layout transitions;
- route transition adapters;
- framework adapters for React, Vue and Svelte;
- a recipe catalog and scaffolding CLI;
- visual debug overlays and performance budgets;
- CMS and localization integration examples.

## Design rule

Motion changes presentation, not meaning. Synced Motion toggles semantic states and animates transforms or opacity. It does not inject hardcoded brand colors, typography, or layout values. This ensures that changing a Synced Flow theme cannot be undermined by stale animation values.

## Showcase promotion rule

The example is a consumer of the package. Any timeline, scroll controller, SplitText sequence, or interaction-state controller first demonstrated in the showcase must live in `src/patterns`, be initialized by `createSyncedMotion`, be documented in the attribute API, and be exported from the package entry point. The example may own Synced Flow layout, visual tokens, and CSS transitions that present semantic states; it may not contain direct GSAP, ScrollTrigger, SplitText, or Lenis orchestration.
