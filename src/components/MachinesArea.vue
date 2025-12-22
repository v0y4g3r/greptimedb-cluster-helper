<template>
  <div class="machines-area">
    <h2 class="section-title">🖥️ Physical Machines</h2>

    <div v-if="machines.length === 0" class="empty-state">
      <p>No machines added yet. Click "Add Physical Machine" to start.</p>
    </div>

    <MachineCard
      v-for="machine in machines"
      :key="machine.id"
      :machine="machine"
      @delete="$emit('delete-machine', machine.id)"
      @update="$emit('update-machine', machine.id, $event.field, $event.value)"
      @delete-component="$emit('delete-component', machine.id, $event)"
      @drop="$emit('drop', $event, machine.id)"
      @drag-over="$emit('drag-over', $event)"
      @drag-leave="$emit('drag-leave', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Machine } from '../types'
import MachineCard from './MachineCard.vue'

defineProps<{
  machines: Machine[]
}>()

defineEmits<{
  'delete-machine': [machineId: number]
  'update-machine': [machineId: number, field: keyof Machine, value: string]
  'delete-component': [machineId: number, componentIndex: number]
  'drop': [event: DragEvent, machineId: number]
  'drag-over': [event: DragEvent]
  'drag-leave': [event: DragEvent]
}>()
</script>

<style scoped>
.empty-state {
  text-align: center;
  color: #6c757d;
  padding: 40px;
}
</style>