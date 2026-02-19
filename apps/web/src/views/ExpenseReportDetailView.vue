<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div v-if="expensesStore.loading && !report" class="space-y-4">
      <div class="animate-pulse bg-white rounded-2xl p-8 shadow-xl">
        <div class="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div class="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>

    <template v-else-if="report">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-white">{{ report.title }}</h1>
              <p class="text-blue-100 mt-1">
                <span v-if="report.period_start">{{ report.period_start }}</span>
                <span v-if="report.period_start && report.period_end"> — </span>
                <span v-if="report.period_end">{{ report.period_end }}</span>
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="statusBadgeClass(report.status)" class="px-4 py-2 rounded-full text-sm font-semibold">
                {{ statusLabel(report.status) }}
              </span>
              <span class="text-2xl font-bold text-white">
                {{ formatCurrency(report.total_amount || 0) }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-8">
          <div v-if="successMsg" class="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <p class="text-sm text-green-700">{{ successMsg }}</p>
          </div>

          <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p class="text-sm text-red-700">{{ errorMsg }}</p>
          </div>

          <div v-if="report.description" class="mb-6">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Descrição</h3>
            <p class="text-gray-900">{{ report.description }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div v-if="report.project">
              <h3 class="text-sm font-medium text-gray-500 mb-1">Projeto</h3>
              <p class="text-gray-900">{{ report.project }}</p>
            </div>
            <div v-if="report.cost_center">
              <h3 class="text-sm font-medium text-gray-500 mb-1">Centro de Custo</h3>
              <p class="text-gray-900">{{ report.cost_center }}</p>
            </div>
          </div>

          <div v-if="report.status === 'rejected' && report.rejection_reason" class="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <h3 class="text-sm font-semibold text-red-700 mb-1">Motivo da Rejeição</h3>
            <p class="text-sm text-red-600">{{ report.rejection_reason }}</p>
          </div>

          <div class="flex flex-wrap gap-3">
            <template v-if="report.status === 'draft'">
              <button
                @click="handleSubmitReport"
                :disabled="expensesStore.loading"
                class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                Enviar para Aprovação
              </button>
              <router-link
                :to="`/reports/${report.id}/edit`"
                class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Editar
              </router-link>
              <button
                @click="handleDeleteReport"
                :disabled="expensesStore.loading"
                class="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                Excluir
              </button>
            </template>
            <template v-if="report.status === 'submitted'">
              <button
                @click="handleApproveReport"
                :disabled="expensesStore.loading"
                class="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-all disabled:opacity-50"
              >
                Aprovar
              </button>
              <button
                @click="showRejectModal = true"
                class="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-all"
              >
                Rejeitar
              </button>
            </template>
            <router-link
              to="/reports"
              class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Voltar
            </router-link>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">Itens de Despesa</h2>
          <button
            v-if="report.status === 'draft'"
            @click="showItemForm = !showItemForm"
            class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <PlusIcon class="h-4 w-4" />
            Adicionar Despesa
          </button>
        </div>

        <div v-if="showItemForm" class="p-8 bg-blue-50/50 border-b border-gray-100">
          <form @submit.prevent="handleAddItem" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comprovante</label>
              <input ref="fileInputRef" type="file" accept="image/*" @change="handleFileChange" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <div class="mt-2">
                <button
                  type="button"
                  @click="analyzeWithAI"
                  :disabled="analyzingReceipt || !receiptFile"
                  :title="!receiptFile ? 'Selecione um comprovante primeiro' : 'Analisar comprovante com IA'"
                  class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg v-if="!analyzingReceipt" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {{ analyzingReceipt ? 'Analisando...' : 'Analisar com IA' }}
                </button>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input v-model="itemForm.date" type="date" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select v-model="itemForm.category" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <option value="">Selecionar</option>
                  <template v-if="categories.length > 0">
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.icon }} {{ cat.name }}
                    </option>
                  </template>
                  <option v-else disabled value="">Nenhuma categoria cadastrada</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input v-model="itemForm.amountDisplay" type="number" step="0.01" min="0" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="0,00" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estabelecimento</label>
                <input v-model="itemForm.merchant" type="text" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Nome do estabelecimento" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input v-model="itemForm.description" type="text" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Descrição da despesa" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea v-model="itemForm.notes" rows="2" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Observações adicionais" />
            </div>
            
            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="expensesStore.loading"
                class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                Salvar
              </button>
              <button
                type="button"
                @click="showItemForm = false; resetItemForm()"
                class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div class="p-8">
          <div v-if="expensesStore.items.length === 0" class="text-center py-8">
            <ClipboardDocumentListIcon class="mx-auto h-12 w-12 text-gray-300" />
            <p class="mt-4 text-gray-500">Nenhum item de despesa adicionado</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="item in expensesStore.items"
              :key="item.id"
              class="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all"
            >
              <div class="flex flex-col sm:flex-row sm:items-start gap-4">
                <div v-if="item.receipt_image" class="flex-shrink-0">
                  <img :src="getFileUrl(item)" class="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-1">
                    <span class="font-semibold text-gray-900">{{ formatCurrency(item.amount || 0) }}</span>
                    <span v-if="item.category" class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {{ categoryLabel(item.category) }}
                    </span>
                  </div>
                  <p v-if="item.merchant" class="text-sm text-gray-600">{{ item.merchant }}</p>
                  <p v-if="item.description" class="text-sm text-gray-500">{{ item.description }}</p>
                  <p v-if="item.date" class="text-xs text-gray-400 mt-1">{{ new Date(item.date).toLocaleDateString('pt-BR') }}</p>
                </div>
                <div v-if="report.status === 'draft'" class="flex gap-2">
                  <button
                    @click="handleRemoveItem(item.id)"
                    :disabled="expensesStore.loading"
                    class="rounded-lg border border-red-300 p-2 text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="bg-white rounded-2xl shadow-xl p-12 text-center">
      <p class="text-gray-500">Relatório não encontrado.</p>
      <router-link to="/reports" class="mt-4 inline-block text-blue-600 hover:underline">Voltar aos relatórios</router-link>
    </div>

    <div
      v-if="showRejectModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showRejectModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Rejeitar Relatório</h3>
        <textarea
          v-model="rejectionReason"
          rows="4"
          class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
          placeholder="Informe o motivo da rejeição..."
        />
        <div class="flex gap-3 justify-end mt-4">
          <button
            @click="showRejectModal = false"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            @click="handleRejectReport"
            :disabled="expensesStore.loading || !rejectionReason.trim()"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-all disabled:opacity-50"
          >
            Confirmar Rejeição
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpensesStore } from '../stores/expenses'
import { useCompanyStore } from '../stores/company'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import pb from '../services/pocketbase'
import { PlusIcon, TrashIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import type { RecordModel } from 'pocketbase'

const route = useRoute()
const router = useRouter()
const expensesStore = useExpensesStore()
const companyStore = useCompanyStore()
const successMsg = ref('')
const errorMsg = ref('')
const showItemForm = ref(false)
const showRejectModal = ref(false)
const rejectionReason = ref('')
const receiptFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const analyzingReceipt = ref(false)
const categories = ref<RecordModel[]>([])

const itemForm = ref({
  date: '',
  category: '',
  amountDisplay: '',
  merchant: '',
  description: '',
  notes: '',
})

const report = computed(() => expensesStore.currentReport)

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'draft': return 'bg-white/20 text-white'
    case 'submitted': return 'bg-blue-200 text-blue-800'
    case 'approved': return 'bg-green-200 text-green-800'
    case 'rejected': return 'bg-red-200 text-red-800'
    case 'paid': return 'bg-purple-200 text-purple-800'
    default: return 'bg-gray-200 text-gray-800'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'draft': return 'Rascunho'
    case 'submitted': return 'Enviado'
    case 'approved': return 'Aprovado'
    case 'rejected': return 'Rejeitado'
    case 'paid': return 'Pago'
    default: return status
  }
}

