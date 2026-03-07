<template>
  <div class="print-root">
    <div v-if="loading" class="no-print flex items-center justify-center min-h-screen bg-gray-50">
      <p class="text-gray-400 text-base">Carregando relatório...</p>
    </div>

    <div v-else-if="error" class="no-print flex items-center justify-center min-h-screen bg-gray-50">
      <p class="text-red-500 text-base">{{ error }}</p>
    </div>

    <template v-else>
      <div class="no-print action-bar">
        <div class="action-bar-inner">
          <button @click="goBack" class="btn-ghost">← Voltar</button>
          <span class="action-bar-title">{{ report?.title }}</span>
          <button @click="triggerPrint" class="btn-primary">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      <div class="print-content">
        <!-- PAGE 1: Report -->
        <div class="print-page">
          <!-- Header -->
          <div class="page-header">
            <div class="header-left">
              <div class="company-name">{{ companyName }}</div>
              <div class="doc-title">{{ template.docTitle || 'Relatório de Despesas' }}</div>
            </div>
            <div class="header-right">
              <div class="status-badge" :data-status="report?.status">{{ statusLabel(report?.status) }}</div>
              <div class="header-total">{{ formatCurrency(report?.total_amount || 0) }}</div>
            </div>
          </div>

          <!-- Report info -->
          <div class="info-block">
            <div class="info-title">{{ report?.title }}</div>
            <div v-if="report?.description" class="info-description">{{ report.description }}</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Colaborador</span>
                <span class="info-value">{{ employeeName }}</span>
              </div>
              <div v-if="report?.period_start || report?.period_end" class="info-item">
                <span class="info-label">Período</span>
                <span class="info-value">
                  <template v-if="report?.period_start">{{ formatDate(report.period_start) }}</template>
                  <template v-if="report?.period_start && report?.period_end"> — </template>
                  <template v-if="report?.period_end">{{ formatDate(report.period_end) }}</template>
                </span>
              </div>
              <div v-if="report?.cost_center" class="info-item">
                <span class="info-label">Centro de Custo</span>
                <span class="info-value">{{ report.cost_center }}</span>
              </div>
              <div v-if="report?.project" class="info-item">
                <span class="info-label">Projeto</span>
                <span class="info-value">{{ report.project }}</span>
              </div>
              <div v-if="report?.advance_amount" class="info-item">
                <span class="info-label">Adiantamento</span>
                <span class="info-value">{{ formatCurrency(report.advance_amount) }}</span>
              </div>
            </div>
          </div>

          <!-- Intro text -->
          <div v-if="template.introText" class="intro-box">
            {{ template.introText }}
          </div>

          <!-- Expenses table -->
          <div class="section-heading">
            <span>Despesas</span>
            <span class="section-count">{{ items.length }} {{ items.length === 1 ? 'item' : 'itens' }}</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Estabelecimento</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th class="col-amount">Valor</th>
                <th class="col-receipt-icon"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td class="col-date">{{ formatDate(item.date) }}</td>
                <td>{{ item.merchant || '—' }}</td>
                <td class="col-cat">{{ categoryName(item.category) }}</td>
                <td class="col-desc">
                  {{ item.description || item.notes || '—' }}
                  <div v-if="item.original_currency && item.original_currency !== 'BRL'" class="currency-note">
                    {{ item.currency_note || `${item.original_currency} ${Number(item.original_amount || 0).toLocaleString('pt-BR')}` }}
                  </div>
                </td>
                <td class="col-amount">{{ formatCurrency(item.amount) }}</td>
                <td class="col-receipt-icon">
                  <svg v-if="!item.receipt_image && !item._imageUrl" class="no-receipt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="6" class="empty-row">Nenhuma despesa registrada.</td>
              </tr>
            </tbody>
          </table>

          <!-- Category summary -->
          <div class="section-heading" style="margin-top:20px">
            <span>Resumo por Categoria</span>
          </div>
          <table class="summary-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th class="col-num">Qtd</th>
                <th class="col-amount">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in categorySummary" :key="row.categoryId">
                <td>{{ row.name }}</td>
                <td class="col-num">{{ row.count }}</td>
                <td class="col-amount">{{ formatCurrency(row.total) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="foot-total">
                <td colspan="2">Total geral</td>
                <td class="col-amount">{{ formatCurrency(report?.total_amount || 0) }}</td>
              </tr>
              <tr v-if="report?.advance_amount" class="foot-sub">
                <td colspan="2">Adiantamento concedido</td>
                <td class="col-amount">{{ formatCurrency(report.advance_amount) }}</td>
              </tr>
              <tr v-if="report?.advance_amount" class="foot-balance">
                <td colspan="2">{{ balanceLabel }}</td>
                <td class="col-amount">{{ formatCurrency(Math.abs(balanceValue)) }}</td>
              </tr>
            </tfoot>
          </table>

          <!-- History -->
          <div v-if="historyEntries.length > 0" class="history-section">
            <div class="section-title">Histórico de Ações</div>
            <table class="data-table history-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Ação</th>
                  <th>Usuário</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in historyEntries" :key="entry.id">
                  <td class="col-date">{{ formatDateTime(entry.created) }}</td>
                  <td>{{ actionLabel(entry.action) }}</td>
                  <td>{{ actionUserName(entry) }}</td>
                  <td class="col-notes">{{ entry.notes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer text -->
          <div v-if="template.footerText" class="footer-box">
            {{ template.footerText }}
          </div>

          <!-- Signatures -->
          <div v-if="template.signatureLabel1 || template.signatureLabel2 || template.signatureLabel3" class="signatures">
            <div v-if="template.signatureLabel1" class="sig-field">
              <div class="sig-line" />
              <div class="sig-label">{{ template.signatureLabel1 }}</div>
              <div class="sig-date">Data: ___/___/______</div>
            </div>
            <div v-if="template.signatureLabel2" class="sig-field">
              <div class="sig-line" />
              <div class="sig-label">{{ template.signatureLabel2 }}</div>
              <div class="sig-date">Data: ___/___/______</div>
            </div>
            <div v-if="template.signatureLabel3" class="sig-field">
              <div class="sig-line" />
              <div class="sig-label">{{ template.signatureLabel3 }}</div>
              <div class="sig-date">Data: ___/___/______</div>
            </div>
          </div>

          <div class="page-footer">
            Gerado em {{ printDate }} · Reembolsa AI
          </div>
        </div>

        <!-- Receipts pages -->
        <template v-if="template.includeReceipts && itemsWithReceipts.length > 0">
          <div
            v-for="(group, groupIndex) in receiptGroups"
            :key="groupIndex"
            class="print-page receipts-page"
          >
            <div class="receipts-header">
              <span class="receipts-company">{{ companyName }}</span>
              <span class="receipts-label">{{ report?.title }} — Comprovantes ({{ groupIndex + 1 }}/{{ receiptGroups.length }})</span>
            </div>

            <div class="receipts-grid">
              <div v-for="item in group" :key="item.id" class="receipt-card">
                <div class="receipt-img-wrap">
                  <img
                    v-if="item._imageUrl"
                    :src="item._imageUrl"
                    :alt="`Comprovante ${item.merchant || ''}`"
                    class="receipt-img"
                  />
                  <div v-else class="receipt-no-img">Sem imagem</div>
                </div>
                <div class="receipt-meta">
                  <div class="receipt-meta-row"><span class="meta-key">Data</span><span>{{ formatDate(item.date) }}</span></div>
                  <div class="receipt-meta-row"><span class="meta-key">Local</span><span>{{ item.merchant || '—' }}</span></div>
                  <div class="receipt-meta-row"><span class="meta-key">Categoria</span><span>{{ categoryName(item.category) }}</span></div>
                  <div v-if="item.description" class="receipt-meta-row"><span class="meta-key">Descrição</span><span>{{ item.description }}</span></div>
                  <div class="receipt-meta-row receipt-value"><span class="meta-key">Valor</span><span>{{ formatCurrency(item.amount) }}</span></div>
                </div>
              </div>

              <div v-for="n in (4 - group.length)" :key="`pad-${n}`" class="receipt-card receipt-card-empty" />
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompanyStore } from '../stores/company'
import pb from '../services/pocketbase'
import type { RecordModel } from 'pocketbase'

const route = useRoute()
const router = useRouter()
const companyStore = useCompanyStore()

const isPreview = computed(() => route.query.preview === '1')

const report = ref<RecordModel | null>(null)
const items = ref<RecordModel[]>([])
const categories = ref<RecordModel[]>([])
const approvalActions = ref<RecordModel[]>([])
const loading = ref(true)
const error = ref('')

const template = ref({
  docTitle: '',
  introText: '',
  footerText: '',
  signatureLabel1: 'Solicitante',
  signatureLabel2: 'Aprovador',
  signatureLabel3: '',
  includeReceipts: true,
})

const companyName = computed(() => companyStore.currentCompany?.name || 'Minha Empresa')
const employeeName = computed(() => {
  if (isPreview.value) return 'João da Silva'
  const u = report.value?.expand?.user
  return u?.name || u?.email || '—'
})

const printDate = computed(() => new Date().toLocaleString('pt-BR'))

function formatDate(value: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-BR')
}

function formatCurrency(value: number): string {
  return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusLabel(status?: string): string {
  const map: Record<string, string> = {
    draft: 'Rascunho', submitted: 'Enviado', approved: 'Aprovado',
    rejected: 'Rejeitado', paid: 'Pago', partially_paid: 'Pago Parcialmente',
  }
  return map[status || ''] || status || '—'
}

function categoryName(categoryId: string): string {
  const cat = categories.value.find(c => c.id === categoryId)
  if (!cat) return '—'
  return cat.icon ? `${cat.icon} ${cat.name}` : cat.name
}

const categorySummary = computed(() => {
  const map: Record<string, { categoryId: string; name: string; count: number; total: number }> = {}
  for (const item of items.value) {
    const name = categoryName(item.category)
    const key = item.category || '__none__'
    if (!map[key]) map[key] = { categoryId: key, name, count: 0, total: 0 }
    map[key].count++
    map[key].total += Number(item.amount) || 0
  }
  return Object.values(map).sort((a, b) => b.total - a.total)
})

const balanceValue = computed(() => (report.value?.total_amount || 0) - (report.value?.advance_amount || 0))
const balanceLabel = computed(() => balanceValue.value >= 0 ? 'Saldo a Reembolsar' : 'Saldo a Devolver')

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    approve: 'Relatório aprovado',
    reject: 'Relatório rejeitado',
    return_for_revision: 'Devolvido para revisão',
    forward: 'Relatório encaminhado',
    pay: 'Marcado como pago',
    partially_pay: 'Parcialmente pago',
    submit: 'Relatório enviado',
  }
  return map[action] || action
}

function actionUserName(action: RecordModel): string {
  const u = action.expand?.user as RecordModel | undefined
  return u?.name || u?.email || action.user || '—'
}

function formatDateTime(value: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const historyEntries = computed(() =>
  [...approvalActions.value].sort((a, b) =>
    new Date(a.created).getTime() - new Date(b.created).getTime()
  )
)

const itemsWithReceipts = computed(() => items.value.filter(i => i.receipt_image || i._imageUrl))
const receiptGroups = computed(() => {
  const groups: RecordModel[][] = []
  const list = itemsWithReceipts.value
  for (let i = 0; i < list.length; i += 4) groups.push(list.slice(i, i + 4))
  return groups
})

async function loadTemplate() {
  const companyId = companyStore.currentCompany?.id
  if (!companyId) return
  try {
    const records = await pb.collection('print_templates').getFullList({
      filter: `company="${companyId}"`,
    })
    if (records.length > 0) {
      const r = records[0]
      template.value = {
        docTitle: r.doc_title || '',
        introText: r.intro_text || '',
        footerText: r.footer_text || '',
        signatureLabel1: r.signature_label_1 || 'Solicitante',
        signatureLabel2: r.signature_label_2 || 'Aprovador',
        signatureLabel3: r.signature_label_3 || '',
        includeReceipts: r.include_receipts ?? true,
      }
    }
  } catch { /* use defaults */ }
}

function triggerPrint() { window.print() }
function goBack() { router.back() }

function loadMockData() {
  report.value = {
    id: 'preview',
    title: 'Viagem Comercial — São Paulo',
    description: 'Despesas referentes à viagem para reuniões com clientes e prospecção de novos parceiros na região metropolitana de SP.',
    status: 'approved',
    period_start: '2025-04-01T00:00:00.000Z',
    period_end: '2025-04-05T00:00:00.000Z',
    cost_center: 'Comercial',
    project: 'Expansão SP',
    total_amount: 180712,
    advance_amount: 30000,
    company: '',
  } as any

  categories.value = [
    { id: 'cat1', name: 'Alimentação', icon: '🍽️' },
    { id: 'cat2', name: 'Transporte', icon: '🚗' },
    { id: 'cat3', name: 'Hospedagem', icon: '🏨' },
    { id: 'cat4', name: 'Material', icon: '📦' },
    { id: 'cat5', name: 'Quilometragem', icon: '📍' },
    { id: 'cat6', name: 'Taxas', icon: '💱' },
  ] as any[]

  const sampleImg = '/app/receipt-sample.png'
  items.value = [
    { id: '1', date: '2025-04-01T00:00:00Z', merchant: 'Restaurante Sabor & Cia', category: 'cat1', description: 'Almoço com cliente', amount: 15620, receipt_image: 'mock', _imageUrl: sampleImg },
    { id: '2', date: '2025-04-01T00:00:00Z', merchant: '99 Táxi', category: 'cat2', description: 'Traslado aeroporto — hotel', amount: 8700, receipt_image: 'mock', _imageUrl: sampleImg },
    { id: '3', date: '2025-04-02T00:00:00Z', merchant: 'Hotel Paulista Inn', category: 'cat3', description: 'Hospedagem 2 noites', amount: 39000, receipt_image: 'mock', _imageUrl: sampleImg },
    { id: '4', date: '2025-04-02T00:00:00Z', merchant: 'Papelaria Central', category: 'cat4', description: 'Material para reunião', amount: 3210, receipt_image: 'mock', _imageUrl: sampleImg },
    { id: '5', date: '2025-04-03T00:00:00Z', merchant: 'Restaurante Sabor & Cia', category: 'cat1', description: 'Jantar com equipe', amount: 21400, receipt_image: 'mock', _imageUrl: sampleImg },
    { id: '6', date: '2025-04-03T00:00:00Z', merchant: '', category: 'cat5', description: 'Visita ao cliente ABC — ida e volta (45 km)', amount: 6750, km: 45, receipt_image: '', _imageUrl: '' },
    { id: '7', date: '2025-04-04T00:00:00Z', merchant: 'Uber', category: 'cat2', description: 'Deslocamento interno', amount: 2300, receipt_image: '', _imageUrl: '' },
    { id: '8', date: '2025-04-04T00:00:00Z', merchant: 'Restaurant Santiago', category: 'cat1', description: 'Jantar com parceiro', amount: 18900, original_currency: 'CLP', original_amount: 27000, conversion_rate: 0.007, currency_note: 'Compra em CLP 27.000', receipt_image: 'mock', _imageUrl: sampleImg },
    { id: '9', date: '2025-04-04T00:00:00Z', merchant: '', category: 'cat6', description: 'IOF compra 27000 CLP', amount: 662, receipt_image: '', _imageUrl: '' },
    { id: '10', date: '2025-04-05T00:00:00Z', merchant: 'Hotel Miami', category: 'cat3', description: 'Hospedagem 1 noite', amount: 62000, original_currency: 'USD', original_amount: 120, conversion_rate: 5.17, currency_note: 'Compra em USD 120.00', receipt_image: 'mock', _imageUrl: sampleImg },
    { id: '11', date: '2025-04-05T00:00:00Z', merchant: '', category: 'cat6', description: 'IOF compra 120 USD', amount: 2170, receipt_image: '', _imageUrl: '' },
  ] as any[]

  approvalActions.value = [
    { id: 'a1', created: '2025-04-05T10:30:00Z', action: 'submit', notes: '', expand: { user: { name: 'João da Silva' } } },
    { id: 'a2', created: '2025-04-06T09:15:00Z', action: 'return_for_revision', notes: 'Falta comprovante da hospedagem', expand: { user: { name: 'Maria Souza' } } },
    { id: 'a3', created: '2025-04-06T14:00:00Z', action: 'submit', notes: 'Comprovante anexado', expand: { user: { name: 'João da Silva' } } },
    { id: 'a4', created: '2025-04-07T11:00:00Z', action: 'approve', notes: '', expand: { user: { name: 'Maria Souza' } } },
    { id: 'a5', created: '2025-04-08T16:30:00Z', action: 'pay', notes: 'Depósito realizado', expand: { user: { name: 'Carlos Oliveira' } } },
  ] as any[]
}

onMounted(async () => {
  if (!companyStore.currentCompany) {
    await companyStore.fetchMyCompanies()
  }
  await loadTemplate()

  if (isPreview.value) {
    loadMockData()
    loading.value = false
    return
  }

  const reportId = route.params.id as string
  try {
    const [reportData, itemsData, actionsData] = await Promise.all([
      pb.collection('expense_reports').getOne(reportId, { expand: 'user' }),
      pb.collection('expense_items').getFullList({
        filter: `report="${reportId}"`,
        sort: 'date',
        expand: 'category',
      }),
      pb.collection('approval_actions').getFullList({
        filter: `report="${reportId}"`,
        sort: '-created',
        expand: 'user',
      }),
    ])
    report.value = reportData
    approvalActions.value = actionsData
    const cats = await pb.collection('categories').getFullList({
      filter: `company="${reportData.company}"`,
      sort: 'name',
    })
    categories.value = cats
    items.value = itemsData.map(item => ({
      ...item,
      _imageUrl: item.receipt_image ? pb.files.getURL(item, item.receipt_image) : '',
    }))
  } catch (e: any) {
    error.value = e?.message || 'Erro ao carregar relatório.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.print-root {
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
  color: #111827;
}

/* Action bar */
.action-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 10px 20px;
}

.action-bar-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.action-bar-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(37,99,235,0.25);
}

.btn-primary:hover { opacity: 0.9; }
.btn-primary .icon { width: 15px; height: 15px; }

.btn-ghost {
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  white-space: nowrap;
}
.btn-ghost:hover { background: #f9fafb; color: #374151; }

/* Print content wrapper */
.print-content {
  padding: 28px 16px;
  max-width: 900px;
  margin: 0 auto;
}

/* A4 page simulation */
.print-page {
  background: white;
  box-shadow: 0 2px 20px rgba(0,0,0,0.08);
  border-radius: 4px;
  margin-bottom: 28px;
  padding: 44px 52px;
  width: 210mm;
  min-height: 270mm;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

/* Page header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 16px;
  margin-bottom: 18px;
  border-bottom: 2px solid #2563eb;
}

.header-left { display: flex; flex-direction: column; gap: 2px; }

.company-name {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.doc-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.header-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }

.status-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 20px;
  background: #dbeafe;
  color: #1d4ed8;
}
.status-badge[data-status="approved"] { background: #d1fae5; color: #065f46; }
.status-badge[data-status="paid"] { background: #ede9fe; color: #5b21b6; }
.status-badge[data-status="rejected"] { background: #fee2e2; color: #991b1b; }
.status-badge[data-status="draft"] { background: #f3f4f6; color: #374151; }

.header-total {
  font-size: 24px;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: -0.02em;
}

/* Info block */
.info-block {
  background: #f8faff;
  border: 1px solid #e0eaff;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 18px;
}

.info-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.info-description {
  font-size: 12px;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.info-item { display: flex; flex-direction: column; gap: 1px; }
.info-label { font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }
.info-value { font-size: 12px; font-weight: 600; color: #374151; }

/* Intro box */
.intro-box {
  font-size: 11.5px;
  color: #374151;
  line-height: 1.65;
  background: #eff6ff;
  border-left: 3px solid #2563eb;
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
  margin-bottom: 18px;
}

/* Section heading */
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #2563eb;
  padding-bottom: 5px;
  border-bottom: 1px solid #dbeafe;
  margin-bottom: 6px;
}

.section-count {
  font-size: 10px;
  font-weight: 600;
  color: #93c5fd;
}

/* Data tables */
.data-table, .summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
}

.data-table th, .summary-table th {
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6b7280;
  padding: 5px 8px;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td, .summary-table td {
  padding: 6px 8px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.data-table tr:last-child td, .summary-table tbody tr:last-child td {
  border-bottom: none;
}

.col-amount { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
.col-num { text-align: center; }
.col-date { white-space: nowrap; color: #6b7280; }
.col-cat { white-space: nowrap; }
.col-receipt-icon { width: 20px; text-align: center; padding: 0 4px; }
.no-receipt-icon { width: 14px; height: 14px; color: #9ca3af; display: inline-block; vertical-align: middle; }
.col-notes { color: #6b7280; font-size: 11px; }

.history-section {
  margin-top: 20px;
}

.history-table td {
  font-size: 11px;
}
.col-desc { color: #6b7280; font-size: 11px; }
.currency-note { font-size: 9px; color: #9ca3af; margin-top: 2px; }
.empty-row { text-align: center; color: #9ca3af; font-style: italic; padding: 16px; }

.summary-table .foot-total td {
  font-weight: 700;
  font-size: 12px;
  color: #111827;
  border-top: 2px solid #e5e7eb;
  border-bottom: none;
  padding-top: 8px;
}

.summary-table .foot-sub td {
  font-size: 11px;
  color: #6b7280;
  border-bottom: none;
}

.summary-table .foot-balance td {
  font-weight: 800;
  font-size: 12px;
  color: #2563eb;
  border-bottom: none;
}

/* Footer box */
.footer-box {
  font-size: 11.5px;
  color: #374151;
  line-height: 1.6;
  border: 1px dashed #d1d5db;
  padding: 10px 14px;
  border-radius: 6px;
  background: #fafafa;
  margin-top: 20px;
}

/* Signatures */
.signatures {
  display: flex;
  gap: 20px;
  margin-top: 36px;
  padding-top: 0;
}

.sig-field { flex: 1; text-align: center; }
.sig-line { border-bottom: 1px solid #374151; height: 40px; margin-bottom: 6px; }
.sig-label { font-size: 10px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.08em; }
.sig-date { font-size: 10px; color: #9ca3af; margin-top: 3px; }

/* Page footer */
.page-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 10px;
  color: #d1d5db;
  border-top: 1px solid #f3f4f6;
  padding-top: 8px;
}

/* Receipts page */
.receipts-page {
  padding: 28px 36px;
  min-height: 270mm;
  display: flex;
  flex-direction: column;
}

.receipts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 2px solid #2563eb;
  flex-shrink: 0;
}

.receipts-company { font-size: 11px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.08em; }
.receipts-label { font-size: 11px; color: #6b7280; }

.receipts-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  min-height: 0;
}

.receipt-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
  min-height: 0;
}

.receipt-card-empty {
  border: none;
}

.receipt-img-wrap {
  flex: 1;
  min-height: 0;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.receipt-img { width: 100%; height: 100%; object-fit: contain; display: block; }
.receipt-no-img { color: #9ca3af; font-size: 11px; font-style: italic; }

.receipt-meta {
  padding: 8px 10px;
  border-top: 1px solid #f3f4f6;
  background: white;
  flex-shrink: 0;
}

.receipt-meta-row {
  display: flex;
  gap: 4px;
  font-size: 10px;
  color: #374151;
  margin-bottom: 2px;
  flex-wrap: wrap;
}

.meta-key { font-weight: 700; color: #2563eb; white-space: nowrap; min-width: 56px; }
.receipt-value { font-weight: 700; font-size: 11px; color: #111827; margin-top: 3px; }

/* Print styles */
@media print {
  @page { size: A4 portrait; margin: 10mm 12mm; }

  .no-print { display: none !important; }

  .print-root { background: white; }

  .print-content { padding: 0; max-width: none; }

  .print-page {
    box-shadow: none;
    border-radius: 0;
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: unset;
    page-break-after: always;
  }

  .print-page:last-child { page-break-after: auto; }

  .receipts-page {
    padding: 10mm 12mm;
    height: 277mm;
    min-height: unset;
  }

  .receipts-grid {
    height: calc(277mm - 36px);
    min-height: unset;
  }
}
</style>
