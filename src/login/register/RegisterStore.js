// stores/auth.js
import { defineStore } from 'pinia'
import { reactive, ref, computed, watch } from 'vue'
import { authService } from '@/api/services'

export const useAuthStore = defineStore('auth', () => {
  const isLoading = ref(false)

  // 🔥 로그인 상태
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  /* =========================
     🔹 회원가입 FORM
  ========================= */
  const registerForm = reactive({
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    agreeAll: false,
    agreeTerms: false,
    agreePrivacy: false,
  })

  const registerErrors = reactive({
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  })

  const registerShake = reactive({
    email: false,
    phone: false,
    password: false,
    passwordConfirm: false,
  })

  /* =========================
     🔹 로그인 FORM
  ========================= */
  const loginForm = reactive({
    email: '',
    password: '',
    remember: false,
  })

  const loginErrors = reactive({
    email: '',
    password: '',
  })

  const loginShake = reactive({
    email: false,
    password: false,
  })

  /* =========================
     🔹 공통 유틸
  ========================= */
  const patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
    phone: /^010-\d{3,4}-\d{4}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  }

  const triggerShake = (target, field) => {
    target[field] = false // 강제 초기화
    setTimeout(() => {
      target[field] = true
      setTimeout(() => {
        target[field] = false
      }, 500)
    }, 10)
  }

  /* =========================
     🔹 회원가입 검증
  ========================= */
  const validateRegister = (field) => {
    let isValid = true
    registerErrors[field] = ''

    if (field === 'email' && !patterns.email.test(registerForm.email)) {
      registerErrors.email = '유효한 이메일 형식이 아닙니다.'
      isValid = false
    } else if (field === 'phone' && !patterns.phone.test(registerForm.phone)) {
      registerErrors.phone = '010-0000-0000 형식으로 입력해주세요.'
      isValid = false
    } else if (field === 'password' && !patterns.password.test(registerForm.password)) {
      registerErrors.password = '비밀번호는 8자 이상, 영문+숫자 포함'
      isValid = false
    } else if (
      field === 'passwordConfirm' &&
      registerForm.password !== registerForm.passwordConfirm
    ) {
      registerErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
      isValid = false
    }

    if (!isValid) triggerShake(registerShake, field)
    return isValid
  }

  const isRegisterValid = computed(() => {
    return (
      patterns.email.test(registerForm.email) &&
      patterns.phone.test(registerForm.phone) &&
      patterns.password.test(registerForm.password) &&
      registerForm.password === registerForm.passwordConfirm &&
      registerForm.agreeTerms &&
      registerForm.agreePrivacy
    )
  })

  const toggleAll = () => {
    const val = registerForm.agreeAll
    registerForm.agreeTerms = val
    registerForm.agreePrivacy = val
  }

  /* =========================
     🔹 로그인 검증
  ========================= */
  const validateLogin = (field) => {
    let isValid = true
    loginErrors[field] = ''

    if (field === 'email') {
      if (!loginForm.email) {
        loginErrors.email = '이메일을 입력해주세요.'
        isValid = false
      } else if (!patterns.email.test(loginForm.email)) {
        loginErrors.email = '유효한 이메일 형식이 아닙니다.'
        isValid = false
      }
    }

    if (field === 'password' && !loginForm.password) {
      loginErrors.password = '비밀번호를 입력해주세요.'
      isValid = false
    }

    if (!isValid) triggerShake(loginShake, field)
    return isValid
  }

  /* =========================
     🔥 회원가입
  ========================= */
  const register = async () => {
    const ok =
      validateRegister('email') &&
      validateRegister('phone') &&
      validateRegister('password') &&
      validateRegister('passwordConfirm')

    if (!ok) return { success: false }

    isLoading.value = true

    try {
      const result = await authService.register({
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
      })

      if (result.success) {
        user.value = result.user
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      return result
    } catch (e) {
      console.error(e)
      return { success: false, message: '서버 오류' }
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
      🔹 전화번호 하이픈 자동 포맷팅
  ========================= */
  watch(
    () => registerForm.phone,
    (newValue, oldValue) => {
      // 숫자가 아닌 문자 제거
      const digits = newValue.replace(/\D/g, '')

      // 이전 값과 숫자만 비교했을 때 같다면 업데이트 하지 않음 (무한 루프 방지)
      if (digits === oldValue.replace(/\D/g, '')) return

      let formatted = ''
      if (digits.length <= 3) {
        formatted = digits
      } else if (digits.length <= 7) {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
      } else {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
      }

      registerForm.phone = formatted
    },
  )

  /* =========================
     🔥 로그인
  ========================= */
  const login = async () => {
    const ok = validateLogin('email') && validateLogin('password')
    if (!ok) return { success: false }

    isLoading.value = true

    try {
      const result = await authService.login(loginForm.email, loginForm.password)

      if (result.success) {
        user.value = result.user
        token.value = result.token

        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('token', result.token)
      }

      return result
    } catch (e) {
      console.error(e)
      return { success: false, message: '서버 오류' }
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
     🔥 로그아웃
  ========================= */
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.clear()
  }

  return {
    // 상태
    user,
    token,
    isLoading,

    // 회원가입
    registerForm,
    registerErrors,
    registerShake,
    isRegisterValid,
    validateRegister,
    toggleAll,
    register,

    // 로그인
    loginForm,
    loginErrors,
    loginShake,
    validateLogin,
    login,

    // 공통
    logout,
  }
})
