<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="inline-block mb-4">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-110 transition-transform">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 class="mt-6 text-center text-4xl font-extrabold text-gray-900">
          {{ currentTitle }}
        </h2>
        <p class="mt-3 text-center text-base text-gray-600">
          {{ currentSubtitle }}
        </p>
        <p class="mt-2 text-center text-sm">
          <a href="/" class="font-semibold text-blue-600 hover:text-purple-600 transition-colors inline-flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Voltar para a landing page
          </a>
        </p>
      </div>

      <div class="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-gray-100">
        <div v-if="successMessage" class="rounded-xl bg-green-50 p-4 border-l-4 border-green-500 shadow-sm mb-6">
          <div class="flex">
            <svg class="h-5 w-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <p class="ml-3 text-sm font-semibold text-green-800">{{ successMessage }}</p>
          </div>
        </div>

        <form v-if="mode !== 'forgot'" class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="error" class="rounded-xl bg-red-50 p-4 border-l-4 border-red-500 shadow-sm">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="ml-3 text-sm font-semibold text-red-800">{{ error }}</p>
            </div>
          </div>

          <div v-if="mode === 'register'">
            <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              autocomplete="name"
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="Joao Silva"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              E-mail
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
              required
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="Minimo 8 caracteres"
            />
          </div>

          <div v-if="mode === 'register'">
            <label for="passwordConfirm" class="block text-sm font-semibold text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <input
              id="passwordConfirm"
              v-model="formData.passwordConfirm"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="Repita a senha"
            />
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Carregando...
              </span>
              <span v-else class="flex items-center">
                {{ mode === 'register' ? 'Criar conta' : 'Entrar' }}
                <svg class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>
            </button>
          </div>

          <div v-if="mode === 'login'" class="text-center">
            <button type="button" @click="setMode('forgot')" class="text-sm text-blue-600 hover:text-purple-600 font-medium transition-colors">
              Esqueceu sua senha?
            </button>
          </div>
        </form>

        <form v-if="mode === 'forgot'" class="space-y-6" @submit.prevent="handleForgotPassword">
          <div v-if="error" class="rounded-xl bg-red-50 p-4 border-l-4 border-red-500 shadow-sm">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="ml-3 text-sm font-semibold text-red-800">{{ error }}</p>
            </div>
          </div>

          <p class="text-sm text-gray-600">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>

          <div>
            <label for="forgot-email" class="block text-sm font-semibold text-gray-700 mb-2">
              E-mail
            </label>
            <input
              id="forgot-email"
              v-model="formData.email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </span>
            <span v-else>Enviar link de recuperacao</span>
          </button>
        </form>

        <div class="mt-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t-2 border-gray-200" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-600 font-medium">
                {{ mode === 'register' ? 'Ja tem uma conta?' : mode === 'forgot' ? 'Lembrou a senha?' : 'Nao tem uma conta?' }}
              </span>
            </div>
          </div>

          <div class="mt-6">
            <button
              type="button"
              @click="mode === 'register' ? setMode('login') : mode === 'forgot' ? setMode('login') : setMode('register')"
              class="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-xl shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02]"
            >
              {{ mode === 'register' ? 'Fazer Login' : mode === 'forgot' ? 'Voltar ao Login' : 'Criar Nova Conta' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

type Mode = 'login' | 'register' | 'forgot'
const mode = ref<Mode>('login')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const formData = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

const currentTitle = computed(() => {
  if (mode.value === 'register') return 'Criar conta'
  if (mode.value === 'forgot') return 'Recuperar senha'
  return 'Bem-vindo de volta'
})

const currentSubtitle = computed(() => {
  if (mode.value === 'register') return 'Preencha os dados para criar sua conta'
  if (mode.value === 'forgot') return 'Enviaremos um link para seu e-mail'
  return 'Entre com suas credenciais para continuar'
})

function setMode(newMode: Mode) {
  mode.value = newMode
  error.value = ''
  successMessage.value = ''
  formData.value = { name: '', email: '', password: '', passwordConfirm: '' }
}

function validateForm(): string | null {
  const { email, password, passwordConfirm, name } = formData.value

  if (!email.trim()) return 'Informe seu e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'E-mail invalido.'
  if (!password) return 'Informe sua senha.'
  if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'

  if (mode.value === 'register') {
    if (!name.trim()) return 'Informe seu nome.'
    if (!passwordConfirm) return 'Confirme sua senha.'
    if (password !== passwordConfirm) return 'As senhas nao coincidem.'
  }

  return null
}

async function handleSubmit() {
  error.value = ''
  successMessage.value = ''

  const validationError = validateForm()
  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true

  try {
    let result

    if (mode.value === 'register') {
      result = await authStore.register(
        formData.value.email,
        formData.value.password,
        formData.value.passwordConfirm,
        formData.value.name
      )
    } else {
      result = await authStore.login(
        formData.value.email,
        formData.value.password
      )
    }

    if (result.success) {
      await nextTick()
      await router.push('/dashboard')
    } else {
      error.value = result.error || 'Ocorreu um erro'
    }
  } catch (e: any) {
    error.value = e?.message || 'Ocorreu um erro'
  } finally {
    loading.value = false
  }
}

async function handleForgotPassword() {
  error.value = ''
  successMessage.value = ''

  if (!formData.value.email.trim()) {
    error.value = 'Informe seu e-mail.'
    return
  }

  loading.value = true

  try {
    const result = await authStore.requestPasswordReset(formData.value.email)
    if (result.success) {
      successMessage.value = 'Se o e-mail estiver cadastrado, voce recebera um link para redefinir sua senha.'
    } else {
      successMessage.value = 'Se o e-mail estiver cadastrado, voce recebera um link para redefinir sua senha.'
    }
  } catch (e: any) {
    error.value = e?.message || 'Ocorreu um erro'
  } finally {
    loading.value = false
  }
}
</script>
