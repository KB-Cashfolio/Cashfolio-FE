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

const router = useRouter()
const currentStep = ref(1)

const formData = reactive({
  nickname: '',
  isAccountLinked: false,
  assets: null,
  dailyLimit: null,
})

const handleNext = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  } else {
    // 최종 제출 로직
    console.log('최종 데이터:', formData)
    alert('모든 설정이 완료되었습니다!')
    router.push('/')
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
