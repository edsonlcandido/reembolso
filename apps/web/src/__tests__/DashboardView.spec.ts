import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

// Mock do PocketBase para evitar chamadas de rede nos testes
vi.mock('../services/pocketbase', () => ({
  default: {
    authStore: {
      record: { id: 'user-1' },
      isValid: true,
      token: '',
      onChange: vi.fn(),
      clear: vi.fn(),
    },
    collection: () => ({
      getList: vi.fn().mockResolvedValue({ items: [], totalItems: 0 }),
      getFullList: vi.fn().mockResolvedValue([]),
      authRefresh: vi.fn().mockResolvedValue({}),
    }),
    send: vi.fn().mockResolvedValue({}),
  },
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/reports', name: 'reports', component: { template: '<div />' } },
    { path: '/reports/new', name: 'reports-new', component: { template: '<div />' } },
    { path: '/reports/:id', name: 'report-detail', component: { template: '<div />' } },
    { path: '/companies', name: 'companies', component: { template: '<div />' } },
    { path: '/companies/members', name: 'company-members', component: { template: '<div />' } },
    { path: '/categories', name: 'categories', component: { template: '<div />' } },
  ],
})

function mountDashboard(authState = {}, companyState = {}) {
  return mount(DashboardView, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            auth: {
              user: { id: 'user-1', name: 'João Silva', email: 'joao@teste.com' },
              ...authState,
            },
            company: {
              currentCompany: null,
              currentUserRole: 'employee',
              companies: [],
              loading: false,
              ...companyState,
            },
          },
        }),
        router,
      ],
      stubs: {
        ChartBarIcon: true,
        DocumentTextIcon: true,
        CurrencyDollarIcon: true,
        ClockIcon: true,
        CheckCircleIcon: true,
        PlusCircleIcon: true,
        UsersIcon: true,
        TagIcon: true,
        BuildingOfficeIcon: true,
        ExclamationTriangleIcon: true,
      },
    },
  })
}

// Testa funções puras expostas via vm (helpers de formatação e status)
describe('DashboardView.vue — funções utilitárias', () => {
  let wrapper: ReturnType<typeof mountDashboard>

  beforeEach(async () => {
    wrapper = mountDashboard()
    await router.isReady()
  })

  describe('formatCurrency', () => {
    it('formata centavos em reais com símbolo BRL', () => {
      const vm = wrapper.vm as any
      expect(vm.formatCurrency(100)).toMatch(/R\$\s*1[,.]00/)
    })

    it('formata valor zero', () => {
      const vm = wrapper.vm as any
      expect(vm.formatCurrency(0)).toMatch(/R\$\s*0[,.]00/)
    })

    it('formata valor com centavos', () => {
      const vm = wrapper.vm as any
      expect(vm.formatCurrency(1550)).toMatch(/15[,.]50/)
    })

    it('formata valores maiores corretamente', () => {
      const vm = wrapper.vm as any
      const result = vm.formatCurrency(100000)
      expect(result).toMatch(/1[.]000/)
    })
  })

  describe('formatDate', () => {
    it('formata data ISO no padrão brasileiro', () => {
      const vm = wrapper.vm as any
      expect(vm.formatDate('2024-03-15')).toMatch(/15\/03\/2024/)
    })

    it('formata outra data corretamente', () => {
      const vm = wrapper.vm as any
      expect(vm.formatDate('2025-01-01')).toMatch(/01\/01\/2025/)
    })
  })

  describe('statusLabel', () => {
    it('retorna "Rascunho" para status "draft"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusLabel('draft')).toBe('Rascunho')
    })

    it('retorna "Enviado" para status "submitted"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusLabel('submitted')).toBe('Enviado')
    })

    it('retorna "Aprovado" para status "approved"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusLabel('approved')).toBe('Aprovado')
    })

    it('retorna "Rejeitado" para status "rejected"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusLabel('rejected')).toBe('Rejeitado')
    })

    it('retorna "Pago" para status "paid"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusLabel('paid')).toBe('Pago')
    })

    it('retorna o próprio status para valores desconhecidos', () => {
      const vm = wrapper.vm as any
      expect(vm.statusLabel('unknown_status')).toBe('unknown_status')
    })
  })

  describe('statusClass', () => {
    it('retorna classe cinza para status "draft"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusClass('draft')).toContain('bg-gray-100')
    })

    it('retorna classe azul para status "submitted"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusClass('submitted')).toContain('bg-blue-100')
    })

    it('retorna classe verde para status "approved"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusClass('approved')).toContain('bg-green-100')
    })

    it('retorna classe vermelha para status "rejected"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusClass('rejected')).toContain('bg-red-100')
    })

    it('retorna classe roxa para status "paid"', () => {
      const vm = wrapper.vm as any
      expect(vm.statusClass('paid')).toContain('bg-purple-100')
    })

    it('retorna classe cinza para status desconhecido', () => {
      const vm = wrapper.vm as any
      expect(vm.statusClass('outro')).toContain('bg-gray-100')
    })
  })
})

