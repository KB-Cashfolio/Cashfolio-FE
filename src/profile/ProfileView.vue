<template>
  <div class="profile-page">
    <div v-if="profileStore.loading" class="loading-state">데이터를 불러오는 중...</div>

    <div v-else-if="profileStore.user" class="profile-content">
      <section class="profile-card character-section">
        <div class="character-header">
          <p class="eyebrow">SAVING RANK</p>
          <h2>Lv.{{ profileStore.user.beg_level }} {{ profileStore.user.username }}</h2>
        </div>

        <div class="avatar-display">
          <div class="avatar-circle">🧍</div>
          <p class="status-msg">"오늘도 절약하며 성장하고 있어요!"</p>
        </div>

        <div class="exp-container">
          <div class="exp-label">
            <span>성장 경험치</span>
            <strong>{{ profileStore.user.current_exp }}%</strong>
          </div>
          <div class="exp-track">
            <div class="exp-bar" :style="{ width: `${profileStore.user.current_exp}%` }"></div>
          </div>
        </div>
      </section>

      <section class="profile-card stats-section">
        <h3>누적 활동 기록</h3>
        <div class="stats-grid">
          <div class="stat-item income">
            <p>총 수입</p>
            <strong>{{ formatCurrency(profileStore.user.total_income) }}</strong>
          </div>
          <div class="stat-item expense">
            <p>총 지출</p>
            <strong>{{ formatCurrency(profileStore.user.total_expense) }}</strong>
          </div>
        </div>
      </section>

      <section class="profile-card info-section">
        <h3>계정 정보</h3>
        <div class="info-list">
          <div class="info-row">
            <span class="label">아이디</span>
            <span class="value">{{ profileStore.user.username }}</span>
          </div>
          <div class="info-row">
            <span class="label">이메일</span>
            <span class="value">{{ profileStore.user.email }}</span>
          </div>

          <div v-for="acc in profileStore.accounts" :key="acc.id" class="info-row">
            <span class="label">계좌 ({{ acc.bank }})</span>
            <span class="value account-text">{{ acc.acc_num }}</span>
          </div>

          <div v-if="profileStore.accounts.length === 0" class="info-row">
            <span class="label">계좌 정보</span>
            <span class="value">등록된 계좌가 없습니다.</span>
          </div>
        </div>
      </section>

      <button class="logout-btn" @click="handleLogout">로그아웃</button>
    </div>

    <div v-else class="error-state">
      <p>프로필 정보를 가져올 수 없습니다.</p>
      <button @click="profileStore.fetchUserProfile(profileStore.currentUserId)" class="retry-btn">
        다시 시도
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from './useProfileStore'

const router = useRouter()
const profileStore = useProfileStore()

const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(value)}원`

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    profileStore.user = null
    profileStore.accounts = []
    localStorage.removeItem('user')
    router.push('/login')
  }
}

onMounted(() => {
  const savedUserId = localStorage.getItem('userId') || 'a1'

  // 2. 'a1'을 직접 넣지 않고 변수를 넘김
  profileStore.fetchUserProfile(savedUserId)
})
</script>

<style scoped>
.profile-page {
  width: 100%;
  padding: 20px;
  background-color: #ffffff; /* 핑크색 배경 가리기 */
  min-height: 100dvh; /* 페이지 전체를 흰색으로 채움 */
}

/* 기존 스타일 유지 */
.profile-card {
  background: white;
  border-radius: 28px;
  padding: 24px;
  margin-bottom: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: #b45309;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}
h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.character-section {
  background: linear-gradient(180deg, #fffbeb 0%, #fff7ed 100%);
  border-color: #fde68a;
  text-align: center;
}
.avatar-circle {
  font-size: 60px;
  background: white;
  width: 100px;
  height: 100px;
  line-height: 100px;
  border-radius: 50%;
  margin: 0 auto 12px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

.exp-track {
  height: 10px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
}
.exp-bar {
  height: 100%;
  background: #f59e0b;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.stat-item {
  padding: 16px;
  border-radius: 20px;
  background: #f9fafb;
}
.stat-item.income strong {
  color: #1d4ed8;
}
.stat-item.expense strong {
  color: #e11d48;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
}
.info-row:last-child {
  border-bottom: none;
}

/* 계좌 정보 텍스트 강조 */
.account-text {
  color: #1d4ed8;
  font-weight: 600;
  font-size: 13px;
}

.logout-btn {
  width: 100%;
  padding: 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 20px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}
</style>
