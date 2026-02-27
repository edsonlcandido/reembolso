<template>
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-500/5"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div class="text-center max-w-4xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center px-4 py-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium rounded-full mb-8 fade-in">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          OCR Inteligente com IA
        </div>

        <!-- Headline -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 fade-in delay-100">
          Tire foto do cupom.<br>
          <span class="text-primary-600">A IA faz o resto.</span>
        </h1>

        <!-- Subheadline -->
        <p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 fade-in delay-200">
          Sistema completo de reembolso de despesas corporativas. Upload do cupom fiscal, extração automática de dados com IA e aprovação simplificada.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8 fade-in delay-300">
          <a href="/app/" class="inline-flex items-center justify-center px-8 py-3.5 bg-primary-600 text-white text-base font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-600/25">
            Comece Gratuitamente
            <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </a>
          <a href="#how-it-works" class="inline-flex items-center justify-center px-8 py-3.5 bg-white text-gray-700 text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all">
            Ver como funciona
          </a>
        </div>

        <!-- Trust Indicators -->
        <div class="flex items-center justify-center space-x-6 text-sm text-gray-500 fade-in delay-400">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1.5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Gratis por 30 dias
          </div>
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1.5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Sem cartao de credito
          </div>
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1.5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Setup em 5 minutos
          </div>
        </div>
      </div>

      <!-- Hero Visual -->
      <div class="mt-16 max-w-5xl mx-auto fade-in delay-400">
        <HeroVisual />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import HeroVisual from './HeroVisual.vue'
</script>
