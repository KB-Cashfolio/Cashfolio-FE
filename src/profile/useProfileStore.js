import { defineStore } from 'pinia'
import api from '@/api/index'
import { userService, characterService } from '@/api/services' // 경로 확인!

export const useProfileStore = defineStore('profile', {
  state: () => ({
    // 서버 연결 전 보여줄 목업(Mock) 데이터
    user: null,
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

        const [userRes, beggarsRes] = await Promise.all([
          userService.getUser(targetId),
          characterService.getCharacterList(), // 엔드포인트가 /beggars로 설정된 서비스
        ])

        this.user = userRes.data
        this.currentUserId = targetId // 성공 시 현재 ID 업데이트

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

        // 1. 수정된 서비스 함수(getTodayExpenses) 사용 권장
        // 오늘 총 지출만 가져오기
        const res = await transactionService.getTodayExpenses(userId, today)
        const totalSpent = res.data.reduce((sum, tx) => sum + Number(tx.amount), 0)

        const goal = this.user.daily_limit || 20000 // 유저의 일일 목표

        if (totalSpent < goal) {
          // 2. 아까 정한 로직: (절약 비율) * 0.1
          const savingRatio = ((goal - totalSpent) / goal) * 100
          const earnedExp = Math.floor(savingRatio * 0.1) // 0.1 가중치 적용

          if (earnedExp > 0) {
            let nextExp = (this.user.current_exp || 0) + earnedExp
            let nextLevel = this.user.beg_level || 1

            // 3. 레벨업 처리
            while (nextExp >= 100) {
              nextLevel++
              nextExp -= 100
            }

            // 4. 서버 업데이트 (targetId -> userId로 오타 수정 및 통합된 서비스 사용)
            const response = await userService.updateUserStats(userId, {
              current_exp: nextExp,
              beg_level: nextLevel,
            })

            // 스토어 상태 동기화
            this.user = response.data

            // 🆕 레벨업했으면 캐릭터 정보도 새로고침
            if (nextLevel !== this.user.beg_level) {
              const beggarsRes = await characterService.getCharacterList()
              this.character = beggarsRes.data.find((b) => Number(b.level) === nextLevel)
            }

            console.log(`경험치 획득 완료: +${earnedExp}%`)
          }
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

    async recalculateTotalExp(userId) {
      if (!this.user || !this.user.join_date) return
      this.loading = true

      try {
        // 1. 카테고리 정보 먼저 확보
        if (!this.categories || this.categories.length === 0) {
          const resCat = await api.get('/category')
          this.categories = resCat.data
        }

        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const joinDate = new Date(this.user.join_date)

        // 1. 가입일부터 오늘까지 흐른 일수 계산 (최소 1일)
        const diffTime = Math.abs(today - joinDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1

        // 2. 가입일부터 지금까지의 총 예산 (목표 소비량 * 흐른 일수)
        const totalBudget = (Number(this.user.daily_limit) || 20000) * diffDays

        // 3. 내 모든 거래내역 가져오기
        const res = await api.get(`/transactions?user_id=${userId}`)
        const allTxs = res.data

        const totalSpent = allTxs
          .filter((tx) => {
            // 오늘 쓴 돈도 포함해서 실시간 비율을 보고 싶다면 날짜 필터를 빼고,
            // 어제까지만 보고 싶다면 if (tx.date >= todayStr) return false; 를 추가하세요.
            const foundCat = this.categories.find((c) => String(c.id) === String(tx.category_id))
            return foundCat && String(foundCat.type_id) === '2'
          })
          .reduce((sum, tx) => sum + Number(tx.amount), 0)

        // 5. 🔥 [새 로직] 전체 절약 비율 계산
        let finalLevel = 1
        let finalExp = 0

        if (totalSpent < totalBudget) {
          // 절약률 = (남은 돈 / 전체 예산) * 100
          const totalSavingRatio = ((totalBudget - totalSpent) / totalBudget) * 100

          // 경험치 산정: 절약률 1%당 경험치 10으로 환산 (지우님 취향껏 가중치 조절 가능!)
          // 예: 50% 절약 중이면 500점 -> Lv.6 (경험치 0%)
          let totalAccumulatedExp = Math.floor(totalSavingRatio * 0.1)

          finalExp = totalAccumulatedExp
          while (finalExp >= 100) {
            finalLevel++
            finalExp -= 100
          }
        } else {
          // 만약 총 지출이 예산을 넘었다면 경험치는 0 (또는 벌칙 로직 추가 가능)
          finalLevel = 1
          finalExp = 0
        }

        // 6. 서버 업데이트 (값이 변했을 때만)
        if (this.user.current_exp !== finalExp || this.user.beg_level !== finalLevel) {
          const response = await userService.updateAccount(userId, {
            current_exp: finalExp,
            beg_level: finalLevel,
            total_expense: totalSpent, // 서버의 총 지출액도 업데이트
          })
          this.user = response.data
          localStorage.setItem('user', JSON.stringify(this.user))
          console.log(
            `누적 재계산 완료: 예산 ${totalBudget}원 대비 ${totalSpent}원 지출 -> Lv.${finalLevel} (${finalExp}%)`,
          )
        }
      } catch (err) {
        console.error('재계산 에러:', err)
      } finally {
        this.loading = false
      }
    },
  },
})
