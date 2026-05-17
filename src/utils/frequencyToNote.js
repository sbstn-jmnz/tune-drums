const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F',
    'F#', 'G', 'G#', 'A', 'A#', 'B']
  
  export function frequencyToNote(freq) {
    const noteNum = 12 * (Math.log(freq / 440) / Math.log(2)) + 69
    const rounded = Math.round(noteNum)
  
    return {
      note: NOTES[rounded % 12],
      octave: Math.floor(rounded / 12) - 1,
      cents: Math.floor((noteNum - rounded) * 100),
    }
  }