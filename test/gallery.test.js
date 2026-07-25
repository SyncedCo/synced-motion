import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { restoreRecipeLinkFocus } from '../example/gallery/gallery-state.js'
import { renderPreviewError } from '../example/gallery/preview-dom.js'

describe('recipe gallery safety and focus', () => {
  it('renders preview errors as text instead of reflected HTML', () => {
    const stage = document.createElement('main')
    renderPreviewError(stage, new Error('<img src=x onerror="globalThis.pwned=true">'))
    expect(stage.querySelector('img')).toBeNull()
    expect(stage.textContent).toContain('<img src=x onerror="globalThis.pwned=true">')
  })

  it('restores focus to the recipe link that opened the inspector', () => {
    document.body.innerHTML = '<div id="grid"><a href="?recipe=reveal-rise" data-inspect-recipe="reveal-rise">Inspect</a></div>'
    const link = document.querySelector('a')
    link.focus = vi.fn(HTMLElement.prototype.focus.bind(link))
    expect(restoreRecipeLinkFocus(document.querySelector('#grid'), 'reveal-rise')).toBe(true)
    expect(link.focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(document.activeElement).toBe(link)
  })

  it('uses a contrasting semantic tone for the catalog recipe count', () => {
    const markup = readFileSync(resolve('example/gallery/index.html'), 'utf8')
    const page = new DOMParser().parseFromString(markup, 'text/html')
    expect(page.querySelector('#recipe-count')?.getAttribute('data-tone')).toBe('info')
    expect(page.querySelector('#recipe-count')?.getAttribute('data-dot')).toBe('false')
  })

  it('keeps a page-level heading outside replaceable fixture markup', () => {
    const markup = readFileSync(resolve('example/gallery/preview.html'), 'utf8')
    const page = new DOMParser().parseFromString(markup, 'text/html')
    const title = page.querySelector('main > #preview-title')
    expect(title?.localName).toBe('h1')
    expect(title?.classList.contains('sf-visually-hidden')).toBe(true)
    expect(page.querySelector('#preview-stage')?.contains(title)).toBe(false)
  })

  it('does not send no-JavaScript users to an unserved documentation route', () => {
    const markup = readFileSync(resolve('example/gallery/index.html'), 'utf8')
    const page = new DOMParser().parseFromString(markup, 'text/html')
    const fallback = page.querySelector('noscript')
    expect(fallback?.textContent).toContain('docs/RECIPES.md')
    expect(fallback?.textContent).toContain('synced-motion catalog --json')
    expect(fallback?.querySelector('a')).toBeNull()
  })
})
