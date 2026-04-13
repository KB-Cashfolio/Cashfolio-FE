<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <div>
          <p class="eyebrow">Budget Mate</p>
          <h1>{{ currentMonthLabel }}</h1>
        </div>
        <button class="quick-btn" @click="handleQuickAdd">+</button>
      </header>

      <QuickAddModal v-if="isModalOpen" @close="isModalOpen = false" />

      <section class="panel asset-panel">
        <div class="asset-top">
          <div>
            <p class="label">현재 잔액</p>
            <h2>{{ formatCurrency(summary.assets) }}</h2>
          </div>
        </div>

        <div class="asset-grid">
          <div class="mini-card">
            <p>이번 달 수입</p>
            <strong class="income-text">+ {{ formatCurrency(summary.income) }}</strong>
          </div>
          <div class="mini-card">
            <p>이번 달 지출</p>
            <strong class="expense-text">- {{ formatCurrency(summary.expense) }}</strong>
          </div>
        </div>
      </section>

      <section class="beggars-panel">
        <div class="section-head top-align">
          <div>
            <p class="beggars-eyebrow">Saving Character</p>
            <h3>{{ beggars.name }} · Lv.{{ beggars.level }}</h3>
          </div>
        </div>

        <div class="beggars-card">
          <div class="beggars-wrap">
            <div class="beggars">
              <img v-if="beggars.img_path" :src="beggars.img_path" class="beggars-img" />
            </div>
          </div>

          <div class="status-wrap">
            <div class="status-item">
              <div class="status-label-row">
                <span>성장 경험치</span>
                <strong>{{ beggars.exp }}%</strong>
              </div>
              <div class="status-track exp">
                <div class="status-bar exp" :style="{ width: `${beggars.exp}%` }"></div>
              </div>
            </div>
            <div class="beggars-ment" v-if="beggars.ment">{{ beggars.ment }}</div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="section-head">
          <div>
            <h3>최근 거래 내역</h3>
            <br />
            <p>최신 순</p>
          </div>
        </div>

        <div class="transaction-list">
          <div v-for="tx in recentTransactions" :key="tx.id" class="transaction-item">
            <div class="tx-left">
              <div
                :class="['tx-icon', getCategoryType(tx.category_id) === '1' ? 'income' : 'expense']"
              >
                {{ getCategoryType(tx.category_id) === '1' ? '↗' : '↘' }}
              </div>
              <div>
                <div class="tx-title">{{ tx.memo }}</div>
                <div class="tx-meta">{{ getCategoryName(tx.category_id) }} · {{ tx.date }}</div>
              </div>
            </div>
            <div
              :class="['tx-amount', getCategoryType(tx.category_id) === '1' ? 'income' : 'expense']"
            >
              {{ formatCurrency(tx.amount) }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import QuickAddModal from './QuickAddModal.vue'
import { storeToRefs } from 'pinia'
import { useHomeStore } from './HomeStore'
import { useTransactionStore } from '../transaction-history/TransactionStore'
import { useRouter } from 'vue-router' // 1. useRouter 임포트

const store = useHomeStore()
const txStore = useTransactionStore()

const { summary, transactions, beggars } = storeToRefs(store)
const { formatCurrency, fetchHomeData } = store
const { getCategoryName, getCategoryType } = txStore
const isModalOpen = ref(false)
const router = useRouter() // 2. router 인스턴스 생성

const recentTransactions = computed(() => {
  let list = [...transactions.value]

  // 날짜 최신순, 날짜가 같으면 ID 내림차순 정렬
  list.sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date)
    if (dateDiff !== 0) return dateDiff
    return b.id - a.id
  })

  // 홈 화면이므로 가장 최근 5건만 표시 (원하는 숫자로 조절 가능)
  return list.slice(0, 5)
})

const handleQuickAdd = () => {
  const isLogin = localStorage.getItem('user')
  if (!isLogin) {
    alert('로그인이 필요한 서비스입니다.')
    router.push('/login') // 이제 정상 작동합니다.
    return
  }
  isModalOpen.value = true
}

const currentMonthLabel = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return `${year}년 ${month}월`
})

onMounted(async () => {
  await fetchHomeData()
  await txStore.fetchCategories()

  console.log(transactions.value)
  console.log(summary.value)
})
</script>
<style scoped>
* {
  box-sizing: border-box;
}

