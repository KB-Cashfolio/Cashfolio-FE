<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <div>
          <p class="eyebrow">Analysis</p>
          <h1>소비 리포트</h1>
        </div>
      </header>

      <section class="panel">
        <div class="section-head">
          <div class="head-title">
            <h3>카테고리별 분석</h3>
            <p>어디에 가장 많이 {{ chartType === 'expense' ? '썼을까요?' : '벌었을까요?' }}</p>
          </div>
          <div class="toggle-group">
            <button :class="{ active: chartType === 'expense' }" @click="chartType = 'expense'">
              지출
            </button>
            <button :class="{ active: chartType === 'income' }" @click="chartType = 'income'">
              수입
            </button>
          </div>
        </div>

        <div class="month-navigator">
          <button class="nav-btn" @click="prevMonth" :disabled="selectedMonth === 0">&lt;</button>
          <h2 class="current-month">{{ selectedMonth + 1 }}월</h2>
          <button class="nav-btn" @click="nextMonth" :disabled="selectedMonth === 11">&gt;</button>
        </div>

        <div class="chart-wrapper">
          <v-chart class="chart" :option="pieChartOption" autoresize @click="handleChartClick" />
        </div>
      </section>

      <section class="panel">
        <div class="section-head">
          <div>
            <h3>연간 추이</h3>
            <p>나의 1년 {{ chartType === 'expense' ? '소비' : '수입' }} 패턴</p>
          </div>
        </div>
        <div class="chart-wrapper mini">
          <v-chart class="chart" :option="lineChartOption" autoresize />
        </div>
      </section>

      <div class="asset-grid">
        <div class="mini-card">
          <p class="label">최대 {{ chartType === 'expense' ? '지출' : '수입' }} 월</p>
          <strong>{{ maxMonth }}</strong>
        </div>
        <div class="mini-card">
          <p class="label">총 {{ chartType === 'expense' ? '지출액' : '수입액' }} (1년)</p>
          <strong :style="{ color: chartType === 'expense' ? '#e11d48' : '#1d4ed8' }">
            {{
              chartType === 'expense'
                ? totalExpense.toLocaleString()
                : totalIncome.toLocaleString()
            }}원
          </strong>
        </div>
      </div>
    </div>

    <TransactionListModal
      :show="isModalVisible"
      :title="`${selectedMonth + 1}월 ${selectedCategory}`"
      :transactions="selectedTransactions"
      :type="chartType"
      @close="isModalVisible = false"
    />
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
import TransactionListModal from './TransactionListModal.vue'
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

const allTransactions = ref([])
const categoryMap = ref({}) // ✨ Computed에서 접근할 수 있도록 ref로 변경
const categoryColorMap = ref({})
const categoryOrderMap = ref({})

// 토글 상태 ('expense' | 'income')
const chartType = ref('expense')

// ✨ 현재 선택된 월 상태 (0 = 1월, 11 = 12월) - 기본값은 현재 실제 월
const selectedMonth = ref(new Date().getMonth())

// 1년치 월별 합산 데이터 (꺾은선 차트용)
const expenseMonthlyData = ref(new Array(12).fill(0))
const incomeMonthlyData = ref(new Array(12).fill(0))
const totalIncome = ref(0)
const totalExpense = ref(0)

const userData = localStorage.getItem('user')
const currentUserId = userData ? JSON.parse(userData).id : null

const isModalVisible = ref(false)
const selectedCategory = ref('')
const selectedTransactions = ref([])

// ✨ 월 변경 함수
const prevMonth = () => {
  if (selectedMonth.value > 0) selectedMonth.value--
}
const nextMonth = () => {
  if (selectedMonth.value < 11) selectedMonth.value++
}

// 데이터 불러오기
const fetchData = async () => {
  try {
    const [txRes, catRes] = await Promise.all([
      api.get(`/transactions?user_id=${currentUserId}`),
      api.get('/category'),
    ])

    allTransactions.value = txRes.data

    const tempMap = {}
    const tempColorMap = {}
    const tempOrderMap = {} // ✨ 순서 맵 임시 변수

    const expColors = [
      '#7F1D1D', // 가장 진한 (딥 레드)
      '#DC2626', // 중간 (선명한 레드)
      '#EF4444', // 기준 (메인 레드)
      '#FCA5A5', // 밝은 레드
      '#FEE2E2', // 아주 연한
    ]
    const incColors = [
      '#0F766E', // 가장 진한 (딥 민트)
      '#14B8A6', // 중간 (선명)
      '#2AC1BC', // 기준 컬러
      '#5EEAD4', // 밝은 민트
      '#CCFBF1',
    ]

    let expIdx = 0
    let incIdx = 0
    let orderIdx = 0 // ✨ 전체 카테고리 순서를 매길 변수

    catRes.data.forEach((cat) => {
      tempMap[cat.id] = cat

      // ✨ 서버에서 받아온 카테고리 순서대로 고유 번호를 부여합니다.
      tempOrderMap[cat.name] = orderIdx++

      if (cat.type_id === '2') {
        tempColorMap[cat.name] = expColors[expIdx % expColors.length]
        expIdx++
      } else if (cat.type_id === '1') {
        tempColorMap[cat.name] = incColors[incIdx % incColors.length]
        incIdx++
      }
    })

    categoryMap.value = tempMap
    categoryColorMap.value = tempColorMap
    categoryOrderMap.value = tempOrderMap

    const expMonthSums = new Array(12).fill(0)
    const incMonthSums = new Array(12).fill(0)
    let incSum = 0
    let expSum = 0

    allTransactions.value.forEach((tx) => {
      const cat = categoryMap.value[tx.category_id]
      if (!cat) return

      const amount = Number(tx.amount)
      const monthIndex = new Date(tx.date).getMonth()

      if (cat.type_id === '2') {
        // 지출
        expMonthSums[monthIndex] += amount
        expSum += amount
      } else if (cat.type_id === '1') {
        // 수입
        incMonthSums[monthIndex] += amount
        incSum += amount
      }
    })

    expenseMonthlyData.value = expMonthSums
    incomeMonthlyData.value = incMonthSums
    totalExpense.value = expSum
    totalIncome.value = incSum
  } catch (err) {
    console.error('데이터 로드 에러:', err)
  }
}

