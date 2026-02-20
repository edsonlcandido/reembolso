<template>
  <div class="max-w-6xl mx-auto">
    <!-- Show list of companies if user has any AND not showing create form -->
    <div v-if="!companyStore.loading && companyStore.companies.length > 0 && !showCreateForm">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Minhas Empresas</h1>
          <p class="text-gray-600 mt-1">Gerencie suas empresas</p>
        </div>
        <button
          @click="showCreateForm = true"
          class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nova Empresa
        </button>
      </div>

      <!-- Company Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="company in companyStore.companies"
          :key="company.id"
          class="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all"
        >
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 class="text-xl font-bold text-white truncate">{{ company.name }}</h2>
            <p class="text-blue-100 text-sm mt-1">/app/companies/{{ company.slug }}</p>
          </div>
          
          <div class="p-6 space-y-3">
            <div v-if="company.cnpj" class="flex items-start gap-2">
              <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-sm text-gray-600">{{ company.cnpj }}</span>
            </div>
            
            <div v-if="company.email" class="flex items-start gap-2">
              <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-sm text-gray-600 truncate">{{ company.email }}</span>
            </div>
            
            <div v-if="company.phone" class="flex items-start gap-2">
              <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-sm text-gray-600">{{ company.phone }}</span>
            </div>
            
            <div class="pt-4 flex gap-2">
              <router-link
                :to="`/companies/${company.id}/edit`"
                class="flex-1 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-all text-center"
              >
                Editar
              </router-link>
              <button
                @click="setActive(company)"
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                {{ company.id === companyStore.currentCompany?.id ? 'Ativa' : 'Selecionar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Show create form if user has no companies or clicked "Nova Empresa" -->
    <div v-else-if="!companyStore.loading && (companyStore.companies.length === 0 || showCreateForm)">
      <div v-if="showCreateForm && companyStore.companies.length > 0" class="mb-4">
        <button
          @click="showCreateForm = false"
          class="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para lista
        </button>
      </div>
      
      <CompanyForm @created="handleCompanyCreated" />
    </div>

    <!-- Loading state -->
    <div v-if="companyStore.loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <svg class="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span class="text-gray-600">Carregando empresas...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCompanyStore } from '../stores/company'
import CompanyForm from '../components/CompanyForm.vue'
import type { RecordModel } from 'pocketbase'

const companyStore = useCompanyStore()
const showCreateForm = ref(false)

function setActive(company: RecordModel) {
  companyStore.setCurrentCompany(company)
}

function handleCompanyCreated() {
  showCreateForm.value = false
  companyStore.fetchMyCompanies()
}

onMounted(async () => {
  await companyStore.fetchMyCompanies()
})
</script>
