import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { userService, characterService, transactionService } from '../api/services'
import { useTransactionStore } from '../transaction-history/TransactionStore'

export const useHomeStore = defineStore('Home', () => {
  const summary = reactive({ assets: 0, income: 0, expense: 0 })
  const beggars = reactive({ name: '', level: 1, img_path: '', ment: '', exp: 0 })
  const transactions = ref([])

  const formatCurrency = (value) =>
    value !== undefined ? `${new Intl.NumberFormat('ko-KR').format(Number(value))}원` : '0원'

  const getLoginUserId = () => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData).id : null
  }

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
        beggars.name = userData.username || '무명 거지'
        summary.income = Number(userData.total_income ?? 0)
        summary.expense = Number(userData.total_expense ?? 0)
        summary.assets = summary.income - summary.expense
        beggars.level = Number(userData.beg_level ?? 1)
        beggars.exp = Number(userData.current_exp ?? 0)
      }

      // 캐릭터 데이터 매핑 (resCharacters.data 사용)
      const currentBeggar = resCharacters.data.find((b) => Number(b.level) === beggars.level)
      if (currentBeggar) {
        const { name, ...otherInfo } = currentBeggar
        Object.assign(beggars, currentBeggar)
      }

      transactions.value = Array.isArray(resTransactions.data) ? resTransactions.data : []
      console.log('데이터 로드 완료 (사용자:', loginUserId, ')')
    } catch (err) {
      handleClientError(err)
    }
  }

  const addTransaction = async (newTx) => {
    const loginUserId = getLoginUserId()
    // if (!loginUserId) {
    //   alert('로그인이 필요한 서비스입니다.')
    //   return false
    // }

    try {
      const payload = {
        ...newTx,
        user_id: loginUserId, // 문자열 ID 그대로 사용
        amount: Number(newTx.amount),
        date: new Date().toISOString().split('T')[0], // 날짜 추가
      }

      const response = await transactionService.addTransaction(payload)
      let savedTx = response.data

      // `savedTx`에는 category_id만 있으므로, 화면 표시에 필요한 category 이름을 추가합니다.
      const transactionStore = useTransactionStore()
      if (transactionStore.categories.length === 0) {
        await transactionStore.fetchCategories()
      }
      if (savedTx.category_id) {
        savedTx.category = transactionStore.getCategoryName(savedTx.category_id)
      }

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
      handleClientError(err)
      return false
    }
  }

  return { summary, beggars, transactions, formatCurrency, fetchHomeData, addTransaction }
})
