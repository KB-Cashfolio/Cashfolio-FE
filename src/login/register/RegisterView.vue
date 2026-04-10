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
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from './RegisterStore'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const auth = useAuthStore()
const router = useRouter()

// 🔥 핵심
const { registerForm, registerErrors, registerShake, isLoading, isRegisterValid } =
  storeToRefs(auth)

const { validateRegister, toggleAll, register } = auth

const handleSignup = async () => {
  try {
    await register()

    alert('회원가입 성공! 🎉')
    router.push('/StepperForm')
  } catch (err) {
    console.log(err)
    alert(err.message || '회원가입 실패')
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
