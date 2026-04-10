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
/* 1. 페이지 전체 배경색 변경 */
.page {
  background: #f9ffff !important; /* !important를 사용해 공용 설정보다 우선순위를 높입니다 */
}

/* 2. mini-card 및 category-card 배경색 흰색으로 변경 & 테두리 추가 */
.mini-card,
.transaction-item,
.category-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0; /* profile card와 비슷한 느낌의 테두리 추가 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); /* 은은한 그림자로 입체감 부여 */
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

/* 3. 파란색 프로그레스 바 전용 스타일 (지난 대화 내용 유지) */
.blue-track {
  height: 10px;
  background: #eff6ff;
  border-radius: 999px;
  overflow: hidden;
}

.blue-bar {
  height: 100%;
  background: #60e2dc;
  border-radius: 999px;
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.profile-img-inner {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.loading-state {
  text-align: center;
  padding: 80px 0;
  color: #64748b;
}

/* 아바타 텍스트 위치 및 강조 */
.avatar-wrap {
  position: relative;
  border: 2px solid #dbeafe; /* 아바타 테두리도 살짝 강조 */
}

.avatar-text {
  position: absolute;
  bottom: 8px;
  font-weight: 800;
}
</style>
