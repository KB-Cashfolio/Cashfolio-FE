<!-- <template>
  <div class="profile-container">
    <header class="profile-header">
      <div>
        <p class="eyebrow">My Profile</p>
        <h1>사용자 프로필</h1>
      </div>
      <button class="secondary-btn">로그아웃</button>
    </header>

    <section class="character-panel">
      <div class="section-head top-align">
        <div>
          <p class="character-eyebrow">User Rank</p>
          <h3>{{ user.beg_level_name }} · Lv.{{ user.beg_level }}</h3>
          <p class="character-desc">다음 레벨까지 얼마 남지 않았어요!</p>
        </div>
        <span class="mood-badge">상위 15%</span>
      </div>

      <div class="character-card">
        <div class="avatar-wrap">
          <div class="avatar">📉</div>
          <div class="avatar-text">성장 중</div>
        </div>

        <div class="status-wrap">
          <div class="status-item">
            <div class="status-label-row">
              <span>현재 등급 경험치</span>
              <strong>{{ user.current_exp }}%</strong>
            </div>
            <div class="status-track exp">
              <div class="status-bar exp" :style="{ width: `${user.current_exp}%` }"></div>
            </div>
          </div>
          <p class="info-text">활동을 통해 거지를 탈출하세요!</p>
        </div>
      </div>
    </section>

    <section class="panel asset-panel">
      <div class="section-head">
        <h3>누적 활동 기록</h3>
      </div>
      <div class="asset-grid">
        <div class="mini-card income-focus">
          <p>총 수입</p>
          <strong>{{ formatCurrency(user.total_income) }}</strong>
        </div>
        <div class="mini-card expense-focus">
          <p>총 지출</p>
          <strong>{{ formatCurrency(user.total_expense) }}</strong>
        </div>
      </div>
    </section>

    <section class="panel account-info">
      <div class="section-head">
        <h3>계정 정보</h3>
      </div>
      <div class="info-list">
        <div class="info-row">
          <span class="info-label">아이디</span>
          <span class="info-value">{{ user.username }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">이메일</span>
          <span class="info-value">{{ user.email }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">회원 번호</span>
          <span class="info-value">#{{ user.user_id }}</span>
        </div>
      </div>
    </section>

    <button class="back-home-btn" @click="$router.push('/')">메인으로 돌아가기</button>
  </div>
</template>

<script setup>
// 실제로는 API 등을 통해 가져올 데이터
const user = {
  user_id: 1024,
  username: 'budget_master',
  email: 'gemini@example.com',
  beg_level: 2,
  beg_level_name: '성실한 평민',
  current_exp: 45,
  total_income: 15800000,
  total_expense: 9450000,
}

const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(value)}원`
</script>

<style scoped>
/* App.vue에서 max-width를 잡고 있으므로 여기서는 padding만 신경씁니다. */
.profile-container {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background-color: #f8fafc; /* 모바일 배경 */
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 { font-size: 24px; margin: 0; }
.eyebrow { font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: bold; }

/* 공통 패널 스타일 */
.panel, .character-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.character-panel {
  background: linear-gradient(180deg, #fffbeb 0%, #fff7ed 100%);
  border-color: #fde68a;
}

/* 그리드 및 카드 */
.asset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 15px;
}

.mini-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 16px;
}

.income-focus strong { color: #1d4ed8; }
.expense-focus strong { color: #e11d48; }

/* 상태 바 */
.status-track {
  height: 10px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 8px;
}

.status-bar.exp {
  height: 100%;
  background: #f59e0b;
}

/* 계정 정보 리스트 */
.info-list {
  margin-top: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child { border-bottom: none; }
.info-label { color: #64748b; font-size: 14px; }
.info-value { font-weight: 600; font-size: 14px; }

/* 버튼 */
.secondary-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.back-home-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 16px;
  font-weight: bold;
  margin-top: 10px;
}
</style> -->

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
            <span class="label">이메일</span>
            <span class="value">{{ profileStore.user.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">회원번호</span>
            <span class="value">#{{ profileStore.user.id }}</span>
          </div>
        </div>
      </section>

      <button class="logout-btn">로그아웃</button>
    </div>
    <div v-else class="error-state">
      <p>프로필 정보를 가져올 수 없습니다.</p>
      <button @click="profileStore.fetchUserProfile('0001')" class="retry-btn">다시 시도</button>
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

// 3. 로그아웃 함수 선언
const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    // 스토어 데이터 초기화 (필요시)
    profileStore.user = null
    // 브라우저 저장소 비우기
    localStorage.removeItem('user')
    // 페이지 이동
    router.push('/login')
  }
}

onMounted(() => {
  // 컴포넌트 로드 시 1024번 유저 정보 호출 (db.json 기준)
  profileStore.fetchUserProfile('0001')
})
</script>

<style scoped>
.profile-page {
  width: 100%;
  padding: 20px;
  /* GlobalNavigationBar가 sticky이므로 상단 여백은 App.vue의 content 설정에 따라 조절됨 */
}

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

/* 경험치 스타일 */
.character-section {
  background: linear-gradient(180deg, #fffbeb 0%, #fff7ed 100%);
  border-color: #fde68a;
  text-align: center;
}

.avatar-display {
  margin: 20px 0;
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

.status-msg {
  font-size: 13px;
  color: #6b7280;
}

.exp-container {
  margin-top: 20px;
  text-align: left;
}
.exp-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
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

/* 그리드 스타일 */
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
.stat-item p {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}
.stat-item strong {
  font-size: 15px;
  font-weight: 700;
}
.stat-item.income strong {
  color: #1d4ed8;
}
.stat-item.expense strong {
  color: #e11d48;
}

/* 리스트 스타일 */
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
}
.info-row:last-child {
  border-bottom: none;
}
.label {
  font-size: 14px;
  color: #6b7280;
}
.value {
  font-size: 14px;
  font-weight: 500;
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
