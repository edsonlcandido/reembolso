<template>
  <div class="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
    <!-- Window Header -->
    <div class="flex items-center space-x-2 mb-4">
      <div class="w-3 h-3 bg-red-400 rounded-full"></div>
      <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
      <div class="w-3 h-3 bg-green-400 rounded-full"></div>
      <span class="ml-3 text-gray-400 text-sm">Dashboard - Reembolso Inteligente</span>
    </div>

    <!-- Content -->
    <div class="bg-gray-50 rounded-xl p-6 sm:p-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500 mb-1">Despesas do Mes</p>
          <p class="text-2xl font-bold text-gray-900">R$ 4.250<span class="text-sm font-normal text-gray-400">,00</span></p>
          <p class="text-xs text-secondary-500 mt-1">+12% vs mes anterior</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500 mb-1">Pendentes</p>
          <p class="text-2xl font-bold text-accent-500">3</p>
          <p class="text-xs text-gray-400 mt-1">aguardando aprovacao</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500 mb-1">Aprovados</p>
          <p class="text-2xl font-bold text-secondary-500">12</p>
          <p class="text-xs text-gray-400 mt-1">neste periodo</p>
        </div>
      </div>

      <!-- Recent Reimbursements -->
      <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <p class="font-semibold text-gray-900 text-sm">Ultimos Reembolsos</p>
          <span class="text-xs text-primary-600 font-medium">Ver todos</span>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm">🍽</div>
              <div>
                <p class="text-sm font-medium text-gray-900">Restaurante Sabor</p>
                <p class="text-xs text-gray-400">15/02/2026</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900">R$ 85,50</p>
              <span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Aprovado</span>
            </div>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">🚕</div>
              <div>
                <p class="text-sm font-medium text-gray-900">Taxi Premium</p>
                <p class="text-xs text-gray-400">14/02/2026</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900">R$ 45,00</p>
              <span class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Pendente</span>
            </div>
          </div>
          <div class="flex items-center justify-between py-2">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm">🏨</div>
              <div>
                <p class="text-sm font-medium text-gray-900">Hotel Central</p>
                <p class="text-xs text-gray-400">13/02/2026</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900">R$ 320,00</p>
              <span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Aprovado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