function categoryLabel(categoryId: string): string {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat ? `${cat.icon} ${cat.name}` : categoryId
}

async function fetchCategories() {
  const companyId = companyStore.currentCompany?.id
  if (!companyId) return
  try {
    categories.value = await pb.collection('categories').getFullList({
      filter: `company="${companyId}" && active=true`,
      sort: 'name',
    })
  } catch {
    categories.value = []
  }
}

function getFileUrl(item: any): string {
  if (!item.receipt_image) return ''
  return pb.files.getURL(item, item.receipt_image)
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    receiptFile.value = input.files[0]
  }
}

async function analyzeWithAI() {
  if (!receiptFile.value) return

  analyzingReceipt.value = true
  errorMsg.value = ''

  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        resolve(dataUrl.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(receiptFile.value!)
    })

    const data = await pb.send('/api/ai/read-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mimeType: receiptFile.value.type || 'image/jpeg', companyId: companyStore.currentCompany?.id || '' }),
    })

    if (data.date) itemForm.value.date = data.date
    if (data.amount != null) itemForm.value.amountDisplay = String(data.amount)
    if (data.merchant) itemForm.value.merchant = data.merchant
    if (data.category) itemForm.value.category = data.category
    if (data.description) itemForm.value.description = data.description

    successMsg.value = 'Dados extraídos pela IA! Revise os campos e salve.'
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao analisar comprovante com IA.'
  } finally {
    analyzingReceipt.value = false
  }
}

