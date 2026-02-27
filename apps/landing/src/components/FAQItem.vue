<template>
  <div class="faq-item border border-gray-200 rounded-xl overflow-hidden">
    <button
      class="faq-toggle w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      @click="isOpen = !isOpen"
    >
      <span class="font-semibold text-gray-900">{{ item.question }}</span>
      <svg
        class="faq-icon w-5 h-5 text-gray-400 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        :style="{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
    <div v-if="isOpen" class="faq-content px-5 pb-5">
      <p class="text-gray-600 text-sm">{{ item.answer }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FAQItem {
  id: number
  question: string
  answer: string
}

defineProps<{
  item: FAQItem
}>()

const isOpen = ref(false)
</script>
