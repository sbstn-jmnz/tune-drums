export function median(values) {
    if (!values.length) return 0
  
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
  
    return sorted[mid]
  }