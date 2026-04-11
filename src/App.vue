<script setup>
import GlobalNavigationBar from './components/GlobalNavigationBar.vue'
import LaunchScreen from './components/LaunchScreen.vue'
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/login/register/RegisterStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 네비게이션 바를 숨기고 싶은 페이지 이름 리스트
const hideNavRoutes = ['login', 'register'] // router/index.js에 설정한 name 기준
// 현재 페이지가 hideNavRoutes에 포함되지 않을 때만 true
const showNavbar = computed(() => !hideNavRoutes.includes(route.name))
// 초기 상태: 세션 스토리지에 방문 기록이 없다면 로딩중(true)으로 설정
const isLoading = ref(!sessionStorage.getItem('hasSeenLaunchScreen'))

// LaunchScreen에서 3.5초 뒤에 emit('complete')를 쏘면 이 함수가 실행됩니다.
const onLaunchComplete = () => {
  isLoading.value = false
  sessionStorage.setItem('hasSeenLaunchScreen', 'true')
}

// 로딩이 끝나거나, 페이지가 변경될 때마다 로그인 상태를 확인합니다.
watchEffect(() => {
  // 시작 화면이 끝나고, 로그인되어 있지 않으며, 현재 페이지가 로그인/회원가입 페이지가 아니라면
  if (!isLoading.value && !authStore.user && !hideNavRoutes.includes(route.name)) {
    router.push('/login')
  }
})
</script>

<template>
  <LaunchScreen v-if="isLoading" @complete="onLaunchComplete" />

  <div v-else class="main-content">
    <div v-if="showNavbar">
      <GlobalNavigationBar />
    </div>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
}

/* 전체 배경 (PC에서 보이는 배경) */
#app {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px;
  min-width: 320px;
  max-width: 480px; /* 모바일 최대 너비 제한 (보통 420px ~ 480px) */
  min-height: 100dvh; /* 화면 높이 꽉 채우기 (dvh 사용 권장) */
  background-color: rgb(255, 222, 255); /* 실제 모바일 앱의 배경색 */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05); /* PC에서 경계선 구분 */
}

.content {
  display: flex;
  flex: 1; /* 나머지 공간을 다 채움 */
}
</style>
