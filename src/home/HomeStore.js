import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { userService, characterService, transactionService } from '../api/services'

export const useHomeStore = defineStore('Home', () => {
  const summary = reactive({ assets: 0, income: 0, expense: 0 })
  const beggars = reactive({ name: '', level: 1, img_path: '', ment: '', exp: 0 })
  const transactions = ref([])

  const formatCurrency = (value) =>
    value !== undefined ? `${new Intl.NumberFormat('ko-KR').format(Number(value))}원` : '0원'

  const getLoginUserId = () => localStorage.getItem('user_id')

  const fetchHomeData = async () => {
    const loginUserId = getLoginUserId()

    // 로그인 정보가 없으면 실행 중단 (임시 유저 로직 제거)
    if (!loginUserId) {
      console.warn('로그인한 사용자가 없습니다.')
      return
    }

    try {
      // 서비스 함수들을 사용하여 병렬 호출
      const [resUser, resCharacters, resTransactions] = await Promise.all([
        userService.getUser(loginUserId),
        characterService.getCharacterList(),
        transactionService.getTransactions(loginUserId),
      ])

      const userData = resUser.data
      if (userData) {
        summary.income = Number(userData.total_income ?? 0)
        summary.expense = Number(userData.total_expense ?? 0)
        summary.assets = summary.income - summary.expense
        beggars.level = Number(userData.beg_level ?? 1)
        beggars.exp = Number(userData.current_exp ?? 0)
      }

      // 캐릭터 데이터 매핑 (resCharacters.data 사용)
      const currentBeggar = resCharacters.data.find((b) => Number(b.level) === beggars.level)
      if (currentBeggar) {
        Object.assign(beggars, currentBeggar)
      }

      transactions.value = Array.isArray(resTransactions.data) ? resTransactions.data : []
      console.log('데이터 로드 완료 (사용자:', loginUserId, ')')
    } catch (err) {
      console.error('데이터 로드 실패:', err)
    }
  }

  const addTransaction = async (newTx) => {
    const loginUserId = getLoginUserId()
    if (!loginUserId) {
      alert('로그인이 필요한 서비스입니다.')
      return false
    }

    try {
      const payload = {
        ...newTx,
        user_id: loginUserId, // 문자열 ID 그대로 사용
        amount: Number(newTx.amount),
        date: new Date().toISOString().split('T')[0], // 날짜 추가
      }

      const response = await transactionService.addTransaction(payload)
      const savedTx = response.data

      transactions.value.unshift(savedTx)

      // 자산 계산 반영
      const amt = Number(savedTx.amount)
      if (savedTx.inandout_id === 'in') {
        summary.income += amt
        summary.assets += amt
      } else {
        summary.expense += amt
        summary.assets -= amt
      }
      return true
    } catch (err) {
      console.error('거래 추가 실패:', err)
      return false
    }
  }

  return { summary, beggars, transactions, formatCurrency, fetchHomeData, addTransaction }
})
