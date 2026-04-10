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
      console.error('데이터 로드 실패:', err)
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

      // 2. 🔥 경험치 추가 로직 (예: 거래 1건당 5% 상승)
      let newExp = beggars.exp + 5
      let newLevel = beggars.level

      if (newExp >= 100) {
        newLevel += 1
        newExp -= 100
        alert(`🎉 축하합니다! Lv.${newLevel}로 레벨업하셨습니다!`)
      }

      // 3. 🔥 서버에 유저 정보 업데이트 (userService 호출 필요)
      await userService.updateAccount(loginUserId, {
        current_exp: newExp,
        beg_level: newLevel,
      })

      // 4. 스토어 상태 업데이트
      beggars.exp = newExp
      beggars.level = newLevel
      return true
    } catch (err) {
      console.error('거래 추가 실패:', err)
      return false
    }
  }

  // 경험치 업데이트 핵심 로직
  const updateExpAfterTransaction = async (amount) => {
    const profileStore = useProfileStore() // 유저 정보 접근
    const user = profileStore.user

    if (!user || !user.daily_limit) return

    // 1. 절약분 계산 (목표 - 실지출)
    // 여기서는 '이번에 쓴 금액'이 아니라 '오늘 총 지출' 기준으로 계산하는 게 정확합니다.
    const todaySpent = summary.expense + amount
    const goal = user.daily_limit

    // 2. 목표보다 적게 썼을 때만 경험치 부여
    if (todaySpent < goal) {
      const savingRatio = ((goal - todaySpent) / goal) * 100 // 아낀 비율 (%)

      // 3. 너무 빨리 오르지 않게 0.1 곱하기 (지우님 의견 반영)
      const earnedExp = Math.floor(savingRatio * 0.1)

      if (earnedExp > 0) {
        let nextExp = user.current_exp + earnedExp
        let nextLevel = user.beg_level

        // 4. 레벨업 처리 (100% 넘으면 레벨업)
        while (nextExp >= 100) {
          nextLevel++
          nextExp -= 100
          alert(`🎊 축하합니다! 절약의 고수! Lv.${nextLevel}로 레벨업!`)
        }

        // 5. DB 업데이트 (userService 이용)
        try {
          await userService.updateAccount(user.id, {
            current_exp: nextExp,
            beg_level: nextLevel,
          })

          // 스토어 상태도 즉시 업데이트하여 화면에 반영
          profileStore.user.current_exp = nextExp
          profileStore.user.beg_level = nextLevel

          console.log(`경험치 획득: +${earnedExp}% (현재: ${nextExp}%)`)
        } catch (err) {
          console.error('경험치 저장 실패:', err)
        }
      }
    } else {
      console.log('목표 금액 초과로 경험치를 획득하지 못했습니다. 💪')
    }
  }

  return { summary, beggars, transactions, formatCurrency, fetchHomeData, addTransaction }
})
