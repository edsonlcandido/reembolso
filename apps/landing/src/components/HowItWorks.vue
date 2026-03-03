<template>
  <section id="how-it-works" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Três passos simples para um reembolso sem estresse.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div v-for="(step, idx) in steps" :key="idx" class="relative text-center">
          <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-600/30">
            <span class="text-2xl font-bold text-white">{{ idx + 1 }}</span>
          </div>
          <div v-if="idx < steps.length - 1" class="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary-200"></div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">{{ step.title }}</h3>
          <p class="text-gray-600">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    title: 'Fotografe o cupom',
    description: 'Use a câmera do celular ou faça upload de uma foto. Aceita JPG, PNG e PDF.',
  },
  {
    title: 'IA extrai os dados',
    description: 'Em menos de 10 segundos, a inteligência artificial extrai valor, data, estabelecimento e categoria.',
  },
  {
    title: 'Aprove e reembolse',
    description: 'O gestor recebe a notificação, revisa os dados e aprova com um clique. Simples assim.',
  },
]
</script>
