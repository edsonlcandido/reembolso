<template>
  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Problems -->
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">O problema com reembolsos tradicionais</h2>
          <div class="space-y-4">
            <div v-for="(problem, idx) in problems" :key="idx" class="flex items-start space-x-3">
              <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p class="text-gray-600">{{ problem }}</p>
            </div>
          </div>
        </div>

        <!-- Solutions -->
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Nossa <span class="text-primary-600">solucao</span></h2>
          <div class="space-y-4">
            <div v-for="(solution, idx) in solutions" :key="idx" class="flex items-start space-x-3">
              <div class="w-6 h-6 bg-secondary-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p class="text-gray-600">{{ solution }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const problems = [
  'Preenchimento manual de formularios e tedioso e sujeito a erros',
  'Cupons fiscais se perdem ou ficam ilegíveis com o tempo',
  'Processo de aprovacao lento e descentralizado',
  'Falta de rastreabilidade e auditoria das despesas',
]

const solutions = [
  'IA extrai dados do cupom automaticamente em segundos',
  'Fotos digitais ficam armazenadas com seguranca para sempre',
  'Dashboard centralizado para aprovacao em poucos cliques',
  'Trilha de auditoria completa e compliance garantido',
]
</script>
