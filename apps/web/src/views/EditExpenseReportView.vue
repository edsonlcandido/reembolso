<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
        <h1 class="text-2xl font-bold text-white">Editar Relatório de Despesas</h1>
        <p class="text-blue-100 mt-1">Altere os dados do relatório e salve</p>
      </div>

      <div v-if="expensesStore.loading && !loaded" class="p-8 space-y-4">
        <div class="animate-pulse space-y-4">
          <div class="h-10 bg-gray-200 rounded" />
          <div class="grid grid-cols-2 gap-4">
            <div class="h-10 bg-gray-200 rounded" />
            <div class="h-10 bg-gray-200 rounded" />
          </div>
          <div class="h-24 bg-gray-200 rounded" />
        </div>
      </div>

      <template v-else-if="loaded">
        <div v-if="errorMsg" class="mx-8 mt-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p class="text-sm text-red-700">{{ errorMsg }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Título *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Título do relatório"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Período Início</label>
              <input
                v-model="form.period_start"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Período Fim</label>
              <input
                v-model="form.period_end"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Centro de Custo</label>
              <input
                v-model="form.cost_center"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Centro de custo"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Projeto</label>
              <input
                v-model="form.project"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Nome do projeto"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Descrição do relatório"
            />
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="expensesStore.loading"
              class="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="expensesStore.loading" class="flex items-center justify-center gap-2">
                <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Salvando...
              </span>
              <span v-else>Salvar Alterações</span>
            </button>
            <router-link
              :to="`/reports/${reportId}`"
              class="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all text-center"
            >
              Cancelar
            </router-link>
          </div>
        </form>
      </template>

      <div v-else class="p-8 text-center text-gray-500">
        Relatório não encontrado.
        <router-link to="/reports" class="mt-2 block text-blue-600 hover:underline">Voltar aos relatórios</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpensesStore } from '../stores/expenses'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const expensesStore = useExpensesStore()

const reportId = route.params.id as string
const loaded = ref(false)
const errorMsg = ref('')

const form = ref({
  title: '',
  period_start: '',
  period_end: '',
  cost_center: '',
  project: '',
  description: '',
})

onMounted(async () => {
  const result = await expensesStore.getReport(reportId)
  if (!result.success || !result.data) {
    router.replace('/reports')
    return
  }
  const r = result.data
  // Only draft reports are editable
  if (r.status !== 'draft') {
    router.replace(`/reports/${reportId}`)
    return
  }
  form.value.title = r.title || ''
  form.value.period_start = r.period_start ? r.period_start.substring(0, 10) : ''
  form.value.period_end = r.period_end ? r.period_end.substring(0, 10) : ''
  form.value.cost_center = r.cost_center || ''
  form.value.project = r.project || ''
  form.value.description = r.description || ''
  loaded.value = true
})

async function handleSubmit() {
  errorMsg.value = ''
  if (!form.value.title.trim()) {
    errorMsg.value = 'O título é obrigatório.'
    return
  }

  const data: Record<string, any> = {
    title: form.value.title,
    period_start: form.value.period_start || null,
    period_end: form.value.period_end || null,
    cost_center: form.value.cost_center || null,
    project: form.value.project || null,
    description: form.value.description || null,
  }

  const result = await expensesStore.updateReport(reportId, data)
  if (result.success) {
    router.push(`/reports/${reportId}`)
  } else {
    errorMsg.value = result.error || 'Erro ao salvar relatório.'
  }
}
</script>
