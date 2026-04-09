import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/home/HomeView.vue'
import TransactionHistoryView from '@/transaction-history/TransactionHistoryView.vue'
import ProfileView from '@/profile/ProfileView.vue'
import LoginView from '@/login/LoginView.vue'
import RegistarView from '@/login/registar/RegistarView.vue'
import StepperForm from '@/login/registar/StepperForm.vue'
import TransactionsView from '@/transaction-history/TransactionsView.vue'

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
      name: 'logine',
      component: LoginView,
    },
    {
      path: '/registar',
      name: 'registar',
      component: RegistarView,
    },
    {
      path: '/StepperForm',
      name: 'StepperForm',
      component: StepperForm,
    },
  ],
})

export default router
