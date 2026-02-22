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

          <div v-if="report.rejection_reason && (report.status === 'rejected' || report.status === 'draft')" class="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <h3 class="text-sm font-semibold text-amber-700 mb-1">{{ report.status === 'draft' ? 'Devolvido para Revisão' : 'Motivo da Rejeição' }}</h3>
            <p class="text-sm text-amber-700">{{ report.rejection_reason }}</p>
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
                @click="showRejectModal = true"
                :disabled="submitting"
                class="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-all disabled:opacity-50"
              >
                Rejeitar
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
                :disabled="submitting || expensesStore.loading"
                class="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                Pagar Tudo
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
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" fill="none" style="animation-direction: reverse;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
                :disabled="submitting || expensesStore.loading"
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
                    <span v-if="item.paid" class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Pago
                    </span>
                  </div>
                  <p v-if="item.merchant" class="text-sm text-gray-600">{{ item.merchant }}</p>
                  <p v-if="item.description" class="text-sm text-gray-500">{{ item.description }}</p>
                  <p v-if="item.date" class="text-xs text-gray-400 mt-1">{{ new Date(item.date).toLocaleDateString('pt-BR') }}</p>
                </div>
                <div class="flex gap-2 items-center">
                  <template v-if="isApprover && ['approved', 'partially_paid', 'paid'].includes(report.status)">
                    <label class="flex items-center gap-2 cursor-pointer select-none" :title="item.paid ? 'Clique para desmarcar como pago' : 'Clique para marcar como pago'">
                      <input
                        type="checkbox"
                        :checked="item.paid"
                        :disabled="submitting || expensesStore.loading"
                        @change="handleToggleItemPaid(item)"
                        class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <span class="text-xs text-gray-600 whitespace-nowrap">Pagar</span>
                    </label>
                  </template>
                  <button
                    v-if="report.status === 'draft'"
                    @click="openEditItemModal(item)"
                    :disabled="submitting || expensesStore.loading"
                    class="rounded-lg border border-blue-300 p-2 text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                    title="Editar despesa"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="report.status === 'draft'"
                    @click="handleRemoveItem(item.id)"
                    :disabled="submitting || expensesStore.loading"
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
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
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
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input v-model="editItemForm.amountDisplay" type="number" step="0.01" min="0" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="0,00" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estabelecimento</label>
              <input v-model="editItemForm.merchant" type="text" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Nome do estabelecimento" />
            </div>
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
import { ref, computed, onMounted } from 'vue'
import pb from '../services/pocketbase'
import { PlusIcon, TrashIcon, ClipboardDocumentListIcon, PencilIcon } from '@heroicons/vue/24/outline'
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
const submitTargetUserId = ref('')
const forwardTargetUserId = ref('')
const forwardNotes = ref('')
const approverMembers = ref<RecordModel[]>([])
const rejectionReason = ref('')
const returnReason = ref('')
const receiptFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const analyzingReceipt = ref(false)
const submitting = ref(false)
const categories = ref<RecordModel[]>([])
const showEditItemModal = ref(false)
const editingItem = ref<RecordModel | null>(null)
const editItemForm = ref({
  date: '',
  category: '',
  amountDisplay: '',
  merchant: '',
  description: '',
  notes: '',
})

const itemForm = ref({
  date: '',
  category: '',
  amountDisplay: '',
  merchant: '',
  description: '',
  notes: '',
})

const report = computed(() => expensesStore.currentReport)

const isApprover = computed(() =>
  companyStore.currentUserRole === 'admin' || companyStore.currentUserRole === 'approver'
)

const isReportOwner = computed(() =>
  report.value?.user === (pb.authStore.record?.id ?? '')
)

const isSubmitDisabled = computed(() =>
  approverMembers.value.length > 0 && !submitTargetUserId.value
)

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

  submitting.value = true

  const data: any = {
    report: report.value.id,
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
      await expensesStore.recalculateTotal(report.value.id)
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
    const result = await expensesStore.updateItem(editingItem.value.id, {
      amount: amountCents,
      date: editItemForm.value.date || undefined,
      category: editItemForm.value.category || undefined,
      merchant: editItemForm.value.merchant || undefined,
      description: editItemForm.value.description || undefined,
      notes: editItemForm.value.notes || undefined,
    })
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
    const result = await expensesStore.returnForRevision(report.value.id, report.value.rejection_reason || '')
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

async function handleToggleItemPaid(item: RecordModel) {
  if (!report.value) return
  successMsg.value = ''
  errorMsg.value = ''
  submitting.value = true
  try {
    const result = await expensesStore.markItemPaid(item.id, report.value.id, !item.paid)
    if (result.success) {
      await loadReport()
    } else {
      errorMsg.value = result.error || 'Erro ao atualizar pagamento do item.'
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
}

onMounted(async () => {
  await companyStore.fetchMyCompanies()
  await Promise.all([loadReport(), fetchCategories(), fetchApproverMembers()])
})
</script>
