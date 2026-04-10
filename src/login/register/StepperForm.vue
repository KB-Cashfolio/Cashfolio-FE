<template>
  <div class="page-view">
    <div class="page-container">
      <div class="stepper-progress">
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: `${(currentStep / 3) * 100}%` }"></div>
        </div>
        <div class="step-indicator">Step {{ currentStep }} / 3</div>
      </div>

      <form @submit.prevent="handleNext">
        <div v-if="currentStep === 1" class="step-content">
          <h2 class="step-title">당신의 이름은 무엇인가요?</h2>
          <p class="step-desc">거지 세계에서 불릴 닉네임을 정해주세요.</p>
          <div class="input-group">
            <label for="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              v-model="formData.nickname"
              placeholder="예: 탈출꿈나무"
              required
            />
          </div>
        </div>

        <div v-if="currentStep === 2" class="step-content">
          <h2 class="step-title">현재 총 자산은?</h2>
          <p class="step-desc">수중에 있는 모든 돈을 합쳐주세요.</p>
          <div class="input-group">
            <label for="assets">총 자산 (원)</label>
            <input type="number" id="assets" v-model="formData.assets" placeholder="0" required />
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-content">
          <h2 class="step-title">하루에 얼마만 쓸까요?</h2>
          <p class="step-desc">정해진 금액을 넘기면 캐릭터가 슬퍼해요.</p>
          <div class="input-group">
            <label for="limit">일별 소비 한도 (원)</label>
            <input
              type="number"
              id="limit"
              v-model="formData.dailyLimit"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div class="btn-group">
          <button type="button" v-if="currentStep > 1" @click="currentStep--" class="prev-btn">
            이전
          </button>
          <button type="submit" class="auth-submit-btn">
            {{ currentStep === 3 ? '설정 완료' : '다음으로' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/api/services'
import { useAuthStore } from '@/login/register/RegisterStore'

const router = useRouter()
const authStore = useAuthStore()
const currentStep = ref(1)

// 🆕 고정된 ID 대신 현재 회원가입/로그인된 유저의 ID를 가져옴
const userId = computed(() => authStore.user?.id)

const formData = reactive({
  nickname: '',
  isAccountLinked: false,
  assets: null,
  dailyLimit: null,
})

const handleNext = async () => {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    // ⚠️ 가드 로직: ID가 없으면 진행 불가
    if (!userId.value) {
      alert('유저 세션이 만료되었습니다. 다시 시도해주세요.')
      router.push('/login')
      return
    }
    // 2. 최종 데이터 전송
    try {
      // 🆕 오늘 날짜 가져오기 (YYYY-MM-DD 형식)
      const todayStr = new Date().toISOString().split('T')[0]
      // 서버 데이터 구조에 맞게 매핑
      const updateData = {
        username: formData.nickname,
        daily_limit: formData.dailyLimit, // 🆕 경험치 계산을 위해 추가
        monthly_limit: formData.dailyLimit * 30, // 일별 한도를 한 달 한도로 변환 (선택)
        total_income: formData.assets, // 초기 자산을 총 수입으로 잡거나 필드 추가
        beg_level: 1,
        current_exp: 0,
        join_date: todayStr, // 🔥 여기! 가입일을 오늘로 저장합니다.
        last_settled_date: todayStr, // 정산 시작점도 오늘로 맞춤
      }

      console.log(updateData)
      await authService.updateUserInfo(userId.value, updateData) // Axios 통신

      // 🆕 스토어 및 로컬스토리지 최신화 (프로필 페이지 등에서 즉시 반영되도록)
      const updatedUser = { ...authStore.user, ...updateData }
      authStore.user = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))

      alert('우아한 거지가 되신 것을 축하드립니다! 🎉')
      router.push('/') // 메인 대시보드로 이동
    } catch (error) {
      alert('데이터 저장 중 오류가 발생했습니다.')
    }
  }
}
</script>

<style scoped>
/* Stepper 전용 스타일 */
.stepper-progress {
  margin-bottom: 30px;
}

.progress-track {
  width: 100%;
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.step-indicator {
  font-size: 12px;
  color: var(--color-text-sub);
  text-align: right;
  font-weight: 600;
}

.step-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text-main);
  margin-bottom: 8px;
}

.step-desc {
  font-size: 14px;
  color: var(--color-text-sub);
  margin-bottom: 25px;
}

.account-check-box {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 30px;
  text-align: center;
  border: 2px dashed var(--color-border);
  transition: all 0.3s;
}

.account-check-box.active {
  border-color: var(--color-primary);
  background: var(--color-primary-alpha);
}

.account-check-box .icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.link-btn {
  margin-top: 15px;
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid var(--color-primary);
  background: white;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
}

.active .link-btn {
  background: var(--color-primary);
  color: white;
}

.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.prev-btn {
  flex: 1;
  height: 55px;
  background: var(--color-bg);
  color: var(--color-text-sub);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
}

.auth-submit-btn {
  flex: 2;
  height: 55px;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-submit-btn:hover {
  background: var(--color-primary-dark);
}
</style>
