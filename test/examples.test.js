import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const exampleRoutes = [
  {
    route: '/examples/field-notes/',
    file: 'example/examples/field-notes/index.html',
    recipes: ['data-motion-scroll-progress', 'data-motion-svg-orbit', 'data-motion-pinned-chapters'],
  },
  {
    route: '/examples/kestrel-one/',
    file: 'example/examples/kestrel-one/index.html',
    recipes: ['data-motion-pointer-spotlight', 'data-motion-product-explainer', 'data-motion-comparison', 'data-motion-magnetic'],
  },
  {
    route: '/examples/common-ground/',
    file: 'example/examples/common-ground/index.html',
    recipes: ['data-motion-pointer-spotlight', 'data-motion-ambient-float', 'data-motion-flip-filter', 'data-motion-layout-accordion-grid'],
  },
]

function parse(file) {
  return new DOMParser().parseFromString(readFileSync(resolve(file), 'utf8'), 'text/html')
}

describe('full-page examples', () => {
  it.each(exampleRoutes)('$route has a complete semantic page and several production recipes', ({ file, recipes }) => {
    const page = parse(file)
    expect(page.title.length).toBeGreaterThan(0)
    expect(page.querySelectorAll('h1')).toHaveLength(1)
    expect(page.querySelectorAll('main section').length).toBeGreaterThanOrEqual(4)
    expect(page.querySelector('a[href="../"]')?.textContent).toMatch(/examples/i)
    expect(page.querySelector('a[href="/gallery/"]')).not.toBeNull()
    expect(page.querySelector('a[href="/"]')).not.toBeNull()
    for (const recipe of recipes) expect(page.querySelector(`[${recipe}]`), recipe).not.toBeNull()
  })

  it.each(exampleRoutes)('$route uses labelled artwork and explicit button semantics', ({ file }) => {
    const page = parse(file)
    for (const svg of page.querySelectorAll('svg[role="img"]')) {
      expect(svg.hasAttribute('aria-label') || svg.hasAttribute('aria-labelledby')).toBe(true)
    }
    for (const button of page.querySelectorAll('button')) expect(button.getAttribute('type')).toBe('button')
  })

  it('keeps orchestration in the shared public API bootstrap', () => {
    const source = readFileSync(resolve('example/examples/main.js'), 'utf8')
    // Either published entry point is fine; what matters is that the example
    // drives motion through the package API and never touches GSAP directly.
    expect(source).toMatch(/import \{ createSyncedMotion \} from '\.\.\/\.\.\/src\/(index|full)\.js'/)
    expect(source).toContain('createSyncedMotion({ smoothScroll: true })')
    expect(source).not.toMatch(/from ['"]gsap|ScrollTrigger\.create|new Lenis/)
  })

  it('gives each page a distinct primary interaction system', () => {
    const [field, product, studio] = exampleRoutes.map(({ file }) => parse(file))
    expect(field.querySelector('[data-motion-svg-orbit]')).not.toBeNull()
    expect(field.querySelector('[data-motion-product-explainer], [data-motion-flip-filter]')).toBeNull()
    expect(product.querySelector('[data-motion-product-explainer]')).not.toBeNull()
    expect(product.querySelector('[data-motion-comparison-range][type="range"]')).not.toBeNull()
    expect(product.querySelector('[data-motion-svg-orbit], [data-motion-flip-filter]')).toBeNull()
    expect(studio.querySelector('[data-motion-flip-filter]')).not.toBeNull()
    expect(studio.querySelector('[data-motion-layout-accordion-grid]')).not.toBeNull()
    expect(studio.querySelector('[data-motion-svg-orbit], [data-motion-product-explainer]')).toBeNull()
  })

  it('makes complete examples prominent from the showcase and catalog', () => {
    const showcase = parse('example/index.html')
    const gallery = parse('example/gallery/index.html')
    expect(showcase.querySelectorAll('a[href="/examples/"]').length).toBeGreaterThanOrEqual(2)
    expect(gallery.querySelectorAll('a[href="/examples/"]').length).toBeGreaterThanOrEqual(2)
  })

  it('keeps the examples readable without script-authored content', () => {
    for (const { file } of exampleRoutes) {
      const page = parse(file)
      expect(page.querySelector('main')?.textContent.length).toBeGreaterThan(900)
      expect(page.querySelector('main')?.textContent).not.toMatch(/lorem|placeholder|coming soon/i)
    }
  })
})
