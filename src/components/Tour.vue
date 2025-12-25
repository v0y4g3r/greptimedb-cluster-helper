<template>
  <VOnboardingWrapper ref="wrapper" :steps="steps" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VOnboardingWrapper, useVOnboarding, type Step } from 'v-onboarding'

const wrapper = ref()
const { start, finish } = useVOnboarding(wrapper)

const steps: Step[] = [
  {
    attachTo: { element: '.header' },
    content: {
      title: 'Welcome to the GreptimeDB Deploy Helper!',
      description: 'This tour will guide you through the basic steps to generate a deployment configuration.'
    }
  },
  {
    attachTo: { element: '#add-machine-btn' },
    content: {
      title: 'Step 1: Add a Physical Machine',
      description: 'Click here to add a new physical machine to your cluster design.'
    },
    on: {
      before: () => {
        return new Promise((resolve) => {
          const el = document.querySelector('.machine-card')
          if (el) {
            finish()
          }
          resolve()
        })
      }
    }
  },
  {
    attachTo: { element: '#host-ip-input-1' },
    content: {
      title: 'Step 2: Configure Machine Details',
      description: 'Enter the Host IP address for your machine. This is crucial for the deployment commands.'
    },
    on: {
      before: () => {
        return new Promise((resolve, reject) => {
          const el = document.querySelector('#host-ip-input-1')
          if (!el) {
            reject()
          }
          resolve()
        })
      }
    }
  },
  {
    attachTo: { element: '#component-pool-etcd' },
    content: {
      title: 'Step 3: Add Components',
      description: 'Drag and drop components like "etcd", "metasrv", "datanode", and "frontend" onto your machines. You need at least one of each.'
    }
  },
  {
    attachTo: { element: '#generate-btn' },
    content: {
      title: 'Step 4: Generate Configuration',
      description: 'Once you have designed your cluster, click this button to generate the deployment commands and configuration files.'
    }
  }
]

onMounted(() => {
  // Use a timeout to ensure the DOM is fully rendered before starting the tour
  setTimeout(() => {
    const isFirstTime = !localStorage.getItem('hasVisited')
    if (isFirstTime) {
      start()
      localStorage.setItem('hasVisited', 'true')
    }
  }, 500) // 500ms delay
})

defineExpose({
  start
})
</script>