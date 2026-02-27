<template>
  <section class="py-16 bg-primary-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="(stat, idx) in stats" :key="idx" class="text-center">
          <p class="text-4xl sm:text-5xl font-extrabold text-white">{{ stat.value }}</p>
          <p class="text-primary-200 mt-2 text-sm sm:text-base">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { value: '80%', label: 'mais rápido que o processo manual' },
  { value: '95%', label: 'de precisão no OCR' },
  { value: '<10s', label: 'para processar cada cupom' },
  { value: '60%', label: 'de redução em custos operacionais' },
]
</script>
