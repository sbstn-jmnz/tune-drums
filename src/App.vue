<template>
  <div class="app">
    <div class="container">
      <header class="header">
        <div>
          <h1>DrumTune</h1>
          <p>Web drum tuner inspired by Tune-Bot hardware</p>
        </div>

        <button
          v-if="!isListening"
          @click="startListening"
          class="start-btn"
        >
          Start Mic
        </button>

        <button
          v-else
          @click="stopListening"
          class="stop-btn"
        >
          Stop
        </button>
      </header>

      <main class="grid">
        <section class="main-panel">
          <div class="display-row">
            <div>
              <div class="label">Detected Frequency</div>
              <div class="frequency">
                {{ frequency ? frequency.toFixed(1) : '--' }}
                <span>Hz</span>
              </div>
            </div>

            <div class="note-box">
              <div class="label">Detected Note</div>
              <div class="note">{{ note }}</div>
            </div>
          </div>

          <div class="tuner-section">
            <div class="tuner-labels">
              <span>Flat</span>
              <span>In Tune</span>
              <span>Sharp</span>
            </div>

            <div class="tuner-bar">
              <div class="center-line"></div>

              <div
                class="cents-indicator"
                :style="indicatorStyle"
              ></div>
            </div>

            <div class="cents-display">
              {{ cents > 0 ? '+' : '' }}{{ cents }} cents
            </div>
          </div>

          <div class="controls-grid">
            <div class="card">
              <div class="label">Target Frequency</div>
              <div class="target">{{ targetFreq }} Hz</div>

              <input
                type="range"
                min="40"
                max="300"
                v-model="targetFreq"
              />
            </div>

            <div class="card">
              <div class="label">Difference</div>

              <div
                class="difference"
                :class="Math.abs(diff) < 1 ? 'green' : 'orange'"
              >
                {{ diff > 0 ? '+' : '' }}{{ diff.toFixed(1) }} Hz
              </div>

              <div class="volume-section">
                <div class="label">Input Level</div>

                <div class="volume-bar">
                  <div
                    class="volume-fill"
                    :style="{ width: volume + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside class="sidebar">
          <h2>Drum Presets</h2>

          <button
            v-for="preset in drumPresets"
            :key="preset.name"
            @click="targetFreq = preset.freq"
            class="preset-btn"
          >
            <div class="preset-name">{{ preset.name }}</div>
            <div class="preset-freq">Target: {{ preset.freq }} Hz</div>
          </button>

          <div class="workflow-card">
            <div class="workflow-title">Suggested workflow</div>

            <ol>
              <li>Mute opposite drum head</li>
              <li>Tap near one lug</li>
              <li>Match all lug frequencies</li>
              <li>Check center pitch</li>
              <li>Save preset</li>
            </ol>
          </div>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  return sorted[mid]
}

const freqHistory = []

const isListening = ref(false)
const frequency = ref(0)
const note = ref('-')
const cents = ref(0)
const volume = ref(0)
const targetFreq = ref(110)

const audioContextRef = ref(null)
const analyserRef = ref(null)
const rafRef = ref(null)

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const drumPresets = [
  { name: '10” Tom', freq: 147 },
  { name: '12” Tom', freq: 110 },
  { name: '14” Snare', freq: 220 },
  { name: '16” Floor Tom', freq: 82 },
  { name: '22” Kick', freq: 58 },
]

const diff = computed(() => frequency.value - targetFreq.value)

const indicatorStyle = computed(() => ({
  left: '50%',
  width: `${Math.min(50, Math.abs(cents.value))}%`,
  transform: `translateX(${cents.value < 0 ? '-100%' : '0%'})`,
}))

function frequencyToNote(freq) {
  const noteNum = 12 * (Math.log(freq / 440) / Math.log(2)) + 69
  const rounded = Math.round(noteNum)

  return {
    note: NOTES[rounded % 12],
    octave: Math.floor(rounded / 12) - 1,
    cents: Math.floor((noteNum - rounded) * 100),
  }
}

