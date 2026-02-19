<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Adicionar Despesa</h1>
      <router-link
        to="/reports"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
      >
        Voltar
      </router-link>
    </div>

    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-5">
        <h2 class="text-lg font-bold text-white">Nova Despesa</h2>
        <p class="text-blue-100 text-sm mt-1">Preencha os dados e selecione o relatório</p>
      </div>

      <div class="p-8">
        <div v-if="successMsg" class="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
          <p class="text-sm text-green-700">{{ successMsg }}</p>
        </div>

        <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p class="text-sm text-red-700">{{ errorMsg }}</p>
        </div>

        <div v-if="loadingReports" class="mb-6 text-sm text-gray-500">Carregando relatórios...</div>

        <div v-else-if="draftReports.length === 0" class="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p class="text-sm text-yellow-700">
            Nenhum relatório em rascunho encontrado.
            <router-link to="/reports/new" class="underline font-medium">Crie um relatório</router-link> antes de adicionar despesas.
          </p>
        </div>

        <form @submit.prevent="handleAddItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Relatório <span class="text-red-500">*</span></label>
            <select
              v-model="selectedReportId"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Selecionar relatório</option>
              <option v-for="r in draftReports" :key="r.id" :value="r.id">{{ r.title }}</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                v-model="itemForm.date"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                v-model="itemForm.category"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Selecionar</option>
                <option value="food">Alimentação</option>
                <option value="transport">Transporte</option>
                <option value="lodging">Hospedagem</option>
                <option value="supplies">Material</option>
                <option value="other">Outros</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$) <span class="text-red-500">*</span></label>
              <input
                v-model="itemForm.amountDisplay"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="0,00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estabelecimento</label>
              <input
                v-model="itemForm.merchant"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Nome do estabelecimento"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              v-model="itemForm.description"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Descrição da despesa"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              v-model="itemForm.notes"
              rows="2"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Observações adicionais"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Comprovante</label>
            <input
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              :disabled="submitting || draftReports.length === 0"
              class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              Salvar Despesa
            </button>
            <button
              type="button"
              @click="resetForm"
              class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import pb from '../services/pocketbase'
import { useExpensesStore } from '../stores/expenses'
import { useCompanyStore } from '../stores/company'

const router = useRouter()
const expensesStore = useExpensesStore()
const companyStore = useCompanyStore()

const draftReports = ref<any[]>([])
const loadingReports = ref(true)
const submitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const selectedReportId = ref('')
const receiptFile = ref<File | null>(null)

const itemForm = ref({
  date: '',
  category: '',
  amountDisplay: '',
  merchant: '',
  description: '',
  notes: '',
})

function resetForm() {
  itemForm.value = { date: '', category: '', amountDisplay: '', merchant: '', description: '', notes: '' }
  receiptFile.value = null
  selectedReportId.value = ''
  successMsg.value = ''
  errorMsg.value = ''
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    receiptFile.value = input.files[0]
  }
}

async function loadDraftReports() {
  loadingReports.value = true
  errorMsg.value = ''
  try {
    const companyId = companyStore.currentCompany?.id
    if (!companyId) {
      draftReports.value = []
      return
    }
    const result = await expensesStore.fetchReports(companyId, { status: 'draft' })
    if (result.success) {
      draftReports.value = expensesStore.reports
    } else {
      errorMsg.value = result.error || 'Erro ao carregar relatórios.'
      draftReports.value = []
    }
  } finally {
    loadingReports.value = false
  }
}

async function handleAddItem() {
  successMsg.value = ''
  errorMsg.value = ''

  if (!selectedReportId.value) {
    errorMsg.value = 'Selecione um relatório.'
    return
  }

  const amountCents = Math.round(parseFloat(itemForm.value.amountDisplay || '0') * 100)
  if (amountCents <= 0) {
    errorMsg.value = 'O valor deve ser maior que zero.'
    return
  }

  submitting.value = true

  const data: any = {
    report: selectedReportId.value,
    amount: amountCents,
    date: itemForm.value.date || undefined,
    category: itemForm.value.category || undefined,
    merchant: itemForm.value.merchant || undefined,
    description: itemForm.value.description || undefined,
    notes: itemForm.value.notes || undefined,
  }

  try {
    if (receiptFile.value) {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value))
      })
      formData.append('receipt_image', receiptFile.value)
      await pb.collection('expense_items').create(formData)
      await expensesStore.recalculateTotal(selectedReportId.value)
    } else {
      const result = await expensesStore.addItem(data)
      if (!result.success) {
        errorMsg.value = result.error || 'Erro ao adicionar despesa.'
        return
      }
    }
    successMsg.value = 'Despesa adicionada com sucesso!'
    router.push(`/reports/${selectedReportId.value}`)
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao adicionar despesa.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await companyStore.fetchMyCompanies()
  await loadDraftReports()
})
</script>
