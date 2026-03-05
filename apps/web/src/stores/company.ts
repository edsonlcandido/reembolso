import { defineStore } from 'pinia'
import { ref } from 'vue'
import pb from '../services/pocketbase'
import type { RecordModel } from 'pocketbase'

export const useCompanyStore = defineStore('company', () => {
  const currentCompany = ref<RecordModel | null>(null)
  const companies = ref<RecordModel[]>([])
  const companyMemberships = ref<RecordModel[]>([])
  const currentUserRole = ref<string>('employee')
  const members = ref<RecordModel[]>([])
  const loading = ref(false)

  async function fetchMyCompanies() {
    loading.value = true
    try {
      const records = await pb.collection('company_users').getFullList({
        filter: `user="${pb.authStore.record?.id}"`,
        expand: 'company',
      })
      companyMemberships.value = records
      companies.value = records.map((r) => r.expand?.company).filter(Boolean) as RecordModel[]
      if (companies.value.length > 0 && !currentCompany.value) {
        currentCompany.value = companies.value[0]
        const membership = records.find(r => r.expand?.company?.id === companies.value[0].id)
        currentUserRole.value = membership?.role || 'employee'
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao buscar empresas.' }
    } finally {
      loading.value = false
    }
  }

  function clearState() {
    currentCompany.value = null
    companies.value = []
    companyMemberships.value = []
    currentUserRole.value = 'employee'
    members.value = []
  }

  function setCurrentCompany(company: RecordModel | null) {
    currentCompany.value = company
    if (company) {
      const membership = companyMemberships.value.find(r => r.expand?.company?.id === company.id)
      currentUserRole.value = membership?.role || 'employee'
    } else {
      currentUserRole.value = 'employee'
    }
  }

  async function createCompany(data: { name: string; slug: string; cnpj?: string; email?: string; phone?: string; address?: string; km_rate?: number }) {
    loading.value = true
    try {
      // Use the custom server-side endpoint so the company and the admin
      // membership are created atomically with guaranteed auth context.
      const response = await pb.send('/api/companies/create', {
        method: 'POST',
        body: JSON.stringify({ ...data, active: true }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response || !response.id) {
        return { success: false, error: 'Erro ao criar empresa.' }
      }
      await fetchMyCompanies()
      return { success: true, companyId: response.id as string }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao criar empresa.' }
    } finally {
      loading.value = false
    }
  }

  async function updateCompany(id: string, data: Partial<{ name: string; slug: string; cnpj: string; email: string; phone: string; address: string; km_rate: number }>) {
    loading.value = true
    try {
      await pb.collection('companies').update(id, data)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao atualizar empresa.' }
    } finally {
      loading.value = false
    }
  }

  async function fetchMembers() {
    if (!currentCompany.value) return { success: false, error: 'Nenhuma empresa selecionada.' }
    loading.value = true
    try {
      const records = await pb.collection('company_users').getFullList({
        filter: `company="${currentCompany.value.id}"`,
        expand: 'user',
      })
      members.value = records
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao buscar membros.' }
    } finally {
      loading.value = false
    }
  }

  async function addMember(email: string, role: string) {
    if (!currentCompany.value) return { success: false, error: 'Nenhuma empresa selecionada.' }
    loading.value = true
    try {
      // Tentar encontrar o usuário
      let userId: string | null = null
      let userFound = true

      try {
        const userResult = await pb.send('/api/users/find-by-email', {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: { 'Content-Type': 'application/json' },
        })
        if (userResult && userResult.id) {
          userId = userResult.id
        } else {
          userFound = false
        }
      } catch (error: any) {
        const serverMessage = error?.response?.message || error?.data?.message || error?.data?.error
        if (error?.status === 404 || serverMessage?.includes('não encontrado')) {
          userFound = false
        } else {
          throw error
        }
      }

      if (userFound && !userId) {
        return { success: false, error: 'Usuário não encontrado com este e-mail.' }
      }

      // Se usuário existe, adicionar como membro normal
      if (userId) {
        await pb.collection('company_users').create({
          company: currentCompany.value.id,
          user: userId,
          role,
          active: true,
        })
        return { success: true, message: 'Membro adicionado com sucesso!' }
      }

      // Se usuário não existe, criar usuário e enviar email de reset de senha
      if (!userFound) {
        try {
          const result = await pb.send('/api/memberships/send-invite', {
            method: 'POST',
            body: JSON.stringify({
              email,
              companyId: currentCompany.value.id,
              companyName: currentCompany.value.name,
              role,
            }),
            headers: { 'Content-Type': 'application/json' },
          })

          return { 
            success: true, 
            message: result.message || `Usuário criado e adicionado à empresa. Email de configuração de senha enviado para ${email}.` 
          }
        } catch (inviteErr: any) {
          console.error('Erro ao criar usuário e enviar convite:', inviteErr)
          const serverMessage = inviteErr?.response?.message || inviteErr?.data?.message || inviteErr?.data?.error
          return { success: false, error: serverMessage || 'Erro ao criar usuário e enviar convite. Tente novamente.' }
        }
      }

      return { success: false, error: 'Erro ao processar solicitação.' }
    } catch (error: any) {
      const serverMessage = error?.response?.message || error?.data?.message || error?.data?.error
      return { success: false, error: serverMessage || error?.message || 'Erro ao adicionar membro.' }
    } finally {
      loading.value = false
    }
  }

  async function updateMemberRole(membershipId: string, role: string) {
    loading.value = true
    try {
      await pb.collection('company_users').update(membershipId, { role })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao atualizar papel do membro.' }
    } finally {
      loading.value = false
    }
  }

  async function toggleMemberActive(membershipId: string, active: boolean) {
    loading.value = true
    try {
      await pb.collection('company_users').update(membershipId, { active })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao atualizar status do membro.' }
    } finally {
      loading.value = false
    }
  }

  async function removeMember(membershipId: string) {
    loading.value = true
    try {
      await pb.collection('company_users').delete(membershipId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao remover membro.' }
    } finally {
      loading.value = false
    }
  }

  async function getCompanyBySlug(slug: string) {
    loading.value = true
    try {
      const records = await pb.collection('companies').getList(1, 1, {
        filter: `slug="${slug}"`,
      })
      if (records.items.length === 0) {
        return { success: false, error: 'Empresa não encontrada.', company: null }
      }
      return { success: true, company: records.items[0] }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao buscar empresa.', company: null }
    } finally {
      loading.value = false
    }
  }

  return {
    currentCompany,
    companies,
    currentUserRole,
    members,
    loading,
    fetchMyCompanies,
    setCurrentCompany,
    clearState,
    createCompany,
    updateCompany,
    fetchMembers,
    addMember,
    updateMemberRole,
    toggleMemberActive,
    removeMember,
    getCompanyBySlug,
  }
})
