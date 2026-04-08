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
