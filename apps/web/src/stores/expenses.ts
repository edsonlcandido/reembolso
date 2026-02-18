import { defineStore } from 'pinia'
import { ref } from 'vue'
import pb from '../services/pocketbase'
import type { RecordModel } from 'pocketbase'
import { useCompanyStore } from './company'

export const useExpensesStore = defineStore('expenses', () => {
  const reports = ref<RecordModel[]>([])
  const currentReport = ref<RecordModel | null>(null)
  const items = ref<RecordModel[]>([])
  const loading = ref(false)

  function isAdminOrApprover(): boolean {
    const companyStore = useCompanyStore()
    return companyStore.currentUserRole === 'admin' || companyStore.currentUserRole === 'approver'
  }

  async function fetchReports(companyId: string, filters?: { status?: string }) {
    loading.value = true
    try {
      let filter = `company="${companyId}"`
      if (!isAdminOrApprover()) {
        filter += ` && user="${pb.authStore.record?.id}"`
      }
      if (filters?.status) {
        filter += ` && status="${filters.status}"`
      }
      const records = await pb.collection('expense_reports').getFullList({
        filter,
        sort: '-id',
        expand: 'user',
      })
      reports.value = records
      return { success: true, data: records }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao buscar relatórios.' }
    } finally {
      loading.value = false
    }
  }

  async function getReport(id: string) {
    loading.value = true
    try {
      const record = await pb.collection('expense_reports').getOne(id, {
        expand: 'user',
      })
      if (!isAdminOrApprover() && record.user !== pb.authStore.record?.id) {
        return { success: false, error: 'Você não tem permissão para acessar este relatório.' }
      }
      currentReport.value = record
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao buscar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function createReport(data: { company: string; title: string; period_start?: string; period_end?: string; cost_center?: string; project?: string; description?: string }) {
    loading.value = true
    try {
      const record = await pb.collection('expense_reports').create({
        ...data,
        user: pb.authStore.record?.id,
        status: 'draft',
        total_amount: 0,
      })
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao criar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function updateReport(id: string, data: Record<string, any>) {
    loading.value = true
    try {
      const record = await pb.collection('expense_reports').update(id, data)
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao atualizar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function submitReport(id: string) {
    loading.value = true
    try {
      const record = await pb.collection('expense_reports').update(id, {
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao enviar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function approveReport(id: string) {
    loading.value = true
    try {
      const record = await pb.collection('expense_reports').update(id, {
        status: 'approved',
        approved_by: pb.authStore.record?.id,
        approved_at: new Date().toISOString(),
      })
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao aprovar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function rejectReport(id: string, reason: string) {
    loading.value = true
    try {
      const record = await pb.collection('expense_reports').update(id, {
        status: 'rejected',
        rejection_reason: reason,
        approved_by: pb.authStore.record?.id,
        approved_at: new Date().toISOString(),
      })
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao rejeitar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function deleteReport(id: string) {
    loading.value = true
    try {
      const report = await pb.collection('expense_reports').getOne(id)
      if (report.status !== 'draft') {
        return { success: false, error: 'Apenas relatórios em rascunho podem ser excluídos.' }
      }
      await pb.collection('expense_reports').delete(id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao excluir relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function fetchItems(reportId: string) {
    loading.value = true
    try {
      const records = await pb.collection('expense_items').getFullList({
        filter: `report="${reportId}"`,
        sort: '-date',
      })
      items.value = records
      return { success: true, data: records }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao buscar itens.' }
    } finally {
      loading.value = false
    }
  }

  async function addItem(data: { report: string; date?: string; category?: string; amount: number; description?: string; merchant?: string; notes?: string }) {
    loading.value = true
    try {
      const record = await pb.collection('expense_items').create({
        ...data,
        ocr_processed: false,
      })
      await recalculateTotal(data.report)
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao adicionar item.' }
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id: string, data: Record<string, any>) {
    loading.value = true
    try {
      const record = await pb.collection('expense_items').update(id, data)
      const item = await pb.collection('expense_items').getOne(id)
      await recalculateTotal(item.report)
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao atualizar item.' }
    } finally {
      loading.value = false
    }
  }

  async function removeItem(id: string, reportId: string) {
    loading.value = true
    try {
      await pb.collection('expense_items').delete(id)
      await recalculateTotal(reportId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao remover item.' }
    } finally {
      loading.value = false
    }
  }

  async function recalculateTotal(reportId: string) {
    try {
      const allItems = await pb.collection('expense_items').getFullList({
        filter: `report="${reportId}"`,
      })
      const total = allItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
      await pb.collection('expense_reports').update(reportId, { total_amount: total })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao recalcular total.' }
    }
  }

  return {
    reports,
    currentReport,
    items,
    loading,
    fetchReports,
    getReport,
    createReport,
    updateReport,
    submitReport,
    approveReport,
    rejectReport,
    deleteReport,
    fetchItems,
    addItem,
    updateItem,
    removeItem,
    recalculateTotal,
  }
})
