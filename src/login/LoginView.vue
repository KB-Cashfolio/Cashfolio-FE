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
            v-model="loginForm.email"
            placeholder="example@mail.com"
            :class="{ 'error-border': loginErrors.email, shake: loginShake.email }"
            @blur="auth.validateLogin('email')"
          />
          <p v-if="loginErrors.email" class="error-text">{{ loginErrors.email }}</p>
        </div>

        <div class="input-group">
          <label for="password">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="loginForm.password"
            placeholder="비밀번호를 입력하세요"
            :class="{ 'error-border': loginErrors.password, shake: loginShake.password }"
            @blur="auth.validateLogin('password')"
          />
          <p v-if="loginErrors.password">{{ loginErrors.password }}</p>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="loginForm.remember" />
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
          아직 거지가 아니신가요? <router-link to="/register">회원가입</router-link>
        </p>
      </footer>
      <AlertModal :show="isAlertShow" :message="alertMsg" :icon="alertIcon" @close="closeAlert" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/login/register/RegisterStore'
import AlertModal from '../components/AlertModal.vue'

const auth = useAuthStore()
const router = useRouter()

const { loginForm, loginErrors, loginShake, isLoading } = storeToRefs(auth)

const isAlertShow = ref(false)
const alertMsg = ref('')
const alertIcon = ref('💡')
const loginSucceeded = ref(false)

const showAlert = (message, icon = '💡') => {
  alertMsg.value = message
  isAlertShow.value = true
  alertIcon.value = icon
}

const handleLogin = async () => {
  try {
    await auth.login(loginForm.value.email, loginForm.value.password)
    loginSucceeded.value = true
    showAlert('환영합니다! 👋')
  } catch (err) {
    showAlert(err.message)
  }
}

const closeAlert = () => {
  isAlertShow.value = false
  if (loginSucceeded.value) {
    // router.push('/') 대신 페이지 전체를 새로고침하며 이동
    window.location.href = '/' 
  }
}
</script>

<style scoped>
/* 🔥 흔들림 애니메이션 */
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

.error-text {
  font-size: var(--text-xs);
  color: var(--color-error);
  margin-top: var(--space-xs);
  text-align: left;
  padding-left: 4px;
}

/* 🔥 캐릭터 */
.character-circle {
  width: 80px;
  height: 80px;
  background: var(--color-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  font-size: 40px;
  border: 2px solid var(--color-primary);
}

/* 🔥 로고 */
.logo-text {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-main);
  margin-bottom: var(--space-xs);
}

.sub-text {
  font-size: var(--text-md);
  color: var(--color-text-sub);
}

/* 🔥 폼 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* 옵션 영역 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
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

/* 🔥 로그인 버튼 */
.login-btn {
  height: 55px;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.1s ease,
    opacity 0.2s ease;
  margin-top: var(--space-sm);
}

.login-btn:active {
  transform: scale(0.98);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 🔥 하단 */
.login-footer {
  margin-top: var(--space-xl);
  text-align: center;
}

/* 구분선 */
.divider {
  position: relative;
  margin-bottom: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-white);
  padding: 0 var(--space-md);
  font-size: var(--text-xs);
  color: var(--color-text-guide);
}

/* 🔥 소셜 로그인 */
.social-links {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.social-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.social-btn:active {
  transform: scale(0.95);
}

/* 회원가입 유도 */
.signup-prompt {
  font-size: var(--text-md);
  color: var(--color-text-sub);
}

.signup-prompt a {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: none;
}
</style>
