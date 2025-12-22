<template>
  <div v-if="message" :class="messageClass" v-html="message.text"></div>
</template>

<script setup lang="ts">
import type { Message } from '../types'
import { computed } from 'vue'

const props = defineProps<{
  message: Message | null
}>()

const emit = defineEmits<{
  clear: []
}>()

const messageClass = computed(() => {
  if (!props.message) return ''
  return `${props.message.type}-message`
})
</script>