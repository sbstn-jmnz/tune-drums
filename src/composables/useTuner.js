import { ref, computed, onBeforeUnmount } from 'vue'
import { median } from '../utils/median.js'
import { frequencyToNote } from '../utils/frequencyToNote.js'
import { autoCorrelate } from '../services/pitch-detection.service.js'

export function useTuner() {
  const frequency = ref(0)
  const note = ref('-')
  const cents = ref(0)
  const volume = ref(0)
  const targetFreq = ref(110)
  const isListening = ref(false)

  const audioContextRef = ref(null)
  const analyserRef = ref(null)
  const rafRef = ref(null)

  const isLocked = ref(false)
  const lockedFreq = ref(0)
  const lockUntil = ref(0)

  const ATTACK_THRESHOLD = 0.06
  const RELEASE_TIME = 500

  const drumPresets = [
    { name: '10” Tom', freq: 147 },
    { name: '12” Tom', freq: 110 },
    { name: '14” Snare', freq: 220 },
    { name: '16” Floor Tom', freq: 82 },
    { name: '22” Kick', freq: 58 },
  ]

  const diff = computed(() => (frequency.value || 0) - (targetFreq.value || 0))

  const indicatorStyle = computed(() => ({
    left: '50%',
    width: `${Math.min(50, Math.abs(cents.value))}%`,
    transform: `translateX(${cents.value < 0 ? '-100%' : '0%'})`,
  }))

  const freqHistory = []

  async function startListening() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })

      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const audioContext = new AudioContextClass()
      if (audioContext.state === 'suspended') await audioContext.resume()

      const highpass = audioContext.createBiquadFilter()
      highpass.type = 'highpass'
      highpass.frequency.value = 45
      highpass.Q.value = 0.7

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 4096

      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(highpass)
      highpass.connect(analyser)

      audioContextRef.value = audioContext
      analyserRef.value = analyser
      isListening.value = true

      detectPitch()
    } catch (err) {
      console.error(err)
      alert('Microphone access failed')
    }
  }

  function stopListening() {
    cancelAnimationFrame(rafRef.value)
    if (audioContextRef.value) audioContextRef.value.close()
    isListening.value = false
    frequency.value = 0
    note.value = '-'
    cents.value = 0
    volume.value = 0
  }

  function detectPitch() {
    const analyser = analyserRef.value
    const audioContext = audioContextRef.value
    const buffer = new Float32Array(analyser.fftSize)

    const update = () => {
      analyser.getFloatTimeDomainData(buffer)
      const freq = autoCorrelate(buffer, audioContext.sampleRate)

      let rms = 0
      for (let i = 0; i < buffer.length; i++) rms += buffer[i] ** 2
      rms = Math.sqrt(rms / buffer.length)

      const now = Date.now()
      const isAttack = rms > ATTACK_THRESHOLD && !isLocked.value

      if (isAttack) {
        isLocked.value = true
        lockUntil.value = now + RELEASE_TIME
        lockedFreq.value = freq
      }

      let stableFreq = freq
      freqHistory.push(freq)
      if (freqHistory.length > 7) freqHistory.shift()
      if (freqHistory.length >= 3) stableFreq = median(freqHistory)
      if (isLocked.value) stableFreq = lockedFreq.value
      if (isLocked.value && now > lockUntil.value) isLocked.value = false

      volume.value = Math.min(100, rms * 400)

      if (stableFreq > 20 && stableFreq < 500) {
        frequency.value = stableFreq
        const n = frequencyToNote(stableFreq)
        note.value = `${n.note}${n.octave}`
        cents.value = n.cents
      }

      rafRef.value = requestAnimationFrame(update)
    }

    update()
  }

  onBeforeUnmount(() => cancelAnimationFrame(rafRef.value))

  return {
    frequency,
    note,
    cents,
    volume,
    targetFreq,
    diff,
    indicatorStyle,
    isListening,
    startListening,
    stopListening,
    drumPresets,
  }
}