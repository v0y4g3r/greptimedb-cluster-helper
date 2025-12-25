<template>
  <div
    class="machine-card"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <div class="machine-header">
      <div class="machine-title">Machine {{ machine.id }}</div>
      <button class="delete-machine-btn" @click="$emit('delete')">
        🗑️ Delete
      </button>
    </div>

    <div class="machine-inputs">
      <div class="input-group">
        <label>Host IP Address:</label>
        <input
          :id="`host-ip-input-${machine.id}`"
          type="text"
          placeholder="e.g., 192.168.1.100"
          :value="machine.hostIp"
          @input="updateField('hostIp', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="input-group">
        <label>GreptimeDB Home Directory:</label>
        <input
          type="text"
          placeholder="e.g., /opt/greptimedb"
          :value="machine.greptimeHome"
          @input="updateField('greptimeHome', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div
      class="components-slot"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <div v-if="!machine.components || machine.components.length === 0" class="slot-label">
        Drag components here
      </div>
      <MachineComponent
        v-for="(component, index) in machine.components"
        :key="`${component.type}-${index}`"
        :component="component"
        :machine-id="machine.id"
        :component-index="index"
        @delete="$emit('delete-component', index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Machine } from '../types'
import MachineComponent from './MachineComponent.vue'

const props = defineProps<{
  machine: Machine
}>()

const emit = defineEmits<{
  delete: []
  update: [machineId: number, field: keyof Machine, value: string]
  'delete-component': [componentIndex: number]
  drop: [event: DragEvent, machineId: number]
  'drag-over': [event: DragEvent]
  'drag-leave': [event: DragEvent]
}>()

function updateField(field: keyof Machine, value: string) {
  emit('update', props.machine.id, field, value)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
  ;(event.currentTarget as HTMLElement).classList.add('drag-over')
}

function handleDragLeave(event: DragEvent) {
  (event.currentTarget as HTMLElement).classList.remove('drag-over')
}

function handleDrop(event: DragEvent) {
  (event.currentTarget as HTMLElement).classList.remove('drag-over')
  emit('drop', event, props.machine.id)
}
</script>