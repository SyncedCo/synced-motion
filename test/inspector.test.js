import { describe, expect, it, vi } from 'vitest'
import { coerceMotionParameter, createMotionInspector, filterMotionCatalog } from '../src/inspector.js'

describe('motion inspector model', () => {
  it('filters catalog metadata without maintaining a second recipe map', () => {
    const inspector = createMotionInspector()
    expect(filterMotionCatalog(inspector.catalog.recipes, { query: 'morph' }).map((recipe) => recipe.id)).toEqual(expect.arrayContaining(['svg-path-morph', 'svg-icon-state']))
    expect(filterMotionCatalog(inspector.catalog.recipes, { family: 'page-load-route' })).toHaveLength(5)
    expect(filterMotionCatalog(inspector.catalog.recipes, { performance: 'low' }).length).toBeGreaterThan(0)
  })

  it('selects fixtures, coerces bounded parameters, resets, and exposes diagnostics', () => {
    const runtime = { inspect: vi.fn(() => ({ active: true, mounted: [{ id: 'reveal-rise' }], skipped: [], errors: [] })) }
    const inspector = createMotionInspector({ runtime })
    const selected = inspector.select('reveal-rise')
    expect(selected.fixture.id).toBe('default')
    expect(selected.parameters.start).toBe('top 85%')
    expect(selected.diagnostics.active).toBe(true)
    expect(inspector.setParameter('start', 'top 70%').parameters.start).toBe('top 70%')
    expect(inspector.reset().parameters.start).toBe('top 85%')
  })

  it('coerces supported control values and rejects invalid enums', () => {
    expect(coerceMotionParameter({ type: 'boolean' }, 'true')).toBe(true)
    expect(coerceMotionParameter({ type: 'number', min: 0, max: 2 }, 4)).toBe(2)
    expect(() => coerceMotionParameter({ type: 'enum', values: ['soft', 'bold'] }, 'other')).toThrow('Expected one of')
  })
})
