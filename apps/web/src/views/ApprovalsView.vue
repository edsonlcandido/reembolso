<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Aprovações Pendentes</h1>
        <p class="mt-1 text-sm text-gray-500">Relatórios aguardando a sua aprovação</p>
      </div>
    </div>

    <div v-if="errorMsg" class="rounded-lg bg-red-50 border border-red-200 p-4">
      <p class="text-sm text-red-700">{{ errorMsg }}</p>
    </div>

    <div v-if="expensesStore.loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="animate-pulse bg-white rounded-xl p-6 shadow">
        <div class="flex items-center gap-4">
          <div class="flex-1 space-y-3">
            <div class="h-5 bg-gray-200 rounded w-1/3" />
            <div class="h-4 bg-gray-200 rounded w-1/4" />
          </div>
          <div class="h-8 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>

    <div v-else-if="pendingReports.length === 0" class="bg-white rounded-2xl shadow-xl p-12 text-center">
      <CheckCircleIcon class="mx-auto h-16 w-16 text-gray-300" />
      <h3 class="mt-4 text-lg font-semibold text-gray-900">Nenhuma aprovação pendente</h3>
      <p class="mt-2 text-gray-500">Não há relatórios aguardando a sua aprovação no momento.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="report in pendingReports"
        :key="report.id"
        @click="router.push(`/reports/${report.id}`)"
        class="bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer p-6 border border-gray-100 hover:border-blue-200"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate">{{ report.title }}</h3>
            <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              <span v-if="report.period_start || report.period_end">
                {{ report.period_start }} — {{ report.period_end }}
              </span>
              <span>{{ new Date(report.created).toLocaleDateString('pt-BR') }}</span>
              <span v-if="report.expand?.user" class="text-gray-600 font-medium">
                {{ report.expand.user.name || report.expand.user.email }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-lg font-bold text-gray-900 whitespace-nowrap">
              {{ formatCurrency(report.total_amount || 0) }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-blue-100 text-blue-700">
              Aguardando Aprovação
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useExpensesStore } from '../stores/expenses'
import { useCompanyStore } from '../stores/company'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import type { RecordModel } from 'pocketbase'

const router = useRouter()
const expensesStore = useExpensesStore()
const companyStore = useCompanyStore()

const pendingReports = ref<RecordModel[]>([])
const errorMsg = ref('')

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function loadPendingApprovals() {
  if (!companyStore.currentCompany) return
  errorMsg.value = ''
  const result = await expensesStore.fetchPendingApprovals(companyStore.currentCompany.id)
  if (result.success) {
    pendingReports.value = result.data ?? []
  } else {
    errorMsg.value = result.error || 'Erro ao carregar aprovações pendentes.'
  }
}

watch(() => companyStore.currentCompany, () => {
  loadPendingApprovals()
})

onMounted(() => {
  loadPendingApprovals()
})
</script>
