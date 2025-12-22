<template>
  <div>
    <header class="header">
      <h1>🚀 GreptimeDB Cluster Config Generator</h1>
      <p>Visually design your GreptimeDB cluster deployment and generate configuration files</p>
    </header>

    <div class="container">
      <MessageDisplay :message="message" @clear="clearMessage" />

      <div class="main-content">
        <Sidebar
          @add-machine="addMachine"
          @drag-start="handleDragStart"
        />

        <MachinesArea
          :machines="machines"
          @delete-machine="deleteMachine"
          @update-machine="updateMachine"
          @delete-component="deleteComponent"
          @drop="handleDrop"
          @drag-over="handleDragOver"
          @drag-leave="handleDragLeave"
        />
      </div>

      <GenerationArea
        ref="generationAreaRef"
        :machines="machines"
        @generate="handleGenerate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Machine, Message, Component } from './types'
import type { GeneratedConfig } from './types'

import {
  generateEtcdConfig,
  generateMetasrvConfig,
  generateDatanodeConfig,
  generateFrontendConfig
} from './utils/configGenerator'

import Sidebar from './components/Sidebar.vue'
import MachinesArea from './components/MachinesArea.vue'
import GenerationArea from './components/GenerationArea.vue'
import MessageDisplay from './components/MessageDisplay.vue'

const machines = ref<Machine[]>([])
const machineIdCounter = ref(1)
const message = ref<Message | null>(null)
const generationAreaRef = ref<InstanceType<typeof GenerationArea>>()

let draggedComponent: Component['type'] | null = null
let draggedFromMachine: { machineId: number; componentIndex: number } | null = null

function showMessage(text: string, type: Message['type'] = 'info') {
  message.value = { text, type }
  setTimeout(() => {
    clearMessage()
  }, 5000)
}

function clearMessage() {
  message.value = null
}

function addMachine() {
  const machine: Machine = {
    id: machineIdCounter.value++,
    hostIp: '',
    greptimeHome: '/opt/greptimedb',
    components: []
  }
  machines.value.push(machine)
  showMessage('Machine added successfully', 'success')
}

function deleteMachine(machineId: number) {
  machines.value = machines.value.filter(m => m.id !== machineId)
  showMessage('Machine deleted', 'success')
}

function deleteComponent(machineId: number, componentIndex: number) {
  const machine = machines.value.find(m => m.id === machineId)
  if (machine && machine.components) {
    const comp = machine.components[componentIndex]
    if (comp.count > 1) {
      comp.count--
    } else {
      machine.components.splice(componentIndex, 1)
    }
    showMessage('Component deleted', 'success')
  }
}

function updateMachine(machineId: number, field: keyof Machine, value: string) {
  const machine = machines.value.find(m => m.id === machineId)
  if (machine) {
    machine[field] = value
  }
}

function handleDragStart(componentType: Component['type']) {
  draggedComponent = componentType
  draggedFromMachine = null
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
}

function handleDragLeave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement
  target.classList.remove('drag-over')
}

function handleDrop(event: DragEvent, machineId: number) {
  event.preventDefault()

  const machine = machines.value.find(m => m.id === machineId)
  if (!machine) return

  if (!machine.components) {
    machine.components = []
  }

  if (draggedFromMachine) {
    // Moving component from one machine to another
    const sourceMachine = machines.value.find(m => m.id === draggedFromMachine.machineId)
    if (sourceMachine && sourceMachine.components) {
      const component = sourceMachine.components[draggedFromMachine.componentIndex]
      if (component) {
        sourceMachine.components.splice(draggedFromMachine.componentIndex, 1)

        if (draggedFromMachine.machineId !== machineId) {
          // Moving to different machine
          machine.components.push(component)
        }
        // If same machine, just remove (reordering not needed)
      }
    }
  } else if (draggedComponent) {
    // Adding new component from sidebar
    const existingComp = machine.components.find(c => c.type === draggedComponent)
    if (existingComp) {
      existingComp.count++
    } else {
      machine.components.push({ type: draggedComponent, count: 1 })
    }
  }

  // Reset drag state
  draggedComponent = null
  draggedFromMachine = null
}

