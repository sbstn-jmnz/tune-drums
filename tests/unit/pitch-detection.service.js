import { describe, expect, it } from 'vitest'
import { autoCorrelate } from '@/services/pitch-detection.service'

describe('autoCorrelate()', () => {
  it('detects 110Hz sine wave', () => {
    const sampleRate = 44100
    const freq = 110

    const buffer = new Float32Array(4096)

    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.sin(
        (2 * Math.PI * freq * i) / sampleRate
      )
    }

    const detected = autoCorrelate(buffer, sampleRate)

    expect(detected).toBeGreaterThan(108)
    expect(detected).toBeLessThan(112)
  })
})