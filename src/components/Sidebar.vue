<template>
  <div class="sidebar">
    <h2 class="section-title">📦 Components</h2>
    <div class="component-pool">
      <div
        v-for="component in components"
        :key="component.type"
        :id="`component-pool-${component.type}`"
        class="component-item"
        draggable="true"
        @dragstart="$emit('drag-start', component.type)"
      >
        <span class="component-icon">{{ component.icon }}</span>
        <span>{{ component.type }}</span>
      </div>
    </div>

    <button id="add-machine-btn" class="add-machine-btn" @click="$emit('add-machine')">
      ➕ Add Physical Machine
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Component } from '../types'

defineEmits<{
  'add-machine': []
  'drag-start': [type: Component['type']]
}>()

const components: Array<{ type: Component['type']; icon: string }> = [
  { type: 'etcd', icon: '🔧' },
  { type: 'metasrv', icon: '⚙️' },
  { type: 'datanode', icon: '💾' },
  { type: 'frontend', icon: '🌐' }
]
</script>