// ✨ 선택된 월(selectedMonth)과 토글 상태(chartType)에 맞는 도넛 차트 데이터 실시간 계산
const currentCategoryData = computed(() => {
  const targetTypeId = chartType.value === 'expense' ? '2' : '1'
  const sums = {}

  allTransactions.value.forEach((tx) => {
    const cat = categoryMap.value[tx.category_id]
    if (!cat || cat.type_id !== targetTypeId) return

    const txMonth = new Date(tx.date).getMonth()
    if (txMonth === selectedMonth.value) {
      sums[cat.name] = (sums[cat.name] || 0) + Number(tx.amount)
    }
  })

  return Object.entries(sums)
    .map(([name, value]) => ({
      name,
      value,
      // ✨ 차트 데이터 하나하나에 매핑된 고정 색상을 명시적으로 넣어줍니다.
      itemStyle: { color: categoryColorMap.value[name] },
    }))
    .sort((a, b) => categoryOrderMap.value[a.name] - categoryOrderMap.value[b.name])
})

// ✨ 선택된 월의 총액 (차트 가운데 들어갈 금액)
const currentMonthTotal = computed(() => {
  return currentCategoryData.value.reduce((sum, item) => sum + item.value, 0)
})

const compareText = computed(() => {
  const currentTotal = currentMonthlyData.value[selectedMonth.value]

  // ✨ 1. 이번 달 지출/수입이 아예 0원인 경우 가장 먼저 처리
  if (currentTotal === 0) return '해당 월 데이터 없음'

  // 2. 1월(인덱스 0)이라서 이전 달 데이터가 없는 경우
  if (selectedMonth.value === 0) return '이전 달 데이터 없음'

  const prevTotal = currentMonthlyData.value[selectedMonth.value - 1]
  const diff = currentTotal - prevTotal

  const actionWord = chartType.value === 'expense' ? '썼어요' : '벌었어요'

  if (diff > 0) {
    return `지난달보다 \n${diff.toLocaleString()}원 더 ${actionWord}`
  } else if (diff < 0) {
    return `지난달보다 \n${Math.abs(diff).toLocaleString()}원 덜 ${actionWord}`
  } else {
    return '지난달과 금액이 같아요'
  }
})

// 꺾은선 차트용 연간 데이터
const currentMonthlyData = computed(() => {
  return chartType.value === 'expense' ? expenseMonthlyData.value : incomeMonthlyData.value
})

