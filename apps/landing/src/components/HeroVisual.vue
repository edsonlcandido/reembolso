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
    <div class="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">

      <!-- Hero banner -->
      <div class="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-6 text-white flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold mb-1">Olá, Maria!</h2>
            <p class="text-blue-100 text-sm">Acme Tecnologia Ltda.</p>
          </div>
          <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <!-- ChartBar icon -->
            <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Total Relatórios -->
        <div class="bg-white rounded-2xl shadow-xl p-4 border-2 border-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500">Total Relatórios</p>
              <p class="text-xl font-bold text-gray-900">15</p>
            </div>
          </div>
        </div>

        <!-- Valor Total -->
        <div class="bg-white rounded-2xl shadow-xl p-4 border-2 border-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500">Valor Total</p>
              <p class="text-xl font-bold text-gray-900">R$ 4.250</p>
            </div>
          </div>
        </div>

        <!-- Pendentes -->
        <div class="bg-white rounded-2xl shadow-xl p-4 border-2 border-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500">Pendentes</p>
              <p class="text-xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <!-- Aprovados -->
        <div class="bg-white rounded-2xl shadow-xl p-4 border-2 border-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500">Aprovados</p>
              <p class="text-xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent reports + Quick actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Recent reports -->
        <div class="lg:col-span-2 bg-white shadow-xl rounded-2xl border border-gray-100">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-900">Relatórios Recentes</h3>
            <span class="text-xs text-blue-600 font-medium">Ver todos</span>
          </div>
          <div class="divide-y divide-gray-100">
            <div class="flex items-center justify-between px-5 py-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">Viagem São Paulo</p>
                <p class="text-xs text-gray-500 mt-0.5">15/02/2026</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-900">R$ 1.240,00</span>
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Aprovado</span>
              </div>
            </div>
            <div class="flex items-center justify-between px-5 py-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">Almoço Cliente</p>
                <p class="text-xs text-gray-500 mt-0.5">14/02/2026</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-900">R$ 185,50</span>
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Enviado</span>
              </div>
            </div>
            <div class="flex items-center justify-between px-5 py-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">Hotel Congresso</p>
                <p class="text-xs text-gray-500 mt-0.5">13/02/2026</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-900">R$ 820,00</span>
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">Pago</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-bold text-gray-900">Ações Rápidas</h3>
          </div>
          <div class="p-3 space-y-2">
            <div class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-colors">
              <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow flex-shrink-0">
                <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-900">Novo Relatório</p>
                <p class="text-xs text-gray-500">Criar relatório de despesas</p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-50 transition-colors">
              <div class="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow flex-shrink-0">
                <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-900">Ver Relatórios</p>
                <p class="text-xs text-gray-500">Gerenciar seus relatórios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
</script>
