<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <div>
          <p class="eyebrow">PROFILE</p>
          <h1>내 정보 관리</h1>
        </div>
      </header>

      <div v-if="profileStore.loading" class="loading-state">데이터를 불러오는 중...</div>

      <div v-else-if="profileStore.user" class="profile-content">
        <section class="panel">
          <p class="character-eyebrow" style="color: #1d4ed8">SAVING RANK</p>
          <div class="character-card" style="background: #f8fafc">
            <div
              class="avatar-wrap"
              style="background: linear-gradient(180deg, #e0fffd 0%, #d4fffd 100%)"
            >
              <img
                v-if="profileStore.character?.img_path"
                :src="profileStore.character.img_path"
                class="profile-img-inner"
              />
              <span v-else class="avatar">🧍</span>
              <span class="avatar-text" style="color: #1e40af"
                >Lv.{{ profileStore.user.beg_level }}</span
              >
            </div>

            <div class="character-info">
              <h3 style="margin-bottom: 4px">
                {{ profileStore.character?.name || '' }} {{ profileStore.user.username }}
              </h3>
              <p class="character-desc">
                "{{ profileStore.character?.ment || '오늘도 절약하며 성장하고 있어요!' }}"
              </p>

              <div class="status-wrap" style="margin-top: 15px">
                <div class="status-item">
                  <div class="status-label-row">
                    <span>성장 경험치</span>
                    <strong style="color: #28aeb0">{{ profileStore.user.current_exp }}%</strong>
                  </div>
                  <div class="status-track blue-track">
                    <div
                      class="status-bar blue-bar"
                      :style="{ width: `${profileStore.user.current_exp}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style="margin-top: 24px">
          <div class="section-head">
            <h3>누적 활동 기록</h3>
          </div>
          <div class="asset-grid">
            <div class="mini-card">
              <p class="label">총 수입</p>
              <strong class="tx-amount income">{{
                formatCurrency(profileStore.user.total_income)
              }}</strong>
            </div>
            <div class="mini-card">
              <p class="label">총 지출</p>
              <strong class="tx-amount expense">{{
                formatCurrency(profileStore.user.total_expense)
              }}</strong>
            </div>
          </div>
        </section>

        <section style="margin-top: 24px">
          <div class="section-head">
            <h3>계정 정보</h3>
          </div>
          <div class="transaction-list">
            <div class="transaction-item">
              <div class="tx-left">
                <div class="tx-icon">👤</div>
                <div>
                  <p class="tx-title">아이디</p>
                  <p class="tx-meta">{{ profileStore.user.username }}</p>
                </div>
              </div>
            </div>
            <div class="transaction-item">
              <div class="tx-left">
                <div class="tx-icon">💵</div>
                <div>
                  <p class="tx-title">일일 소비 한도</p>
                  <p class="tx-meta">{{ profileStore.user.daily_limit }}원</p>
                </div>
              </div>
            </div>
          
          </div>
        </section>

        <div style="margin-top: 30px">
          <button
            @click="openLogoutModal"
            class="quick-btn"
            style="width: 100%; background: #e2e8f0; color: #475569; box-shadow: none"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
    <LogoutConfirmModal
      :show="isLogoutModalVisible"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from './useProfileStore'
import LogoutConfirmModal from '../components/LogoutConfirmModal.vue'

const router = useRouter()
// 🔥 템플릿에서 'profileStore'를 사용하기 위해 반드시 변수 선언!
const profileStore = useProfileStore()

const formatCurrency = (value) =>
  value !== undefined ? `${new Intl.NumberFormat('ko-KR').format(value)}원` : '0원'

const isLogoutModalVisible = ref(false)

const openLogoutModal = () => {
  isLogoutModalVisible.value = true
}

const confirmLogout = () => {
  profileStore.clearUser()
  localStorage.clear()
  // 런치스크린을 다시 표시하기 위해 세션 기록을 삭제
  sessionStorage.removeItem('hasSeenLaunchScreen')
  window.location.href = '/login'
}
const cancelLogout = () => {
  isLogoutModalVisible.value = false
}

onMounted(async () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    const user = JSON.parse(userData)

    // 1. 기본 정보 및 카테고리 로드
    await profileStore.fetchUserProfile(user.id)

    // 2. [핵심] 들어올 때마다 과거 내역 싹 다 훑어서 경험치 맞추기
    await profileStore.recalculateTotalExp(user.id)
  }
})
</script>

<style scoped src="../assets/css/transaction.css"></style>
<style scoped>
/* 🔥 페이지 테마 */
.page {
  background: var(--color-bg-soft);
}

/* 🔥 카드 공통 스타일 */
.mini-card,
.transaction-item,
.category-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

/* 인터랙션 */
.mini-card:active,
.transaction-item:active,
.category-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-card-active);
}

/* 🔥 블루 프로그레스 (커스텀 테마) */
.blue-track {
  height: 10px;
  background: var(--color-blue-bg);
  border-radius: 999px;
  overflow: hidden;
}

.blue-bar {
  height: 100%;
  background: var(--color-accent);
  border-radius: 999px;
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 🔥 프로필 이미지 */
.profile-img-inner {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 🔥 로딩 상태 */
.loading-state {
  text-align: center;
  padding: var(--space-2xl) 0;
  color: var(--color-text-sub);
  font-size: var(--text-md);
}

/* 🔥 아바타 */
.avatar-wrap {
  position: relative;
  border: 2px solid var(--color-accent-soft);
}

.avatar-text {
  position: absolute;
  bottom: 8px;
  font-weight: 800;
  font-size: var(--text-sm);
  color: var(--color-text-main);
}
</style>
