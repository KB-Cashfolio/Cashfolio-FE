import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { userService, characterService, transactionService } from '../api/services'
import { useTransactionStore } from '../transaction-history/TransactionStore'
import { useAuthStore } from '@/login/register/RegisterStore'

export const useHomeStore = defineStore('Home', () => {
  const summary = reactive({ assets: 0, income: 0, expense: 0 })
  const beggars = reactive({ name: '', level: 1, img_path: '', ment: '', exp: 0 })
  const transactions = ref([])
  const authStore = useAuthStore()
  
  const formatCurrency = (value) =>
    value !== undefined ? `${new Intl.NumberFormat('ko-KR').format(Number(value))}원` : '0원'

const getLoginUserId = () => {
    // 1순위: 스토어의 유저 정보, 2순위: 로컬 스토리지
    return authStore.user?.id || JSON.parse(localStorage.getItem('user'))?.id
  }

const fetchHomeData = async () => {
    const loginUserId = getLoginUserId()
    
    if (!loginUserId) {
      // 만약 로그인은 되어있는데 스토어만 비어있는 경우를 대비해 
      // 여기서 authStore의 유저 정보를 복구하는 로직을 넣으면 더 안전합니다.
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
        beggars.name = userData.username || '뚜벅이'
        beggars.level = Number(userData.beg_level ?? 1)
        beggars.exp = Number(userData.current_exp ?? 0)
      }

      // 날짜 기준 내림차순
      const txList = Array.isArray(resTransactions.data) ? resTransactions.data : []
      txList.sort((a, b) => {
        const timeA = a.createdAt || a.date
        const timeB = b.createdAt || b.date
        return timeB.localeCompare(timeA)
      })

      const transactionStore = useTransactionStore()
      // 카테고리 정보가 필요하므로 미리 로드 확인
      if (transactionStore.categories.length === 0) {
        await transactionStore.fetchCategories()
      }

      // 실시간 합산 로직
      let totalIn = 0
      let totalOut = 0

      txList.forEach((tx) => {
        const amt = Number(tx.amount)

        // categories 배열에서 현재 거래의 category_id와 일치하는 객체를 찾음
        const categoryObj = transactionStore.categories.find(
          (c) => String(c.id) === String(tx.category_id),
        )

        if (categoryObj) {
          tx.category = categoryObj.name // 화면 표시용 이름 저장

          // 찾은 카테고리 객체의 type_id로 수입/지출 판별
          if (categoryObj.type_id === '1') {
            totalIn += amt
            tx.inandout_id = 'in' // UI 아이콘 표시용
          } else if (categoryObj.type_id === '2') {
            totalOut += amt
            tx.inandout_id = 'out'
          }
        }
      })

      // 계산된 결과 반영
      summary.income = totalIn
      summary.expense = totalOut
      summary.assets = totalIn - totalOut
      transactions.value = [...txList]

      // 캐릭터 데이터 매핑 (resCharacters.data 사용)
      const currentBeggar = resCharacters.data.find((b) => Number(b.level) === beggars.level)
      if (currentBeggar) {
        const { name, ...otherInfo } = currentBeggar
        Object.assign(beggars, currentBeggar)
      }

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
        createdAt: new Date().toISOString(), // 생성 시간 추가
      }

      const response = await transactionService.addTransaction(payload)
      let savedTx = response.data

      // `savedTx`에는 category_id만 있으므로, 화면 표시에 필요한 category 이름을 추가합니다.
      const transactionStore = useTransactionStore()

      const amt = Number(savedTx.amount)
      const typeId = transactionStore.getCategoryType(savedTx.category_id)
      savedTx.category = transactionStore.getCategoryName(savedTx.category_id)

      if (typeId === '1') {
        // 수입일 때
        summary.income += amt
        summary.assets += amt
        savedTx.inandout_id = 'in' // UI 아이콘용
      } else {
        // 지출일 때
        summary.expense += amt
        summary.assets -= amt
        savedTx.inandout_id = 'out'
      }

      transactions.value.unshift(savedTx)

      return true
    } catch (err) {
      handleClientError(err)
      return false
    }
  }

  return { summary, beggars, transactions, formatCurrency, fetchHomeData, addTransaction }
})
