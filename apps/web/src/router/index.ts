import { createRouter, createWebHistory } from 'vue-router'
import pb from '../services/pocketbase'
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
import CategoriesView from '../views/CategoriesView.vue'
import AddExpenseView from '../views/AddExpenseView.vue'

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
      path: '/company/:slug',
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
          path: 'company',
          name: 'company-list',
          component: CompaniesListView,
        },
        {
          path: 'company/edit/:id',
          name: 'company-edit',
          component: CompanySetupView,
        },
        {
          path: 'company/members',
          name: 'company-members',
          component: CompanyMembersView,
        },
        {
          path: 'reports',
          name: 'expense-reports',
          component: ExpenseReportsView,
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
          path: 'expenses/new',
          name: 'add-expense',
          component: AddExpenseView,
        },
        {
          path: 'categories',
          name: 'categories',
          component: CategoriesView,
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

  if (needsAuth && !isAuthenticated) {
    next('/login')
  } else if (needsGuest && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
