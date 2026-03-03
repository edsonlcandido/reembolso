<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Adicionar Despesa</h1>
      <router-link to="/reports"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
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
            <router-link to="/reports/new" class="underline font-medium">Crie um relatório</router-link> antes de
            adicionar despesas.
          </p>
        </div>

        <form @submit.prevent="handleAddItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Comprovante</label>
            <div class="rounded-xl border border-blue-100 bg-white p-3">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  @click="openFilePicker"
                  class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-all sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V8m0 8l-3-3m3 3l3-3M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5M8 7V6a4 4 0 118 0v1" />
                  </svg>
                  Escolher arquivo
                </button>
                <button
                  type="button"
                  @click.prevent.stop="openCameraCapture"
                  class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-all sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h2l1.5-2h7L17 7h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  Tirar foto
                </button>
              </div>
            </div>
            <input ref="fileInputRef" type="file" accept="image/*" @change="handleFileChange" class="hidden" />
            <input ref="cameraInputRef" type="file" accept="image/*" capture="environment" @change="handleCameraChange" class="hidden" />
            <div class="mt-2">
              <button type="button" @click="analyzeWithAI" :disabled="analyzingReceipt || !receiptFile"
                :title="!receiptFile ? 'Selecione um comprovante primeiro' : 'Analisar comprovante com IA'"
                class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <svg v-if="!analyzingReceipt" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" fill="none"
                  style="animation-direction: reverse;"
                  viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ analyzingReceipt ? 'Analisando...' : 'Analisar com IA' }}
              </button>
            </div>
            <p v-if="receiptFile" class="mt-2 text-sm text-emerald-700">
              Comprovante pronto para envio: <span class="font-medium">{{ receiptFile.name }}</span>
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">


            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input v-model="itemForm.date" type="date"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select v-model="itemForm.category"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                <option value="">Selecionar</option>
                <template v-if="categories.length > 0">
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.icon }} {{ cat.name }}
                  </option>
                </template>
                <option v-else disabled value="">Nenhuma categoria cadastrada</option>
              </select>
            </div>
            <div v-if="isKmCategory">
              <label class="block text-sm font-medium text-gray-700 mb-1">Quilômetros (km) <span class="text-red-500">*</span></label>
              <input v-model="itemForm.km" type="number" step="0.1" min="0"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Ex: 150" />
              <p v-if="companyStore.currentCompany?.km_rate" class="mt-1 text-xs text-gray-500">
                Taxa: R$ {{ Number(companyStore.currentCompany.km_rate).toFixed(2).replace('.', ',') }}/km
              </p>
              <p v-else class="mt-1 text-xs text-amber-600">Taxa por km não configurada na empresa. Configure em Editar Empresa.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$) <span
                  class="text-red-500">*</span></label>
              <input v-model="itemForm.amountDisplay" type="number" step="0.01" min="0" required
                :readonly="isKmCategory"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                :class="{ 'bg-gray-50 cursor-not-allowed': isKmCategory }"
                placeholder="0,00" />
              <p v-if="isKmCategory" class="mt-1 text-xs text-gray-500">Calculado automaticamente: km × taxa/km</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estabelecimento</label>
              <input v-model="itemForm.merchant" type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Nome do estabelecimento" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input v-model="itemForm.description" type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Descrição da despesa" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea v-model="itemForm.notes" rows="2"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Observações adicionais" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Relatório <span
                class="text-red-500">*</span></label>
            <select v-model="selectedReportId" required
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
              <option value="">Selecionar relatório</option>
              <option v-for="r in draftReports" :key="r.id" :value="r.id">{{ r.title }}</option>
            </select>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" :disabled="submitting || draftReports.length === 0"
              class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50">
              {{ submitting ? 'Enviando comprovante...' : 'Salvar Despesa' }}
            </button>
            <button type="button" @click="resetForm"
              class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
              Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import pb from '../services/pocketbase'
import { useExpensesStore } from '../stores/expenses'
import { useCompanyStore } from '../stores/company'
import type { RecordModel } from 'pocketbase'

const router = useRouter()
const expensesStore = useExpensesStore()
const companyStore = useCompanyStore()

const draftReports = ref<any[]>([])
const loadingReports = ref(true)
const submitting = ref(false)
const analyzingReceipt = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const selectedReportId = ref('')
const receiptFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const categories = ref<RecordModel[]>([])

const itemForm = ref({
  date: '',
  category: '',
  amountDisplay: '',
  merchant: '',
  description: '',
  notes: '',
  km: '',
})

// Detect if the selected category is "Quilometragem"
const isKmCategory = computed(() => {
  if (!itemForm.value.category) return false
  const cat = categories.value.find(c => c.id === itemForm.value.category)
  return cat?.name?.toLowerCase() === 'quilometragem'
})

// Auto-calculate amount when km or category changes
watch([() => itemForm.value.km, isKmCategory], () => {
  if (!isKmCategory.value) return
  const km = parseFloat(itemForm.value.km || '0')
  const kmRate = companyStore.currentCompany?.km_rate ?? 0
  if (km > 0 && kmRate > 0) {
    itemForm.value.amountDisplay = (km * kmRate).toFixed(2)
  } else {
    itemForm.value.amountDisplay = ''
  }
})

function resetForm() {
  itemForm.value = { date: '', category: '', amountDisplay: '', merchant: '', description: '', notes: '', km: '' }
  receiptFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
  if (cameraInputRef.value) cameraInputRef.value.value = ''
  selectedReportId.value = ''
  successMsg.value = ''
  errorMsg.value = ''
}

function openCameraCapture(e?: Event) {
  e?.preventDefault()
  e?.stopPropagation()
  cameraInputRef.value?.click()
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    receiptFile.value = input.files[0]
    successMsg.value = 'Comprovante selecionado. Pronto para envio e análise.'
    errorMsg.value = ''
  }
}

function handleCameraChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    receiptFile.value = input.files[0]
    successMsg.value = 'Foto capturada com sucesso! Clique em Analisar com IA.'
    errorMsg.value = ''
  }
}

async function analyzeWithAI() {
  if (!receiptFile.value) return

  analyzingReceipt.value = true
  errorMsg.value = ''
  successMsg.value = ''

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
    if (data.category) itemForm.value.category = resolveAICategory(data.category)
    if (data.description) itemForm.value.description = data.description

    successMsg.value = 'Dados extraídos pela IA! Revise os campos e salve.'
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao analisar comprovante com IA.'
  } finally {
    analyzingReceipt.value = false
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

// Maps the AI-returned category value (name or legacy slug) to a category ID.
// Returns an empty string when no matching category is found.
const slugToName: Record<string, string> = {
  food: 'Alimentação', transport: 'Transporte',
  lodging: 'Hospedagem', supplies: 'Material', other: 'Outros',
}
function resolveAICategory(aiValue: string): string {
  if (!aiValue) return ''
  const normalized = slugToName[aiValue.toLowerCase()] ?? aiValue
  const match = categories.value.find(
    c => c.name.toLowerCase() === normalized.toLowerCase()
  )
  return match?.id ?? ''
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
    km: isKmCategory.value && itemForm.value.km ? parseFloat(itemForm.value.km) : undefined,
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
  await Promise.all([loadDraftReports(), fetchCategories()])
})
</script>
