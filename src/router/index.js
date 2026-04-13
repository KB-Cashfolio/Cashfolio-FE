import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/home/HomeView.vue'
import TransactionHistoryView from '@/transaction-history/TransactionHistoryView.vue'
import ProfileView from '@/profile/ProfileView.vue'
import LoginView from '@/login/LoginView.vue'
import RegisterView from '@/login/register/RegisterView.vue'
import StepperForm from '@/login/register/StepperForm.vue'
import TransactionsView from '@/transaction-history/TransactionsView.vue'
import ChartView from '@/chart/ChartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/transaction-history',
      name: 'transaction-history',
      component: TransactionHistoryView,
    },
    {
      path: '/chart',
      name: 'chart',
      component: ChartView,
    },
    {
      path: '/updateTx',
      name: 'updateTx',
      component: TransactionsView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/StepperForm',
      name: 'StepperForm',
      component: StepperForm,
    },
  ],
})

export default router
