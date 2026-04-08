import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { userService, beggarService, transactionService } from '../api/services'

export const useHomeStore = defineStore('Home', () => {
  const summary = reactive({
    assets: 0,
    income: 0,
    expense: 0,
  })

  const beggars = reactive({
    name: '',
    level: 1,
    img_path: '',
    ment: '',
    exp: 0,
  })

  const transactions = ref([])

  const formatCurrency = (value) =>
    value !== undefined ? `${new Intl.NumberFormat('ko-KR').format(Number(value))}원` : '0원'

  const getLoginUserId = () => {
    return localStorage.getItem('user_id')
  }

  const fetchHomeData = async () => {
    try {
      let loginUserId = getLoginUserId()
      let userQuery = ''

      // 로그인 ID가 있으면 해당 유저 없으면 첫번째
      if (loginUserId) {
        userQuery = `/users?id=${loginUserId}`
      } else {
        userQuery = `/users`
      }
      const [resUsers, resBeggars, resTransactions] = await Promise.all([
        api.get(userQuery),
        beggarService.getBeggars(),
        api.get(
          loginUserId
            ? `/transactions?user_id=${loginUserId}&_sort=id&_order=desc`
            : `/transactions?_sort=id&_order=desc`,
        ),
      ])

      // 첫 번째 유저 정보
      const userData = resUsers.data[0]

      if (userData) {
        // 로그인 정보 없으면 첫 번째 유저의 ID를 임시로 세팅
        if (!loginUserId) loginUserId = userData.id

        summary.income = Number(userData.total_income ?? 0)
        summary.expense = Number(userData.total_expense ?? 0)
        summary.assets = summary.income - summary.expense

        beggars.level = Number(userData.beg_level ?? 1)
        beggars.exp = Number(userData.current_exp ?? 0)
      }

      // 캐릭터 데이터 매핑
      const currentBeggar = resBeggars.data.find((b) => Number(b.level) === Number(beggars.level))
      if (currentBeggar) {
        beggars.name = currentBeggar.name
        beggars.img_path = currentBeggar.img_path
        beggars.ment = currentBeggar.ment
      }

      transactions.value = Array.isArray(resTransactions.data) ? resTransactions.data : []
      console.log('데이터 로드 완료 (사용자:', loginUserId, ')')
    } catch (err) {
      console.error('데이터 로드 실패:', err)
    }
  }

  const addTransaction = async (newTx) => {
    try {
      let loginUserId = getLoginUserId() // const 대신 let으로 변경

      // 테스트 : 첫번째 유저로 강제 지정
      if (!loginUserId) {
        console.warn('로그인 정보가 없어 임시 유저(1)로 테스트를 진행합니다.')
        loginUserId = 'user-001'
      }

      const payload = {
        ...newTx,
        user_id: loginUserId, // 이제 무조건 ID가 들어감
        amount: Number(newTx.amount),
      }

      const response = await api.post('/transactions', payload)
      const savedTx = response.data

      // 내역 상단에 즉시 추가
      transactions.value.unshift(savedTx)

      // 자산 계산 반영
      if (savedTx.inandout_id === 'in') {
        summary.income += Number(savedTx.amount)
        summary.assets += Number(savedTx.amount)
      } else {
        summary.expense += Number(savedTx.amount)
        summary.assets -= Number(savedTx.amount)
      }

      console.log('추가 및 자산 반영 완료! (테스트 유저 ID:', loginUserId, ')')
      return true
    } catch (err) {
      console.error('거래 추가 실패:', err)
      alert('서버 저장에 실패했습니다.')
      return false
    }
  }

  return {
    summary,
    beggars,
    transactions,
    formatCurrency,
    fetchHomeData,
    addTransaction,
  }
})
