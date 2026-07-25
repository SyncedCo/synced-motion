import { expect, test } from '@playwright/test'

// One representative recipe per family. jsdom cannot exercise these: there is
// no layout, so ScrollTrigger never fires, SplitText never splits and Flip
// measures nothing. These run in a real engine against the same fixtures the
// gallery and the catalog use.
const FAMILIES = [
  { family: 'reveals-entrances', id: 'reveal-rise' },
  { family: 'split-text-typography', id: 'split-lines-rise' },
  { family: 'scroll-parallax', id: 'scroll-parallax' },
  { family: 'pinned-storytelling', id: 'pinned-steps' },
  { family: 'horizontal-galleries', id: 'horizontal-gallery-scrub' },
  { family: 'hover-focus-pointer', id: 'hover-lift' },
  { family: 'navigation-overlay', id: 'accessible-menu' },
  { family: 'media-mask-clip', id: 'image-focus-pan' },
  { family: 'loops-progress-ambient', id: 'marquee' },
  { family: 'flip-layout', id: 'flip-list-reorder' },
  { family: 'svg-path-morph', id: 'svg-line-draw' },
  { family: 'page-load-route', id: 'page-load-hero' },
]

async function openHarness(page) {
  await page.goto('/')
  await page.waitForFunction(() => document.documentElement.dataset.harnessReady === 'true')
}

test.beforeEach(async ({ page }) => {
  const failures = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text())
  })
  await openHarness(page)
  page.motionFailures = failures
})

test('the harness registers all sixty recipes across twelve families', async ({ page }) => {
  const ids = await page.evaluate(() => window.motionHarness.ids())
  const families = await page.evaluate(() => window.motionHarness.families())

  expect(ids).toHaveLength(60)
  expect(families).toHaveLength(12)
})

for (const { family, id } of FAMILIES) {
  test(`${family}: ${id} mounts cleanly in a real browser`, async ({ page }) => {
    const diagnostics = await page.evaluate((recipeId) => window.motionHarness.mount(recipeId), id)

    expect(diagnostics.errors, `${id} raised runtime errors`).toEqual([])
    expect(diagnostics.skipped, `${id} was skipped`).toEqual([])
    expect(diagnostics.mounted.map((entry) => entry.id)).toContain(id)
    expect(page.motionFailures, `${id} logged page errors`).toEqual([])
  })

  test(`${family}: ${id} keeps its content readable`, async ({ page }) => {
    await page.evaluate((recipeId) => window.motionHarness.mount(recipeId), id)
    // Let entrance timelines settle.
    await page.waitForTimeout(400)

    const content = await page.evaluate(() => window.motionHarness.perceivableContent())
    expect(content.length, `${id} rendered nothing a user could perceive`).toBeGreaterThan(0)
  })

  test(`${family}: ${id} restores the authored DOM on destroy`, async ({ page }) => {
    const before = await page.evaluate((recipeId) => {
      window.motionHarness.mount(recipeId)
      return window.motionHarness.stageHtml()
    }, id)

    await page.waitForTimeout(200)

    const after = await page.evaluate(() => {
      window.motionHarness.destroy()
      return window.motionHarness.stageHtml()
    })

    // GSAP may leave inline styles mid-tween; what must not survive teardown is
    // the runtime's own bookkeeping attribute.
    expect(after, `${id} left a mounted marker behind`).not.toContain('data-sf-motion-recipe')
    expect(before.length, `${id} produced no markup`).toBeGreaterThan(0)
  })

  test(`${family}: ${id} honours prefers-reduced-motion`, async ({ page }) => {
    const diagnostics = await page.evaluate(
      (recipeId) => window.motionHarness.mount(recipeId, { reduced: true }),
      id,
    )

    expect(diagnostics.reduced).toBe(true)
    expect(diagnostics.errors, `${id} errored under reduced motion`).toEqual([])

    await page.waitForTimeout(200)
    const content = await page.evaluate(() => window.motionHarness.perceivableContent())
    expect(content.length, `${id} hid its content under reduced motion`).toBeGreaterThan(0)
  })
}

test('scroll-driven recipes respond to actual scrolling', async ({ page }) => {
  await page.evaluate(() => window.motionHarness.mount('scroll-parallax'))

  const before = await page.evaluate(() => window.motionHarness.measure('[data-sf-parallax]'))
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => window.motionHarness.measure('[data-sf-parallax]'))

  expect(before?.transform, 'parallax produced no transform').toBeDefined()
  expect(after?.transform).not.toBe(before?.transform)
})

test('reduced motion leaves content at its authored final state', async ({ page }) => {
  await page.evaluate(() => window.motionHarness.mount('reveal-rise', { reduced: true }))
  await page.waitForTimeout(300)

  const measured = await page.evaluate(() => window.motionHarness.measure('[data-sf-reveal]'))
  expect(measured.opacity).toBe(1)
  expect(measured.visibility).not.toBe('hidden')
})
