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
            v-model="formData.email"
            placeholder="example@gmail.com"
            :class="{ 'error-border': errors.email, shake: shakeFields.email }"
            @blur="validateField('email')"
            required
          />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <div class="input-group">
          <label for="phone">전화번호</label>
          <input
            type="text"
            id="phone"
            v-model="formData.phone"
            placeholder="010-1234-5678"
            :class="{ 'error-border': errors.phone, shake: shakeFields.phone }"
            @blur="validateField('phone')"
            required
          />
          <p v-if="errors.phone" class="error-text">{{ errors.phone }}</p>
        </div>

        <div class="input-group">
          <label for="password">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            placeholder="8자 이상, 영문/숫자 포함"
            :class="{ 'error-border': errors.password, shake: shakeFields.password }"
            @blur="validateField('password')"
            required
          />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>

        <div class="input-group">
          <label for="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            v-model="formData.passwordConfirm"
            placeholder="한 번 더 입력해주세요"
            :class="{ 'error-border': errors.passwordConfirm, shake: shakeFields.passwordConfirm }"
            @blur="validateField('passwordConfirm')"
            required
          />
          <p v-if="errors.passwordConfirm" class="error-text">{{ errors.passwordConfirm }}</p>
        </div>

        <div class="agreement-section">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.agreeAll" @change="toggleAll" />
            <strong>전체 동의하기</strong>
          </label>
          <hr />
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.agreeTerms" required />
            (필수) 이용약관 동의
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.agreePrivacy" required />
            (필수) 개인정보 수집 및 이용 동의
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="!isFormValid || isLoading">
          {{ isLoading ? '등록 중...' : '거지 라이프 시작' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)

const formData = reactive({
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  agreeAll: false,
  agreeTerms: false,
  agreePrivacy: false,
})

// 에러 메시지 및 흔들림 상태 관리
const errors = reactive({
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
})

const shakeFields = reactive({
  email: false,
  phone: false,
  password: false,
  passwordConfirm: false,
})

// 정규식 패턴
const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^010-\d{3,4}-\d{4}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // 최소 8자, 영문/숫자 포함
}

// 개별 필드 검증 로직
const validateField = (field) => {
  let isValid = true
  errors[field] = ''

  if (field === 'email' && !patterns.email.test(formData.email)) {
    errors.email = '유효한 이메일 형식이 아닙니다.'
    isValid = false
  } else if (field === 'phone' && !patterns.phone.test(formData.phone)) {
    errors.phone = '010-0000-0000 형식으로 입력해주세요.'
    isValid = false
  } else if (field === 'password' && !patterns.password.test(formData.password)) {
    errors.password = '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.'
    isValid = false
  } else if (field === 'passwordConfirm' && formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    isValid = false
  }

  // 실패 시 흔들기 효과
  if (!isValid) {
    triggerShake(field)
  }

  return isValid
}

const triggerShake = (field) => {
  shakeFields[field] = true
  setTimeout(() => {
    shakeFields[field] = false
  }, 500) // 애니메이션 지속 시간 후 해제
}

const isFormValid = computed(() => {
  return (
    patterns.email.test(formData.email) &&
    patterns.phone.test(formData.phone) &&
    patterns.password.test(formData.password) &&
    formData.password === formData.passwordConfirm &&
    formData.agreeTerms &&
    formData.agreePrivacy
  )
})

const toggleAll = () => {
  const val = formData.agreeAll
  formData.agreeTerms = val
  formData.agreePrivacy = val
}

const handleSignup = async () => {
  // 최종 전수 검사
  const isEmailOk = validateField('email')
  const isPhoneOk = validateField('phone')
  const isPwOk = validateField('password')
  const isPwConfirmOk = validateField('passwordConfirm')

  if (!isEmailOk || !isPhoneOk || !isPwOk || !isPwConfirmOk) return

  isLoading.value = true
  try {
    setTimeout(() => {
      alert('환영합니다! 이제 거지의 삶이 시작되었습니다.')
      router.push('/stepperForm')
      isLoading.value = false
    }, 1500)
  } catch (error) {
    alert('가입 중 오류가 발생했습니다.')
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 흔들림 애니메이션 키프레임 */
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

/* 에러 테두리 스타일 */
.error-border {
  border-color: var(--color-error) !important;
  background-color: #fff5f5 !important; /* 살짝 붉은 배경으로 강조 */
}

/* 기존 스타일 유지 및 보완 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 5px;
}

.input-group label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.input-group input {
  height: 48px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: white;
}

.error-text {
  font-size: 12px;
  color: var(--color-error);
  margin-top: 2px;
  font-weight: 500;
}

/* 나머지 스타일 (주석 생략) */
.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-sub);
}
.signup-header h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-main);
}
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.agreement-section {
  background: var(--color-bg);
  padding: 15px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.submit-btn {
  height: 55px;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}
.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
</style>
