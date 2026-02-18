import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pb from '../services/pocketbase'
import type { RecordModel } from 'pocketbase'

function translateError(error: any): string {
  const msg = error?.message || ''
  const data = error?.data || error?.response?.data || {}

  if (msg.includes('Failed to authenticate') || msg.includes('invalid credentials')) {
    return 'E-mail ou senha incorretos.'
  }
  if (msg.includes('Failed to create record')) {
    if (data?.email?.code === 'validation_not_unique') {
      return 'Este e-mail já está cadastrado.'
    }
    if (data?.email?.code === 'validation_invalid_email') {
      return 'E-mail inválido.'
    }
    if (data?.password?.code === 'validation_length_out_of_range') {
      return 'A senha deve ter pelo menos 8 caracteres.'
    }
    if (data?.passwordConfirm?.code === 'validation_values_mismatch') {
      return 'As senhas não coincidem.'
    }
    return 'Erro ao criar conta. Verifique os dados informados.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.'
  }

  return msg || 'Ocorreu um erro inesperado. Tente novamente.'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<RecordModel | null>(pb.authStore.model)
  const token = ref<string>(pb.authStore.token)

  const isLoggedIn = computed(() => pb.authStore.isValid && !!user.value)

  pb.authStore.onChange((newToken, newModel) => {
    token.value = newToken
    user.value = newModel
  })

  async function verifyAuth(): Promise<boolean> {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return false
    }

    try {
      await pb.collection('users').authRefresh()
      user.value = pb.authStore.model
      token.value = pb.authStore.token
      return true
    } catch (error) {
      pb.authStore.clear()
      user.value = null
      token.value = ''
      return false
    }
  }

  async function login(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      user.value = authData.record
      token.value = pb.authStore.token
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: translateError(error)
      }
    }
  }

  function logout() {
    pb.authStore.clear()
    user.value = null
    token.value = ''
  }

  async function register(email: string, password: string, passwordConfirm: string, name?: string) {
    try {
      const data = {
        email,
        password,
        passwordConfirm,
        name: name || email.split('@')[0],
      }

      await pb.collection('users').create(data)
      return await login(email, password)
    } catch (error: any) {
      return {
        success: false,
        error: translateError(error)
      }
    }
  }

  async function requestPasswordReset(email: string) {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: translateError(error)
      }
    }
  }

  async function updateProfile(data: { name?: string; avatar?: File }) {
    if (!user.value) return { success: false, error: 'Usuário não autenticado.' }

    try {
      const formData = new FormData()
      if (data.name !== undefined) formData.append('name', data.name)
      if (data.avatar) formData.append('avatar', data.avatar)

      const updated = await pb.collection('users').update(user.value.id, formData)
      user.value = updated
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: translateError(error)
      }
    }
  }

  async function changePassword(oldPassword: string, newPassword: string, newPasswordConfirm: string) {
    if (!user.value) return { success: false, error: 'Usuário não autenticado.' }

    try {
      await pb.collection('users').update(user.value.id, {
        oldPassword,
        password: newPassword,
        passwordConfirm: newPasswordConfirm,
      })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: translateError(error)
      }
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    verifyAuth,
    login,
    logout,
    register,
    requestPasswordReset,
    updateProfile,
    changePassword,
  }
})
