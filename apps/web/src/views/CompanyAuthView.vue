<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          {{ companyName || 'Carregando...' }}
        </h1>
        <p class="text-gray-600">Entre ou registre-se para acessar</p>
      </div>

      <div v-if="errorMsg" class="rounded-lg bg-red-50 border border-red-200 p-4">
        <p class="text-sm text-red-700">{{ errorMsg }}</p>
      </div>

      <div v-if="successMsg" class="rounded-lg bg-green-50 border border-green-200 p-4">
        <p class="text-sm text-green-700">{{ successMsg }}</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              @click="activeTab = 'login'"
              :class="[
                'flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm',
                activeTab === 'login'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Entrar
            </button>
            <button
              @click="activeTab = 'register'"
              :class="[
                'flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm',
                activeTab === 'register'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Registrar
            </button>
          </nav>
        </div>

        <!-- Login Form -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="p-8 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input
              v-model="loginForm.email"
              type="email"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              v-model="loginForm.password"
              type="password"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Entrando...
            </span>
            <span v-else>Entrar</span>
          </button>
        </form>

        <!-- Register Form -->
        <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="p-8 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input
              v-model="registerForm.name"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input
              v-model="registerForm.email"
              type="email"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              v-model="registerForm.password"
              type="password"
              required
              minlength="8"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
            <input
              v-model="registerForm.passwordConfirm"
              type="password"
              required
              minlength="8"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Confirme sua senha"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Registrando...
            </span>
            <span v-else>Registrar</span>
          </button>
        </form>
      </div>

      <div class="text-center">
        <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-500">
          Voltar para login padrão
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import pb from '../services/pocketbase'

const route = useRoute()
const router = useRouter()

const slug = ref(route.params.slug as string)
const companyId = ref('')
const companyName = ref('')
const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const loginForm = ref({
  email: '',
  password: '',
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await pb.collection('users').authWithPassword(loginForm.value.email, loginForm.value.password)
    
    // Check if user is already a member of this company
    const memberships = await pb.collection('company_users').getList(1, 1, {
      filter: `user="${pb.authStore.record?.id}" && company="${companyId.value}"`,
    })

    if (memberships.items.length === 0) {
      // Link user to company as employee
      await pb.collection('company_users').create({
        company: companyId.value,
        user: pb.authStore.record?.id,
        role: 'employee',
        active: true,
      })
    }

    await nextTick()
    router.push('/dashboard')
  } catch (error: any) {
    errorMsg.value = error?.message || 'Erro ao fazer login.'
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  if (registerForm.value.password !== registerForm.value.passwordConfirm) {
    errorMsg.value = 'As senhas não coincidem.'
    loading.value = false
    return
  }

  try {
    // Create user
    const user = await pb.collection('users').create({
      email: registerForm.value.email,
      password: registerForm.value.password,
      passwordConfirm: registerForm.value.passwordConfirm,
      name: registerForm.value.name,
      emailVisibility: true,
    })

    // Link user to company as employee
    await pb.collection('company_users').create({
      company: companyId.value,
      user: user.id,
      role: 'employee',
      active: true,
    })

    // Auto-login after registration
    await pb.collection('users').authWithPassword(registerForm.value.email, registerForm.value.password)

    successMsg.value = 'Conta criada com sucesso! Redirecionando...'
    await nextTick()
    setTimeout(() => router.push('/dashboard'), 1000)
  } catch (error: any) {
    errorMsg.value = error?.message || 'Erro ao criar conta.'
    loading.value = false
  }
}

onMounted(async () => {
  try {
    // Fetch company without authentication (public access)
    const records = await pb.collection('companies').getList(1, 1, {
      filter: `slug="${slug.value}"`,
    })
    if (records.items.length > 0) {
      companyId.value = records.items[0].id
      companyName.value = records.items[0].name
    } else {
      errorMsg.value = 'Empresa não encontrada.'
    }
  } catch (error: any) {
    errorMsg.value = error?.message || 'Erro ao buscar empresa.'
  }
})
</script>
