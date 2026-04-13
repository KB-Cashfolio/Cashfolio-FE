import api from '@/api/index'
import { AppError } from '@/utils/AppError'
import { ERROR_CODES } from '@/utils/errorCodes'

/* =========================
   🔐 인증 서비스
========================= */
export const authService = {
  async login(email, password) {
   // email을 소문자로 변환하거나 trim() 처리 추천
  const res = await api.get(`/users`, { params: { email: email.trim() } });
  const user = res.data.find(u => u.password === password); // 서버가 아닌 클라이언트에서 한번 더 확인

    const users = res.data

    if (users.length === 0) {
      throw new AppError({
        code: ERROR_CODES.LOGIN_FAILED,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.',
        level: 'warning',
      })
    }


    const { password: _, ...userWithoutPassword } = user

    localStorage.setItem('user', JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  },

  logout() {
    localStorage.removeItem('user')
  },

  async register(userData) {
    const checkRes = await api.get(`/users?email=${userData.email}`)

    if (checkRes.data.length > 0) {
      throw new AppError({
        code: ERROR_CODES.EMAIL_DUPLICATED,
        message: '이미 존재하는 이메일입니다.',
        level: 'warning',
      })
    }

    const res = await api.post('/users', {
      ...userData,
      beg_level: 1,
      current_exp: 0,
      daily_limit: 0,
      monthly_limit: 0,
      total_income: 0,
      total_expense: 0,
    })

    const { password, ...userWithoutPassword } = res.data

    localStorage.setItem('user', JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  },

  async updateUserInfo(id, updateData) {
    const res = await api.patch(`/users/${id}`, updateData)
    const updatedUser = res.data

    localStorage.setItem('user', JSON.stringify(updatedUser))

    return updatedUser
  },

  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    return !!localStorage.getItem('user')
  },
}