<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
        <h1 class="text-2xl font-bold text-white">
          {{ isEditing ? 'Editar Empresa' : 'Criar Empresa' }}
        </h1>
        <p class="text-blue-100 mt-1">
          {{ isEditing ? 'Atualize os dados da sua empresa' : 'Preencha os dados para criar sua empresa' }}
        </p>
      </div>

      <div v-if="successMsg" class="mx-8 mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
        <p class="text-sm text-green-700">{{ successMsg }}</p>
      </div>

      <div v-if="errorMsg" class="mx-8 mt-6 rounded-lg bg-red-50 border border-red-200 p-4">
        <p class="text-sm text-red-700">{{ errorMsg }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa *</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Nome da empresa"
            @input="handleNameChange"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
          <input
            v-model="form.slug"
            type="text"
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="slug-da-empresa"
            @input="validateSlug"
          />
          <p class="mt-1 text-sm text-gray-500">
            URL de acesso: /app/companies/{{ form.slug || 'slug-da-empresa' }}
          </p>
          <p v-if="slugError" class="mt-1 text-sm text-red-500">{{ slugError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
          <input
            v-model="form.cnpj"
            type="text"
            maxlength="18"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="XX.XXX.XXX/XXXX-XX"
            @input="maskCnpj"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="empresa@email.com"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-500">{{ emailError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <input
            v-model="form.phone"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
          <textarea
            v-model="form.address"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Endereço completo"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Valor reembolsável por km (R$)</label>
          <input
            v-model="form.km_rate"
            type="number"
            step="0.01"
            min="0"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Ex: 0.60"
          />
          <p class="mt-1 text-sm text-gray-500">Usado para calcular automaticamente despesas de quilometragem</p>
        </div>

        <div class="flex gap-4 pt-4">
          <button
            type="submit"
            :disabled="companyStore.loading"
            class="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="companyStore.loading" class="flex items-center justify-center gap-2">
              <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Salvando...
            </span>
            <span v-else>{{ isEditing ? 'Atualizar' : 'Criar Empresa' }}</span>
          </button>
          <router-link
            to="/dashboard"
            class="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all text-center"
          >
            Cancelar
          </router-link>
        </div>
      </form>
    </div>

    <!-- Billing section: visible only for admins in edit mode -->
    <div v-if="isEditing && isAdmin" class="mt-6 bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Cobrança</h2>
          <p class="text-sm text-gray-500 mt-0.5">Plano e uso da empresa</p>
        </div>
        <span v-if="isFreePlan" class="px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">Plano Gratuito</span>
        <span v-else class="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">Plano PRO</span>
      </div>

      <div v-if="billingLoading" class="px-8 py-8 text-center text-gray-400 text-sm">Carregando...</div>

      <template v-else>
        <!-- FREE plan usage -->
        <div v-if="isFreePlan" class="px-8 py-6 border-b border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-sm font-semibold text-gray-700">Uso do Ciclo Atual</p>
              <p class="text-xs text-gray-500 mt-0.5">Relatórios criados neste mês de cobrança</p>
            </div>
            <span class="text-lg font-bold text-gray-900">{{ cycleReportsCount }}<span class="text-sm font-normal text-gray-500">/{{ FREE_PLAN_LIMIT }}</span></span>
          </div>
          <div class="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              :class="cycleUsageColor"
              class="h-3 rounded-full transition-all duration-500"
              :style="{ width: cycleUsagePercent + '%' }"
            ></div>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            {{ FREE_PLAN_LIMIT - cycleReportsCount > 0 ? `${FREE_PLAN_LIMIT - cycleReportsCount} relatório(s) restante(s)` : 'Limite atingido' }}
            ·
            <a
              href="mailto:contato@reembolsa-ai.ehtudo.app?subject=Upgrade%20para%20Plano%20PRO"
              class="text-blue-600 hover:underline"
            >Fazer upgrade para PRO — R$10/usuário/mês</a>
          </p>
        </div>

        <!-- Members list -->
        <div class="px-8 py-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">
            Membros
            <span class="ml-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-normal">{{ companyStore.members.length }}</span>
          </h3>
          <div v-if="companyStore.members.length === 0" class="text-sm text-gray-400">Nenhum membro encontrado.</div>
          <ul v-else class="divide-y divide-gray-100">
            <li
              v-for="member in companyStore.members"
              :key="member.id"
              class="flex items-center justify-between py-3"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ member.expand?.user?.name || member.expand?.user?.email || '—' }}</p>
                <p class="text-xs text-gray-500 truncate">{{ member.expand?.user?.email || '' }}</p>
              </div>
              <span
                :class="{
                  'bg-purple-100 text-purple-700': member.role === 'admin',
                  'bg-blue-100 text-blue-700': member.role === 'approver',
                  'bg-gray-100 text-gray-600': member.role === 'employee' || !member.role,
                }"
                class="ml-4 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
              >{{ member.role || 'employee' }}</span>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCompanyStore } from '../stores/company'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import pb from '../services/pocketbase'

const router = useRouter()
const route = useRoute()
const companyStore = useCompanyStore()

const isEditing = ref(false)
const editId = ref('')
const successMsg = ref('')
const errorMsg = ref('')
const emailError = ref('')
const slugError = ref('')
const slugManuallyEdited = ref(false)
const billingLoading = ref(false)
const cycleReportsCount = ref(0)
const FREE_PLAN_LIMIT = 5

