<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <div>
          <p class="eyebrow">Analysis</p>
          <h1>소비 리포트</h1>
        </div>
        <button class="quick-btn" @click="fetchData">갱신</button>
      </header>

      <section class="panel">
        <div class="section-head">
          <div>
            <h3>카테고리별 지출</h3>
            <p>어디에 가장 많이 썼을까요?</p>
          </div>
        </div>
        <div class="chart-wrapper">
          <v-chart class="chart" :option="pieChartOption" autoresize />
        </div>
      </section>

      <section class="panel">
        <div class="section-head">
          <div>
            <h3>요일별 지출 추이</h3>
            <p>나의 주간 소비 패턴</p>
          </div>
        </div>
        <div class="chart-wrapper mini">
          <v-chart class="chart" :option="lineChartOption" autoresize />
        </div>
      </section>

      <div class="asset-grid">
        <div class="mini-card">
          <p class="label">최대 지출 요일</p>
          <strong>{{ maxExpenseDay }}요일</strong>
        </div>
        <div class="mini-card">
          <p class="label">총 수입액</p>
          <strong style="color: #1d4ed8">{{ totalIncome.toLocaleString() }}원</strong>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

// 유저가 언급한 api 객체 임포트
import api from '@/api/index'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const categoryData = ref([])
const weeklyData = ref([0, 0, 0, 0, 0, 0, 0])
const totalIncome = ref(0)
const userData = localStorage.getItem('user')
const currentUserId = userData ? JSON.parse(userData).id : null
const fetchData = async () => {
  try {
    // 1. 거래 내역과 카테고리 정보를 동시에 가져옴
    const [txRes, catRes] = await Promise.all([
      api.get(`/transactions?user_id=${currentUserId}`),
      api.get('/category'),
    ])

    const transactions = txRes.data
    const categories = catRes.data

    // 카테고리 맵 생성 (ID로 빠르게 찾기 위함)
    const categoryMap = {}
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat
    })

    const catSums = {}
    const weekSums = [0, 0, 0, 0, 0, 0, 0]
    let incomeSum = 0

    transactions.forEach((tx) => {
      const cat = categoryMap[tx.category_id]
      if (!cat) return

      const amount = Number(tx.amount)

      // type_id "2" 는 지출
      if (cat.type_id === '2') {
        // 카테고리별 합산
        catSums[cat.name] = (catSums[cat.name] || 0) + amount

        // 요일별 합산
        const day = new Date(tx.date).getDay()
        weekSums[day] += amount
      }
      // type_id "1" 은 수입
      else if (cat.type_id === '1') {
        incomeSum += amount
      }
    })

    // 차트용 데이터 변환
    categoryData.value = Object.entries(catSums).map(([name, value]) => ({ name, value }))
    weeklyData.value = weekSums
    totalIncome.value = incomeSum
  } catch (err) {
    console.error('데이터 로드 에러:', err)
  }
}

// --- 차트 옵션 설정 ---

const pieChartOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c}원 ({d}%)' },
  legend: { bottom: '0%', left: 'center', icon: 'circle' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      padAngle: 5,
      itemStyle: { borderRadius: 10 },
      label: { show: false },
      data: categoryData.value,
    },
  ],
  color: ['#e11d48', '#1d4ed8', '#f59e0b', '#10b981', '#6366f1'],
}))

const lineChartOption = computed(() => ({
  grid: { top: 20, bottom: 20, left: 50, right: 10 },
  xAxis: {
    type: 'category',
    data: ['일', '월', '화', '수', '목', '금', '토'],
    axisLine: { show: false },
  },
  yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
  series: [
    {
      data: weeklyData.value,
      type: 'line',
      smooth: true,
      lineStyle: { width: 4, color: '#0f172a' },
      itemStyle: { color: '#0f172a' },
      areaStyle: { color: 'rgba(15, 23, 42, 0.1)' },
    },
  ],
}))

const maxExpenseDay = computed(() => {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const idx = weeklyData.value.indexOf(Math.max(...weeklyData.value))
  return weeklyData.value[idx] === 0 ? '-' : days[idx]
})

onMounted(fetchData)
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

.section-head {
  margin-bottom: var(--space-lg);
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
  background: var(--color-text-main);
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
  transition: transform 0.2s ease;
}

.panel:active {
  transform: scale(0.98);
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
}

.meta-row {
  margin-top: var(--space-md);
  font-size: var(--text-md);
}

.meta-row strong {
  font-size: var(--text-md);
}

.beggars-panel {
  background: linear-gradient(180deg, #fffbeb 0%, #fff7ed 100%);
  border-color: #fde68a;
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
  background: linear-gradient(180deg, #fde68a 0%, #fed7aa 100%);
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
  color: #92400e;
  background: #fef3c7;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  text-align: center;
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
  background: var(--color-border);
}

.status-track.exp {
  background: var(--color-warning-bg);
}

.status-bar {
  height: 100%;
  background: var(--color-text-sub);
}

.status-bar.exp {
  background: var(--color-warning);
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

/* 🔥 차트 영역 */
.chart-wrapper {
  width: 100%;
  height: 320px;
  margin-top: var(--space-sm);
}

.chart-wrapper.mini {
  height: 200px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 반응형 */
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