function validateCluster(): string[] {
  const errors: string[] = []

  if (machines.value.length === 0) {
    errors.push('At least one physical machine is required')
  }

  machines.value.forEach(machine => {
    if (!machine.hostIp) {
      errors.push(`Machine ${machine.id} needs a Host IP address`)
    }
    if (!machine.greptimeHome) {
      errors.push(`Machine ${machine.id} needs a GreptimeDB Home directory`)
    }
  })

  const allComponents = machines.value.flatMap(m => m.components || [])
  const componentCounts: Record<string, number> = {}

  allComponents.forEach(comp => {
    componentCounts[comp.type] = (componentCounts[comp.type] || 0) + comp.count
  })

  if (!componentCounts.etcd || componentCounts.etcd < 1) {
    errors.push('At least 1 etcd component is required')
  }
  if (!componentCounts.metasrv || componentCounts.metasrv < 1) {
    errors.push('At least 1 metasrv component is required')
  }
  if (!componentCounts.datanode || componentCounts.datanode < 1) {
    errors.push('At least 1 datanode component is required')
  }
  if (!componentCounts.frontend || componentCounts.frontend < 1) {
    errors.push('At least 1 frontend component is required')
  }

  return errors
}

function handleGenerate() {
  const errors = validateCluster()

  if (errors.length > 0) {
    showMessage('Validation errors:<br>' + errors.join('<br>'), 'error')
    return
  }

  const configs: GeneratedConfig[] = []
  const globalComponentCounts = { etcd: -1, metasrv: -1, datanode: -1, frontend: -1 }

  // Precompute per-machine component counters for port bumping
  const machineComponentCountsById: Record<number, Record<string, number>> = {}
  machines.value.forEach(machine => {
    machineComponentCountsById[machine.id] = { etcd: 0, metasrv: 0, datanode: 0, frontend: 0 }
  })

  // Global deployment order: etcd -> metasrv -> datanode -> frontend
  const typeOrder: Component['type'][] = ['etcd', 'metasrv', 'datanode', 'frontend']

  typeOrder.forEach(type => {
    let firstOfType = true

    machines.value.forEach(machine => {
      if (!machine.components) return

      const comp = machine.components.find(c => c.type === type)
      if (!comp) return

      const machineCounts = machineComponentCountsById[machine.id]

      for (let i = 0; i < comp.count; i++) {
        // Increment global counter for cardinal (0-based)
        globalComponentCounts[type]++
        const cardinal = globalComponentCounts[type]

        // Increment machine-specific counter for port calculation
        const machineIndex = machineCounts[type]++

        let configText = ''
        switch (type) {
          case 'etcd':
            configText = generateEtcdConfig(machine, cardinal)
            break
          case 'metasrv':
            configText = generateMetasrvConfig(machine, cardinal, machineIndex, machines.value)
            break
          case 'datanode':
            configText = generateDatanodeConfig(machine, cardinal, machineIndex, machines.value)
            break
          case 'frontend':
            configText = generateFrontendConfig(machine, cardinal, machineIndex, machines.value)
            break
        }

        // Merge header with first command block of each type
        if (firstOfType) {
          const header = `# ===== ${type.toUpperCase()} =====`
          configs.push({
            text: `${header}\n\n${configText}`,
            type,
            machineId: machine.id,
            hostIp: machine.hostIp || '$HOST_IP',
            greptimeHome: machine.greptimeHome,
            cardinal,
            step: typeOrder.indexOf(type) + 1
          })
          firstOfType = false
        } else {
          configs.push({
            text: configText,
            type,
            machineId: machine.id,
            hostIp: machine.hostIp || '$HOST_IP',
            greptimeHome: machine.greptimeHome,
            cardinal,
            step: typeOrder.indexOf(type) + 1
          })
        }
      }
    })
  })

  // Pass configs to generation area
  if (generationAreaRef.value) {
    generationAreaRef.value.setConfigs(configs)
  }

  showMessage('Configuration generated successfully!', 'success')
}
</script>