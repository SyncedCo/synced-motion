import { expect, test } from '@playwright/test'

// The recipe schema forces every recipe to declare its accessibility and
// reduced-motion behaviour. These tests check the declarations are true of the
// running code, not just of the manifest.

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => document.documentElement.dataset.harnessReady === 'true')
})

test('the menu traps focus, closes on Escape and returns focus to its trigger', async ({ page }) => {
  await page.evaluate(() => window.motionHarness.mount('accessible-menu'))

  const trigger = page.locator('[data-motion-menu-trigger]')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  // Focus moves once the entrance completes, not on a timer: the items animate
  // from autoAlpha 0 and a visibility:hidden element cannot take focus.
  await page.waitForFunction(
    () => document.querySelector('[data-motion-menu-panel]').contains(document.activeElement),
    undefined,
    { timeout: 3000 },
  )

  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  const focusOnTrigger = await page.evaluate(() =>
    document.activeElement === document.querySelector('[data-motion-menu-trigger]'))
  expect(focusOnTrigger).toBe(true)
})

test('an outside click closes the menu without stealing focus', async ({ page }) => {
  await page.evaluate(() => window.motionHarness.mount('accessible-menu'))

  const trigger = page.locator('[data-motion-menu-trigger]')
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.waitForFunction(
    () => document.querySelector('[data-motion-menu-panel]').contains(document.activeElement),
    undefined,
    { timeout: 3000 },
  )

  await page.mouse.click(5, 5)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('destroying the runtime never leaves an expanded menu on the page', async ({ page }) => {
  await page.evaluate(() => window.motionHarness.mount('accessible-menu'))
  await page.locator('[data-motion-menu-trigger]').click()
  await page.waitForFunction(
    () => document.querySelector('[data-motion-menu-panel]').contains(document.activeElement),
    undefined,
    { timeout: 3000 },
  )

  await page.evaluate(() => window.motionHarness.destroy())

  const state = await page.evaluate(() => {
    const panel = document.querySelector('[data-motion-menu-panel]')
    const trigger = document.querySelector('[data-motion-menu-trigger]')
    return {
      hidden: panel.hidden,
      ariaExpanded: trigger.getAttribute('aria-expanded'),
      scrollLocked: document.documentElement.hasAttribute('data-motion-scroll-locked'),
    }
  })

  // The authored markup had the panel hidden and the trigger collapsed.
  expect(state.hidden).toBe(true)
  expect(state.ariaExpanded).toBe('false')
  expect(state.scrollLocked).toBe(false)
})

test('a recipe authored with data-motion-* attributes mounts and cleans up', async ({ page }) => {
  const result = await page.evaluate(() => {
    const stage = document.querySelector('#stage')
    stage.innerHTML = '<p data-motion-reveal="up">Readable content</p>'
    return window.motionHarness.ids().includes('reveal-rise')
  })
  expect(result).toBe(true)

  const diagnostics = await page.evaluate(() => {
    const stage = document.querySelector('#stage')
    stage.innerHTML = '<p data-motion-reveal="up">Readable content</p>'
    // Mount through the public runtime so the alias pass runs.
    return window.motionHarness.mount('reveal-rise')
  })
  expect(diagnostics.errors).toEqual([])
})

test('the typewriter keeps its complete text available to assistive technology', async ({ page }) => {
  await page.evaluate(() => window.motionHarness.mount('typewriter-announce'))
  await page.waitForTimeout(300)

  const text = await page.evaluate(() => window.motionHarness.text())
  expect(text.length).toBeGreaterThan(10)
})
