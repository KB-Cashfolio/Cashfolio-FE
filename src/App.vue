<script setup>
import GlobalNavigationBar from './components/GlobalNavigationBar.vue'
</script>

<template>
  <div>
    <GlobalNavigationBar />
  </div>

  <main class="content">
    <RouterView />
  </main>
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
