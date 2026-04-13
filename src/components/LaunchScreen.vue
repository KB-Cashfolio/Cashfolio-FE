<script setup>
import { ref, onMounted } from 'vue'
import img1 from '@/assets/img/lv1.webp'
import img2 from '@/assets/img/lv2.webp'
import img3 from '@/assets/img/lv3.webp'
import img4 from '@/assets/img/lv4.webp'
import img5 from '@/assets/img/lv5.webp'

// 로딩 완료 이벤트를 부모 컴포넌트(App.vue)로 전달하기 위해 정의
const emit = defineEmits(['complete'])

// 상태 관리
const phase = ref('logo') // 'logo' (페이드인) -> 'sequence' (이미지 순차 로딩)
const isLogoVisible = ref(false)

const images = [img1, img2, img3, img4, img5]
const currentImageIndex = ref(0)

onMounted(() => {
  // 1. 로고 페이드인 (0.1초 뒤 시작)
  setTimeout(() => {
    isLogoVisible.value = true
  }, 100)

  // 2. 2초간 로고를 보여준 뒤 시퀀스로 전환
  setTimeout(() => {
    phase.value = 'sequence'
    startImageSequence()
  }, 2000)
})

const startImageSequence = () => {
  // 3. 0.4초 간격으로 이미지 교체
  const interval = setInterval(() => {
    if (currentImageIndex.value < images.length - 1) {
      currentImageIndex.value++
    } else {
      currentImageIndex.value = 0
    }
  }, 400)

  // 4. 총 3.5초 뒤 로딩 종료
  setTimeout(() => {
    clearInterval(interval)
    emit('complete')
  }, 3500)
}
</script>

<template>
  <div class="launch-screen">
    <div v-if="phase === 'logo'" class="logo-container" :class="{ 'fade-in': isLogoVisible }">
      <img src="@/assets/img/logo.webp" alt="우아한 거지들 로고" class="logo-image" />
    </div>

    <div v-else-if="phase === 'sequence'" class="sequence-container fade-in">
      <img :src="images[currentImageIndex]" alt="loading sequence" class="sequence-image" />

      <div class="loading-text-area">
        <div class="spinner"></div>
        <div class="loading-text">
          <p class="primary-text">데이터 분석 중...</p>
          <p class="secondary-text">잠시만 기다려주세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.launch-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* --- Phase 1: 로고 --- */
.logo-container {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 1s ease-out,
    transform 1s ease-out;
}

.logo-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.logo-image {
  width: 330px;
  height: auto;
}

/* --- Phase 2: 시퀀스 --- */
.sequence-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xl);
}

.sequence-container.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.sequence-image {
  width: auto;
  height: 180px;
}

/* --- 로딩 영역 --- */
.loading-text-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-text-sub);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  text-align: center;
}

.primary-text {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-sub);
  margin: 0;
}

.secondary-text {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: var(--space-xs) 0 0 0;
}

/* --- 애니메이션 --- */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
