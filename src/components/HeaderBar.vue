<template>
    <header class="header">
      <div>
        <h1>DrumTune</h1>
        <p>Web drum tuner</p>
      </div>
  
      <button
        v-if="!isListening"
        @click="$emit('startMic')"
        class="start-btn"
      >
        Start Mic
      </button>
  
      <button
        v-else
        @click="$emit('stopMic')"
        class="stop-btn"
      >
        Stop
      </button>
    </header>
  </template>
  
  <script setup>
  defineProps({
    isListening: Boolean
  })
  </script>