import api from './index'

// 사용자 관련 서비스 (Profile 파트 핵심)
export const userService = {
  // 사용자 정보 가져오기
  getUser(id) {
    return api.get(`/users/${id}`)
  },

  // 아이디 수정 (PATCH /user/change/user-id/{userid})
  updateUsername(id, newUsername) {
    return api.patch(`/users/${id}`, { username: newUsername })
  },

  // 이메일 수정 (PATCH /user/change/email/{userid})
  updateEmail(id, newEmail) {
    return api.patch(`/users/${id}`, { email: newEmail })
  },

  // 계정 정보 수정
  updateAccount(id, data) {
    return api.patch(`/users/${id}`, data)
  },
}

// 캐릭터 관련 서비스
export const characterService = {
  // 🆕 이 함수가 빠져있어서 에러가 났던 것입니다!
  getCharacterList() {
    return api.get('/beggars') // db.json의 characters 데이터를 가져옵니다.
  },

  // 경험치 증가 (POST /character/exp-inc/:id)
  increaseExp(id, amount) {
    // 실제 서버 구현에 따라 PATCH나 POST 선택
    return api.patch(`/users/${id}`, { current_exp: amount })
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

        localStorage.setItem('user', JSON.stringify(userWithoutPassword))

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
        daily_limit: 0,
        monthly_limit: 0,
        total_income: 0,
        total_expense: 0,
      })

      // 비밀번호 제거
      const { password, ...userWithoutPassword } = res.data

      // 가입 성공시 로컬 스토리지 저장
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))

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
      const updatedUser = response.data

      localStorage.setItem('user', JSON.stringify(updatedUser))
      return updatedUser
    } catch (error) {
      console.error('정보 업데이트 실패:', error)
      throw error
    }
  },

  // 현재 사용자 데이터 가져오기 - ProfileView에서 사용
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // 로그인 여부
  isAuthenticated() {
    return !!localStorage.getItem('user')
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
