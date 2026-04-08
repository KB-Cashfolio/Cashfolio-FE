import { defineStore } from 'pinia'
import { userService, accountService, characterService } from '@/api/services' // 경로 확인!

export const useProfileStore = defineStore('profile', {
  state: () => ({
    // 서버 연결 전 보여줄 목업(Mock) 데이터
    user: null,
    accounts: [], // 🆕 계좌 목록을 담을 배열 추가
    loading: false,
    currentUserId: 'a1', // 🆕 기본값을 'a1'으로 두되, 나중에 로그인 시 변경 가능
  }),

  actions: {
    // 유저 정보 가져오기 (db.json의 users 엔드포인트)
    async fetchUserProfile(userId) {
      this.loading = true
      try {
        // 1. 유저 정보와 계좌 정보를 동시에 호출
        const targetId = String(userId || this.currentUserId)

        const [userRes, accountsRes] = await Promise.all([
          userService.getUser(targetId),
          accountService.getAccountsByUserId(targetId),
        ])

        this.user = userRes.data
        this.accounts = accountsRes.data // 🆕 받아온 계좌 배열 저장
        this.currentUserId = targetId // 성공 시 현재 ID 업데이트

        console.log('불러온 계좌 정보:', this.accounts) // 확인용
      } catch (err) {
        console.error('데이터 로드 실패:', err)
      } finally {
        this.loading = false
      }
    },

    // 경험치 증가 로직 (PATCH)
    async increaseExp(userId, amount) {
      if (!this.user) return

      const newExp = Math.min(this.user.current_exp + amount, 100)
      try {
        const response = await userService.updateAccount(userId, {
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
