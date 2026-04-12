import api from './index'
import { AppError } from '@/utils/AppError'
import { ERROR_CODES } from '@/utils/errorCodes'

/* =========================
   💰 거래 서비스
========================= */
export const transactionService = {
  async getTransactions(userId) {
    if (!userId) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: '유저 ID 필요',
      })
    }

    return await api.get(`/transactions?user_id=${userId}`)
  },

  async addTransaction(data) {
    if (!data) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: '데이터 필요',
      })
    }

    return await api.post('/transactions', data)
  },

  async getTransactionsByDate(userId, date) {
    if (!userId || !date) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'userId, date 필요',
      })
    }

    return await api.get(
      `/transactions?user_id=${userId}&date=${date}`
    )
  },

  async getTodayExpenses(userId, date) {
    return await api.get(
      `/transactions?user_id=${userId}&date=${date}`
    )
  },
}