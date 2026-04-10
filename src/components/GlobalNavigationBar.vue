<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMenuOpen = ref(false)

// 햄버거 메뉴 토글
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 메뉴 링크 클릭 시 닫기
const closeMenu = () => {
  isMenuOpen.value = false
}

// 뒤로가기 기능
const goBack = () => {
  router.back()
}
</script>

<template>
  <header class="safe-header">
    <div class="header-section left">
      <button @click="goBack" class="nav-btn">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </div>

    <div class="header-section center">
      <h1 class="title">우아한 거지들</h1>
    </div>

    <div class="header-section right">
      <button @click="toggleMenu" class="nav-btn">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>

    <transition name="slide">
      <nav v-if="isMenuOpen" class="dropdown-menu">
        <RouterLink to="/" @click="closeMenu" class="menu-link">홈</RouterLink>
        <RouterLink to="/transaction-history" @click="closeMenu" class="menu-link"
          >거래내역</RouterLink
        >
        <RouterLink to="/profile" @click="closeMenu" class="menu-link">프로필</RouterLink>
      </nav>
    </transition>
  </header>
</template>

<style scoped>
/* 기존 디자인 그대로 유지 */
.safe-header {
  padding-top: env(safe-area-inset-top);
  height: calc(56px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 0.5px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-section {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-section.center {
  justify-content: center;
}

.header-section.right {
  justify-content: flex-end;
}

.title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-btn {
  background: none;
  border: none;
  padding: 12px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}

.nav-btn:active {
  opacity: 0.3;
}

/* --- 메뉴 전용 스타일 추가 --- */

.dropdown-menu {
  position: absolute;
  top: 100%; /* 헤더 바로 아래 붙음 */
  left: 0;
  width: 100%;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.menu-link {
  padding: 16px 20px;
  text-decoration: none;
  color: #333;
  font-size: 15px;
  border-bottom: 0.5px solid #f5f5f5;
}

.menu-link:last-child {
  border-bottom: none;
}

/* 애니메이션 (위에서 아래로 스르륵) */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
