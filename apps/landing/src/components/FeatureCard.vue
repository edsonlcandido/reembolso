<template>
  <div :class="[
    'group p-6 bg-white rounded-xl border hover:shadow-lg transition-all',
    borderClasses[feature.color]
  ]">
    <div :class="[
      'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
      iconBgClasses[feature.color]
    ]">
      <svg :class="[
        'w-6 h-6 transition-colors',
        iconClasses[feature.color]
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

const borderClasses: Record<string, string> = {
  primary: 'border-gray-100 hover:border-primary-200',
  secondary: 'border-gray-100 hover:border-secondary-200',
  purple: 'border-gray-100 hover:border-purple-200',
  accent: 'border-gray-100 hover:border-accent-200',
  red: 'border-gray-100 hover:border-red-200',
  indigo: 'border-gray-100 hover:border-indigo-200',
}

const iconBgClasses: Record<string, string> = {
  primary: 'bg-primary-100 group-hover:bg-primary-600',
  secondary: 'bg-secondary-100 group-hover:bg-secondary-600',
  purple: 'bg-purple-100 group-hover:bg-purple-600',
  accent: 'bg-accent-100 group-hover:bg-accent-600',
  red: 'bg-red-100 group-hover:bg-red-600',
  indigo: 'bg-indigo-100 group-hover:bg-indigo-600',
}

const iconClasses: Record<string, string> = {
  primary: 'text-primary-600 group-hover:text-white',
  secondary: 'text-secondary-600 group-hover:text-white',
  purple: 'text-purple-600 group-hover:text-white',
  accent: 'text-accent-600 group-hover:text-white',
  red: 'text-red-600 group-hover:text-white',
  indigo: 'text-indigo-600 group-hover:text-white',
}
</script>
