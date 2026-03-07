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
                <span v-if="report.period_start">{{ formatDate(report.period_start) }}</span>
                <span v-if="report.period_start && report.period_end"> — </span>
                <span v-if="report.period_end">{{ formatDate(report.period_end) }}</span>
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="statusBadgeClass(report.status)" class="px-4 py-2 rounded-full text-sm font-semibold">
                {{ statusLabel(report.status) }}
              </span>
              <div class="text-right">
                <span class="text-2xl font-bold text-white">
                  {{ formatCurrency(report.total_amount || 0) }}
                </span>
                <template v-if="report.advance_amount">
                  <p class="text-blue-100 text-xs mt-0.5">
                    Adiantamento: {{ formatCurrency(report.advance_amount) }}
                    <span v-if="report.advance_date"> · {{ formatDate(report.advance_date) }}</span>
                  </p>
                  <p v-if="balanceInfo" class="text-xs font-semibold mt-0.5" :class="balanceInfo.colorClass">
                    {{ balanceInfo.label }}
                  </p>
                </template>
              </div>
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

          <div v-if="lastActionNotes && (report.status === 'rejected' || report.status === 'draft')" class="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <h3 class="text-sm font-semibold text-amber-700 mb-1">{{ report.status === 'draft' ? 'Devolvido para Revisão' : 'Motivo da Rejeição' }}</h3>
            <p class="text-sm text-amber-700">{{ lastActionNotes }}</p>
          </div>

          <div class="flex flex-wrap gap-3">
            <template v-if="report.status === 'draft'">
              <button
                @click="showSubmitModal = true"
                :disabled="submitting || expensesStore.loading"
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
                :disabled="submitting || expensesStore.loading"
                class="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                Excluir
              </button>
            </template>
            <template v-if="report.status === 'submitted' && isApprover">
              <button
                @click="handleApproveReport"
                :disabled="submitting || expensesStore.loading"
                class="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-all disabled:opacity-50"
              >
                Aprovar
              </button>
              <button
                @click="showReturnModal = true"
                :disabled="submitting"
                class="rounded-lg border border-amber-400 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-all disabled:opacity-50"
              >
                Devolver para Revisão
              </button>
              <button
                @click="showForwardModal = true"
                :disabled="submitting"
                class="rounded-lg border border-blue-300 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                Encaminhar
              </button>
            </template>
            <template v-if="report.status === 'rejected' && isReportOwner">
              <button
                @click="handleReopenReport"
                :disabled="submitting || expensesStore.loading"
                class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                Reabrir para Edição
              </button>
            </template>
            <template v-if="report.status === 'approved' && isApprover">
                            <button
                @click="handlePayReport"
                :disabled="submitting || expensesStore.loading || !canCurrentUserPayReport"
                class="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                Pagar
              </button>
              <button
                @click="showReturnModal = true"
                :disabled="submitting"
                class="rounded-lg border border-amber-400 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-all disabled:opacity-50"
              >
                Devolver para Revisão
              </button>
              <button
                @click="showForwardModal = true"
                :disabled="submitting"
                class="rounded-lg border border-blue-300 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                Encaminhar
              </button>

            </template>
            <p
              v-if="report.status === 'approved' && isApprover && !canCurrentUserPayReport"
              class="w-full text-sm text-amber-700"
            >
              Você aprovou este relatório. Encaminhe para outro aprovador para registrar o pagamento.
            </p>
            <button
              v-if="report.submitted_to && (report.status === 'submitted' || report.status === 'approved')"
              @click="handleNotifyCurrentStageUser"
              :disabled="submitting || notifying"
              class="rounded-lg border border-indigo-300 px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-all disabled:opacity-50"
            >
              {{ notifying ? 'Enviando...' : 'Notificar' }}
            </button>
            <router-link
              :to="`/reports/${report.id}/print`"
              target="_blank"
              class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              🖨️ Imprimir / PDF
            </router-link>
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
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" fill="none" style="animation-direction: reverse;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
              <div v-if="isKmCategory">
                <label class="block text-sm font-medium text-gray-700 mb-1">Quilômetros (km) <span class="text-red-500">*</span></label>
                <input v-model="itemForm.km" type="number" step="0.1" min="0" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Ex: 150" />
                <p v-if="companyStore.currentCompany?.km_rate" class="mt-1 text-xs text-gray-500">
                  Taxa: R$ {{ Number(companyStore.currentCompany.km_rate).toFixed(2).replace('.', ',') }}/km
                </p>
                <p v-else class="mt-1 text-xs text-amber-600">Taxa por km não configurada na empresa.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                <select v-model="itemForm.original_currency" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <option v-for="cur in supportedCurrencies" :key="cur.code" :value="cur.code">{{ cur.label }}</option>
                </select>
              </div>
              <div v-if="isForeignCurrency">
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor ({{ itemForm.original_currency }}) <span class="text-red-500">*</span></label>
                <input v-model="itemForm.originalAmount" type="number" step="0.01" min="0" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="0,00" @input="triggerConversion" />
                <p v-if="convertingCurrency" class="mt-1 text-xs text-blue-600">Convertendo...</p>
                <p v-if="itemForm.currencyNote" class="mt-1 text-xs text-gray-500">{{ itemForm.currencyNote }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor <span class="text-red-500">*</span></label>
                <input v-model="itemForm.amountDisplay" type="number" step="0.01" min="0" required
                  :readonly="isKmCategory"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  :class="{ 'bg-gray-50 cursor-not-allowed': isKmCategory }"
                  placeholder="0,00" />
                <p v-if="isKmCategory" class="mt-1 text-xs text-gray-500">Calculado automaticamente: km × taxa/km</p>
                <p v-if="isForeignCurrency && !isKmCategory" class="mt-1 text-xs text-gray-500">Valor sugerido pela conversão. Você pode editar.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estabelecimento</label>
                <input v-model="itemForm.merchant" type="text" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Nome do estabelecimento" />
              </div>
            </div>
            <div v-if="isForeignCurrency" class="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-amber-600 font-semibold text-sm">💱 IOF (3,5%)</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Valor IOF (R$)</label>
                  <input v-model="itemForm.iofAmount" type="number" step="0.01" min="0" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="0,00" />
                  <p class="mt-1 text-xs text-gray-500">Calculado automaticamente (3,5% do valor em BRL). Você pode editar.</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Descrição IOF</label>
                  <input :value="iofDescription" type="text" readonly class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-gray-50 cursor-not-allowed focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                </div>
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
                :disabled="submitting || expensesStore.loading"
                class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {{ submitting ? 'Enviando comprovante...' : 'Salvar' }}
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
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <div class="flex items-start gap-4 min-w-0">
                  <div v-if="item.receipt_image" class="flex-shrink-0">
                    <button
                      type="button"
                      @click="openReceiptDetailModal(item)"
                      class="rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 transition-all"
                      title="Ver detalhes do comprovante"
                    >
                      <img :src="getFileUrl(item)" class="h-16 w-16 object-cover sm:h-20 sm:w-20" />
                    </button>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-1">
                      <span class="font-semibold text-gray-900">{{ formatCurrency(item.amount || 0) }}</span>
                      <span v-if="item.original_currency && item.original_currency !== 'BRL'" class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        {{ item.original_currency }}
                      </span>
                      <span v-if="item.category" class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {{ categoryLabel(item.category) }}
                      </span>
                      <span v-if="item.paid" class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Pago
                      </span>
                    </div>
                    <p v-if="item.original_currency && item.original_currency !== 'BRL' && item.original_amount" class="text-sm text-amber-600">
                      {{ item.currency_note || `${item.original_currency} ${Number(item.original_amount).toLocaleString('pt-BR')}` }}
                    </p>
                    <p v-if="item.merchant" class="text-sm text-gray-600">{{ item.merchant }}</p>
                    <p v-if="item.description" class="text-sm text-gray-500">{{ item.description }}</p>
                    <p v-if="item.km" class="text-xs text-emerald-600 mt-0.5">🛣️ {{ item.km }} km</p>
                    <p v-if="item.date" class="text-xs text-gray-400 mt-1">{{ new Date(item.date).toLocaleDateString('pt-BR') }}</p>
                  </div>
                </div>
                <div class="flex w-full gap-2 items-center justify-start sm:w-auto sm:ml-auto sm:justify-start sm:self-center">
                  <button
                    v-if="item.receipt_image"
                    @click="openReceiptDetailModal(item)"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all sm:p-2 sm:text-base"
                    title="Ver detalhes do comprovante"
                  >
                    <EyeIcon class="h-4 w-4" />
                    <span class="sm:hidden">Ver</span>
                  </button>
                  
                  <button
                    v-if="report.status === 'draft'"
                    @click="openEditItemModal(item)"
                    :disabled="submitting || expensesStore.loading"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 sm:p-2 sm:text-base"
                    title="Editar despesa"
                  >
                    <PencilIcon class="h-4 w-4" />
                    <span class="sm:hidden">Editar</span>
                  </button>
                  <button
                    v-if="report.status === 'draft'"
                    @click="handleRemoveItem(item.id)"
                    :disabled="submitting || expensesStore.loading"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 sm:p-2 sm:text-base"
                  >
                    <TrashIcon class="h-4 w-4" />
                    <span class="sm:hidden">Deletar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="reportWorkflowHistory.length > 0" class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <button
          type="button"
          @click="showHistorySection = !showHistorySection"
          class="w-full px-8 py-6 border-b border-gray-100 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
        >
          <div>
            <h2 class="text-xl font-bold text-gray-900">Histórico do Relatório</h2>
            <p class="mt-1 text-sm text-gray-500">Fluxo completo da solicitação até aprovação, retorno e pagamento.</p>
          </div>
          <span class="text-sm font-semibold text-blue-700">{{ showHistorySection ? 'Ocultar' : 'Mostrar' }}</span>
        </button>
        <div v-if="showHistorySection" class="px-8 py-6">
          <ol class="space-y-4">
            <li
              v-for="(entry, index) in reportWorkflowHistoryDescending"
              :key="`${entry.timestamp}-${index}`"
              class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-sm font-semibold text-gray-900">{{ entry.action }}</p>
                <span class="text-xs font-medium text-gray-500">{{ formatDateTime(entry.timestamp) }}</span>
              </div>
              <p class="text-sm text-gray-700">Usuário: {{ entry.user }}</p>
              <p v-if="entry.notes" class="text-sm text-amber-700 mt-1">Mensagem: {{ entry.notes }}</p>
            </li>
          </ol>
        </div>
      </div>

    </template>

    <div v-else class="bg-white rounded-2xl shadow-xl p-12 text-center">
      <p class="text-gray-500">Relatório não encontrado.</p>
      <router-link to="/reports" class="mt-4 inline-block text-blue-600 hover:underline">Voltar aos relatórios</router-link>
    </div>

    <div
      v-if="showReceiptDetailModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="closeReceiptDetailModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">Detalhes do comprovante</h3>
          <button
            type="button"
            @click="closeReceiptDetailModal"
            class="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 transition-all"
            title="Fechar"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div v-if="selectedReceiptItem" class="p-6 space-y-6">
          <img
            :src="getFileUrl(selectedReceiptItem)"
            class="w-full max-h-[55vh] object-contain rounded-xl border border-gray-200 bg-gray-50"
            alt="Comprovante da despesa"
          />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Valor</p>
              <p class="font-semibold text-gray-900">{{ formatCurrency(selectedReceiptItem.amount || 0) }}</p>
            </div>
            <div>
              <p class="text-gray-500">Data</p>
              <p class="font-semibold text-gray-900">{{ selectedReceiptItem.date ? new Date(selectedReceiptItem.date).toLocaleDateString('pt-BR') : 'Não informada' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Categoria</p>
              <p class="font-semibold text-gray-900">{{ selectedReceiptItem.category ? categoryLabel(selectedReceiptItem.category) : 'Não informada' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Estabelecimento</p>
              <p class="font-semibold text-gray-900">{{ selectedReceiptItem.merchant || 'Não informado' }}</p>
            </div>
            <div class="sm:col-span-2" v-if="selectedReceiptItem.description">
              <p class="text-gray-500">Descrição</p>
              <p class="font-semibold text-gray-900">{{ selectedReceiptItem.description }}</p>
            </div>
            <div class="sm:col-span-2" v-if="selectedReceiptItem.notes">
              <p class="text-gray-500">Observações</p>
              <p class="font-semibold text-gray-900 whitespace-pre-line">{{ selectedReceiptItem.notes }}</p>
            </div>
          </div>

          <div class="flex justify-end">
            <a
              :href="getFileUrl(selectedReceiptItem)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-all"
            >
              <ArrowTopRightOnSquareIcon class="h-4 w-4" />
              Abrir comprovante em nova aba
            </a>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showSubmitModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showSubmitModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Enviar para Aprovação</h3>
        <p class="text-sm text-gray-500 mb-4">Selecione o aprovador que irá revisar este relatório.</p>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Aprovador</label>
          <select
            v-model="submitTargetUserId"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Selecione um aprovador...</option>
            <option v-for="member in approverMembers" :key="member.expand?.user?.id ?? member.id" :value="member.expand?.user?.id">
              {{ member.expand?.user?.name || member.expand?.user?.email }}
            </option>
          </select>
          <p v-if="approverMembers.length === 0" class="mt-2 text-xs text-amber-600">
            Nenhum aprovador disponível. O relatório será enviado sem destinatário específico.
          </p>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="showSubmitModal = false"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmitReport"
            :disabled="submitting || expensesStore.loading || isSubmitDisabled"
            class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            Confirmar Envio
          </button>
        </div>
      </div>
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
            :disabled="submitting || expensesStore.loading || !rejectionReason.trim()"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-all disabled:opacity-50"
          >
            Confirmar Rejeição
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showReturnModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showReturnModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Devolver para Revisão</h3>
        <p class="text-sm text-gray-500 mb-4">O relatório voltará para rascunho e o funcionário poderá editá-lo e reenviar.</p>
        <textarea
          v-model="returnReason"
          rows="4"
          class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          placeholder="Informe o que precisa ser alterado..."
        />
        <div class="flex gap-3 justify-end mt-4">
          <button
            @click="showReturnModal = false"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            @click="handleReturnForRevision"
            :disabled="submitting || expensesStore.loading || !returnReason.trim()"
            class="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            Devolver
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showForwardModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showForwardModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Encaminhar para Aprovador</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Aprovador</label>
          <select
            v-model="forwardTargetUserId"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Selecione um aprovador...</option>
            <option v-for="member in approverMembers" :key="member.expand?.user?.id ?? member.id" :value="member.expand?.user?.id">
              {{ member.expand?.user?.name || member.expand?.user?.email }}
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Observação</label>
          <textarea
            v-model="forwardNotes"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Adicione uma observação para o próximo aprovador..."
          />
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="showForwardModal = false"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            @click="handleForwardReport"
            :disabled="submitting || expensesStore.loading || !forwardTargetUserId"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            Encaminhar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showEditItemModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="closeEditItemModal()"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Editar Despesa</h3>
        <form @submit.prevent="handleUpdateItem" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input v-model="editItemForm.date" type="date" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select v-model="editItemForm.category" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                <option value="">Selecionar</option>
                <template v-if="categories.length > 0">
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.icon }} {{ cat.name }}
                  </option>
                </template>
                <option v-else disabled value="">Nenhuma categoria cadastrada</option>
              </select>
            </div>
            <div v-if="isEditKmCategory">
              <label class="block text-sm font-medium text-gray-700 mb-1">Quilômetros (km) <span class="text-red-500">*</span></label>
              <input v-model="editItemForm.km" type="number" step="0.1" min="0" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Ex: 150" />
              <p v-if="companyStore.currentCompany?.km_rate" class="mt-1 text-xs text-gray-500">
                Taxa: R$ {{ Number(companyStore.currentCompany.km_rate).toFixed(2).replace('.', ',') }}/km
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input v-model="editItemForm.amountDisplay" type="number" step="0.01" min="0" required
                :readonly="isEditKmCategory"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                :class="{ 'bg-gray-50 cursor-not-allowed': isEditKmCategory }"
                placeholder="0,00"
                @input="onEditAmountChange" />
              <p v-if="isEditKmCategory" class="mt-1 text-xs text-gray-500">Calculado automaticamente: km × taxa/km</p>
              <p v-if="isEditForeignCurrency && !isEditKmCategory" class="mt-1 text-xs text-gray-500">Edite para recalcular a taxa de conversão.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estabelecimento</label>
              <input v-model="editItemForm.merchant" type="text" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Nome do estabelecimento" />
            </div>
          </div>
          <div v-if="isEditForeignCurrency" class="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
            <h4 class="text-sm font-semibold text-blue-800">Dados de moeda estrangeira ({{ editItemForm.original_currency }})</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-blue-700 mb-1">Valor original ({{ editItemForm.original_currency }})</label>
                <input v-model="editItemForm.originalAmount" type="number" step="0.01" min="0" class="w-full rounded-lg border border-blue-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="0,00" />
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-700 mb-1">Taxa de conversão</label>
                <input v-model="editItemForm.conversionRate" type="number" step="0.000001" min="0" class="w-full rounded-lg border border-blue-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" @input="onEditRateChange" />
                <p class="mt-1 text-xs text-blue-600">Edite para recalcular o valor em BRL.</p>
              </div>
            </div>
            <p v-if="editItemForm.currencyNote" class="text-xs text-blue-600">{{ editItemForm.currencyNote }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input v-model="editItemForm.description" type="text" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Descrição da despesa" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea v-model="editItemForm.notes" rows="2" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Observações adicionais" />
          </div>
          <div class="flex gap-3 justify-end">
            <button
              type="button"
              @click="closeEditItemModal()"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting || expensesStore.loading"
              class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpensesStore } from '../stores/expenses'
import { useCompanyStore } from '../stores/company'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'
import pb from '../services/pocketbase'
import { PlusIcon, TrashIcon, ClipboardDocumentListIcon, PencilIcon, EyeIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'
import type { RecordModel } from 'pocketbase'

const route = useRoute()
const router = useRouter()
const expensesStore = useExpensesStore()
const companyStore = useCompanyStore()
const successMsg = ref('')
const errorMsg = ref('')
const showItemForm = ref(false)
const showRejectModal = ref(false)
const showReturnModal = ref(false)
const showForwardModal = ref(false)
const showSubmitModal = ref(false)
const showHistorySection = ref(false)
const approvalActions = ref<RecordModel[]>([])
const submitTargetUserId = ref('')
const forwardTargetUserId = ref('')
const forwardNotes = ref('')
const approverMembers = ref<RecordModel[]>([])
const rejectionReason = ref('')
const returnReason = ref('')
const receiptFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const analyzingReceipt = ref(false)
const submitting = ref(false)
const notifying = ref(false)
const categories = ref<RecordModel[]>([])
const showEditItemModal = ref(false)
const editingItem = ref<RecordModel | null>(null)
const selectedReceiptItem = ref<RecordModel | null>(null)
const editItemForm = ref({
  date: '',
  category: '',
  amountDisplay: '',
  merchant: '',
  description: '',
  notes: '',
  km: '',
  original_currency: 'BRL',
  originalAmount: '',
  suggestedBrlAmount: '',
  conversionRate: '',
  currencyNote: '',
})

const itemForm = ref({
  date: '',
  category: '',
  amountDisplay: '',
  merchant: '',
  description: '',
  notes: '',
  km: '',
  original_currency: 'BRL',
  originalAmount: '',
  suggestedBrlAmount: '',
  conversionRate: '',
  currencyNote: '',
  iofAmount: '',
})

const convertingCurrency = ref(false)
let conversionDebounceTimer: ReturnType<typeof setTimeout> | null = null

const isForeignCurrency = computed(() => itemForm.value.original_currency !== 'BRL')
const isEditForeignCurrency = computed(() => editItemForm.value.original_currency !== '' && editItemForm.value.original_currency !== 'BRL')

const supportedCurrencies = [
  { code: 'BRL', label: '🇧🇷 BRL - Real' },
  { code: 'USD', label: '🇺🇸 USD - Dólar' },
  { code: 'EUR', label: '🇪🇺 EUR - Euro' },
  { code: 'CLP', label: '🇨🇱 CLP - Peso Chileno' },
]

const iofDescription = computed(() => {
  const orig = parseFloat(itemForm.value.originalAmount || '0')
  const cur = itemForm.value.original_currency
  if (orig > 0 && cur && cur !== 'BRL') return `IOF compra ${orig} ${cur}`
  return ''
})

async function fetchConversion(amount: number, from: string, to: string) {
  try {
    convertingCurrency.value = true
    const data = await pb.send('/api/currency/convert', {
      method: 'POST',
      body: { amount, from, to },
    })
    return data
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao converter moeda.'
    return null
  } finally {
    convertingCurrency.value = false
  }
}

function triggerConversion() {
  if (conversionDebounceTimer) clearTimeout(conversionDebounceTimer)
  conversionDebounceTimer = setTimeout(async () => {
    const amount = parseFloat(itemForm.value.originalAmount || '0')
    if (amount <= 0 || !isForeignCurrency.value) return
    const data = await fetchConversion(amount, itemForm.value.original_currency, 'BRL')
    if (data) {
      itemForm.value.suggestedBrlAmount = String(data.brl_amount)
      itemForm.value.amountDisplay = String(data.brl_amount)
      itemForm.value.conversionRate = String(data.conversion_rate)
      itemForm.value.currencyNote = data.note || ''
      const iof = Math.round(data.brl_amount * 3.5) / 100
      itemForm.value.iofAmount = iof.toFixed(2)
    }
  }, 500)
}

let editAmountDebounceTimer: ReturnType<typeof setTimeout> | null = null
let editRateDebounceTimer: ReturnType<typeof setTimeout> | null = null
let editRecalcLock = false

function buildCurrencyNote(orig: number, cur: string, rate: number): string {
  return `Compra em ${cur} ${orig} (taxa: 1 ${cur} = ${rate.toFixed(4)} BRL)`
}

function onEditAmountChange() {
  if (!isEditForeignCurrency.value || editRecalcLock) return
  if (editAmountDebounceTimer) clearTimeout(editAmountDebounceTimer)
  editAmountDebounceTimer = setTimeout(() => {
    const brl = parseFloat(editItemForm.value.amountDisplay || '0')
    const orig = parseFloat(editItemForm.value.originalAmount || '0')
    if (brl > 0 && orig > 0) {
      editRecalcLock = true
      const rate = brl / orig
      editItemForm.value.conversionRate = rate.toFixed(6)
      editItemForm.value.suggestedBrlAmount = String(brl)
      editItemForm.value.currencyNote = buildCurrencyNote(orig, editItemForm.value.original_currency, rate)
      editRecalcLock = false
    }
  }, 400)
}

function onEditRateChange() {
  if (!isEditForeignCurrency.value || editRecalcLock) return
  if (editRateDebounceTimer) clearTimeout(editRateDebounceTimer)
  editRateDebounceTimer = setTimeout(() => {
    const rate = parseFloat(editItemForm.value.conversionRate || '0')
    const orig = parseFloat(editItemForm.value.originalAmount || '0')
    if (rate > 0 && orig > 0) {
      editRecalcLock = true
      const brl = orig * rate
      editItemForm.value.amountDisplay = brl.toFixed(2)
      editItemForm.value.suggestedBrlAmount = String(brl)
      editItemForm.value.currencyNote = buildCurrencyNote(orig, editItemForm.value.original_currency, rate)
      editRecalcLock = false
    }
  }, 400)
}

function findTaxesCategoryId(): string {
  const cat = categories.value.find(c => c.name?.toLowerCase() === 'taxas')
  return cat?.id || ''
}

const report = computed(() => expensesStore.currentReport)

// Detect if the selected category is "Quilometragem" (inline add form)
const isKmCategory = computed(() => {
  if (!itemForm.value.category) return false
  const cat = categories.value.find(c => c.id === itemForm.value.category)
  return cat?.name?.toLowerCase() === 'quilometragem'
})

// Detect if edit item category is "Quilometragem"
const isEditKmCategory = computed(() => {
  if (!editItemForm.value.category) return false
  const cat = categories.value.find(c => c.id === editItemForm.value.category)
  return cat?.name?.toLowerCase() === 'quilometragem'
})

// Auto-calculate amount for inline add form
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

// Auto-calculate amount for edit form
watch([() => editItemForm.value.km, isEditKmCategory], () => {
  if (!isEditKmCategory.value) return
  const km = parseFloat(editItemForm.value.km || '0')
  const kmRate = companyStore.currentCompany?.km_rate ?? 0
  if (km > 0 && kmRate > 0) {
    editItemForm.value.amountDisplay = (km * kmRate).toFixed(2)
  } else {
    editItemForm.value.amountDisplay = ''
  }
})

// Balance: advance_amount - total_amount (positive = employee must return, negative = company owes)
const balance = computed(() => {
  if (!report.value || !report.value.advance_amount) return null
  return (report.value.advance_amount || 0) - (report.value.total_amount || 0)
})

const balanceInfo = computed(() => {
  if (balance.value == null) return null
  if (balance.value >= 0) {
    return { label: `Devolver: ${formatCurrency(balance.value)}`, colorClass: 'text-amber-300' }
  }
  return { label: `A receber: ${formatCurrency(-balance.value)}`, colorClass: 'text-green-300' }
})

const isApprover = computed(() =>
  companyStore.currentUserRole === 'admin' || companyStore.currentUserRole === 'approver'
)

const isReportOwner = computed(() =>
  report.value?.user === (pb.authStore.record?.id ?? '')
)

const canCurrentUserPayReport = computed(() => {
  if (!report.value || !isApprover.value) return false
  if (!report.value.approved_by) return true
  return report.value.approved_by !== (pb.authStore.record?.id ?? '')
})

const isSubmitDisabled = computed(() =>
  approverMembers.value.length > 0 && !submitTargetUserId.value
)

const showReceiptDetailModal = computed(() => !!selectedReceiptItem.value)

type ReportHistoryEntry = {
  timestamp: string
  action: string
  user: string
  notes?: string
}

function approvalActionLabel(action: string): string {
  switch (action) {
    case 'approve': return 'Relatório aprovado'
    case 'reject': return 'Relatório rejeitado'
    case 'return_for_revision': return 'Relatório devolvido para revisão'
    case 'forward': return 'Relatório encaminhado'
    case 'pay': return 'Relatório marcado como pago'
    case 'partially_pay': return 'Relatório parcialmente pago'
    default: return action
  }
}

function approvalActionUserName(action: RecordModel): string {
  const expandedUser = action.expand?.user as RecordModel | undefined
  return expandedUser?.name || expandedUser?.email || action.user || 'Usuário não identificado'
}

const reportWorkflowHistory = computed<ReportHistoryEntry[]>(() =>
  approvalActions.value.map((action) => ({
    timestamp: action.created,
    action: approvalActionLabel(action.action || ''),
    user: approvalActionUserName(action),
    notes: action.notes || '',
  }))
)

const reportWorkflowHistoryDescending = computed<ReportHistoryEntry[]>(() =>
  [...reportWorkflowHistory.value].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
)

const lastActionNotes = computed(() => {
  const action = approvalActions.value.find(a => a.notes)
  return action?.notes || ''
})

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR')
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR')
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'draft': return 'bg-white/20 text-white'
    case 'submitted': return 'bg-blue-200 text-blue-800'
    case 'approved': return 'bg-green-200 text-green-800'
    case 'rejected': return 'bg-red-200 text-red-800'
    case 'paid': return 'bg-purple-200 text-purple-800'
    case 'partially_paid': return 'bg-orange-200 text-orange-800'
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
    case 'partially_paid': return 'Pago Parcialmente'
    default: return status
  }
}

function categoryLabel(categoryId: string): string {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat ? `${cat.icon} ${cat.name}` : ''
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

function getFileUrl(item: any): string {
  if (!item.receipt_image) return ''
  return pb.files.getURL(item, item.receipt_image)
}

function openReceiptDetailModal(item: RecordModel) {
  if (!item.receipt_image) return
  selectedReceiptItem.value = item
}

function closeReceiptDetailModal() {
  selectedReceiptItem.value = null
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

function openFilePicker() {
  fileInputRef.value?.click()
}

function openCameraCapture(e?: Event) {
  e?.preventDefault()
  e?.stopPropagation()
  cameraInputRef.value?.click()
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
    if (data.category) itemForm.value.category = resolveAICategory(data.category)
    if (data.description) itemForm.value.description = data.description

    successMsg.value = 'Dados extraídos pela IA! Revise os campos e salve.'
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao analisar comprovante com IA.'
  } finally {
    analyzingReceipt.value = false
  }
}

function resetItemForm() {
  itemForm.value = { date: '', category: '', amountDisplay: '', merchant: '', description: '', notes: '', km: '', original_currency: 'BRL', originalAmount: '', suggestedBrlAmount: '', conversionRate: '', currencyNote: '', iofAmount: '' }
  receiptFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
  if (cameraInputRef.value) cameraInputRef.value.value = ''
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

  submitting.value = true

  const data: any = {
    report: report.value.id,
    amount: amountCents,
    date: itemForm.value.date || undefined,
    category: itemForm.value.category || undefined,
    merchant: itemForm.value.merchant || undefined,
    description: itemForm.value.description || undefined,
    notes: itemForm.value.notes || undefined,
    km: isKmCategory.value && itemForm.value.km ? parseFloat(itemForm.value.km) : undefined,
  }

  if (isForeignCurrency.value) {
    data.original_currency = itemForm.value.original_currency
    data.original_amount = parseFloat(itemForm.value.originalAmount || '0')
    data.suggested_brl_amount = amountCents
    data.conversion_rate = parseFloat(itemForm.value.conversionRate || '0')
    data.currency_note = itemForm.value.currencyNote || ''
  }

  try {
    if (isForeignCurrency.value && !receiptFile.value) {
      const iofAmountCents = Math.round(parseFloat(itemForm.value.iofAmount || '0') * 100)
      const originalAmt = itemForm.value.originalAmount || '0'
      const iofData = {
        report: report.value.id,
        amount: iofAmountCents,
        date: itemForm.value.date || undefined,
        category: findTaxesCategoryId() || undefined,
        description: `IOF compra ${originalAmt} ${itemForm.value.original_currency}`,
      }
      const result = await expensesStore.addItemWithIOF(data, iofData)
      if (result.success) {
        await loadReport()
        successMsg.value = 'Despesa e IOF adicionados com sucesso!'
        showItemForm.value = false
        resetItemForm()
      } else {
        errorMsg.value = result.error || 'Erro ao adicionar despesa.'
      }
    } else if (receiptFile.value) {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value))
      })
      formData.append('receipt_image', receiptFile.value)
      await pb.collection('expense_items').create(formData)
      await expensesStore.recalculateTotal(report.value.id)

      if (isForeignCurrency.value) {
        const iofAmountCents = Math.round(parseFloat(itemForm.value.iofAmount || '0') * 100)
        const originalAmt = itemForm.value.originalAmount || '0'
        await expensesStore.addItem({
          report: report.value.id,
          amount: iofAmountCents,
          date: itemForm.value.date || undefined,
          category: findTaxesCategoryId() || undefined,
          description: `IOF compra ${originalAmt} ${itemForm.value.original_currency}`,
        })
      }

      await loadReport()
      successMsg.value = 'Despesa adicionada com sucesso!'
      showItemForm.value = false
      resetItemForm()
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
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao adicionar despesa.'
  } finally {
    submitting.value = false
  }
}

