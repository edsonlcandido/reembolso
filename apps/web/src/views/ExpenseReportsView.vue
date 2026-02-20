<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Relatórios de Despesas</h1>
      <router-link
        to="/reports/new"
        class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
      >
        <PlusIcon class="h-5 w-5" />
        Novo Relatório
      </router-link>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        :class="[
          'rounded-lg px-4 py-2 text-sm font-medium transition-all',
          activeTab === tab.value
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        ]"
      >
        {{ tab.label }}
      </button>
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

    <div v-else-if="filteredReports.length === 0" class="bg-white rounded-2xl shadow-xl p-12 text-center">
      <DocumentTextIcon class="mx-auto h-16 w-16 text-gray-300" />
      <h3 class="mt-4 text-lg font-semibold text-gray-900">Nenhum relatório encontrado</h3>
      <p class="mt-2 text-gray-500">Crie um novo relatório de despesas para começar.</p>
      <router-link
        to="/reports/new"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
      >
        <PlusIcon class="h-5 w-5" />
        Novo Relatório
      </router-link>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="report in filteredReports"
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
              <span v-if="report.expand?.user" class="text-gray-400">
                {{ report.expand.user.name || report.expand.user.email }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-lg font-bold text-gray-900 whitespace-nowrap">
              {{ formatCurrency(report.total_amount || 0) }}
            </span>
            <span :class="statusBadgeClass(report.status)" class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              {{ statusLabel(report.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpensesStore } from '../stores/expenses'
import { useCompanyStore } from '../stores/company'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const expensesStore = useExpensesStore()
const companyStore = useCompanyStore()

const activeTab = ref('all')
const errorMsg = ref('')

const tabs = [
  { label: 'Todos', value: 'all' },
  { label: 'Rascunho', value: 'draft' },
  { label: 'Enviado', value: 'submitted' },
  { label: 'Aprovado', value: 'approved' },
  { label: 'Rejeitado', value: 'rejected' },
  { label: 'Pago', value: 'paid' },
  { label: 'Pago Parcialmente', value: 'partially_paid' },
]

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-700'
    case 'submitted': return 'bg-blue-100 text-blue-700'
    case 'approved': return 'bg-green-100 text-green-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    case 'paid': return 'bg-purple-100 text-purple-700'
    case 'partially_paid': return 'bg-orange-100 text-orange-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'draft': return 'Rascunho'
    case 'submitted': return 'Enviado'
    case 'approved': return 'Aprovado'
    case 'rejected': return 'Rejeitado'
    case 'paid': return 'Pago'
    case 'partially_paid': return 'Pago Parcialmente'
    default: return status
  }
}

const filteredReports = computed(() => {
  if (activeTab.value === 'all') return expensesStore.reports
  return expensesStore.reports.filter(r => r.status === activeTab.value)
})

async function loadReports() {
  if (!companyStore.currentCompany) return
  const result = await expensesStore.fetchReports(companyStore.currentCompany.id)
  if (!result.success) {
    errorMsg.value = result.error || 'Erro ao carregar relatórios.'
  }
}

watch(() => companyStore.currentCompany, () => {
  loadReports()
})

onMounted(async () => {
  await companyStore.fetchMyCompanies()
  await loadReports()
})
</script>
