<template>
  <nav class="bg-white/90 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <span class="text-xl font-bold text-gray-900">Reembolsa<span class="text-primary-600">AI</span></span>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-8">
          <a href="#features" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Recursos</a>
          <a href="#how-it-works" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Como Funciona</a>
          <a href="#pricing" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Planos</a>
          <a href="#faq" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">FAQ</a>
        </div>

        <!-- CTA Buttons -->
        <div class="flex items-center space-x-3">
          <a href="/app/" class="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Entrar</a>
          <a href="/app/" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-sm">
            Criar Conta Grátis
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
</script>
