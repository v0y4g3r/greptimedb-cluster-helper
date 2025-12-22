<template>
  <div class="generation-area">
    <h2 class="section-title">⚡ Generate Configuration</h2>
    <button class="generate-btn" @click="handleGenerate">
      Generate Config Files & Commands
    </button>

    <div v-if="configs.length > 0" class="outputs">
      <div
        v-for="(config, index) in configs"
        :key="index"
        class="config-block"
      >
        <div class="output-instruction">
          <strong>Step {{ config.step }}:</strong> Deploy
          <strong>{{ config.type }}</strong> on
          <strong>{{ config.hostIp }}</strong>
          (Machine {{ config.machineId }}, GREPTIME_HOME=<code>{{ config.greptimeHome }}</code>, instance #{{ config.cardinal }})
        </div>

        <pre class="output-area">
          <code
            ref="codeElements"
            class="language-bash"
          >{{ config.text }}</code>
        </pre>

        <button class="copy-btn" @click="copyBlock(config.text)">
          📋 Copy This Block
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import hljs from 'highlight.js'
import type { GeneratedConfig } from '../types'
import bash from 'highlight.js/lib/languages/bash'

defineEmits<{
  generate: []
}>()

const configs = ref<GeneratedConfig[]>([])
const codeElements = ref<HTMLElement[]>([])

onMounted(() => {
  hljs.registerLanguage('bash', bash)
})

async function handleGenerate() {
  emit('generate')
}

async function copyBlock(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    // Show success message - in a real app, you'd use a better notification system
    alert('Block copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy text: ', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('Block copied to clipboard!')
  }
}

function highlightCode() {
  codeElements.value.forEach(element => {
    if (element) {
      hljs.highlightElement(element)
    }
  })
}

// Expose a method for the parent to set configs
function setConfigs(newConfigs: GeneratedConfig[]) {
  configs.value = newConfigs
  nextTick(() => {
    highlightCode()
  })
}

defineExpose({
  setConfigs
})
</script>

<style scoped>
.config-block {
  margin-bottom: 2rem;
}

.outputs {
  margin-top: 1rem;
}

code {
  background: transparent !important;
}
</style>