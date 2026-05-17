<template>
  <div class="app">
    <div class="container">
      <HeaderBar
        :isListening="isListening"
        @startMic="startListening"
        @stopMic="stopListening"
      />

      <main class="grid">
        <TunerDisplay
          :frequency="frequency"
          :note="note"
          :cents="cents"
          :indicatorStyle="indicatorStyle"
          :targetFreq="targetFreq"
          :diff="diff"
          :volume="volume"
          @updateTarget="targetFreq = $event"
        />

        <DrumPresets
          :presets="drumPresets"
          @selectPreset="targetFreq = $event"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useTuner } from './composables/useTuner.js'
import HeaderBar from './components/HeaderBar.vue'
import TunerDisplay from './components/TunerDisplay.vue'
import DrumPresets from './components/DrumPresets.vue'

const {
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
} = useTuner()
</script>

