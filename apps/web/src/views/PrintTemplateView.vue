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

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-700">
            Este modelo é usado ao imprimir ou exportar relatórios de despesas em PDF. As configurações são salvas por empresa.
          </p>
        </div>

        <form @submit.prevent="handleSave" class="space-y-6">
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

          <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              @click="handleReset"
              class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Restaurar Padrão
            </button>
            <button
              type="submit"
              class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="px-8 py-5 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">Pré-visualização do Cabeçalho</h2>
        <p class="text-sm text-gray-500 mt-0.5">Como o cabeçalho aparecerá no relatório impresso</p>
      </div>
      <div class="p-8">
        <div class="border border-gray-200 rounded-lg p-6 bg-gray-50 font-serif">
          <div class="text-center border-b border-gray-300 pb-4 mb-4">
            <p class="text-base font-bold text-gray-900 uppercase tracking-wide">{{ companyName }}</p>
            <p class="text-xl font-bold text-gray-900 mt-1">RELATÓRIO DE DESPESAS</p>
            <p class="text-sm text-gray-500 mt-1">Título do Relatório</p>
          </div>
          <p v-if="form.introText" class="text-sm text-gray-700 italic">{{ form.introText }}</p>
          <p v-else class="text-sm text-gray-400 italic">[ Texto de introdução aparecerá aqui ]</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useCompanyStore } from '../stores/company'

const companyStore = useCompanyStore()
const saved = ref(false)

const defaultForm = {
  introText: '',
  footerText: '',
  signatureLabel1: 'Solicitante',
  signatureLabel2: 'Aprovador',
  signatureLabel3: '',
  includeReceipts: true,
}

const form = reactive({ ...defaultForm })

const companyName = ref('')

function storageKey(): string {
  return `print_template_${companyStore.currentCompany?.id || 'default'}`
}

function loadTemplate() {
  companyName.value = companyStore.currentCompany?.name || 'Empresa'
  try {
    const raw = localStorage.getItem(storageKey())
    if (raw) {
      const parsed = JSON.parse(raw)
      Object.assign(form, parsed)
    }
  } catch {
    // use defaults
  }
}

function handleSave() {
  try {
    localStorage.setItem(storageKey(), JSON.stringify({ ...form }))
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch {
    // ignore
  }
}

function handleReset() {
  Object.assign(form, defaultForm)
  localStorage.removeItem(storageKey())
  saved.value = true
  setTimeout(() => { saved.value = false }, 3000)
}

onMounted(loadTemplate)
</script>
