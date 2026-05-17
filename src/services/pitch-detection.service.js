export function autoCorrelate(buffer, sampleRate) {
    let SIZE = buffer.length
    let rms = 0
  
    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i]
    }
  
    rms = Math.sqrt(rms / SIZE)
  
    if (rms < 0.01) return -1
  
    const c = new Array(SIZE).fill(0)
  
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] += buffer[j] * buffer[j + i]
      }
    }
  
    let d = 0
    while (c[d] > c[d + 1]) d++
  
    let maxval = -1
    let maxpos = -1
  
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i]
        maxpos = i
      }
    }
  
    return sampleRate / maxpos
  }