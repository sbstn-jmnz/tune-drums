import { describe, expect, it } from 'vitest'
import frequencyToNote from '@/utils/frequencyToNote'

describe('frequencyToNote()', () => {
  it('detects A4', () => {
    const result = frequencyToNote(440)

    expect(result.note).toBe('A')
    expect(result.octave).toBe(4)
  })

  it('detects C4', () => {
    const result = frequencyToNote(261.63)

    expect(result.note).toBe('C')
  })
})