function autoCorrelate(buffer, sampleRate) {
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

  const T0 = maxpos

  return sampleRate / T0
}

async function startListening() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext

    const audioContext = new AudioContextClass()
    const highpass = audioContext.createBiquadFilter()
      highpass.type = 'highpass'
      highpass.frequency.value = 45
      highpass.Q.value = 0.7

    // IMPORTANTE PARA iOS
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 4096

    const microphone =
      audioContext.createMediaStreamSource(stream)

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

  if (audioContextRef.value) {
    audioContextRef.value.close()
  }

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

    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i]
    }

    rms = Math.sqrt(rms / buffer.length)

    if (rms < 0.02) {
      rafRef.value = requestAnimationFrame(update)
      return
    }

    volume.value = Math.min(100, rms * 400)

    let stableFreq = freq

    freqHistory.push(freq)

    if (freqHistory.length > 7) {
        freqHistory.shift()
    }

    if (freqHistory.length >= 3) {
        stableFreq = median(freqHistory)
    }

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

onBeforeUnmount(() => {
  cancelAnimationFrame(rafRef.value)
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: #000;
  color: white;
  font-family: Inter, sans-serif;
  padding: 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

h1 {
  font-size: 4rem;
  margin: 0;
  color: #ff7a00;
}

p {
  color: #888;
  margin-top: 0.5rem;
}

.start-btn,
.stop-btn {
  border: none;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.start-btn {
  background: #ff7a00;
  color: black;
}

.stop-btn {
  background: #ff3b30;
  color: white;
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.main-panel,
.sidebar {
  background: #0c0c0c;
  border: 1px solid #222;
  border-radius: 32px;
  padding: 2rem;
}

.display-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.frequency {
  font-size: 5rem;
  font-weight: 900;
  color: #ff7a00;
}

.frequency span {
  font-size: 2rem;
}

.note {
  font-size: 4rem;
  font-weight: 900;
}

.tuner-section {
  margin-top: 3rem;
}

.tuner-labels {
  display: flex;
  justify-content: space-between;
  color: #777;
  margin-bottom: 0.5rem;
}

.tuner-bar {
  height: 24px;
  background: #111;
  border-radius: 999px;
  position: relative;
  overflow: hidden;
  border: 1px solid #222;
}

.center-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #00ff88;
}

.cents-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  background: #ff7a00;
}

.cents-display {
  margin-top: 1rem;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
}

.controls-grid {
  margin-top: 3rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.card {
  background: #111;
  border: 1px solid #222;
  border-radius: 24px;
  padding: 1.5rem;
}

.target,
.difference {
  font-size: 3rem;
  font-weight: 900;
  margin-top: 0.5rem;
}

.orange {
  color: #ff7a00;
}

.green {
  color: #00ff88;
}

.volume-section {
  margin-top: 2rem;
}

.volume-bar {
  height: 16px;
  background: black;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #222;
  margin-top: 0.5rem;
}

.volume-fill {
  height: 100%;
  background: #00ff88;
}

.sidebar h2 {
  color: #ff7a00;
  margin-top: 0;
}

.preset-btn {
  width: 100%;
  background: #111;
  border: 1px solid #222;
  color: white;
  border-radius: 20px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  text-align: left;
}

.preset-btn:hover {
  background: #1a1a1a;
}

.preset-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.preset-freq {
  color: #777;
  margin-top: 0.3rem;
}

.workflow-card {
  margin-top: 2rem;
  background: black;
  border: 1px solid #222;
  border-radius: 24px;
  padding: 1.5rem;
}

.workflow-title {
  color: #666;
  margin-bottom: 1rem;
}

ol {
  color: #bbb;
  line-height: 1.8;
  padding-left: 1.2rem;
}

input[type='range'] {
  width: 100%;
  margin-top: 1rem;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .display-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }

  .controls-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  h1 {
    font-size: 3rem;
  }

  .frequency {
    font-size: 4rem;
  }
}
</style>
