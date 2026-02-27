<template>
  <div :class="[
    'relative bg-white rounded-2xl p-8 border shadow-sm flex flex-col',
    featured ? 'border-2 border-primary-600 shadow-xl' : 'border-gray-200'
  ]">
    <!-- Featured Badge -->
    <div v-if="featured" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
      <span class="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">Mais Popular</span>
    </div>

    <!-- Header -->
    <h3 class="text-lg font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
    <p class="text-sm text-gray-500 mb-6">{{ plan.subtitle }}</p>

    <!-- Price -->
    <div class="mb-6">
      <span class="text-4xl font-extrabold text-gray-900">{{ plan.price }}</span>
      <span class="text-gray-500">{{ plan.period }}</span>
    </div>

    <!-- Features -->
    <ul class="space-y-3 mb-8 flex-grow">
      <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        {{ feature }}
      </li>
    </ul>

    <!-- CTA -->
    <a
      :href="plan.name === 'Empresarial' ? '#' : '/app/'"
      :class="[
        'block w-full text-center px-6 py-3 font-semibold rounded-xl transition-all mt-auto',
        featured
          ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
          : 'border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600'
      ]"
    >
      {{ plan.cta }}
    </a>
  </div>
</template>

<script setup lang="ts">
interface Plan {
  id: number
  name: string
  subtitle: string
  price: string
  period: string
  features: string[]
  cta: string
  featured?: boolean
}

defineProps<{
  plan: Plan
  featured?: boolean
}>()
</script>
