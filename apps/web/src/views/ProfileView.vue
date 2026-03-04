<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
      Meu Perfil
    </h1>

    <div v-if="successMessage" class="rounded-xl bg-green-50 p-4 border-l-4 border-green-500 shadow-sm mb-6">
      <p class="text-sm font-semibold text-green-800">{{ successMessage }}</p>
    </div>
    <div v-if="errorMessage" class="rounded-xl bg-red-50 p-4 border-l-4 border-red-500 shadow-sm mb-6">
      <p class="text-sm font-semibold text-red-800">{{ errorMessage }}</p>
    </div>

    <div class="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden mb-8">
      <div class="px-6 py-5 border-b border-gray-100">
        <h3 class="text-lg font-bold text-gray-900">Informações Pessoais</h3>
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
          <div class="flex items-center gap-3">
            <input
              :value="authStore.user?.email"
              type="email"
              disabled
              class="appearance-none block flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
            />
            <div v-if="authStore.user?.verified" class="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-200">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-semibold text-green-800">Verificado</span>
            </div>
            <div v-else class="flex items-center gap-2 px-4 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-semibold text-yellow-800">Não verificado</span>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado por aqui.</p>
          <button
            v-if="!authStore.user?.verified"
            type="button"
            @click="handleResendVerificationEmail"
            :disabled="resendingEmail"
            class="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
          >
            {{ resendingEmail ? 'Reenviando...' : 'Reenviar email de verificação' }}
          </button>
        </div>
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="savingProfile"
            class="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            <span v-if="savingProfile">Salvando...</span>
            <span v-else>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100">
        <h3 class="text-lg font-bold text-gray-900">Alterar Senha</h3>
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
            placeholder="Mínimo 8 caracteres"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCompanyStore } from '../stores/company'

const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const successMessage = ref('')
const errorMessage = ref('')
const savingProfile = ref(false)
const savingPassword = ref(false)
const resendingEmail = ref(false)

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
    errorMessage.value = 'As novas senhas não coincidem.'
    return
  }

  savingPassword.value = true
  try {
    const result = await authStore.changePassword(oldPassword, newPassword, newPasswordConfirm)
    if (result.success) {
      successMessage.value = 'Senha alterada com sucesso! Faça login novamente.'
      passwordForm.value = { oldPassword: '', newPassword: '', newPasswordConfirm: '' }
      setTimeout(() => {
        const companyLogoutUrl = companyStore.currentCompany?.slug
          ? `/companies/${companyStore.currentCompany.slug}`
          : '/login'

        authStore.logout()
        router.push(companyLogoutUrl)
      }, 2000)
    } else {
      errorMessage.value = result.error || 'Erro ao alterar senha.'
    }
  } finally {
    savingPassword.value = false
  }
}

async function handleResendVerificationEmail() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!authStore.user?.email) {
    errorMessage.value = 'E-mail não encontrado.'
    return
  }

  resendingEmail.value = true
  try {
    const result = await authStore.resendVerificationEmail(authStore.user.email)
    if (result.success) {
      successMessage.value = 'Email de verificação reenviado com sucesso! Verifique sua caixa de entrada.'
    } else {
      errorMessage.value = result.error || 'Erro ao reenviar email de verificação.'
    }
  } finally {
    resendingEmail.value = false
  }
}
</script>
