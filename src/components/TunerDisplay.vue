<template>
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
  
          <div class="target">
            {{ targetFreq }} Hz
          </div>
  
          <input
            type="range"
            min="40"
            max="300"
            :value="targetFreq"
            @input="$emit('updateTarget', Number($event.target.value))"
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
  </template>
  
  <script setup>
  defineProps({
    frequency: Number,
    note: String,
    cents: Number,
    indicatorStyle: Object,
    targetFreq: Number,
    diff: Number,
    volume: Number,
  })
  
  defineEmits(['updateTarget'])
  </script>