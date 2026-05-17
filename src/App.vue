<template>
  <div class="app">
    <div class="container">
      <HeaderBar
        :isListening="isListening"
        @start="startListening"
        @stop="stopListening"
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
          @select="targetFreq = $event"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import HeaderBar from './components/HeaderBar.vue'
import TunerDisplay from './components/TunerDisplay.vue'
import DrumPresets from './components/DrumPresets.vue'

import { useTuner } from './composables/useTuner'

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

<style src="./styles/app.css"></style>