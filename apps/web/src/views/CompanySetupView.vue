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
            URL de acesso: /app/company/{{ form.slug || 'slug-da-empresa' }}
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
  </div>
</template>

<script setup lang="ts">
import { useCompanyStore } from '../stores/company'
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

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

const form = ref({
  name: '',
  slug: '',
  cnpj: '',
  email: '',
  phone: '',
  address: '',
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
  }

  let result
  if (isEditing.value) {
    result = await companyStore.updateCompany(editId.value, data)
  } else {
    result = await companyStore.createCompany(data)
  }

  if (result.success) {
    successMsg.value = isEditing.value ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!'
    setTimeout(() => router.push('/dashboard'), 1000)
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
    }
  }
})
</script>
