<template>
    <aside class="sidebar">
      <h2>Drum Presets</h2>
      <button
        v-for="preset in presets"
        :key="preset.name"
        @click="$emit('selectPreset', preset.freq)"
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
  </template>
  
  <script setup>
  defineProps({
    presets: Array
  })
  </script>
  