const isAdmin = computed(() => companyStore.currentUserRole === 'admin')

const isFreePlan = computed(() => {
  const plan = companyStore.currentCompany?.plan
  return !plan || plan === 'FREE'
})

const cycleUsagePercent = computed(() =>
  Math.min(100, Math.round((cycleReportsCount.value / FREE_PLAN_LIMIT) * 100))
)

const cycleUsageColor = computed(() => {
  if (cycleUsagePercent.value >= 100) return 'bg-red-500'
  if (cycleUsagePercent.value >= 80) return 'bg-amber-500'
  return 'bg-blue-500'
})

const form = ref({
  name: '',
  slug: '',
  cnpj: '',
  email: '',
  phone: '',
  address: '',
  km_rate: '',
})

function maskCnpj(e: Event) {
  const input = e.target as HTMLInputElement
  let v = input.value.replace(/\D/g, '')
  if (v.length > 14) v = v.slice(0, 14)
  if (v.length > 12) {
    v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5')
  } else if (v.length > 8) {
    v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4')
  } else if (v.length > 5) {
    v = v.replace(/^(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3')
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{1,3})/, '$1.$2')
  }
  form.value.cnpj = v
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

function handleNameChange() {
  if (!slugManuallyEdited.value && !isEditing.value) {
    form.value.slug = generateSlug(form.value.name)
  }
}

function validateSlug() {
  slugManuallyEdited.value = true
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (form.value.slug && !slugPattern.test(form.value.slug)) {
    slugError.value = 'O slug deve conter apenas letras minúsculas, números e hífens'
    return false
  }
  if (form.value.slug && form.value.slug.length < 3) {
    slugError.value = 'O slug deve ter pelo menos 3 caracteres'
    return false
  }
  slugError.value = ''
  return true
}

function validateEmail(): boolean {
  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    emailError.value = 'Formato de e-mail inválido'
    return false
  }
  emailError.value = ''
  return true
}

async function handleSubmit() {
  successMsg.value = ''
  errorMsg.value = ''

  if (!form.value.name.trim()) {
    errorMsg.value = 'O nome da empresa é obrigatório.'
    return
  }

  if (!form.value.slug.trim()) {
    errorMsg.value = 'O slug é obrigatório.'
    return
  }

  if (!validateSlug()) return
  if (!validateEmail()) return

  const data = {
    name: form.value.name,
    slug: form.value.slug,
    cnpj: form.value.cnpj || undefined,
    email: form.value.email || undefined,
    phone: form.value.phone || undefined,
    address: form.value.address || undefined,
    km_rate: form.value.km_rate !== '' ? parseFloat(form.value.km_rate) : undefined,
  }

  let result
  if (isEditing.value) {
    result = await companyStore.updateCompany(editId.value, data)
  } else {
    result = await companyStore.createCompany(data)
  }

  if (result.success) {
    const companyId = (result as { success: true; companyId?: string }).companyId
    if (!isEditing.value && companyId) {
      router.push({ name: 'companies-edit', params: { id: companyId } })
    } else {
      successMsg.value = 'Empresa atualizada com sucesso!'
      setTimeout(() => router.push('/dashboard'), 1000)
    }
  } else {
    errorMsg.value = result.error || 'Erro ao salvar empresa.'
  }
}

onMounted(async () => {
  if (route.params.id) {
    isEditing.value = true
    editId.value = route.params.id as string
    slugManuallyEdited.value = true // Don't auto-generate slug when editing
    await companyStore.fetchMyCompanies()
    const company = companyStore.companies.find(c => c.id === editId.value)
    if (company) {
      form.value.name = company.name || ''
      form.value.slug = company.slug || ''
      form.value.cnpj = company.cnpj || ''
      form.value.email = company.email || ''
      form.value.phone = company.phone || ''
      form.value.address = company.address || ''
      form.value.km_rate = company.km_rate != null ? String(company.km_rate) : ''

      // Load billing data for admins
      if (companyStore.currentUserRole === 'admin') {
        companyStore.setCurrentCompany(company)
        billingLoading.value = true
        try {
          await companyStore.fetchMembers()

          // Compute current billing cycle usage
          const anchorDay = company.billing_anchor_day || 1
          const now = new Date()
          const currentDay = now.getUTCDate()
          const currentMonth = now.getUTCMonth()
          const currentYear = now.getUTCFullYear()
          let cycleStart: Date
          if (currentDay >= anchorDay) {
            cycleStart = new Date(Date.UTC(currentYear, currentMonth, anchorDay))
          } else {
            cycleStart = new Date(Date.UTC(currentYear, currentMonth - 1, anchorDay))
          }
          const cycleStartStr = cycleStart.toISOString().slice(0, 10)
          try {
            const cycleResult = await pb.collection('expense_reports').getList(1, 1, {
              filter: `company="${company.id}" && created >= "${cycleStartStr}"`,
            })
            cycleReportsCount.value = cycleResult.totalItems
          } catch (_) {
            cycleReportsCount.value = 0
          }
        } finally {
          billingLoading.value = false
        }
      }
    }
  }
})
</script>
