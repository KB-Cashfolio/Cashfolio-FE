<template>
  <div class="page-view">
    <div class="page-container">
      <div class="stepper-progress">
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: `${(currentStep / 4) * 100}%` }"></div>
        </div>
        <div class="step-indicator">Step {{ currentStep }} / 4</div>
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
          <h2 class="step-title">계좌를 연결할까요?</h2>
          <p class="step-desc">정확한 자산 관리를 위해 계좌를 조회합니다.</p>
          <div class="account-check-box" :class="{ active: formData.isAccountLinked }">
            <div class="icon">🏦</div>
            <p>내 모든 계좌 불러오기</p>
            <button
              type="button"
              @click="formData.isAccountLinked = !formData.isAccountLinked"
              class="link-btn"
            >
              {{ formData.isAccountLinked ? '연결 완료' : '조회하기' }}
            </button>
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-content">
          <h2 class="step-title">현재 총 자산은?</h2>
          <p class="step-desc">수중에 있는 모든 돈을 합쳐주세요.</p>
          <div class="input-group">
            <label for="assets">총 자산 (원)</label>
            <input type="number" id="assets" v-model="formData.assets" placeholder="0" required />
          </div>
        </div>

        <div v-if="currentStep === 4" class="step-content">
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
            {{ currentStep === 4 ? '설정 완료' : '다음으로' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/api/services'

const router = useRouter()
const currentStep = ref(1)
const userId = ref('DB8ZwD6xk1Q')

const formData = reactive({
  nickname: '',
  isAccountLinked: false,
  assets: null,
  dailyLimit: null,
})

const handleNext = async () => {
  if (currentStep.value < 4) {
    currentStep.value++
  } else {
    // 2. 최종 데이터 전송
    try {
      // 서버 데이터 구조에 맞게 매핑
      const updateData = {
        username: formData.nickname,
        monthly_limit: formData.dailyLimit * 30, // 일별 한도를 한 달 한도로 변환 (선택)
        total_income: formData.assets, // 초기 자산을 총 수입으로 잡거나 필드 추가
        beg_level: 1,
        current_exp: 0,
      }

      console.log(updateData)
      await authService.updateUserInfo(userId.value, updateData)

      // 3. 로컬 스토리지 정보도 최신화 (선택)
      const currentUser = JSON.parse(localStorage.getItem('user'))
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updateData }))

      alert('거지 생활 준비 완료! 탈출을 응원합니다.')
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
