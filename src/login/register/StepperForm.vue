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
            <input type="text" id="nickname" v-model="formData.nickname" placeholder="예: 탈출꿈나무" required />
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
            <input type="number" id="limit" v-model="formData.dailyLimit" placeholder="0" required />
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

      <AlertModal :show="isAlertShow" :message="alertMsg" :icon="alertIcon" @close="closeAlert" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/index'
import { useAuthStore } from '@/login/register/RegisterStore'
import AlertModal from '@/components/AlertModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const currentStep = ref(1)

// 모달 상태
const isAlertShow = ref(false)
const alertMsg = ref('')
const alertIcon = ref('💡')
const onAlertClose = ref(null) // 모달이 닫힐 때 실행될 콜백

const showAlert = (message, icon = '💡', onCloseCallback = null) => {
  alertMsg.value = message
  alertIcon.value = icon
  onAlertClose.value = onCloseCallback
  isAlertShow.value = true
}

const closeAlert = () => {
  isAlertShow.value = false
  if (typeof onAlertClose.value === 'function') {
    onAlertClose.value()
  }
  onAlertClose.value = null // 콜백 초기화
}

// 🆕 고정된 ID 대신 현재 회원가입/로그인된 유저의 ID를 가져옴
const userId = computed(() => authStore.user?.id)

const formData = reactive({
  nickname: '',
  assets: null,
  dailyLimit: null,
})

const handleNext = async () => {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    // ⚠️ 가드 로직: ID가 없으면 진행 불가
    if (!userId.value) {
      showAlert('유저 세션이 만료되었습니다. 다시 로그인해주세요.', '🚨', () => {
        router.push('/login')
      })
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

      await api.patch(`/users/${userId.value}`, updateData)

      // 2. 🔥 [핵심] 30만원을 '수입' 거래 내역으로 추가
      await api.post('/transactions', {
        user_id: userId.value,
        category_id: '1', // '용돈' 혹은 '기타 수입' 카테고리 ID
        date: todayStr,
        amount: Number(formData.assets),
        memo: '기초 자산', // 나중에 지우지 않도록 메모를 남김
      })

      // 🆕 스토어 및 로컬스토리지 최신화 (프로필 페이지 등에서 즉시 반영되도록)
      const updatedUser = { ...authStore.user, ...updateData }
      authStore.user = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))

      showAlert('우아한 거지가 되신 것을 축하드립니다!', '🎉', () => {
        router.push('/') // 메인 대시보드로 이동
      })
    } catch (error) {
      showAlert('데이터 저장 중 오류가 발생했습니다.', '🚨')
    }
  }
}
</script>

<style scoped>
/* 🔥 Stepper 전체 */
.stepper-progress {
  margin-bottom: var(--space-xl);
}

/* 진행 바 */
.progress-track {
  width: 100%;
  height: 6px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.progress-bar {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

/* 단계 표시 */
.step-indicator {
  font-size: var(--text-xs);
  color: var(--color-text-sub);
  text-align: right;
  font-weight: 600;
}

/* 제목 */
.step-title {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-main);
  margin-bottom: var(--space-xs);
}

/* 설명 */
.step-desc {
  font-size: var(--text-md);
  color: var(--color-text-sub);
  margin-bottom: var(--space-lg);
}

/* 🔥 계좌 연결 박스 */
.account-check-box {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  text-align: center;
  border: 2px dashed var(--color-border);
  transition: all 0.3s ease;
}

/* 활성 상태 */
.account-check-box.active {
  border-color: var(--color-primary);
  background: var(--color-primary-alpha);
}

/* 아이콘 */
.account-check-box .icon {
  font-size: 40px;
  margin-bottom: var(--space-md);
}

/* 🔥 링크 버튼 */
.link-btn {
  margin-top: var(--space-md);
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid var(--color-primary);
  background: var(--color-white);
  color: var(--color-primary);
  font-weight: 600;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.link-btn:active {
  transform: scale(0.96);
}

/* 활성 시 버튼 */
.account-check-box.active .link-btn {
  background: var(--color-primary);
  color: var(--color-white);
}

/* 🔥 버튼 그룹 */
.btn-group {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-xl);
}

/* 이전 버튼 */
.prev-btn {
  flex: 1;
  height: 55px;
  background: var(--color-bg);
  color: var(--color-text-sub);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--text-md);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.prev-btn:active {
  transform: scale(0.97);
}

/* 🔥 다음/제출 버튼 */
.auth-submit-btn {
  flex: 2;
  height: 55px;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* hover */
.auth-submit-btn:hover {
  background: var(--color-primary-dark);
}

/* active */
.auth-submit-btn:active {
  transform: scale(0.97);
}
</style>
