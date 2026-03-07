<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
        <h1 class="text-2xl font-bold text-white">Modelo de Impressão</h1>
        <p class="text-blue-100 mt-1">Configure os textos e campos do relatório impresso</p>
      </div>

      <div class="p-8 space-y-6">
        <div v-if="saved" class="rounded-lg bg-green-50 border border-green-200 p-4">
          <p class="text-sm text-green-700">Configurações salvas com sucesso.</p>
        </div>

        <div v-if="errorMsg" class="rounded-lg bg-red-50 border border-red-200 p-4">
          <p class="text-sm text-red-700">{{ errorMsg }}</p>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-700">
            Este modelo é usado ao imprimir ou exportar relatórios de despesas em PDF. As configurações são salvas por empresa.
          </p>
        </div>

        <form @submit.prevent="handleSave" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Título do Documento <span class="text-gray-400">(opcional)</span>
            </label>
            <p class="text-xs text-gray-500 mb-2">
              Substitui o título padrão "Relatório de Despesas". Útil para incluir código ISO/SGQ, ex: <span class="font-mono text-blue-600">F-123 · Relatório de Reembolso</span>.
            </p>
            <input
              v-model="form.docTitle"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Ex: F-123 · Relatório de Reembolso"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Texto de Introdução
            </label>
            <p class="text-xs text-gray-500 mb-2">
              Exibido no início do relatório, antes da lista de despesas.
            </p>
            <textarea
              v-model="form.introText"
              rows="4"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-y"
              placeholder="Ex: Este relatório foi elaborado conforme as políticas da empresa e está sujeito à aprovação do departamento financeiro."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Texto de Rodapé
            </label>
            <p class="text-xs text-gray-500 mb-2">
              Exibido ao final do relatório, após o resumo por categorias.
            </p>
            <textarea
              v-model="form.footerText"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-y"
              placeholder="Ex: Declaro que as despesas acima são verídicas e foram efetuadas em benefício da empresa."
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Rótulo da 1ª Assinatura
              </label>
              <input
                v-model="form.signatureLabel1"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Ex: Solicitante"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Rótulo da 2ª Assinatura
              </label>
              <input
                v-model="form.signatureLabel2"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Ex: Aprovador"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Rótulo da 3ª Assinatura <span class="text-gray-400">(opcional)</span>
            </label>
            <input
              v-model="form.signatureLabel3"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Ex: Financeiro"
            />
          </div>

          <div class="flex items-center gap-3">
            <input
              id="includeReceipts"
              v-model="form.includeReceipts"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="includeReceipts" class="text-sm font-medium text-gray-700 cursor-pointer">
              Incluir comprovantes (4 por página) após o resumo
            </label>
          </div>

          <div class="space-y-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              @click="handlePreview"
              class="w-full rounded-lg border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
            >
              🖥️ Pré-visualizar com dados de exemplo
            </button>
            <div class="flex gap-3">
              <button
                type="button"
                @click="handleReset"
                :disabled="saving"
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Restaurar Padrão
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {{ saving ? 'Salvando...' : 'Salvar Configurações' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="px-8 py-5 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">Pré-visualização do Cabeçalho</h2>
        <p class="text-sm text-gray-500 mt-0.5">Amostra de como o relatório será apresentado</p>
      </div>
      <div class="p-8">
        <div class="border border-gray-200 rounded-lg overflow-hidden bg-white" style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;">
          <div class="flex justify-between items-start p-5 border-b-2 border-blue-600">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ companyName }}</p>
              <p class="text-xl font-extrabold text-gray-900 mt-0.5 tracking-tight">{{ form.docTitle || 'Relatório de Despesas' }}</p>
            </div>
            <div class="text-right">
              <span class="inline-block text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded-full px-3 py-1">Aprovado</span>
              <p class="text-2xl font-extrabold text-blue-600 mt-1">R$ 872,30</p>
            </div>
          </div>
          <div class="bg-blue-50 mx-4 mt-4 rounded-lg p-3 text-xs text-gray-700 border-l-2 border-blue-600" v-if="form.introText">
            {{ form.introText }}
          </div>
          <div class="bg-gray-50 mx-4 mt-4 rounded-lg p-3 text-xs text-gray-400 italic border border-dashed border-gray-200" v-else>
            Texto de introdução aparecerá aqui após ser configurado
          </div>
          <div class="p-4 pb-5">
            <p class="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-1 mb-2">Despesas</p>
            <div class="space-y-1">
              <div v-for="row in previewRows" :key="row.label" class="flex justify-between text-xs text-gray-600">
                <span>{{ row.label }}</span>
                <span class="font-semibold">{{ row.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyStore } from '../stores/company'
import pb from '../services/pocketbase'

const router = useRouter()
const companyStore = useCompanyStore()
const saved = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const recordId = ref('')

const defaultForm = {
  docTitle: '',
  introText: '',
  footerText: '',
  signatureLabel1: 'Solicitante',
  signatureLabel2: 'Aprovador',
  signatureLabel3: '',
  includeReceipts: true,
}

const form = reactive({ ...defaultForm })

const companyName = ref('')

function toDbFields() {
  return {
    company: companyStore.currentCompany?.id,
    doc_title: form.docTitle,
    intro_text: form.introText,
    footer_text: form.footerText,
    signature_label_1: form.signatureLabel1,
    signature_label_2: form.signatureLabel2,
    signature_label_3: form.signatureLabel3,
    include_receipts: form.includeReceipts,
  }
}

function fromDbRecord(record: any) {
  form.docTitle = record.doc_title || ''
  form.introText = record.intro_text || ''
  form.footerText = record.footer_text || ''
  form.signatureLabel1 = record.signature_label_1 || 'Solicitante'
  form.signatureLabel2 = record.signature_label_2 || 'Aprovador'
  form.signatureLabel3 = record.signature_label_3 || ''
  form.includeReceipts = record.include_receipts ?? true
}

async function loadTemplate() {
  companyName.value = companyStore.currentCompany?.name || 'Empresa'
  const companyId = companyStore.currentCompany?.id
  if (!companyId) return
  try {
    const records = await pb.collection('print_templates').getFullList({
      filter: `company="${companyId}"`,
    })
    if (records.length > 0) {
      recordId.value = records[0].id
      fromDbRecord(records[0])
    }
  } catch {
    // collection may not exist yet
  }
}

async function handleSave() {
  const companyId = companyStore.currentCompany?.id
  if (!companyId) return
  saving.value = true
  errorMsg.value = ''
  try {
    if (recordId.value) {
      await pb.collection('print_templates').update(recordId.value, toDbFields())
    } else {
      const record = await pb.collection('print_templates').create(toDbFields())
      recordId.value = record.id
    }
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e: any) {
    errorMsg.value = e?.message || 'Erro ao salvar configurações.'
  } finally {
    saving.value = false
  }
}

async function handleReset() {
  const companyId = companyStore.currentCompany?.id
  if (!companyId) return
  Object.assign(form, defaultForm)
  saving.value = true
  errorMsg.value = ''
  try {
    if (recordId.value) {
      await pb.collection('print_templates').update(recordId.value, toDbFields())
    }
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e: any) {
    errorMsg.value = e?.message || 'Erro ao restaurar padrão.'
  } finally {
    saving.value = false
  }
}

function handlePreview() {
  const url = router.resolve({ name: 'print-report', params: { id: 'preview' }, query: { preview: '1' } }).href
  window.open(url, '_blank')
}

const previewRows = computed(() => [
  { label: '28/04 · Restaurante Sabor & Cia · Alimentação', value: 'R$ 156,20' },
  { label: '29/04 · 99 Táxi · Transporte', value: 'R$ 87,00' },
  { label: '29/04 · Hotel Paulista Inn · Hospedagem', value: 'R$ 390,00' },
  { label: '30/04 · Papelaria Central · Material', value: 'R$ 32,10' },
  { label: '01/05 · Restaurante Sabor & Cia · Alimentação', value: 'R$ 207,00' },
])

onMounted(loadTemplate)
</script>
