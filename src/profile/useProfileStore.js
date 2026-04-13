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
        // 1. 카테고리 정보 로드
        if (!this.categories || this.categories.length === 0) {
          const resCat = await api.get('/category')
          this.categories = resCat.data
        }

        // 2. 전체 거래내역 로드
        const res = await api.get(`/transactions?user_id=${userId}`)
        const allTxs = res.data || []

        // 3. 정산 기준일 설정
        // 이전에 정산한 적이 있다면 그 날짜 이후부터, 없다면 가입일 혹은 첫 거래일부터 시작
        const lastRecalcDateStr = this.user.last_recalculated_date
        const todayStr = new Date().toISOString().split('T')[0]

        // 4. 🔥 [핵심] 아직 정산되지 않은 '새로운 날짜'들만 추출
        // 오늘 데이터는 아직 지출이 끝난 게 아니므로 '어제'까지의 데이터만 정산 대상으로 잡습니다.
        const targetDates = [
          ...new Set(
            allTxs
              .map((tx) => tx.date)
              .filter((date) => {
                const isAfterLastCalc = lastRecalcDateStr ? date > lastRecalcDateStr : true
                const isBeforeToday = date < todayStr
                return isAfterLastCalc && isBeforeToday
              }),
          ),
        ].sort() // 날짜순 정렬

        if (targetDates.length === 0) {
          console.log('새로 정산할 내역이 없습니다.')
          return
        }

        // 5. 새로운 경험치 누적합 계산
        let addedExp = 0
        const dailyLimit = Number(this.user.daily_limit) || 20000

        targetDates.forEach((date) => {
          const daySpent = allTxs
            .filter((tx) => tx.date === date)
            .filter((tx) => {
              const foundCat = this.categories.find((c) => String(c.id) === String(tx.category_id))
              return foundCat && String(foundCat.type_id) === '2' // 지출 카테고리
            })
            .reduce((sum, tx) => sum + Number(tx.amount), 0)

          // 일별 절약 로직 적용 (해당 일자에 예산보다 적게 썼다면)
          if (daySpent < dailyLimit) {
            const savingRatio = ((dailyLimit - daySpent) / dailyLimit) * 100
            addedExp += Math.floor(savingRatio)
          }
        })

        if (addedExp === 0) {
          // 아낀 금액이 없어 경험치 추가가 없더라도 마지막 정산일은 업데이트해줘야 중복 계산을 안 합니다.
          await userService.updateAccount(userId, {
            last_recalculated_date: targetDates[targetDates.length - 1],
          })
          return
        }

        // 6. 🔥 기존 경험치에 "더하기" 및 레벨업 처리
        let finalExp = (this.user.current_exp || 0) + addedExp
        let finalLevel = this.user.beg_level || 1

        while (finalExp >= 100) {
          finalLevel++
          finalExp -= 100
        }

        // 7. 서버 및 로컬 업데이트
        // 마지막으로 정산 완료한 날짜(targetDates의 마지막 값)를 함께 저장
        const lastDoneDate = targetDates[targetDates.length - 1]

        const response = await userService.updateAccount(userId, {
          current_exp: finalExp,
          beg_level: finalLevel,
          last_recalculated_date: lastDoneDate,
        })

        this.user = response.data
        localStorage.setItem('user', JSON.stringify(this.user))

        // 레벨업 시 캐릭터 정보 동기화
        if (finalLevel !== response.data.beg_level) {
          const beggarsRes = await characterService.getCharacterList()
          this.character = beggarsRes.data.find((b) => Number(b.level) === finalLevel)
        }

        console.log(`${targetDates.length}일치 데이터 정산 완료: +${addedExp}% 추가됨`)
      } catch (err) {
        console.error('재계산 에러:', err)
      } finally {
        this.loading = false
      }
    },
  },
})
