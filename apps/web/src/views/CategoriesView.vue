<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
        <h1 class="text-2xl font-bold text-white">Categorias de Despesa</h1>
        <p class="text-blue-100 mt-1">Gerencie as categorias de despesa da empresa</p>
      </div>

      <div v-if="successMsg" class="mx-8 mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
        <p class="text-sm text-green-700">{{ successMsg }}</p>
      </div>

      <div v-if="errorMsg" class="mx-8 mt-6 rounded-lg bg-red-50 border border-red-200 p-4">
        <p class="text-sm text-red-700">{{ errorMsg }}</p>
      </div>

      <div class="p-8">
        <div class="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ editingId ? 'Editar Categoria' : 'Nova Categoria' }}
          </h3>
          <form @submit.prevent="handleSaveCategory" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  v-model="categoryForm.name"
                  type="text"
                  required
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Nome da categoria"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                <input
                  v-model="categoryForm.icon"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Ex: 🍔, ✈️, 🏨"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                v-model="categoryForm.description"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Descrição da categoria"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cor</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in presetColors"
                  :key="color.value"
                  type="button"
                  @click="categoryForm.color = color.value"
                  :class="[
                    'w-8 h-8 rounded-full border-2 transition-all',
                    categoryForm.color === color.value ? 'border-gray-900 scale-110 ring-2 ring-offset-2 ring-blue-400' : 'border-transparent hover:scale-105'
                  ]"
                  :style="{ backgroundColor: color.value }"
                  :title="color.label"
                />
              </div>
            </div>
            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="saving"
                class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {{ editingId ? 'Atualizar' : 'Adicionar' }}
              </button>
              <button
                v-if="editingId"
                type="button"
                @click="cancelEdit"
                class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div v-if="loading && categories.length === 0" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div class="w-10 h-10 bg-gray-200 rounded-lg" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-1/3" />
              <div class="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>

        <div v-else-if="categories.length === 0" class="text-center py-12">
          <TagIcon class="mx-auto h-12 w-12 text-gray-300" />
          <p class="mt-4 text-gray-500">Nenhuma categoria cadastrada</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                :style="{ backgroundColor: cat.color || '#e5e7eb' }"
              >
                {{ cat.icon || '📁' }}
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ cat.name }}</p>
                <p v-if="cat.description" class="text-sm text-gray-500 truncate">{{ cat.description }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                @click="toggleActive(cat)"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  cat.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                ]"
              >
                {{ cat.active !== false ? 'Ativa' : 'Inativa' }}
              </button>
              <button
                @click="startEdit(cat)"
                class="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 transition-all"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                @click="handleDeleteCategory(cat.id)"
                class="rounded-lg border border-red-300 p-2 text-red-600 hover:bg-red-50 transition-all"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import pb from '../services/pocketbase'
import { useCompanyStore } from '../stores/company'
import { ref, onMounted } from 'vue'
import { TagIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { RecordModel } from 'pocketbase'

const companyStore = useCompanyStore()

const categories = ref<RecordModel[]>([])
const loading = ref(false)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const editingId = ref('')

const categoryForm = ref({
  name: '',
  description: '',
  icon: '',
  color: '',
})

const presetColors = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#f97316', label: 'Laranja' },
  { value: '#eab308', label: 'Amarelo' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#6b7280', label: 'Cinza' },
]

async function fetchCategories() {
  if (!companyStore.currentCompany) return
  loading.value = true
  try {
    const records = await pb.collection('categories').getFullList({
      filter: `company="${companyStore.currentCompany.id}"`,
      sort: 'name',
    })
    categories.value = records
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao buscar categorias.'
  } finally {
    loading.value = false
  }
}

async function handleSaveCategory() {
  successMsg.value = ''
  errorMsg.value = ''

  if (!categoryForm.value.name.trim()) {
    errorMsg.value = 'O nome da categoria é obrigatório.'
    return
  }

  if (!companyStore.currentCompany) {
    errorMsg.value = 'Nenhuma empresa selecionada.'
    return
  }

  saving.value = true
  try {
    const data = {
      name: categoryForm.value.name,
      description: categoryForm.value.description || undefined,
      icon: categoryForm.value.icon || undefined,
      color: categoryForm.value.color || undefined,
      company: companyStore.currentCompany.id,
      active: true,
    }

    if (editingId.value) {
      await pb.collection('categories').update(editingId.value, data)
      successMsg.value = 'Categoria atualizada com sucesso!'
    } else {
      await pb.collection('categories').create(data)
      successMsg.value = 'Categoria criada com sucesso!'
    }

    cancelEdit()
    await fetchCategories()
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao salvar categoria.'
  } finally {
    saving.value = false
  }
}

function startEdit(cat: RecordModel) {
  editingId.value = cat.id
  categoryForm.value = {
    name: cat.name || '',
    description: cat.description || '',
    icon: cat.icon || '',
    color: cat.color || '',
  }
}

function cancelEdit() {
  editingId.value = ''
  categoryForm.value = { name: '', description: '', icon: '', color: '' }
}

async function toggleActive(cat: RecordModel) {
  successMsg.value = ''
  errorMsg.value = ''
  try {
    await pb.collection('categories').update(cat.id, { active: cat.active === false })
    await fetchCategories()
    successMsg.value = 'Status atualizado!'
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao atualizar status.'
  }
}

async function handleDeleteCategory(id: string) {
  if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
  successMsg.value = ''
  errorMsg.value = ''
  try {
    await pb.collection('categories').delete(id)
    successMsg.value = 'Categoria excluída com sucesso!'
    await fetchCategories()
  } catch (err: any) {
    errorMsg.value = err?.message || 'Erro ao excluir categoria.'
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
