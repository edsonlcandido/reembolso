import { createRouter, createWebHistory } from 'vue-router'
import pb from '../services/pocketbase'
import { useCompanyStore } from '../stores/company'
import LoginView from '../views/LoginView.vue'
import CompanyAuthView from '../views/CompanyAuthView.vue'
import AppLayout from '../layouts/AppLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import CompaniesListView from '../views/CompaniesListView.vue'
import CompanySetupView from '../views/CompanySetupView.vue'
import CompanyMembersView from '../views/CompanyMembersView.vue'
import ExpenseReportsView from '../views/ExpenseReportsView.vue'
import ExpenseReportDetailView from '../views/ExpenseReportDetailView.vue'
import CreateExpenseReportView from '../views/CreateExpenseReportView.vue'
import EditExpenseReportView from '../views/EditExpenseReportView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import AddExpenseView from '../views/AddExpenseView.vue'
import ApprovalsView from '../views/ApprovalsView.vue'

const router = createRouter({
  history: createWebHistory('/app/'),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/companies/:slug',
      name: 'company-auth',
      component: CompanyAuthView,
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView,
        },
        {
          path: 'companies',
          name: 'companies-list',
          component: CompaniesListView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'companies/:id/edit',
          name: 'companies-edit',
          component: CompanySetupView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'companies/members',
          name: 'companies-members',
          component: CompanyMembersView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'reports',
          name: 'expense-reports',
          component: ExpenseReportsView,
        },
        {
          path: 'approvals',
          name: 'approvals',
          component: ApprovalsView,
        },
        {
          path: 'reports/new',
          name: 'create-expense-report',
          component: CreateExpenseReportView,
        },
        {
          path: 'reports/:id',
          name: 'expense-report-detail',
          component: ExpenseReportDetailView,
        },
        {
          path: 'reports/:id/edit',
          name: 'edit-expense-report',
          component: EditExpenseReportView,
        },
        {
          path: 'expenses/new',
          name: 'add-expense',
          component: AddExpenseView,
        },
        {
          path: 'categories',
          name: 'categories',
          component: CategoriesView,
          meta: { requiresAdmin: true },
        },
      ],
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  let isAuthenticated = pb.authStore.isValid && !!pb.authStore.record

  if (to.meta.requiresAuth && isAuthenticated) {
    try {
      await pb.collection('users').authRefresh()
    } catch (error) {
      pb.authStore.clear()
      isAuthenticated = false
    }
  }

  const needsAuth = to.matched.some(record => record.meta.requiresAuth)
  const needsGuest = to.matched.some(record => record.meta.requiresGuest)
  const needsAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (needsAuth && !isAuthenticated) {
    next('/login')
  } else if (needsGuest && isAuthenticated) {
    next('/dashboard')
  } else if (needsAdmin && isAuthenticated) {
    const companyStore = useCompanyStore()
    if (companyStore.companies.length === 0) {
      await companyStore.fetchMyCompanies()
    }
    // Allow users with no companies to create their first company.
    // Block only when user has companies but is not admin.
    if (companyStore.companies.length > 0 && companyStore.currentUserRole !== 'admin') {
      next('/dashboard')
      return
    }
    next()
  } else {
    next()
  }
})

export default router
