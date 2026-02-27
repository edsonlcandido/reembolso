<template>
  <div :class="[
    'group p-6 bg-white rounded-xl border hover:shadow-lg transition-all',
    `border-gray-100 hover:border-${colorMap[feature.color]}-200`
  ]">
    <div :class="[
      'w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:transition-colors',
      `bg-${colorMap[feature.color]}-100 group-hover:bg-${colorMap[feature.color]}-600`
    ]">
      <svg :class="[
        'w-6 h-6 group-hover:text-white transition-colors',
        `text-${colorMap[feature.color]}-600`
      ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.icon"></path>
      </svg>
    </div>
    <h3 class="text-lg font-bold text-gray-900 mb-2">{{ feature.title }}</h3>
    <p class="text-gray-600 text-sm">{{ feature.description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Feature {
  id: number
  icon: string
  title: string
  description: string
  color: string
  hoverColor: string
}

defineProps<{
  feature: Feature
}>()

const colorMap: Record<string, string> = {
  primary: 'primary',
  secondary: 'secondary',
  purple: 'purple',
  accent: 'accent',
  red: 'red',
  indigo: 'indigo',
}
</script>