async function handleRemoveItem(itemId: string) {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.removeItem(itemId, report.value.id)
    if (result.success) {
      successMsg.value = 'Item removido com sucesso!'
      await loadReport()
    } else {
      errorMsg.value = result.error || 'Erro ao remover item.'
    }
  } finally {
    submitting.value = false
  }
}

function openEditItemModal(item: RecordModel) {
  editingItem.value = item
  editItemForm.value = {
    date: item.date ? item.date.substring(0, 10) : '',
    category: item.category || '',
    amountDisplay: item.amount ? String(item.amount / 100) : '',
    merchant: item.merchant || '',
    description: item.description || '',
    notes: item.notes || '',
    km: item.km ? String(item.km) : '',
    original_currency: item.original_currency || 'BRL',
    originalAmount: item.original_amount ? String(item.original_amount) : '',
    suggestedBrlAmount: item.suggested_brl_amount ? String(item.suggested_brl_amount / 100) : '',
    conversionRate: item.conversion_rate ? String(item.conversion_rate) : '',
    currencyNote: item.currency_note || '',
  }
  showEditItemModal.value = true
}

function closeEditItemModal() {
  showEditItemModal.value = false
  editingItem.value = null
}

async function handleUpdateItem() {
  if (!report.value || !editingItem.value) return
  successMsg.value = ''
  errorMsg.value = ''

  const amountCents = Math.round(parseFloat(editItemForm.value.amountDisplay || '0') * 100)
  if (amountCents <= 0) {
    errorMsg.value = 'O valor deve ser maior que zero.'
    return
  }

  submitting.value = true
  try {
    const updateData: Record<string, any> = {
      amount: amountCents,
      date: editItemForm.value.date || undefined,
      category: editItemForm.value.category || undefined,
      merchant: editItemForm.value.merchant || undefined,
      description: editItemForm.value.description || undefined,
      notes: editItemForm.value.notes || undefined,
      km: isEditKmCategory.value && editItemForm.value.km ? parseFloat(editItemForm.value.km) : undefined,
    }

    if (isEditForeignCurrency.value) {
      updateData.original_currency = editItemForm.value.original_currency
      updateData.original_amount = parseFloat(editItemForm.value.originalAmount || '0')
      updateData.suggested_brl_amount = amountCents
      updateData.conversion_rate = parseFloat(editItemForm.value.conversionRate || '0')
      updateData.currency_note = editItemForm.value.currencyNote || ''
    } else {
      updateData.original_currency = 'BRL'
      updateData.original_amount = 0
      updateData.suggested_brl_amount = 0
      updateData.conversion_rate = 0
      updateData.currency_note = ''
    }

    const result = await expensesStore.updateItem(editingItem.value.id, updateData)
    if (result.success) {
      successMsg.value = 'Despesa atualizada com sucesso!'
      closeEditItemModal()
      await loadReport()
    } else {
      errorMsg.value = result.error || 'Erro ao atualizar despesa.'
    }
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao atualizar despesa.'
  } finally {
    submitting.value = false
  }
}

