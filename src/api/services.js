import api from './index'

// 아직 기능 미 구현
export const userService = {
  // 사용자 정보 가져오기 (ID 기준)
  getUser(id) {
    return api.get(`/users/${id}`)
  },
  // 사용자 경험치나 레벨 업데이트
  updateUser(id, data) {
    return api.patch(`/users/${id}`, data)
  },
}

// 로그인 서비스
export const authService = {
  /**
   * 로그인 시도
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   */
  async login(email, password) {
    try {
      // 1. 이메일과 비밀번호가 일치하는 사용자 검색
      const response = await api.get(`/users?email=${email}&password=${password}`)

      const users = response.data

      // 2. 일치하는 사용자가 있는 경우
      if (users.length > 0) {
        const user = users[0]

        // 보안상 비밀번호는 제외하고 반환
        const { password: _, ...userWithoutPassword } = user

        // 로컬 스토리지 등에 유저 정보를 저장할 수 있도록 반환
        return {
          success: true,
          user: userWithoutPassword,
        }
      } else {
        // 3. 일치하는 사용자가 없는 경우
        return {
          success: false,
          message: '이메일 또는 비밀번호가 일치하지 않습니다.',
        }
      }
    } catch (error) {
      console.error('로그인 API 오류:', error)
      throw error
    }
  },

  // 로그아웃 (클라이언트 사이드에서 처리)
  logout() {
    // 로컬 스토리지나 세션 스토리지 비우기
    localStorage.removeItem('user')
  },

  async register(userData) {
    try {
      // 1️⃣ 이메일 중복 체크
      const checkRes = await api.get(`/users?email=${userData.email}`)

      if (checkRes.data.length > 0) {
        return {
          success: false,
          message: '이미 존재하는 이메일입니다.',
        }
      }

      // 2️⃣ 회원 생성
      const res = await api.post('/users', {
        ...userData,
        beg_level: 1,
        current_exp: 0,
        monthly_limit: 0,
        total_income: 0,
        total_expense: 0,
      })

      // 비밀번호 제거
      const { password, ...userWithoutPassword } = res.data

      return {
        success: true,
        user: userWithoutPassword,
      }
    } catch (error) {
      console.error('회원가입 오류:', error)
      throw error
    }
  },

  async updateUserInfo(id, updateData) {
    try {
      const response = await api.patch(`/users/${id}`, updateData)
      return response.data
    } catch (error) {
      console.error('정보 업데이트 실패:', error)
      throw error
    }
  },
}

// 거래 내역 파트
export const transactionService = {
  // 특정 사용자의 모든 거래 내역
  getTransactions(userId) {
    return api.get(`/transactions?user_id=${userId}`)
  },
  // 지출/수입 내역 추가
  addTransaction(data) {
    return api.post('/transactions', data)
  },
  // 특정 날짜 범위 검색 (예시)
  getTransactionsByDate(userId, date) {
    return api.get(`/transactions?user_id=${userId}&date=${date}`)
  },
}
