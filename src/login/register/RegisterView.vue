<template>
  <div class="page-view">
    <div class="page-container">
      <header class="page-header">
        <button class="back-btn" @click="$router.back()">←</button>
        <h1>거지 등록하기</h1>
        <p>기초 자산 0원부터 시작하는 자산 관리</p>
      </header>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="input-group">
          <label for="email">이메일 주소</label>
          <input
            type="email"
            id="email"
            v-model="registerForm.email"
            placeholder="example@gmail.com"
            :class="{ 'error-border': registerErrors.email, shake: registerShake.email }"
            @blur="validateRegister('email')"
            required
          />
          <p v-if="registerErrors.email" class="error-text">{{ registerErrors.email }}</p>
        </div>

        <div class="input-group">
          <label for="phone">전화번호</label>
          <input
            type="text"
            id="phone"
            v-model="registerForm.phone"
            placeholder="010-1234-5678"
            :class="{ 'error-border': registerErrors.phone, shake: registerShake.phone }"
            @blur="validateRegister('phone')"
            required
          />
          <p v-if="registerErrors.phone" class="error-text">{{ registerErrors.phone }}</p>
        </div>

        <div class="input-group">
          <label for="password">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="registerForm.password"
            placeholder="8자 이상, 영문/숫자 포함"
            :class="{ 'error-border': registerErrors.password, shake: registerShake.password }"
            @blur="validateRegister('password')"
            required
          />
          <p v-if="registerErrors.password" class="error-text">{{ registerErrors.password }}</p>
        </div>

        <div class="input-group">
          <label for="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            v-model="registerForm.passwordConfirm"
            placeholder="한 번 더 입력해주세요"
            :class="{
              'error-border': registerErrors.passwordConfirm,
              shake: registerShake.passwordConfirm,
            }"
            @blur="validateRegister('passwordConfirm')"
            required
          />
          <p v-if="registerErrors.passwordConfirm" class="error-text">
            {{ registerErrors.passwordConfirm }}
          </p>
        </div>

        <div class="agreement-section">
          <label class="checkbox-label">
            <input type="checkbox" v-model="registerForm.agreeAll" @change="toggleAll" />
            <strong>전체 동의하기</strong>
          </label>
          <hr />
          <label class="checkbox-label">
            <input type="checkbox" v-model="registerForm.agreeTerms" required />
            (필수) 이용약관 동의
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="registerForm.agreePrivacy" required />
            (필수) 개인정보 수집 및 이용 동의
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="!isRegisterValid || isLoading">
          {{ isLoading ? '등록 중...' : '거지 라이프 시작' }}
        </button>
      </form>

      <AlertModal :show="isAlertShow" :message="alertMsg" :icon="alertIcon" @close="closeAlert" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from './RegisterStore'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AlertModal from '../../components/AlertModal.vue'

const auth = useAuthStore()
const router = useRouter()

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

//  핵심
const { registerForm, registerErrors, registerShake, isLoading, isRegisterValid } =
  storeToRefs(auth)

const { validateRegister, toggleAll, register } = auth

const handleSignup = async () => {
  try {
    await register()
    setTimeout(() => {
      // router.push('/StepperForm')
      window.location.href = '/StepperForm'
    }, 1500)
  } catch (err) {
    alert(err.message || '회원가입 실패')
  }
}
</script>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  20%,
  60% {
    transform: translateX(-5px);
  }

  40%,
  80% {
    transform: translateX(5px);
  }
}

.shake {
  animation: shake 0.4s ease-in-out;
}

/* 🔥 에러 상태 */
.error-border {
  border-color: var(--color-error) !important;
  background-color: rgba(239, 68, 68, 0.08) !important;
}

/* 🔥 입력 그룹 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.input-group label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-sub);
}

/* 🔥 인풋 */
.input-group input {
  height: 48px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: var(--text-md);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

/* 🔥 포커스 UX 강화 */
.input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-white);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}

/* 🔥 에러 메시지 */
.error-text {
  font-size: var(--text-xs);
  color: var(--color-error);
  margin-top: 2px;
  font-weight: 500;
}

/* 🔥 뒤로가기 버튼 */
.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-sub);
}

/* 🔥 헤더 */
.signup-header h1 {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-main);
}

/* 🔥 폼 레이아웃 */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* 🔥 약관 영역 */
.agreement-section {
  background: var(--color-bg);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* 🔥 제출 버튼 */
.submit-btn {
  height: 55px;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--text-md);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

/* 클릭 효과 */
.submit-btn:active {
  transform: scale(0.98);
}

/* 비활성 상태 */
.submit-btn:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

/* 🔥 인풋 폰트 스타일 수정 (도현체 탈출 및 가독성 확보) */
.input-group input {
  height: 48px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);

  /* 1. 입력창은 가독성이 중요하므로 Pretendard 적용 */
  font-family: 'Pretendard', sans-serif !important;
  font-size: var(--text-md);

  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

/* 2. 비밀번호 점(●)이 잘 보이도록 자간 조절 */
.input-group input[type='password'] {
  letter-spacing: 0.12em;
}

/* 3. 힌트 텍스트(placeholder) 폰트도 통일 */
.input-group input::placeholder {
  font-family: 'Pretendard', sans-serif !important;
  font-size: var(--text-sm);
}

/* 🔥 포커스 UX 강화 */
.input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-white);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}
</style>
