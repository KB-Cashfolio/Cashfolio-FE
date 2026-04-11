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
/* 기존에 제공해주신 CSS를 그대로 사용하면서 아래 페이지만을 위한 스타일만 추가합니다 */
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

.asset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.mini-card {
  background: #f8fafc;
  border-radius: 20px;
  padding: 16px;
}

.mini-card p,
.reward-title,
.tx-meta,
.mission-reward,
.section-head p,
.beggars-desc {
  font-size: 13px;
}

.mini-card strong {
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

  .asset-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.chart-wrapper {
  width: 100%;
  height: 320px; /* 차트 높이 설정 */
  margin-top: 10px;
}

.chart-wrapper.mini {
  height: 200px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 패널 내 헤더 여백 조정 */
.section-head {
  margin-bottom: 20px;
}

/* 애니메이션 효과 */
.panel {
  transition: transform 0.2s ease;
}
.panel:active {
  transform: scale(0.98);
}
</style>
