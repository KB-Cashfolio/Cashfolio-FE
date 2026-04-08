<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <div>
          <p class="eyebrow">Budget Mate</p>
          <h1>{{ currentMonthLabel }}</h1>
        </div>
        <button class="quick-btn" @click="isModalOpen = true">+</button>
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
            <strong>+ {{ formatCurrency(summary.income) }}</strong>
          </div>
          <div class="mini-card">
            <p>이번 달 지출</p>
            <strong>- {{ formatCurrency(summary.expense) }}</strong>
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
            <p>최신 순</p>
          </div>
        </div>

        <div class="transaction-list">
          <div v-for="tx in transactions" :key="tx.id" class="transaction-item">
            <div class="tx-left">
              <div :class="['tx-icon', tx.inandout_id === 'in' ? 'income' : 'expense']">
                {{ tx.inandout_id === 'in' ? '↗' : '↘' }}
              </div>
              <div>
                <div class="tx-title">{{ tx.memo }}</div>
                <div class="tx-meta">{{ tx.category }} · {{ tx.date }}</div>
              </div>
            </div>
            <div :class="['tx-amount', tx.inandout_id === 'in' ? 'income' : 'expense']">
              {{ tx.inandout_id === 'in' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
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

const store = useHomeStore()

const { summary, category, transactions, beggars } = storeToRefs(store)
const { formatCurrency, fetchHomeData } = store

const isModalOpen = ref(false)

const currentMonthLabel = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return `${year}년 ${month}월`
})

onMounted(async () => {
  await fetchHomeData()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  color: #0f172a;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.container {
  max-width: 430px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  gap: 12px;
}

.top-align {
  align-items: flex-start;
}

.eyebrow,
.beggars-eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.eyebrow {
  color: #64748b;
}

.beggars-eyebrow {
  color: #b45309;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: 30px;
  line-height: 1.2;
}

h2 {
  margin-top: 8px;
  font-size: 32px;
  line-height: 1.2;
}

h3 {
  font-size: 20px;
  line-height: 1.3;
}

.quick-btn {
  border: none;
  background: #0f172a;
  color: #fff;
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.16);
}

.panel,
.asset-panel,
.beggars-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.panel,
.beggars-panel {
  padding: 20px;
}

.asset-panel {
  padding: 22px;
}

.label,
.section-head p,
.beggars-desc,
.mission-reward,
.tx-meta,
.meta-row span {
  color: #64748b;
}

.label {
  font-size: 14px;
}

.icon-box {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #334155;
}

.asset-grid,
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.mini-card,
.category-card {
  background: #f8fafc;
  border-radius: 20px;
  padding: 16px;
}

.mini-card p,
.category-name,
.reward-title,
.tx-meta,
.mission-reward,
.section-head p,
.beggars-desc {
  font-size: 13px;
}

.mini-card strong,
.category-amount {
  display: block;
  margin-top: 6px;
  font-size: 18px;
  font-weight: 800;
}

.badge,
.mood-badge,
.mission-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.badge {
  background: #f1f5f9;
  color: #334155;
}

.progress-track,
.status-track {
  width: 100%;
  overflow: hidden;
  border-radius: 999px;
}

.progress-track {
  height: 12px;
  background: #e2e8f0;
  margin-top: 14px;
}

.progress-bar {
  height: 100%;
  background: #0f172a;
  border-radius: 999px;
}

.meta-row {
  margin-top: 12px;
  font-size: 14px;
}

.meta-row strong {
  font-size: 14px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #334155;
  margin-bottom: 12px;
}

.beggars-panel {
  background: linear-gradient(180deg, #fffbeb 0%, #fff7ed 100%);
  border-color: #fde68a;
}

.beggars-card {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 26px;
  padding: 16px;
}

.beggars-wrap {
  border-radius: 24px;
  background: linear-gradient(180deg, #fde68a 0%, #fed7aa 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.beggars {
  font-size: 52px;
  line-height: 1;
}

.beggars-img {
  width: 100%;
  height: auto;
  max-width: 60px;
  object-fit: contain;
}

.beggars-ment {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.4;
  color: #92400e;
  background: #fef3c7;
  padding: 8px 12px;
  border-radius: 12px;
  font-style: italic;
  text-align: center;
}

.status-wrap {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 25px;
  width: 100%;
  gap: 12px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-label-row span,
.status-label-row strong {
  font-size: 12px;
}

.status-label-row span {
  color: #475569;
}

.status-track {
  height: 10px;
  background: #e2e8f0;
}

.status-track.exp {
  background: #ffedd5;
}

.status-bar {
  height: 100%;
  background: #334155;
  border-radius: 999px;
}

.status-bar.exp {
  background: #f59e0b;
}

.reward-box {
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 16px;
}

.reward-title {
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.mission-list,
.transaction-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mission-item,
.transaction-item {
  background: #f8fafc;
  border-radius: 18px;
  padding: 14px 16px;
}

.mission-title,
.tx-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.mission-badge.done {
  background: #dcfce7;
  color: #166534;
}

.mission-badge.doing {
  background: #e2e8f0;
  color: #475569;
}

.tx-icon {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.tx-icon.income {
  background: #dbeafe;
  color: #1d4ed8;
}

.tx-icon.expense {
  background: #ffe4e6;
  color: #e11d48;
}

.tx-amount {
  font-size: 14px;
  font-weight: 800;
}

.tx-amount.income {
  color: #1d4ed8;
}

.tx-amount.expense {
  color: #e11d48;
}

@media (max-width: 420px) {
  .page {
    padding: 14px;
  }

  .container {
    gap: 14px;
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

  .asset-grid,
  .category-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
