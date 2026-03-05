<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')
const email = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    status.value = 'error'
    errorMessage.value = 'Token de verificação não encontrado.'
    return
  }

  try {
    const result = await authStore.confirmVerification(token)
    
    if (result.success) {
      // Atualizar dados do usuário para refletir verified=true
      if (authStore.user) {
        email.value = authStore.user.email
      }
      status.value = 'success'
      
      // Redirecionar para dashboard após 3 segundos
      setTimeout(() => {
        router.push({ name: 'dashboard' })
      }, 3000)
    } else {
      status.value = 'error'
      errorMessage.value = result.error || 'Erro ao confirmar email'
    }
  } catch (err: any) {
    status.value = 'error'
    errorMessage.value = err.message || 'Erro ao processar verificação'
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="inline-block mb-4">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Confirmar E-mail
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
          <p class="text-gray-600">Confirmando seu e-mail...</p>
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
                <p class="text-lg font-semibold text-green-800">E-mail confirmado com sucesso!</p>
                <p class="text-sm text-green-700 mt-1" v-if="email">
                  {{ email }} foi verificado.
                </p>
              </div>
            </div>
          </div>
          <p class="text-center text-gray-600 text-sm">
            Redirecionando para o dashboard em alguns segundos...
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="status === 'error'" class="space-y-6">
          <div class="rounded-xl bg-red-50 p-6 border-l-4 border-red-500 shadow-sm">
            <div class="flex">
              <svg class="h-6 w-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-lg font-semibold text-red-800">Erro ao confirmar e-mail</p>
                <p class="text-sm text-red-700 mt-2">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-center text-sm text-gray-600">
              O link de verificação pode ter expirado.
            </p>
            <p class="text-center text-sm">
              <a href="/auth/register"
                class="font-semibold text-blue-600 hover:text-purple-600 transition-colors">
                Tentar novamente
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
