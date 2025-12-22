<template>
  <span class="machine-component" draggable="true">
    <span class="component-icon">{{ getIcon(component.type) }}</span>
    <span>{{ component.type }}</span>
    <span v-if="component.count > 1">({{ component.count }})</span>
    <button
      class="delete-component-btn"
      @click="$emit('delete')"
      title="Delete component"
    >
      ×
    </button>
  </span>
</template>

<script setup lang="ts">
import type { Component } from '../types'

defineProps<{
  component: Component
  machineId: number
  componentIndex: number
}>()

defineEmits<{
  delete: []
}>()

const iconMap = {
  etcd: '🔧',
  metasrv: '⚙️',
  datanode: '💾',
  frontend: '🌐'
}

function getIcon(type: Component['type']) {
  return iconMap[type]
}
</script>