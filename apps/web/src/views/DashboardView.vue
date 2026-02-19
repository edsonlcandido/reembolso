<template>
  <div>
    <div class="mb-8">
      <div class="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden shadow-2xl rounded-2xl">
        <div class="p-8 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold mb-2">
                Olá, {{ userName }}!
              </h2>
              <p class="text-blue-100 text-lg" v-if="companyStore.currentCompany">
                {{ companyStore.currentCompany.name }}
              </p>
              <p class="text-blue-100 text-lg" v-else>
                Configure sua empresa para começar
              </p>
            </div>
            <div class="hidden md:block">
              <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <ChartBarIcon class="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!companyStore.currentCompany && !loading" class="mb-8">
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow">
        <div class="flex items-start gap-4">
          <ExclamationTriangleIcon class="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 class="font-semibold text-yellow-800 text-lg">Empresa não configurada</h3>
            <p class="text-yellow-700 mt-1">Você precisa criar ou ser adicionado a uma empresa para começar a gerenciar despesas.</p>
            <router-link
              to="/company"
              class="mt-3 inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm"
            >
              <BuildingOfficeIcon class="h-4 w-4 mr-2" />
              Criar Empresa
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div v-for="i in 4" :key="i" class="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div class="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>

    <div v-else-if="companyStore.currentCompany" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div class="group bg-white overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-200">
        <div class="p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <DocumentTextIcon class="h-6 w-6 text-white" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Relatórios</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalReports }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="group bg-white overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-200">
        <div class="p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <CurrencyDollarIcon class="h-6 w-6 text-white" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Valor Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalAmount) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="group bg-white overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-yellow-200">
        <div class="p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <ClockIcon class="h-6 w-6 text-white" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pendentes</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pendingReports }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="group bg-white overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-200">
        <div class="p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircleIcon class="h-6 w-6 text-white" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Aprovados</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.approvedReports }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="companyStore.currentCompany" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2">
        <div class="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Relatórios Recentes</h3>
            <router-link to="/reports" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Ver todos
            </router-link>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-if="recentReports.length === 0" class="p-8 text-center text-gray-400">
              <DocumentTextIcon class="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum relatório ainda</p>
              <router-link to="/reports/new" class="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
                Criar primeiro relatório
              </router-link>
            </div>
            <router-link
              v-for="report in recentReports"
              :key="report.id"
              :to="`/reports/${report.id}`"
              class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ report.title }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(report.created) }}</p>
              </div>
              <div class="flex items-center gap-3 ml-4">
                <span class="text-sm font-medium text-gray-900">{{ formatCurrency(report.total_amount) }}</span>
                <span :class="statusClass(report.status)" class="px-2.5 py-1 text-xs font-semibold rounded-full">
                  {{ statusLabel(report.status) }}
                </span>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <div>
        <div class="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-900">Ações Rápidas</h3>
          </div>
          <div class="p-4 space-y-3">
            <router-link
              to="/reports/new"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow">
                <PlusCircleIcon class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900 group-hover:text-blue-600">Novo Relatório</p>
                <p class="text-xs text-gray-500">Criar relatório de despesas</p>
              </div>
            </router-link>

            <router-link
              to="/reports"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors group"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow">
                <DocumentTextIcon class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900 group-hover:text-purple-600">Ver Relatórios</p>
                <p class="text-xs text-gray-500">Gerenciar seus relatórios</p>
              </div>
            </router-link>

            <router-link
              to="/company/members"
              v-if="isAdmin"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow">
                <UsersIcon class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900 group-hover:text-green-600">Equipe</p>
                <p class="text-xs text-gray-500">Gerenciar membros</p>
              </div>
            </router-link>

            <router-link
              to="/categories"
              v-if="isAdmin"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow">
                <TagIcon class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900 group-hover:text-orange-600">Categorias</p>
                <p class="text-xs text-gray-500">Personalizar categorias</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCompanyStore } from '../stores/company'
import pb from '../services/pocketbase'
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  UsersIcon,
  TagIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const companyStore = useCompanyStore()

const loading = ref(true)
const recentReports = ref<any[]>([])
const stats = ref({
  totalReports: 0,
  totalAmount: 0,
  pendingReports: 0,
  approvedReports: 0,
})

const userName = computed(() => {
  return authStore.user?.name || authStore.user?.email || 'Usuário'
})

const isAdmin = computed(() => companyStore.currentUserRole === 'admin')

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    submitted: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    paid: 'Pago',
  }
  return labels[status] || status
}

function statusClass(status: string): string {
  const classes: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-purple-100 text-purple-700',
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

async function loadDashboard() {
  loading.value = true
  try {
    await companyStore.fetchMyCompanies()

    if (companyStore.currentCompany) {
      const companyId = companyStore.currentCompany.id
      const isAdmin = companyStore.currentUserRole === 'admin' || companyStore.currentUserRole === 'approver'
      const userId = pb.authStore.record?.id

      let filter = `company="${companyId}"`
      if (!isAdmin && userId) {
        filter += ` && user="${userId}"`
      }

      const allReports = await pb.collection('expense_reports').getList(1, 50, {
        filter,
        sort: '-id',
      })

      recentReports.value = allReports.items.slice(0, 5)

      stats.value.totalReports = allReports.totalItems
      stats.value.totalAmount = allReports.items.reduce((sum: number, r: any) => sum + (r.total_amount || 0), 0)
      stats.value.pendingReports = allReports.items.filter((r: any) => r.status === 'submitted').length
      stats.value.approvedReports = allReports.items.filter((r: any) => r.status === 'approved').length
    }
  } catch (error) {
    console.error('Dashboard load error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>
