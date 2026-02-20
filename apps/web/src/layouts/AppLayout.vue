<template>
  <div class="flex h-screen bg-gray-100">
    <div
      :class="[
        'fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-gray-900 to-gray-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex h-16 items-center justify-center border-b border-gray-700">
        <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Reembolsa AI
        </h1>
      </div>

      <nav class="mt-6 px-3 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
            isActive(item.path)
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
          ]"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </div>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-20 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <div class="flex flex-1 flex-col overflow-hidden">
      <header class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
        <button
          class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          @click="sidebarOpen = !sidebarOpen"
        >
          <Bars3Icon class="h-6 w-6" />
        </button>

        <div class="flex-1 lg:ml-0" />

        <div class="flex items-center gap-3">
          <router-link
            to="/profile"
            class="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 hover:from-blue-100 hover:to-purple-100 transition-all"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <UserCircleIcon class="h-5 w-5 text-white" />
            </div>
            <span class="text-sm font-semibold text-gray-700">{{ userName }}</span>
          </router-link>

          <button
            @click="handleLogout"
            class="inline-flex items-center rounded-lg bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-red-600 hover:to-pink-600 transition-all"
          >
            <ArrowRightOnRectangleIcon class="mr-2 h-5 w-5" />
            Sair
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCompanyStore } from '../stores/company'
import {
  HomeIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TagIcon,
} from '@heroicons/vue/24/outline'
import { Bars3Icon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const sidebarOpen = ref(false)

const userName = computed(() => {
  return authStore.user?.name || authStore.user?.email || 'Usuário'
})

const isAdmin = computed(() => companyStore.currentUserRole === 'admin')
const hasNoCompany = computed(() => companyStore.companies.length === 0)

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon, adminOnly: false, showForNewUser: false },
  { path: '/reports', label: 'Relatórios', icon: DocumentTextIcon, adminOnly: false, showForNewUser: false },
  { path: '/expenses/new', label: 'Nova Despesa', icon: PlusCircleIcon, adminOnly: false, showForNewUser: false },
  { path: '/company', label: 'Empresa', icon: BuildingOfficeIcon, adminOnly: true, showForNewUser: true },
  { path: '/company/members', label: 'Membros', icon: UsersIcon, adminOnly: true, showForNewUser: false },
  { path: '/categories', label: 'Categorias', icon: TagIcon, adminOnly: true, showForNewUser: false },
]

const navItems = computed(() =>
  // Show item if: not admin-only, OR user is admin, OR item is shown for new users without a company
  allNavItems.filter(item => !item.adminOnly || isAdmin.value || (item.showForNewUser && hasNoCompany.value))
)

function isActive(path: string): boolean {
  return route.path === path
}

function handleLogout() {
  companyStore.clearState()
  authStore.logout()
  router.push('/login')
}
</script>
