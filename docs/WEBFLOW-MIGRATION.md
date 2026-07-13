# Migrating a Webflow experience

## Inventory first

Capture every page-load, click, hover, scroll, pin, scrub, reveal, and menu interaction. Record trigger, target, start/end position, duration, ease, stagger, and reduced-motion behavior.

## Replace generated identity

Replace opaque Webflow interaction attributes with readable semantic hooks:

```html
<!-- Before -->
<a data-wf-element-id="645ee970-6c97-eea3-d61b-013ab5a5f236">...</a>

<!-- After -->
<a data-sf-step-link>...</a>
```

## Preserve ownership boundaries

- Convert Webflow variables to Synced Flow tokens.
- Convert utility layout to `sf-*` primitives.
- Keep unique editorial section classes in the consuming site.
- Make state controllers work before adding GSAP presentation.
- Toggle semantic state instead of animating final brand colors inline.

## Removal order

1. Rebuild one interaction locally.
2. Verify it against the reference in both scroll directions.
3. Disable the equivalent Webflow interaction.
4. Remove its generated IDs and overrides.
5. Repeat until the Webflow runtime owns no behavior.
6. Remove Webflow JavaScript and jQuery.
7. Remove unused compatibility CSS and metadata.
8. Run browser, accessibility, reduced-motion, performance, and build checks.

Never remove the Webflow runtime before replacing and verifying every behavior it owns.

