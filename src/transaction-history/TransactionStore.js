import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/index'
import { userService } from '../api/services'

export const useTransactionStore = defineStore('transaction', () => {
  // --- State (상태) ---
  const transactions = ref([]) // 거래내역
  const inandout = ref([]) // 수입, 지출
  const categories = ref([]) // 카테고리 정보
  const currentSort = ref('date') // 현재 조회 정렬 방식

  // --- Getters (계산된 상태) ---
  const displayTransactions = computed(() => {
    const list = [...transactions.value]
    if (currentSort.value === 'date') {
      // 최신 날짜순 (날짜가 같으면 최신 ID순)
      return list.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)
    } else {
      // 금액 높은순
      return list.sort((a, b) => b.amount - a.amount)
    }
  })

  // 카테고리 이름 가져오기 (추가)
  const getCategoryName = computed(() => {

    return (categoryId) => {
      const found = categories.value.find((c) => c.id === String(categoryId))
      return found ? found.name : '기타'
    }
  })

  // 카테고리 ID를 통해 수입/지출(type_id) 판별하기 (추가)
  const getCategoryType = computed(() => {
    return (categoryId) => {
      const found = categories.value.find((c) => c.id === String(categoryId))
      return found ? found.type_id : null // '1': 수입, '2': 지출
    }
  })

  // --- Actions (메서드) ---

  // 조회 정렬 방식 변경
  const setSort = (type) => {
    currentSort.value = type
  }

  // 거래 내역 가져오기
  const fetchTransactions = async () => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) return

    try {
      // 🆕 API 호출 시 user_id를 쿼리 스트링으로 전달하여 내 것만 가져옴
      const res = await api.get(`/transactions?user_id=${userData.id}`)
      transactions.value = res.data
    } catch (err) {
      console.error('거래내역 로드 실패', err)
    }
  }

  // 수입, 지출 방식 가져오기
  const fetchInAndOut = async () => {
    try {
      const res = await api.get('/inandout')
      inandout.value = res.data
    } catch (err) {
      console.error('공통코드 로드 실패', err)
    }
  }

  // 카테고리 정보 가져오기 (추가)
  const fetchCategories = async () => {
    try {
      const res = await api.get('/category')
      categories.value = res.data
    } catch (err) {
      console.error('카테고리 로드 실패', err)
    }
  }

  // 거래 내역 추가
  const addTransaction = async (payload) => {
    await api.post('/transactions', payload)
    await fetchTransactions() // 저장 후 목록 갱신
    await syncUserTotal() // 추가된 후 유저 합계 업데이트
  }

  // 거래 내역 업데이트
  const updateTransaction = async (id, payload) => {
    await api.put(`/transactions/${id}`, payload)
    await fetchTransactions()
    await syncUserTotal() // 추가된 후 유저 합계 업데이트
  }

  // 거래 내역 삭제
  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`)
    await fetchTransactions()
    await syncUserTotal() // 🔥 삭제 후 유저 합계 업데이트
  }

  // --- 유틸리티: 유저의 누적 수입/지출 재계산 및 서버 저장 ---
  const syncUserTotal = async () => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) return

    // 1. 현재 모든 거래 내역을 바탕으로 합계 계산
    const totalIncome = transactions.value
      .filter((tx) => {
        // 🔥 핵심: getCategoryType은 computed이므로 .value를 붙여서 내부 함수에 접근해야 합니다!
        const type = getCategoryType.value(tx.category_id)
        return type === '1' // 수입 판별
      })
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    const totalExpense = transactions.value
      .filter((tx) => {
        // 🔥 마찬가지로 .value를 통해 '타입 판별 함수'를 가져와서 호출합니다.
        const type = getCategoryType.value(tx.category_id)
        return type === '2' // 지출 판별
      })
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    try {
      // 2. 서버의 users 데이터 업데이트
      const res = await userService.updateAccount(userData.id, {
        total_income: totalIncome,
        total_expense: totalExpense,
      })

      // 3. 로컬 스토리지 정보 갱신 (프로필 페이지 로드 시 최신값 유지 위해)
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch (err) {
      console.error('유저 누적 데이터 동기화 실패', err)
    }
  }

  return {
    transactions,
    inandout,
    categories,
    currentSort,
    displayTransactions,
    getCategoryName,
    getCategoryType,
    setSort,
    fetchTransactions,
    fetchInAndOut,
    fetchCategories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
})
