<template>
  <div class="page-view">
    <div class="page-container">
      <header class="page-header">
        <div class="character-circle">
          <span class="avatar">👨‍🌾</span>
        </div>
        <h1 class="logo-text">Cashfolio</h1>
        <p class="sub-text">한 푼 두 푼 모아 탈출하는 거지 생활</p>
      </header>

      <form @submit.prevent="handleLogin" class="login-form" novalidate>
        <div class="input-group">
          <label for="email">이메일</label>
          <input
            type="email"
            id="email"
            v-model="loginData.email"
            placeholder="example@mail.com"
            :class="{ 'error-border': errors.email, shake: shakeFields.email }"
            @blur="validateField('email')"
          />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <div class="input-group">
          <label for="password">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="loginData.password"
            placeholder="비밀번호를 입력하세요"
            :class="{ 'error-border': errors.password, shake: shakeFields.password }"
            @blur="validateField('password')"
          />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="loginData.remember" />
            로그인 유지
          </label>
          <a href="#" class="find-pw">비밀번호 찾기</a>
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '거지 생활 시작하기' }}
        </button>
      </form>

      <footer class="login-footer">
        <div class="divider">
          <span>간편 로그인</span>
        </div>
        <div class="social-links">
          <button class="social-btn kakao">K</button>
          <button class="social-btn google">G</button>
          <button class="social-btn apple">A</button>
        </div>
        <p class="signup-prompt">
          아직 거지가 아니신가요? <router-link to="/registar">회원가입</router-link>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)

const loginData = reactive({
  email: '',
  password: '',
  remember: false,
})

// 에러 메시지 및 흔들림 상태
const errors = reactive({
  email: '',
  password: '',
})

const shakeFields = reactive({
  email: false,
  password: false,
})

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// 개별 필드 검증
const validateField = (field) => {
  let isValid = true
  errors[field] = ''

  if (field === 'email') {
    if (!loginData.email) {
      errors.email = '이메일을 입력해주세요.'
      isValid = false
    } else if (!emailPattern.test(loginData.email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.'
      isValid = false
    }
  }

  if (field === 'password' && !loginData.password) {
    errors.password = '비밀번호를 입력해주세요.'
    isValid = false
  }

  if (!isValid) triggerShake(field)
  return isValid
}

const triggerShake = (field) => {
  shakeFields[field] = true
  setTimeout(() => {
    shakeFields[field] = false
  }, 500)
}

const handleLogin = async () => {
  // 전수 검사
  const isEmailOk = validateField('email')
  const isPwOk = validateField('password')

  if (!isEmailOk || !isPwOk) return

  isLoading.value = true

  try {
    console.log('로그인 시도:', loginData)
    setTimeout(() => {
      router.push('/')
      isLoading.value = false
    }, 1000)
  } catch (error) {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 흔들림 애니메이션 */
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

/* 에러 테두리 */
.error-border {
  border-color: var(--color-error) !important;
  background-color: #fff5f5 !important;
}

.error-text {
  font-size: 12px;
  color: var(--color-error);
  margin-top: 4px;
  text-align: left;
  padding-left: 4px;
}

/* 기존 스타일 유지 */
.character-circle {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 40px;
  border: 2px solid var(--color-primary);
}

.logo-text {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-text-main);
  margin-bottom: 8px;
}
.sub-text {
  font-size: 14px;
  color: var(--color-text-sub);
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}
.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-sub);
  cursor: pointer;
}
.find-pw {
  color: var(--color-text-sub);
  text-decoration: none;
}

.login-btn {
  height: 55px;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 10px;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.login-footer {
  margin-top: 40px;
  text-align: center;
}
.divider {
  position: relative;
  margin-bottom: 25px;
  border-top: 1px solid var(--color-border);
}
.divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-white);
  padding: 0 15px;
  font-size: 12px;
  color: var(--color-text-guide);
}
.social-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}
.social-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  font-weight: bold;
  cursor: pointer;
}
.signup-prompt {
  font-size: 14px;
  color: var(--color-text-sub);
}
.signup-prompt a {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: none;
}
</style>
