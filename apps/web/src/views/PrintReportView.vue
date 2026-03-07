<template>
  <div class="print-root">
    <div v-if="loading" class="no-print flex items-center justify-center min-h-screen">
      <p class="text-gray-500 text-lg">Carregando relatório...</p>
    </div>

    <div v-else-if="error" class="no-print flex items-center justify-center min-h-screen">
      <p class="text-red-500 text-lg">{{ error }}</p>
    </div>

    <template v-else>
      <div class="no-print action-bar">
        <div class="action-bar-inner">
          <button @click="goBack" class="btn-secondary">
            ← Voltar
          </button>
          <span class="report-title-preview">{{ report?.title }}</span>
          <button @click="triggerPrint" class="btn-primary">
            🖨️ Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      <div class="print-content">
        <div class="print-page report-page">
          <div class="report-header">
            <div class="report-header-company">{{ companyName }}</div>
            <div class="report-header-title">RELATÓRIO DE DESPESAS</div>
            <div class="report-header-sub">{{ report?.title }}</div>
          </div>

          <div class="report-meta-grid">
            <div class="report-meta-item">
              <span class="report-meta-label">Colaborador</span>
              <span class="report-meta-value">{{ employeeName }}</span>
            </div>
            <div class="report-meta-item">
              <span class="report-meta-label">Status</span>
              <span class="report-meta-value">{{ statusLabel(report?.status) }}</span>
            </div>
            <div v-if="report?.period_start || report?.period_end" class="report-meta-item">
              <span class="report-meta-label">Período</span>
              <span class="report-meta-value">
                <template v-if="report?.period_start">{{ formatDate(report.period_start) }}</template>
                <template v-if="report?.period_start && report?.period_end"> — </template>
                <template v-if="report?.period_end">{{ formatDate(report.period_end) }}</template>
              </span>
            </div>
            <div v-if="report?.cost_center" class="report-meta-item">
              <span class="report-meta-label">Centro de Custo</span>
              <span class="report-meta-value">{{ report.cost_center }}</span>
            </div>
            <div v-if="report?.project" class="report-meta-item">
              <span class="report-meta-label">Projeto</span>
              <span class="report-meta-value">{{ report.project }}</span>
            </div>
            <div v-if="report?.advance_amount" class="report-meta-item">
              <span class="report-meta-label">Adiantamento</span>
              <span class="report-meta-value">{{ formatCurrency(report.advance_amount) }}</span>
            </div>
          </div>

          <div v-if="template.introText" class="intro-text">
            {{ template.introText }}
          </div>

          <div class="section-title">Despesas</div>
          <table class="expenses-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Estabelecimento</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th class="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td class="nowrap">{{ formatDate(item.date) }}</td>
                <td>{{ item.merchant || '—' }}</td>
                <td class="nowrap">{{ categoryName(item.category) }}</td>
                <td>{{ item.description || item.notes || '—' }}</td>
                <td class="text-right nowrap">{{ formatCurrency(item.amount) }}</td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="5" class="text-center text-gray-500">Nenhuma despesa registrada.</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title" style="margin-top: 24px;">Resumo por Categoria</div>
          <table class="summary-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th class="text-right">Qtd</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in categorySummary" :key="row.categoryId">
                <td>{{ row.name }}</td>
                <td class="text-right">{{ row.count }}</td>
                <td class="text-right nowrap">{{ formatCurrency(row.total) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2">Total Geral</td>
                <td class="text-right nowrap">{{ formatCurrency(report?.total_amount || 0) }}</td>
              </tr>
              <tr v-if="report?.advance_amount" class="total-row">
                <td colspan="2">Adiantamento</td>
                <td class="text-right nowrap">{{ formatCurrency(report.advance_amount) }}</td>
              </tr>
              <tr v-if="report?.advance_amount" class="balance-row">
                <td colspan="2">{{ balanceLabel }}</td>
                <td class="text-right nowrap">{{ formatCurrency(Math.abs(balanceValue)) }}</td>
              </tr>
            </tfoot>
          </table>

          <div v-if="template.footerText" class="footer-text">
            {{ template.footerText }}
          </div>

          <div class="signatures-area">
            <div v-if="template.signatureLabel1" class="signature-field">
              <div class="signature-line" />
              <div class="signature-label">{{ template.signatureLabel1 }}</div>
              <div class="signature-date">Data: ___/___/______</div>
            </div>
            <div v-if="template.signatureLabel2" class="signature-field">
              <div class="signature-line" />
              <div class="signature-label">{{ template.signatureLabel2 }}</div>
              <div class="signature-date">Data: ___/___/______</div>
            </div>
            <div v-if="template.signatureLabel3" class="signature-field">
              <div class="signature-line" />
              <div class="signature-label">{{ template.signatureLabel3 }}</div>
              <div class="signature-date">Data: ___/___/______</div>
            </div>
          </div>

          <div class="print-footer">
            Documento gerado em {{ printDate }}
          </div>
        </div>

        <template v-if="template.includeReceipts && itemsWithReceipts.length > 0">
          <div
            v-for="(group, groupIndex) in receiptGroups"
            :key="groupIndex"
            class="print-page receipts-page"
          >
            <div class="receipts-page-header">
              <span class="receipts-page-company">{{ companyName }}</span>
              <span class="receipts-page-report">{{ report?.title }} — Comprovantes ({{ groupIndex + 1 }}/{{ receiptGroups.length }})</span>
            </div>

            <div class="receipts-grid">
              <div v-for="item in group" :key="item.id" class="receipt-cell">
                <div class="receipt-image-wrapper">
                  <img
                    v-if="item._imageUrl"
                    :src="item._imageUrl"
                    :alt="`Comprovante - ${item.merchant || item.description}`"
                    class="receipt-image"
                  />
                  <div v-else class="receipt-no-image">Sem imagem</div>
                </div>
                <div class="receipt-info">
                  <div class="receipt-info-row">
                    <span class="receipt-info-label">Data:</span>
                    <span>{{ formatDate(item.date) }}</span>
                  </div>
                  <div class="receipt-info-row">
                    <span class="receipt-info-label">Estabelecimento:</span>
                    <span>{{ item.merchant || '—' }}</span>
                  </div>
                  <div class="receipt-info-row">
                    <span class="receipt-info-label">Categoria:</span>
                    <span>{{ categoryName(item.category) }}</span>
                  </div>
                  <div v-if="item.description" class="receipt-info-row">
                    <span class="receipt-info-label">Descrição:</span>
                    <span>{{ item.description }}</span>
                  </div>
                  <div class="receipt-info-row receipt-amount">
                    <span class="receipt-info-label">Valor:</span>
                    <span>{{ formatCurrency(item.amount) }}</span>
                  </div>
                </div>
              </div>

              <div v-for="n in (4 - group.length)" :key="`empty-${n}`" class="receipt-cell receipt-cell-empty" />
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

const report = ref<RecordModel | null>(null)
const items = ref<RecordModel[]>([])
const categories = ref<RecordModel[]>([])
const loading = ref(true)
const error = ref('')

const template = ref({
  introText: '',
  footerText: '',
  signatureLabel1: 'Solicitante',
  signatureLabel2: 'Aprovador',
  signatureLabel3: '',
  includeReceipts: true,
})

const companyName = computed(() => companyStore.currentCompany?.name || 'Empresa')
const employeeName = computed(() => {
  const u = report.value?.expand?.user
  if (!u) return '—'
  return u.name || u.email || '—'
})

const printDate = computed(() => new Date().toLocaleString('pt-BR'))

function formatDate(value: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-BR')
}

function formatCurrency(value: number): string {
  return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Rascunho',
    submitted: 'Enviado para Aprovação',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    paid: 'Pago',
    partially_paid: 'Pago Parcialmente',
  }
  return map[status] || status || '—'
}

function categoryName(categoryId: string): string {
  const cat = categories.value.find(c => c.id === categoryId)
  if (!cat) return '—'
  return cat.icon ? `${cat.icon} ${cat.name}` : cat.name
}

const categorySummary = computed(() => {
  const map: Record<string, { categoryId: string; name: string; count: number; total: number }> = {}
  for (const item of items.value) {
    const cat = categories.value.find(c => c.id === item.category)
    const name = cat ? (cat.icon ? `${cat.icon} ${cat.name}` : cat.name) : 'Sem Categoria'
    const key = item.category || '__none__'
    if (!map[key]) {
      map[key] = { categoryId: key, name, count: 0, total: 0 }
    }
    map[key].count++
    map[key].total += Number(item.amount) || 0
  }
  return Object.values(map).sort((a, b) => b.total - a.total)
})

const balanceValue = computed(() => {
  const total = report.value?.total_amount || 0
  const advance = report.value?.advance_amount || 0
  return total - advance
})

const balanceLabel = computed(() => {
  return balanceValue.value >= 0 ? 'Saldo a Reembolsar' : 'Saldo a Devolver'
})

const itemsWithReceipts = computed(() =>
  items.value.filter(i => i.receipt_image)
)

const receiptGroups = computed(() => {
  const groups: RecordModel[][] = []
  const list = itemsWithReceipts.value
  for (let i = 0; i < list.length; i += 4) {
    groups.push(list.slice(i, i + 4))
  }
  return groups
})

function loadTemplate() {
  const key = `print_template_${companyStore.currentCompany?.id || 'default'}`
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      template.value = { ...template.value, ...parsed }
    }
  } catch {
    // use defaults
  }
}