async function handleSubmitReport() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.submitReport(report.value.id, submitTargetUserId.value || undefined)
    if (result.success) {
      successMsg.value = 'Relatório enviado para aprovação!'
      showSubmitModal.value = false
      submitTargetUserId.value = ''
      await loadReport()
    } else {
      errorMsg.value = result.error || 'Erro ao enviar relatório.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleApproveReport() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.approveReport(report.value.id)
    if (result.success) {
      successMsg.value = 'Relatório aprovado com sucesso!'
      await loadReport()
    } else {
      errorMsg.value = result.error || 'Erro ao aprovar relatório.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleRejectReport() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.rejectReport(report.value.id, rejectionReason.value)
    if (result.success) {
      successMsg.value = 'Relatório rejeitado.'
      showRejectModal.value = false
      rejectionReason.value = ''
      await loadReport()
    } else {
      errorMsg.value = result.error || 'Erro ao rejeitar relatório.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleReturnForRevision() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.returnForRevision(report.value.id, returnReason.value)
    if (result.success) {
      successMsg.value = 'Relatório devolvido para revisão.'
      showReturnModal.value = false
      returnReason.value = ''
      await loadReport()
    } else {
      errorMsg.value = result.error || 'Erro ao devolver relatório.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleReopenReport() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.returnForRevision(report.value.id)
    if (result.success) {
      successMsg.value = 'Relatório reaberto como rascunho. Você já pode editá-lo.'
      await loadReport()
    } else {
      errorMsg.value = result.error || 'Erro ao reabrir relatório.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleDeleteReport() {
  if (!report.value) return
  if (!confirm('Tem certeza que deseja excluir este relatório?')) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.deleteReport(report.value.id)
    if (result.success) {
      router.push('/reports')
    } else {
      errorMsg.value = result.error || 'Erro ao excluir relatório.'
    }
  } finally {
    submitting.value = false
  }
}

async function handlePayReport() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.payReport(report.value.id)
    if (result.success) {
      successMsg.value = 'Relatório marcado como pago!'
      await loadReport()
    } else {
      errorMsg.value = result.error || 'Erro ao pagar relatório.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleForwardReport() {
  if (!report.value || !forwardTargetUserId.value) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.forwardReport(report.value.id, forwardTargetUserId.value, forwardNotes.value)
    if (result.success) {
      successMsg.value = 'Relatório encaminhado com sucesso!'
      showForwardModal.value = false
      forwardTargetUserId.value = ''
      forwardNotes.value = ''
    } else {
      errorMsg.value = result.error || 'Erro ao encaminhar relatório.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleNotifyCurrentStageUser() {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  notifying.value = true
  try {
    await pb.send('/api/expense-reports/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: report.value.id }),
    })
    successMsg.value = 'Notificação enviada com sucesso!'
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao enviar notificação.'
  } finally {
    notifying.value = false
  }
}

async function fetchApproverMembers() {
  const companyId = companyStore.currentCompany?.id
  if (!companyId) return
  try {
    const records = await pb.collection('company_users').getFullList({
      filter: `company="${companyId}" && (role="approver" || role="admin") && active=true`,
      expand: 'user',
    })
    approverMembers.value = records.filter(m => m.expand?.user?.id !== pb.authStore.record?.id)
  } catch {
    approverMembers.value = []
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
  const actionsResult = await expensesStore.fetchApprovalActions(id)
  approvalActions.value = actionsResult.success ? (actionsResult.data || []) : []
}

onMounted(async () => {
  await companyStore.fetchMyCompanies()
  await Promise.all([loadReport(), fetchCategories(), fetchApproverMembers()])
})
</script>
