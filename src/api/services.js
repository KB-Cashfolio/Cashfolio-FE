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

  // 계좌 정보/계정 정보 수정
  updateAccount(id, data) {
    return api.patch(`/users/${id}`, data)
  },
}

export const accountService = {
  // 특정 유저의 ID로 연결된 계좌들을 가져옴 (Query String 활용)
  getAccountsByUserId(userId) {
    return api.get(`/accounts?user_id=${String(userId)}`)
  },
}

// 캐릭터 관련 서비스
export const characterService = {
  // 경험치 증가 (POST /character/exp-inc/:id)
  increaseExp(id, amount) {
    // 실제 서버 구현에 따라 PATCH나 POST 선택
    return api.patch(`/users/${id}`, { current_exp: amount })
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
