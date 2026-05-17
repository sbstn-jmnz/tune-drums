import { describe, expect, it } from 'vitest'
import { median } from '@/utils/median'

describe('median()', () => {
  it('returns median for odd arrays', () => {
    expect(median([1, 5, 3])).toBe(3)
  })

  it('sorts automatically', () => {
    expect(median([100, 2, 50])).toBe(50)
  })

  it('handles drum-like frequencies', () => {
    expect(median([109, 110, 400, 111, 108])).toBe(110)
  })
})