<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
        <h1 class="text-2xl font-bold text-white">Membros da Empresa</h1>
        <p class="text-blue-100 mt-1">Gerencie os membros e suas permissões</p>
      </div>

      <div v-if="successMsg" class="mx-8 mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
        <p class="text-sm text-green-700">{{ successMsg }}</p>
      </div>

      <div v-if="errorMsg" class="mx-8 mt-6 rounded-lg bg-red-50 border border-red-200 p-4">
        <p class="text-sm text-red-700">{{ errorMsg }}</p>
      </div>

      <div class="p-8">
        <div class="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Convidar Novo Membro</h3>
          <form @submit.prevent="handleAddMember" class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="newMemberEmail"
              type="email"
              required
              placeholder="E-mail do usuário"
              class="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <select
              v-model="newMemberRole"
              class="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="admin">Admin</option>
              <option value="approver">Aprovador</option>
              <option value="employee">Funcionário</option>
            </select>
            <button
              type="submit"
              :disabled="companyStore.loading"
              class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              Convidar
            </button>
          </form>
        </div>

        <div v-if="companyStore.loading && companyStore.members.length === 0" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div class="w-10 h-10 bg-gray-200 rounded-full" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-1/3" />
              <div class="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>

        <div v-else-if="companyStore.members.length === 0" class="text-center py-12">
          <UsersIcon class="mx-auto h-12 w-12 text-gray-300" />
          <p class="mt-4 text-gray-500">Nenhum membro encontrado</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="member in companyStore.members"
            :key="member.id"
            class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {{ (member.expand?.user?.name || member.expand?.user?.email || '?')[0].toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 truncate">
                  {{ member.expand?.user?.name || 'Sem nome' }}
                  <span v-if="isCurrentUser(member)" class="text-xs text-blue-600 ml-1">(você)</span>
                </p>
                <p class="text-sm text-gray-500 truncate">{{ member.expand?.user?.email }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span :class="roleBadgeClass(member.role)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ roleLabel(member.role) }}
              </span>

              <select
                v-if="!isCurrentUser(member)"
                :value="member.role"
                @change="handleRoleChange(member.id, ($event.target as HTMLSelectElement).value)"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="admin">Admin</option>
                <option value="approver">Aprovador</option>
                <option value="employee">Funcionário</option>
              </select>

              <button
                v-if="!isCurrentUser(member)"
                @click="confirmRemoveMember(member)"
                class="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-all"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showConfirmModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Remover Membro</h3>
        <p class="text-gray-600 mb-6">
          Tem certeza que deseja remover <strong>{{ memberToRemove?.expand?.user?.name || memberToRemove?.expand?.user?.email }}</strong> da empresa?
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="showConfirmModal = false"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            @click="handleRemoveMember"
            :disabled="companyStore.loading"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-all disabled:opacity-50"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCompanyStore } from '../stores/company'
import { ref, onMounted } from 'vue'
import pb from '../services/pocketbase'
import { UsersIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { RecordModel } from 'pocketbase'

const companyStore = useCompanyStore()

const newMemberEmail = ref('')
const newMemberRole = ref('employee')
const successMsg = ref('')
const errorMsg = ref('')
const showConfirmModal = ref(false)
const memberToRemove = ref<RecordModel | null>(null)

function isCurrentUser(member: RecordModel): boolean {
  return member.expand?.user?.id === pb.authStore.record?.id
}

function roleBadgeClass(role: string): string {
  switch (role) {
    case 'admin': return 'bg-blue-100 text-blue-700'
    case 'approver': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-green-100 text-green-700'
  }
}

function roleLabel(role: string): string {
  switch (role) {
    case 'admin': return 'Admin'
    case 'approver': return 'Aprovador'
    default: return 'Funcionário'
  }
}

async function handleAddMember() {
  successMsg.value = ''
  errorMsg.value = ''
  const result = await companyStore.addMember(newMemberEmail.value, newMemberRole.value)
  if (result.success) {
    successMsg.value = 'Membro convidado com sucesso!'
    newMemberEmail.value = ''
    newMemberRole.value = 'employee'
    await companyStore.fetchMembers()
  } else {
    errorMsg.value = result.error || 'Erro ao convidar membro.'
  }
}

async function handleRoleChange(membershipId: string, role: string) {
  successMsg.value = ''
  errorMsg.value = ''
  const result = await companyStore.updateMemberRole(membershipId, role)
  if (result.success) {
    successMsg.value = 'Papel atualizado com sucesso!'
    await companyStore.fetchMembers()
  } else {
    errorMsg.value = result.error || 'Erro ao atualizar papel.'
  }
}

function confirmRemoveMember(member: RecordModel) {
  memberToRemove.value = member
  showConfirmModal.value = true
}

async function handleRemoveMember() {
  if (!memberToRemove.value) return
  successMsg.value = ''
  errorMsg.value = ''
  const result = await companyStore.removeMember(memberToRemove.value.id)
  if (result.success) {
    successMsg.value = 'Membro removido com sucesso!'
    showConfirmModal.value = false
    memberToRemove.value = null
    await companyStore.fetchMembers()
  } else {
    errorMsg.value = result.error || 'Erro ao remover membro.'
  }
}

onMounted(async () => {
  await companyStore.fetchMembers()
})
</script>
