<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = ref<'form' | 'loading' | 'success' | 'redirect-login' | 'error'>('form')
const errorMessage = ref('')
const token = ref('')
const emailFromToken = ref('')

const formData = ref({
  password: '',
  passwordConfirm: '',
})

function decodeTokenEmail(jwt: string): string {
  try {
    const payload = jwt.split('.')[1]
    // JWT uses base64url encoding - replace chars before decoding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64))
    const email = decoded.email || ''
    // Basic email format validation before trusting the decoded value
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
  } catch {
    return ''
  }
}

onMounted(() => {
  token.value = route.query.token as string

  if (!token.value) {
    status.value = 'error'
    errorMessage.value = 'Token de redefinição não encontrado. Solicite um novo link de recuperação de senha.'
    return
  }

  emailFromToken.value = decodeTokenEmail(token.value)
})

function validateForm(): string | null {
  if (!formData.value.password) return 'Informe a nova senha.'
  if (formData.value.password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
  if (!formData.value.passwordConfirm) return 'Confirme a nova senha.'
  if (formData.value.password !== formData.value.passwordConfirm) return 'As senhas não coincidem.'
  return null
}

async function handleSubmit() {
  errorMessage.value = ''

  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  status.value = 'loading'

  const resetResult = await authStore.confirmPasswordReset(
    token.value,
    formData.value.password,
    formData.value.passwordConfirm,
  )

  if (!resetResult.success) {
    status.value = 'form'
    errorMessage.value = resetResult.error || 'Erro ao redefinir senha. O link pode ter expirado.'
    return
  }

  const loginResult = emailFromToken.value
    ? await authStore.login(emailFromToken.value, formData.value.password)
    : { success: false }

  if (loginResult.success) {
    status.value = 'success'
    await nextTick()
    router.push({ name: 'dashboard' })
  } else {
    // Password was reset successfully; redirect to login so the user can sign in manually
    status.value = 'redirect-login'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 3000)
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="inline-block mb-4">
          <div
            class="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Redefinir Senha
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          <a href="/" class="font-semibold text-blue-600 hover:text-purple-600 transition-colors">
            Voltar para a landing page
          </a>
        </p>
      </div>

      <div class="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-gray-100">
        <!-- Loading State -->
        <div v-if="status === 'loading'" class="space-y-6 text-center">
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p class="text-gray-600">Redefinindo sua senha...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="status === 'success'" class="space-y-6">
          <div class="rounded-xl bg-green-50 p-6 border-l-4 border-green-500 shadow-sm">
            <div class="flex">
              <svg class="h-6 w-6 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-lg font-semibold text-green-800">Senha redefinida com sucesso!</p>
                <p class="text-sm text-green-700 mt-1">
                  Redirecionando para o dashboard...
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Redirect to Login State (password reset ok but auto-login failed) -->
        <div v-else-if="status === 'redirect-login'" class="space-y-6">
          <div class="rounded-xl bg-green-50 p-6 border-l-4 border-green-500 shadow-sm">
            <div class="flex">
              <svg class="h-6 w-6 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-lg font-semibold text-green-800">Senha redefinida com sucesso!</p>
                <p class="text-sm text-green-700 mt-1">
                  Redirecionando para o login...
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State (no token) -->
        <div v-else-if="status === 'error'" class="space-y-6">
          <div class="rounded-xl bg-red-50 p-6 border-l-4 border-red-500 shadow-sm">
            <div class="flex">
              <svg class="h-6 w-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-lg font-semibold text-red-800">Link inválido</p>
                <p class="text-sm text-red-700 mt-2">{{ errorMessage }}</p>
              </div>
            </div>
          </div>
          <div class="text-center">
            <router-link :to="{ name: 'login' }"
              class="font-semibold text-blue-600 hover:text-purple-600 transition-colors text-sm">
              Voltar ao Login
            </router-link>
          </div>
        </div>

        <!-- Form State -->
        <form v-else class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="errorMessage" class="rounded-xl bg-red-50 p-4 border-l-4 border-red-500 shadow-sm">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
              <p class="ml-3 text-sm font-semibold text-red-800">{{ errorMessage }}</p>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              Nova Senha
            </label>
            <input id="password" v-model="formData.password" type="password" autocomplete="new-password" required
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="Mínimo 8 caracteres" />
          </div>

          <div>
            <label for="passwordConfirm" class="block text-sm font-semibold text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <input id="passwordConfirm" v-model="formData.passwordConfirm" type="password"
              autocomplete="new-password" required
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="Repita a nova senha" />
          </div>

          <button type="submit"
            class="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02]">
            <span class="flex items-center">
              Redefinir senha
              <svg class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6">
                </path>
              </svg>
            </span>
          </button>

          <div class="text-center">
            <router-link :to="{ name: 'login' }"
              class="text-sm text-blue-600 hover:text-purple-600 font-medium transition-colors">
              Voltar ao Login
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
