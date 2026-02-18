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

  async function createCompany(data: { name: string; cnpj?: string; email?: string; phone?: string; address?: string }) {
    loading.value = true
    try {
      const company = await pb.collection('companies').create({
        ...data,
        active: true,
      })
      await pb.collection('company_users').create({
        company: company.id,
        user: pb.authStore.record?.id,
        role: 'admin',
        active: true,
      })
      await fetchMyCompanies()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao criar empresa.' }
    } finally {
      loading.value = false
    }
  }

  async function updateCompany(id: string, data: Partial<{ name: string; cnpj: string; email: string; phone: string; address: string }>) {
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
      const users = await pb.collection('users').getList(1, 1, {
        filter: `email="${email}"`,
      })
      if (users.items.length === 0) {
        return { success: false, error: 'Usuário não encontrado com este e-mail.' }
      }
      const user = users.items[0]
      await pb.collection('company_users').create({
        company: currentCompany.value.id,
        user: user.id,
        role,
        active: true,
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao adicionar membro.' }
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
    removeMember,
  }
})