function resetItemForm() {
  itemForm.value = { date: '', category: '', amountDisplay: '', merchant: '', description: '', notes: '' }
  receiptFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function handleAddItem() {
  successMsg.value = ''
  errorMsg.value = ''
  if (!report.value) return

  const amountCents = Math.round(parseFloat(itemForm.value.amountDisplay || '0') * 100)
  if (amountCents <= 0) {
    errorMsg.value = 'O valor deve ser maior que zero.'
    return
  }

  const data: any = {
    report: report.value.id,
    amount: amountCents,
    date: itemForm.value.date || undefined,
    category: itemForm.value.category || undefined,
    merchant: itemForm.value.merchant || undefined,
    description: itemForm.value.description || undefined,
    notes: itemForm.value.notes || undefined,
  }

  if (receiptFile.value) {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value))
    })
    formData.append('receipt_image', receiptFile.value)
    try {
      await pb.collection('expense_items').create(formData)
      await expensesStore.recalculateTotal(report.value.id)
      await loadReport()
      successMsg.value = 'Despesa adicionada com sucesso!'
      showItemForm.value = false
      resetItemForm()
    } catch (err: any) {
      errorMsg.value = err?.message || 'Erro ao adicionar despesa.'
    }
  } else {
    const result = await expensesStore.addItem(data)
    if (result.success) {
      await loadReport()
      successMsg.value = 'Despesa adicionada com sucesso!'
      showItemForm.value = false
      resetItemForm()
    } else {
      errorMsg.value = result.error || 'Erro ao adicionar despesa.'
    }
  }
}

async function handleRemoveItem(itemId: string) {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  const result = await expensesStore.removeItem(itemId, report.value.id)
  if (result.success) {
    successMsg.value = 'Item removido com sucesso!'
    await loadReport()
  } else {
    errorMsg.value = result.error || 'Erro ao remover item.'
  }
}

async function handleSubmitReport() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  const result = await expensesStore.submitReport(report.value.id)
  if (result.success) {
    successMsg.value = 'Relatório enviado para aprovação!'
    await loadReport()
  } else {
    errorMsg.value = result.error || 'Erro ao enviar relatório.'
  }
}

async function handleApproveReport() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  const result = await expensesStore.approveReport(report.value.id)
  if (result.success) {
    successMsg.value = 'Relatório aprovado com sucesso!'
    await loadReport()
  } else {
    errorMsg.value = result.error || 'Erro ao aprovar relatório.'
  }
}

async function handleRejectReport() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  const result = await expensesStore.rejectReport(report.value.id, rejectionReason.value)
  if (result.success) {
    successMsg.value = 'Relatório rejeitado.'
    showRejectModal.value = false
    rejectionReason.value = ''
    await loadReport()
  } else {
    errorMsg.value = result.error || 'Erro ao rejeitar relatório.'
  }
}

async function handleDeleteReport() {
  if (!report.value) return
  if (!confirm('Tem certeza que deseja excluir este relatório?')) return
  successMsg.value = ''
  errorMsg.value = ''
  const result = await expensesStore.deleteReport(report.value.id)
  if (result.success) {
    router.push('/reports')
  } else {
    errorMsg.value = result.error || 'Erro ao excluir relatório.'
  }
}

async function loadReport() {
  const id = route.params.id as string
  const result = await expensesStore.getReport(id)
  if (!result.success) {
    alert(result.error || 'Erro ao carregar relatório.')
    router.push('/reports')
    return
  }
  await expensesStore.fetchItems(id)
}

onMounted(async () => {
  await companyStore.fetchMyCompanies()
  await Promise.all([loadReport(), fetchCategories()])
})
</script>
