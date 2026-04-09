import { defineStore } from 'pinia'
import { userService, accountService, characterService } from '@/api/services' // 경로 확인!

export const useProfileStore = defineStore('profile', {
  state: () => ({
    // 서버 연결 전 보여줄 목업(Mock) 데이터
    user: null,
    accounts: [], // 🆕 계좌 목록을 담을 배열 추가
    character: null,
    loading: false,
    currentUserId: null, // 🆕 기본값을 'a1'으로 두되, 나중에 로그인 시 변경 가능
  }),

  actions: {
    // 유저 정보 가져오기 (db.json의 users 엔드포인트)
    async fetchUserProfile(userId) {
      this.loading = true
      try {
        // 1. 유저 정보와 계좌 정보를 동시에 호출
        const targetId = String(userId)

        const [userRes, accountsRes, beggarsRes] = await Promise.all([
          userService.getUser(targetId),
          accountService.getAccountsByUserId(targetId),
          characterService.getCharacterList(), // 엔드포인트가 /beggars로 설정된 서비스
        ])

        this.user = userRes.data
        this.accounts = accountsRes.data // 🆕 받아온 계좌 배열 저장
        this.currentUserId = targetId // 성공 시 현재 ID 업데이트

        console.log('불러온 계좌 정보:', this.accounts) // 확인용

        // 🆕 유저 레벨에 맞는 캐릭터 데이터 찾기
        if (this.user && beggarsRes.data) {
          const userLevel = Number(this.user.beg_level || 1)
          this.character = beggarsRes.data.find((b) => Number(b.level) === userLevel)
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err)
      } finally {
        this.loading = false
      }
    },

    // useProfileStore.js 내부 actions 수정본

    async updateExpBySavings(userId) {
      if (!this.user) return
      this.loading = true

      try {
        const today = new Date().toISOString().split('T')[0]

        // 1. 오늘 지출 내역 가져오기
        const res = await transactionService.getTransactionsByDate(userId, today)
        const totalSpent = res.data
          .filter((tx) => tx.inandout_id === 'out')
          .reduce((sum, tx) => sum + tx.amount, 0)

        const goal = this.user.daily_limit || 20000 // 유저가 정한 일일 목표

        if (totalSpent <= goal) {
          // 2. 절약 비율 계산 (보상 경험치)
          const earnedExp = Math.floor(((goal - totalSpent) / goal) * 100)

          if (earnedExp > 0) {
            let nextExp = this.user.current_exp + earnedExp
            let nextLevel = this.user.beg_level

            // 3. 레벨업 처리 (100 초과 시 다음 레벨로)
            while (nextExp >= 100) {
              nextLevel++
              nextExp -= 100
            }

            // 4. 서버 업데이트
            const response = await userService.updateAccount(targetId, {
              current_exp: nextExp,
              beg_level: nextLevel,
            })

            this.user = response.data
            alert(`🎉 절약 성공! 경험치 ${earnedExp}를 획득하여 Lv.${nextLevel}이 되었습니다!`)
          }
        } else {
          alert('목표 금액을 초과했어요. 내일은 좀 더 아껴볼까요? 💪')
        }
      } catch (err) {
        console.error('경험치 업데이트 실패:', err)
      } finally {
        this.loading = false
      }
    },

    // 로그아웃 (상태 초기화)
    clearUser() {
      this.user = null
      localStorage.removeItem('user')
    },

    // 닉네임 수정 예시
    async changeName(newName) {
      try {
        const response = await userService.updateUsername(this.user.id, newName)
        this.user.username = response.data.username
        alert('이름이 변경되었습니다!')
      } catch (err) {
        alert('변경 실패')
      }
    },
  },
})
