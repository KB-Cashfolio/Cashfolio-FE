import { defineStore } from 'pinia'
import { userService, characterService } from '@/api/services' // 경로 확인!

export const useProfileStore = defineStore('profile', {
  state: () => ({
    // 서버 연결 전 보여줄 목업(Mock) 데이터
    user: {
      user_id: 1024,
      username: '절약꿈나무(목업)',
      email: 'mockup@example.com',
      beg_level: 1,
      current_exp: 10,
      total_income: 3000000,
      total_expense: 1000000,
    },
    loading: false,
  }),

  actions: {
    // 유저 정보 가져오기 (db.json의 users 엔드포인트)
    async fetchUserProfile(userId) {
      this.loading = true
      try {
        // 서버 연결 시도 (json-server가 켜져 있어야 함)
        const response = await userService.getUser(userId)
        if (response.data) {
          this.user = response.data // 연결 성공 시 서버 데이터로 교체
        }
      } catch (err) {
        console.error('데이터 로드 실패')
        // 에러가 나도 state의 초기 목업 데이터는 유지됨
      } finally {
        this.loading = false
      }
    },

    // 경험치 증가 로직 (PATCH)
    async increaseExp(userId, amount) {
      if (!this.user) return

      const newExp = Math.min(this.user.current_exp + amount, 100)
      try {
        const response = await userService.updateUser(userId, {
          current_exp: newExp,
        })
        this.user = response.data
      } catch (err) {
        console.error('경험치 업데이트 실패:', err)
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
