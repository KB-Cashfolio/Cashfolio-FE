import api from './index'
import { AUTH_MESSAGES } from '@/utils/ErrorMessage'

// 유저/계좌 서비스
export const userService = {
  getUser: (id) => api.get(`/users/${id}`),
  updateUsername: (id, newUsername) => api.patch(`/users/${id}`, { username: newUsername }),
  updateEmail: (id, newEmail) => api.patch(`/users/${id}`, { email: newEmail }),
  updateAccount: (id, data) => api.patch(`/users/${id}`, data),
}

export const accountService = {
  getAccountsByUserId: (userId) => api.get(`/accounts?user_id=${String(userId)}`),
}

// 캐릭터 서비스
export const characterService = {
  getCharacterList: () => api.get('/beggars'),
  increaseExp: (id, amount) => api.patch(`/users/${id}`, { current_exp: amount }),
}

// 인증 서비스 (핵심 리팩토링)
export const authService = {
  async login(email, password) {
    const response = await api.get(`/users?email=${email}&password=${password}`)
    const user = response.data[0]

    if (!user) {
      // ❌ success: false 대신 에러를 던짐
      throw new Error(AUTH_MESSAGES.LOGIN_FAILED)
    }

    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    return userWithoutPassword // ✅ 데이터만 깔끔하게 반환
  },

  logout() {
    localStorage.removeItem('user')
  },

  async register(userData) {
    const checkRes = await api.get(`/users?email=${userData.email}`)

    if (checkRes.data.length > 0) {
      throw new Error(AUTH_MESSAGES.DUPLICATE_EMAIL)
    }

    const res = await api.post('/users', {
      ...userData,
      beg_level: 1,
      current_exp: 0,
      monthly_limit: 0,
      total_income: 0,
      total_expense: 0,
    })

    const { password, ...userWithoutPassword } = res.data
    localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    return userWithoutPassword
  },

  getCurrentUser: () => JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: () => !!localStorage.getItem('user'),
}

// 거래 내역 서비스
export const transactionService = {
  getTransactions: (userId) => api.get(`/transactions?user_id=${userId}&_sort=id&_order=desc`),
  addTransaction: (data) => api.post('/transactions', data),
  getTransactionsByDate: (userId, date) => api.get(`/transactions?user_id=${userId}&date=${date}`),
}