describe('DashboardView.vue — computeds e renderização', () => {
  describe('userName', () => {
    it('exibe o nome do usuário autenticado', async () => {
      const wrapper = mountDashboard({ user: { id: 'u1', name: 'Maria Oliveira', email: 'm@t.com' } })
      await router.isReady()
      await flushPromises()
      expect(wrapper.text()).toContain('Maria Oliveira')
    })

    it('exibe o e-mail quando o usuário não tem nome', async () => {
      const wrapper = mountDashboard({ user: { id: 'u1', name: '', email: 'sem-nome@t.com' } })
      await router.isReady()
      await flushPromises()
      expect(wrapper.text()).toContain('sem-nome@t.com')
    })
  })

  describe('empresa não configurada', () => {
    it('exibe o banner de empresa não configurada quando não há empresa', async () => {
      const wrapper = mountDashboard({}, { currentCompany: null })
      await router.isReady()
      await flushPromises()
      expect(wrapper.text()).toContain('Empresa não configurada')
    })
  })

  describe('isAdmin', () => {
    it('exibe ações de admin quando o papel é "admin"', async () => {
      const company = { id: 'c1', name: 'Empresa Admin', plan: 'FREE' }
      const wrapper = mountDashboard(
        {},
        { currentCompany: company, currentUserRole: 'admin' }
      )
      await router.isReady()
      await flushPromises()
      expect(wrapper.text()).toContain('Equipe')
    })

    it('não exibe ações de admin quando o papel é "employee"', async () => {
      const company = { id: 'c1', name: 'Empresa Func', plan: 'FREE' }
      const wrapper = mountDashboard(
        {},
        { currentCompany: company, currentUserRole: 'employee' }
      )
      await router.isReady()
      await flushPromises()
      expect(wrapper.text()).not.toContain('Equipe')
    })
  })

  describe('cycleUsagePercent e cycleUsageColor', () => {
    it('cycleUsagePercent é 0 quando não há relatórios no ciclo', () => {
      const wrapper = mountDashboard()
      const vm = wrapper.vm as any
      vm.cycleReportsCount = 0
      expect(vm.cycleUsagePercent).toBe(0)
    })

    it('cycleUsagePercent é 100 quando atinge o limite', () => {
      const wrapper = mountDashboard()
      const vm = wrapper.vm as any
      vm.cycleReportsCount = 5 // FREE_PLAN_LIMIT = 5
      expect(vm.cycleUsagePercent).toBe(100)
    })

    it('cycleUsagePercent não ultrapassa 100', () => {
      const wrapper = mountDashboard()
      const vm = wrapper.vm as any
      vm.cycleReportsCount = 10
      expect(vm.cycleUsagePercent).toBe(100)
    })

    it('cycleUsageColor é "bg-blue-500" abaixo de 80%', () => {
      const wrapper = mountDashboard()
      const vm = wrapper.vm as any
      vm.cycleReportsCount = 3 // 60%
      expect(vm.cycleUsageColor).toBe('bg-blue-500')
    })

    it('cycleUsageColor é "bg-amber-500" entre 80% e 99%', () => {
      const wrapper = mountDashboard()
      const vm = wrapper.vm as any
      vm.cycleReportsCount = 4 // 80%
      expect(vm.cycleUsageColor).toBe('bg-amber-500')
    })

    it('cycleUsageColor é "bg-red-500" em 100%', () => {
      const wrapper = mountDashboard()
      const vm = wrapper.vm as any
      vm.cycleReportsCount = 5 // 100%
      expect(vm.cycleUsageColor).toBe('bg-red-500')
    })
  })

  describe('isFreePlan', () => {
    it('considera plano gratuito quando plan é undefined', () => {
      const wrapper = mountDashboard(
        {},
        { currentCompany: { id: 'c1', name: 'Empresa' } }
      )
      const vm = wrapper.vm as any
      expect(vm.isFreePlan).toBe(true)
    })

    it('considera plano gratuito quando plan é "FREE"', () => {
      const wrapper = mountDashboard(
        {},
        { currentCompany: { id: 'c1', name: 'Empresa', plan: 'FREE' } }
      )
      const vm = wrapper.vm as any
      expect(vm.isFreePlan).toBe(true)
    })

    it('não considera plano gratuito quando plan é "PRO"', () => {
      const wrapper = mountDashboard(
        {},
        { currentCompany: { id: 'c1', name: 'Empresa', plan: 'PRO' } }
      )
      const vm = wrapper.vm as any
      expect(vm.isFreePlan).toBe(false)
    })
  })
})
