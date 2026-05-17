import { describe, it, expect } from 'vitest'

import { useTuner } from '@/composables/useTuner'

describe('useTuner()', () => {
  it('initializes with default values', () => {
    const tuner = useTuner()

    expect(tuner.frequency.value).toBe(0)
    expect(tuner.note.value).toBe('-')
    expect(tuner.cents.value).toBe(0)
  })

  it('exposes startListening()', () => {
    const tuner = useTuner()

    expect(typeof tuner.startListening).toBe('function')
  })

  it('exposes stopListening()', () => {
    const tuner = useTuner()

    expect(typeof tuner.stopListening).toBe('function')
  })
})