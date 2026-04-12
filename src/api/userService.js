import api from './index'
import { AppError } from '@/utils/AppError'
import { ERROR_CODES } from '@/utils/errorCodes'

/* =========================
   👤 사용자 서비스
========================= */
export const userService = {
  async getUser(id) {
    if (!id) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: '사용자 ID가 필요합니다.',
        level: 'warning',
      })
    }

    return await api.get(`/users/${id}`)
  },

  async updateUsername(id, newUsername) {
    if (!newUsername || newUsername.trim().length < 2) {
      throw new AppError({
        code: ERROR_CODES.INVALID_INPUT,
        message: '아이디는 2자 이상이어야 합니다.',
        level: 'warning',
      })
    }

    return await api.patch(`/users/${id}`, {
      username: newUsername,
    })
  },

  async updateEmail(id, newEmail) {
    if (!newEmail) {
      throw new AppError({
        code: ERROR_CODES.INVALID_INPUT,
        message: '이메일을 입력해주세요.',
        level: 'warning',
      })
    }

    return await api.patch(`/users/${id}`, {
      email: newEmail,
    })
  },

  async updateAccount(id, data) {
    if (!id || !data) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: '잘못된 요청입니다.',
      })
    }

    return await api.patch(`/users/${id}`, data)
  },
}
