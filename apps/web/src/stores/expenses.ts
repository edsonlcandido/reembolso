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

  async function fetchReports(companyId: string, filters?: { status?: string }) {
    loading.value = true
    try {
      const companyStore = useCompanyStore()
      const userId = pb.authStore.record?.id
      let filter = `company="${companyId}"`

      if (companyStore.currentUserRole === 'admin') {
        // Admins see all reports in the company
      } else if (companyStore.currentUserRole === 'approver') {
        // Approvers see their own reports + reports submitted to them
        filter += ` && (user="${userId}" || submitted_to="${userId}")`
      } else {
        // Employees see only their own reports
        filter += ` && user="${userId}"`
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
      const userId = pb.authStore.record?.id
      const companyStore = useCompanyStore()
      // Allow: admins, approvers (own or submitted_to them), employees (own reports)
      if (companyStore.currentUserRole === 'admin') {
        // ok
      } else if (companyStore.currentUserRole === 'approver') {
        if (record.user !== userId && record.submitted_to !== userId) {
          return { success: false, error: 'Você não tem permissão para acessar este relatório.' }
        }
      } else if (record.user !== userId) {
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

  async function fetchPendingApprovals(companyId: string) {
    loading.value = true
    try {
      const companyStore = useCompanyStore()
      if (companyStore.currentUserRole !== 'admin' && companyStore.currentUserRole !== 'approver') {
        return { success: false, error: 'Sem permissão para acessar aprovações.' }
      }
      const userId = pb.authStore.record?.id
      const records = await pb.collection('expense_reports').getFullList({
        filter: `company="${companyId}" && status="submitted" && submitted_to="${userId}"`,
        sort: '-submitted_at',
        expand: 'user',
      })
      return { success: true, data: records }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao buscar aprovações pendentes.' }
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

  async function submitReport(id: string, approverId?: string) {
    loading.value = true
    try {
      const record = await pb.collection('expense_reports').update(id, {
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        submitted_to: approverId || null,
      })
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao enviar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function approveReport(id: string, notes?: string) {
    loading.value = true
    try {
      const record = await pb.collection('expense_reports').update(id, {
        status: 'approved',
        approved_by: pb.authStore.record?.id,
        approved_at: new Date().toISOString(),
      })
      const companyStore = useCompanyStore()
      try {
        await pb.collection('approval_actions').create({
          report: id,
          company: companyStore.currentCompany?.id,
          user: pb.authStore.record?.id,
          action: 'approve',
          notes: notes || '',
        })
      } catch (_) {}
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
      const companyStore = useCompanyStore()
      try {
        await pb.collection('approval_actions').create({
          report: id,
          company: companyStore.currentCompany?.id,
          user: pb.authStore.record?.id,
          action: 'reject',
          notes: reason,
        })
      } catch (_) {}
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao rejeitar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function payReport(id: string, notes?: string) {
    loading.value = true
    try {
      const record = await pb.collection('expense_reports').update(id, {
        status: 'paid',
      })
      const companyStore = useCompanyStore()
      try {
        await pb.collection('approval_actions').create({
          report: id,
          company: companyStore.currentCompany?.id,
          user: pb.authStore.record?.id,
          action: 'pay',
          notes: notes || '',
        })
      } catch (_) {}
      return { success: true, data: record }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao pagar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function markItemPaid(itemId: string, reportId: string, paid: boolean) {
    loading.value = true
    try {
      await pb.collection('expense_items').update(itemId, {
        paid,
        paid_by: paid ? pb.authStore.record?.id : null,
        paid_at: paid ? new Date().toISOString() : null,
      })
      // Recalculate report status based on item payment state
      const allItems = await pb.collection('expense_items').getFullList({
        filter: `report="${reportId}"`,
      })
      if (allItems.length > 0) {
        const paidCount = allItems.filter(i => i.paid).length
        let newStatus: string
        if (paidCount === 0) {
          newStatus = 'approved'
        } else if (paidCount === allItems.length) {
          newStatus = 'paid'
        } else {
          newStatus = 'partially_paid'
        }
        const report = await pb.collection('expense_reports').getOne(reportId)
        if (['approved', 'paid', 'partially_paid'].includes(report.status)) {
          const companyStore = useCompanyStore()
          await pb.collection('expense_reports').update(reportId, { status: newStatus })
          if (newStatus === 'paid' || newStatus === 'partially_paid') {
            try {
              await pb.collection('approval_actions').create({
                report: reportId,
                company: companyStore.currentCompany?.id,
                user: pb.authStore.record?.id,
                action: newStatus === 'paid' ? 'pay' : 'partially_pay',
              })
            } catch (_) {}
          }
        }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao atualizar pagamento do item.' }
    } finally {
      loading.value = false
    }
  }

  async function forwardReport(id: string, targetUserId: string, notes: string) {
    loading.value = true
    try {
      const companyStore = useCompanyStore()
      await pb.collection('approval_actions').create({
        report: id,
        company: companyStore.currentCompany?.id,
        user: pb.authStore.record?.id,
        action: 'forward',
        notes,
        forwarded_to: targetUserId,
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao encaminhar relatório.' }
    } finally {
      loading.value = false
    }
  }

  async function fetchApprovalActions(reportId: string) {
    try {
      const records = await pb.collection('approval_actions').getFullList({
        filter: `report="${reportId}"`,
        sort: '-created',
        expand: 'user,forwarded_to',
      })
      return { success: true, data: records }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao buscar ações de aprovação.' }
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
        expand: 'category',
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
    fetchPendingApprovals,
    getReport,
    createReport,
    updateReport,
    submitReport,
    approveReport,
    rejectReport,
    payReport,
    markItemPaid,
    forwardReport,
    fetchApprovalActions,
    deleteReport,
    fetchItems,
    addItem,
    updateItem,
    removeItem,
    recalculateTotal,
  }
})