.page {
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg);
  padding: 20px;
  color: var(--color-text-main);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.container {
  max-width: var(--max-width-mobile);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.header,
.section-head,
.asset-top,
.transaction-item,
.tx-left,
.meta-row,
.status-label-row,
.mission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.top-align {
  align-items: flex-start;
}

.eyebrow,
.beggars-eyebrow {
  margin: 0 0 var(--space-xs);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.eyebrow {
  color: var(--color-text-sub);
}

.beggars-eyebrow {
  color: var(--color-warning);
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: var(--text-2xl);
  line-height: 1.2;
}

h2 {
  margin-top: var(--space-xs);
  font-size: var(--text-3xl);
  line-height: 1.2;
}

h3 {
  font-size: var(--text-xl);
  line-height: 1.3;
}

.quick-btn {
  border: none;
  background: var(--color-primary);
  color: var(--color-white);
  padding: 14px 18px;
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.panel,
.asset-panel,
.beggars-panel {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.panel,
.beggars-panel {
  padding: var(--space-lg);
}

.asset-panel {
  padding: var(--space-xl);
}

.label,
.section-head p,
.beggars-desc,
.mission-reward,
.tx-meta,
.meta-row span {
  color: var(--color-text-sub);
}

.label {
  font-size: var(--text-md);
}

.icon-box {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: var(--color-text-sub);
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.mini-card {
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.mini-card p,
.reward-title,
.tx-meta,
.mission-reward,
.section-head p,
.beggars-desc {
  font-size: var(--text-sm);
}

.mini-card strong {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--text-lg);
  font-weight: 800;
}

.badge,
.mood-badge,
.mission-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 700;
  white-space: nowrap;
}

.badge {
  background: var(--color-bg);
  color: var(--color-text-sub);
}

.progress-track,
.status-track {
  width: 100%;
  overflow: hidden;
  border-radius: 999px;
}

.progress-track {
  height: 12px;
  background: var(--color-border);
  margin-top: var(--space-md);
}

.progress-bar {
  height: 100%;
  background: var(--color-text-main);
  border-radius: 999px;
}

.meta-row {
  margin-top: var(--space-md);
  font-size: var(--text-md);
}

.meta-row strong {
  font-size: var(--text-md);
}

.beggars-panel {
  background: #bee8e6;
  border-color: #bee8e6;
}

.beggars-card {
  margin-top: var(--space-md);
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: var(--space-md);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-xl);
  padding: var(--space-md);
}

.beggars-wrap {
  border-radius: var(--radius-xl);
  background: linear-gradient(180deg, #e6f0f0 0%, #beeceb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
}

.beggars {
  font-size: 52px;
}

.beggars-img {
  width: 100%;
  max-width: 60px;
  object-fit: contain;
}

.beggars-ment {
  margin-top: var(--space-xs);
  font-size: var(--text-sm);
  line-height: 1.4;

  color: #278582; /* 진한 민트색 글자 */
  background: #f0faf9; /* 아주 연한 민트 그레이 배경 */
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  text-align: center;
  font-style: italic; /* 멘트느낌 살리기 */
}

.status-wrap {
  display: flex;
  flex-direction: column;
  margin-top: 25px;
  gap: var(--space-sm);
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.status-label-row span,
.status-label-row strong {
  font-size: var(--text-xs);
}

.status-label-row span {
  color: var(--color-text-sub);
}

.status-track {
  height: 10px;
  background: #beeceb;
}

.status-track.exp {
  background: #beeceb;
}

.status-bar {
  height: 100%;
  background: #beeceb;
  border-radius: 999px;
}

.status-bar.exp {
  background: #2ac1bc;
}

.reward-box {
  margin-top: var(--space-md);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.reward-title {
  font-weight: 700;
  color: var(--color-text-sub);
  margin-bottom: var(--space-xs);
}

.mission-list,
.transaction-list {
  margin-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.mission-item,
.transaction-item {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
}

.mission-title,
.tx-title {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text-main);
}

.mission-badge.done {
  background: #dcfce7;
  color: #166534;
}

.mission-badge.doing {
  background: var(--color-border);
  color: var(--color-text-sub);
}

.tx-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.tx-icon.income {
  background: var(--color-income-bg);
  color: var(--color-income);
}

.tx-icon.expense {
  background: var(--color-expense-bg);
  color: var(--color-expense);
}

.tx-amount {
  font-size: var(--text-md);
  font-weight: 800;
}

.tx-amount.income {
  color: var(--color-income);
}

.tx-amount.expense {
  color: var(--color-expense);
}

.income-text {
  color: var(--color-income);
}
.expense-text {
  color: var(--color-expense);
}

@media (max-width: 420px) {
  .page {
    padding: 14px;
  }

  .container {
    gap: var(--space-md);
  }

  h1 {
    font-size: 26px;
  }

  h2 {
    font-size: 28px;
  }

  .beggars-card {
    grid-template-columns: 1fr;
  }
}
</style>
