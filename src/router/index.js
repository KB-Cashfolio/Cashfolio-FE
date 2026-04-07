import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/home/HomeView.vue'
import TransactionHistoryView from '@/transaction-history/TransactionHistoryView.vue'
import ProfileView from '@/profile/ProfileView.vue'

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
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
  ],
})

export default router