const handleChartClick = (params) => {
  if (params.componentType !== 'series' || params.seriesType !== 'pie') return

  selectedCategory.value = params.name
  const targetTypeId = chartType.value === 'expense' ? '2' : '1'

  // ✨ 모달 클릭 시, 카테고리뿐만 아니라 "현재 선택된 월"의 내역만 뽑아오도록 조건 추가
  selectedTransactions.value = allTransactions.value
    .filter((tx) => {
      const cat = categoryMap.value[tx.category_id]
      const txMonth = new Date(tx.date).getMonth()
      return (
        cat &&
        cat.name === params.name &&
        cat.type_id === targetTypeId &&
        txMonth === selectedMonth.value
      )
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  isModalVisible.value = true
}

// --- 차트 옵션 설정 ---

const pieChartOption = computed(() => {
  const isExpense = chartType.value === 'expense'
  const titleLabel = isExpense ? '총 지출액' : '총 수입액'
  const amountColor = isExpense ? '#e11d48' : '#1d4ed8'

  return {
    title: {
      // ✨ 텍스트에 {compare|...} 구역을 추가해서 3줄로 만듭니다.
      text: `{label|${titleLabel}}\n{amount|${currentMonthTotal.value.toLocaleString()}원}\n{compare|${compareText.value}}`,
      left: 'center',
      top: '33%', // ✨ 글씨가 3줄이 되었으므로 중심을 살짝 더 위로 올립니다. (38% -> 33%)
      textStyle: {
        rich: {
          label: {
            fontSize: 13,
            color: '#64748b',
            padding: [0, 0, 4, 0],
            fontFamily: 'Pretendard',
            align: 'center',
          },
          // ✨ 금액 아래에 여백(padding bottom 8px)을 주어 비교 문구와 살짝 띄웁니다.
          amount: {
            fontSize: 20,
            fontWeight: 800,
            color: amountColor,
            padding: [0, 0, 8, 0],
            fontFamily: 'Pretendard',
            align: 'center',
          },
          // ✨ 새로 추가된 비교 문구의 디자인 (약간 작고 연한 글씨)
          compare: {
            fontSize: 12,
            color: '#94a3b8',
            fontWeight: 600,
            fontFamily: 'Pretendard',
            align: 'center',
          },
        },
      },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [12, 24],
      borderRadius: 12,
      extraCssText:
        'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);',
      formatter: (params) => `
        <div style="display: flex; flex-direction: column; gap: 4px; font-family: 'Pretendard', sans-serif; min-width: 140px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${params.color};"></span>
            <span style="font-size: 13px; color: #64748b; font-weight: 600;">${params.name}</span>
          </div>
          <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 2px;">
            <span style="font-size: 17px; font-weight: 800; color: #0f172a;">${params.value.toLocaleString()}원</span>
            <span style="font-size: 13px; font-weight: 700; color: ${params.color};">${params.percent}%</span>
          </div>
        </div>
      `,
    },
    legend: {
      bottom: '0%',
      width: '98%',
      left: 'center',
      icon: 'circle',
      itemGap: 10,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 13,
        color: '#475569',
        padding: [0, 0, 0, 2],
        fontFamily: 'Pretendard',
      },
    },
    series: [
      {
        type: 'pie',
        center: ['50%', '45%'],
        radius: ['50%', '73%'], // ✨ 텍스트가 3줄이 되어 공간이 좁아 보일 수 있으니 안쪽 구멍을 살짝 더 넓힙니다. (45% -> 48%)
        avoidLabelOverlap: false,
        padAngle: 5,
        itemStyle: { borderRadius: 10 },
        label: { show: false },
        data:
          currentCategoryData.value.length > 0
            ? currentCategoryData.value
            : [{ name: '내역 없음', value: 0, itemStyle: { color: '#f1f5f9' } }],
      },
    ],
  }
})

const lineChartOption = computed(() => {
  const isExpense = chartType.value === 'expense'
  const lineColor = isExpense ? '#e11d48' : '#1d4ed8'
  const areaColor = isExpense ? 'rgba(225, 29, 72, 0.1)' : 'rgba(29, 78, 216, 0.1)'
  const labelText = isExpense ? '지출' : '수입' // ✨ 툴팁에 띄워줄 글씨

  return {
    grid: { top: 20, bottom: 20, left: 50, right: 10 },

    // ✨ 꺾은선 차트용 커스텀 툴팁
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [12, 16], // 양옆 여백을 적당히 16px로 조정
      borderRadius: 12,
      extraCssText:
        'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);',
      formatter: (params) => {
        // axis 트리거는 params가 배열로 들어옵니다. (우리는 선이 1개라 params[0]을 사용)
        const data = params[0]
        return `
          <div style="display: flex; flex-direction: column; gap: 8px; font-family: 'Pretendard', sans-serif; min-width: 140px;">
            <div style="font-size: 13px; color: #64748b; font-weight: 600;">${data.name}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${data.color};"></span>
                <span style="font-size: 14px; font-weight: 700; color: #475569;">${labelText}</span>
              </div>
              <span style="font-size: 16px; font-weight: 800; color: #0f172a;">${Number(data.value).toLocaleString()}원</span>
            </div>
          </div>
        `
      },
    },

    xAxis: {
      type: 'category',
      data: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      axisLine: { show: false },
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      {
        data: currentMonthlyData.value,
        type: 'line',
        smooth: true,
        lineStyle: { width: 4, color: lineColor },
        itemStyle: { color: lineColor },
        areaStyle: { color: areaColor },
      },
    ],
  }
})

const maxMonth = computed(() => {
  const data = currentMonthlyData.value
  const maxVal = Math.max(...data)
  if (maxVal === 0) return '-'
  const idx = data.indexOf(maxVal)
  return `${idx + 1}월`
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
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.section-head {
  margin-bottom: var(--space-lg);
}

/* 상단 타이틀이 좁아지는 것을 방지 */
.head-title {
  flex: 1;
}

.eyebrow {
  margin: 0 0 var(--space-xs);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-sub);
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

.panel {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: var(--space-lg);
}

.label,
.section-head p {
  color: var(--color-text-sub);
  font-size: var(--text-sm);
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

.mini-card strong {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--text-lg);
  font-weight: 800;
}

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

/* 수입 지출 토글 */
.toggle-group {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
  width: 120px;
}

.toggle-group button {
  border: none;
  background: transparent;
  flex: 1;
  padding: 8px 0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.toggle-group button.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ✨ 월 이동 네비게이터 스타일 */
.month-navigator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
}

.current-month {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  min-width: 60px;
  text-align: center;
}

.nav-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