function triggerPrint() {
  window.print()
}

function goBack() {
  router.back()
}

onMounted(async () => {
  const reportId = route.params.id as string

  if (!companyStore.currentCompany) {
    await companyStore.fetchMyCompanies()
  }

  loadTemplate()

  try {
    const [reportData, itemsData] = await Promise.all([
      pb.collection('expense_reports').getOne(reportId, { expand: 'user' }),
      pb.collection('expense_items').getFullList({
        filter: `report="${reportId}"`,
        sort: 'date',
        expand: 'category',
      }),
    ])

    report.value = reportData

    const companyId = reportData.company
    const cats = await pb.collection('categories').getFullList({
      filter: `company="${companyId}"`,
      sort: 'name',
    })
    categories.value = cats

    const enriched = itemsData.map(item => ({
      ...item,
      _imageUrl: item.receipt_image
        ? pb.files.getURL(item, item.receipt_image)
        : '',
    }))
    items.value = enriched
  } catch (e: any) {
    error.value = e?.message || 'Erro ao carregar relatório.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.print-root {
  font-family: 'Georgia', serif;
  background: #f3f4f6;
  min-height: 100vh;
}

.action-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.action-bar-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.report-title-preview {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(to right, #2563eb, #7c3aed);
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37,99,235,0.3);
  white-space: nowrap;
}

.btn-primary:hover {
  opacity: 0.92;
}

.btn-secondary {
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  cursor: pointer;
  white-space: nowrap;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.print-content {
  padding: 32px 24px;
  max-width: 960px;
  margin: 0 auto;
}

.print-page {
  background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  margin-bottom: 32px;
  padding: 48px 56px;
  min-height: 297mm;
  width: 210mm;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.report-header {
  text-align: center;
  border-bottom: 2px solid #1e3a5f;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.report-header-company {
  font-size: 13px;
  font-weight: bold;
  color: #1e3a5f;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.report-header-title {
  font-size: 20px;
  font-weight: bold;
  color: #111827;
  letter-spacing: 0.04em;
}

.report-header-sub {
  font-size: 14px;
  color: #4b5563;
  margin-top: 4px;
}

.report-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  margin-bottom: 20px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.report-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.report-meta-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
}

.report-meta-value {
  font-size: 13px;
  color: #111827;
  font-weight: 500;
}

.intro-text {
  font-size: 12px;
  color: #374151;
  font-style: italic;
  border-left: 3px solid #2563eb;
  padding: 8px 12px;
  margin-bottom: 20px;
  background: #eff6ff;
  border-radius: 0 4px 4px 0;
  line-height: 1.6;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1e3a5f;
  border-bottom: 1px solid #1e3a5f;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.expenses-table,
.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.expenses-table th,
.summary-table th {
  background: #1e3a5f;
  color: white;
  font-weight: 600;
  padding: 6px 10px;
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.expenses-table td,
.summary-table td {
  padding: 6px 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  vertical-align: top;
}

.expenses-table tr:nth-child(even) td,
.summary-table tbody tr:nth-child(even) td {
  background: #f9fafb;
}

.summary-table tfoot .total-row td {
  font-weight: 700;
  font-size: 12px;
  border-top: 2px solid #1e3a5f;
  border-bottom: none;
  padding-top: 8px;
  color: #111827;
}

.summary-table tfoot .balance-row td {
  font-weight: 700;
  font-size: 12px;
  color: #1e3a5f;
  border-bottom: none;
}

.text-right {
  text-align: right;
}

.nowrap {
  white-space: nowrap;
}

.footer-text {
  font-size: 12px;
  color: #374151;
  margin-top: 24px;
  padding: 12px 16px;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  background: #fafafa;
  line-height: 1.6;
}

.signatures-area {
  display: flex;
  gap: 24px;
  margin-top: 40px;
  padding-top: 16px;
}

.signature-field {
  flex: 1;
  text-align: center;
}

.signature-line {
  border-bottom: 1px solid #374151;
  margin-bottom: 6px;
  height: 40px;
}

.signature-label {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.signature-date {
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
}

.print-footer {
  margin-top: 32px;
  font-size: 10px;
  color: #9ca3af;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
}

/* Receipts page */
.receipts-page {
  padding: 32px 40px;
}

.receipts-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #1e3a5f;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.receipts-page-company {
  font-size: 11px;
  font-weight: 700;
  color: #1e3a5f;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.receipts-page-report {
  font-size: 11px;
  color: #4b5563;
}

.receipts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  height: calc(100% - 60px);
}

.receipt-cell {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.receipt-cell-empty {
  background: #f9fafb;
  border-style: dashed;
}

.receipt-image-wrapper {
  flex: 1;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  max-height: 200px;
}

.receipt-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.receipt-no-image {
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
}

.receipt-info {
  padding: 8px 10px;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.receipt-info-row {
  display: flex;
  gap: 4px;
  font-size: 10px;
  color: #374151;
  margin-bottom: 2px;
  flex-wrap: wrap;
}

.receipt-info-label {
  font-weight: 700;
  color: #1e3a5f;
  white-space: nowrap;
}

.receipt-amount {
  font-weight: 700;
  font-size: 11px;
  margin-top: 4px;
  color: #111827;
}

/* Print media */
@media print {
  @page {
    size: A4;
    margin: 10mm 12mm;
  }

  .no-print {
    display: none !important;
  }

  .print-root {
    background: white;
    min-height: unset;
  }

  .print-content {
    padding: 0;
    max-width: none;
  }

  .print-page {
    box-shadow: none;
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: unset;
    page-break-after: always;
  }

  .print-page:last-child {
    page-break-after: auto;
  }

  .receipts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 10px;
    height: 240mm;
  }

  .receipt-image-wrapper {
    max-height: 160px;
  }
}
</style>
