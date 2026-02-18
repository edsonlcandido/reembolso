<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <nav class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-4">
            <button @click="router.push('/dashboard')" class="text-gray-500 hover:text-gray-700 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meu Perfil
            </h1>
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="handleLogout"
              class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div v-if="successMessage" class="rounded-xl bg-green-50 p-4 border-l-4 border-green-500 shadow-sm mb-6">
        <p class="text-sm font-semibold text-green-800">{{ successMessage }}</p>
      </div>
      <div v-if="errorMessage" class="rounded-xl bg-red-50 p-4 border-l-4 border-red-500 shadow-sm mb-6">
        <p class="text-sm font-semibold text-red-800">{{ errorMessage }}</p>
      </div>

      <div class="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden mb-8">
        <div class="px-6 py-6 border-b border-gray-100">
          <h3 class="text-xl font-bold text-gray-900">Informacoes Pessoais</h3>
          <p class="text-gray-500 text-sm mt-1">Atualize seus dados pessoais</p>
        </div>
        <form @submit.prevent="handleUpdateProfile" class="p-6 space-y-6">
          <div>
            <label for="profile-name" class="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
            <input
              id="profile-name"
              v-model="profileForm.name"
              type="text"
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
            <input
              :value="authStore.user?.email"
              type="email"
              disabled
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
            />
            <p class="text-xs text-gray-400 mt-1">O e-mail nao pode ser alterado por aqui.</p>
          </div>
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="savingProfile"
              class="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              <span v-if="savingProfile">Salvando...</span>
              <span v-else>Salvar Alteracoes</span>
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden">
        <div class="px-6 py-6 border-b border-gray-100">
          <h3 class="text-xl font-bold text-gray-900">Alterar Senha</h3>
          <p class="text-gray-500 text-sm mt-1">Defina uma nova senha para sua conta</p>
        </div>
        <form @submit.prevent="handleChangePassword" class="p-6 space-y-6">
          <div>
            <label for="old-password" class="block text-sm font-semibold text-gray-700 mb-2">Senha Atual</label>
            <input
              id="old-password"
              v-model="passwordForm.oldPassword"
              type="password"
              required
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="Sua senha atual"
            />
          </div>
          <div>
            <label for="new-password" class="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              required
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="Minimo 8 caracteres"
            />
          </div>
          <div>
            <label for="confirm-new-password" class="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nova Senha</label>
            <input
              id="confirm-new-password"
              v-model="passwordForm.newPasswordConfirm"
              type="password"
              required
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="Repita a nova senha"
            />
          </div>
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="savingPassword"
              class="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              <span v-if="savingPassword">Atualizando...</span>
              <span v-else>Alterar Senha</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const successMessage = ref('')
const errorMessage = ref('')
const savingProfile = ref(false)
const savingPassword = ref(false)

const profileForm = ref({
  name: '',
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
})

onMounted(() => {
  profileForm.value.name = authStore.user?.name || ''
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

async function handleUpdateProfile() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!profileForm.value.name.trim()) {
    errorMessage.value = 'Informe seu nome.'
    return
  }

  savingProfile.value = true
  try {
    const result = await authStore.updateProfile({ name: profileForm.value.name })
    if (result.success) {
      successMessage.value = 'Perfil atualizado com sucesso!'
    } else {
      errorMessage.value = result.error || 'Erro ao atualizar perfil.'
    }
  } finally {
    savingProfile.value = false
  }
}

async function handleChangePassword() {
  successMessage.value = ''
  errorMessage.value = ''

  const { oldPassword, newPassword, newPasswordConfirm } = passwordForm.value

  if (!oldPassword) {
    errorMessage.value = 'Informe sua senha atual.'
    return
  }
  if (newPassword.length < 8) {
    errorMessage.value = 'A nova senha deve ter pelo menos 8 caracteres.'
    return
  }
  if (newPassword !== newPasswordConfirm) {
    errorMessage.value = 'As novas senhas nao coincidem.'
    return
  }

  savingPassword.value = true
  try {
    const result = await authStore.changePassword(oldPassword, newPassword, newPasswordConfirm)
    if (result.success) {
      successMessage.value = 'Senha alterada com sucesso! Faca login novamente.'
      passwordForm.value = { oldPassword: '', newPassword: '', newPasswordConfirm: '' }
      setTimeout(() => {
        authStore.logout()
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = result.error || 'Erro ao alterar senha.'
    }
  } finally {
    savingPassword.value = false
  }
}
</script>
