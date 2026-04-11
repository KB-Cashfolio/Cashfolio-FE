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
      <RouterLink to="/" class="title-link" @click="closeMenu">
        <h1 class="title">우아한 거지들</h1>
      </RouterLink>
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
        <RouterLink to="/chart" @click="closeMenu" class="menu-link">chart</RouterLink>
        <RouterLink to="/profile" @click="closeMenu" class="menu-link">프로필</RouterLink>
      </nav>
    </transition>
  </header>
</template>

<style scoped>
.safe-header {
  padding-top: env(safe-area-inset-top);
  height: calc(56px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 0.5px solid var(--color-border);
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
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-link {
  text-decoration: none;
}

.nav-btn {
  background: none;
  border: none;
  padding: var(--space-md);
  color: var(--color-text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: opacity 0.2s ease;
}

.nav-btn:active {
  opacity: 0.3;
}

/* 🔥 드롭다운 메뉴 */

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

.menu-link {
  padding: var(--space-md) var(--space-lg);
  text-decoration: none;
  color: var(--color-text-main);
  font-size: var(--text-md);
  border-bottom: 0.5px solid var(--color-bg);
}

.menu-link:last-child {
  border-bottom: none;
}

/* 🔥 애니메이션 (슬라이드) */
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
