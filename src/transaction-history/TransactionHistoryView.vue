<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <div>
          <p class="eyebrow">Transaction History</p>
          <h1>거래 내역 조회</h1>
        </div>
      </header>

      <section class="panel calendar-panel">
        <VDatePicker
          v-model="selectedDate"
          expanded
          borderless
          transparent
          @dayclick="onDayClick"
        />
      </section>

      <button class="quick-btn primary-btn" @click="goToAdd">거래 내역 추가 하기</button>

      <section v-if="selectedDetail" class="panel detail-panel">
        <div class="section-head">
          <h3>거래 상세 정보</h3>
          <button class="close-btn" @click="selectedDetail = null">✕</button>
        </div>

        <div class="detail-content">
          <div class="detail-row">
            <span class="label">일시</span><strong>{{ selectedDetail.date }}</strong>
          </div>
          <div class="detail-row">
            <span class="label">카테고리</span
            ><span class="badge">{{ store.getCategoryName(selectedDetail.category_id) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">금액</span>
            <strong
              :class="
                store.getCategoryType(selectedDetail.category_id) === '1' ? 'income' : 'expense'
              "
            >
              {{ store.getCategoryType(selectedDetail.category_id) === '1' ? '+' : '-' }}
              {{ Number(selectedDetail.amount).toLocaleString() }}원
            </strong>
          </div>
          <div class="detail-row">
            <span class="label">메모</span><span>{{ selectedDetail.memo }}</span>
          </div>
        </div>

        <div class="modal-btns mt-20">
          <button class="btn-save" @click="goToUpdate(selectedDetail)">수정</button>
          <button class="btn-cancel" @click="openDeleteModal(selectedDetail.id)">삭제</button>
        </div>
      </section>

      <section v-else class="panel">
        <div class="section-head">
          <h3>{{ isFiltering ? formattedSelectedDate + ' 내역' : '최근 거래 내역' }}</h3>
        </div>

        <div class="transaction-list">
          <div
            v-for="tx in filteredTransactions"
            :key="tx.id"
            class="transaction-item clickable"
            @click="selectedDetail = tx"
          >
            <div class="tx-left">
              <div
                :class="[
                  'tx-icon',
                  store.getCategoryType(tx.category_id) === '1' ? 'income' : 'expense',
                ]"
              >
                {{ store.getCategoryType(tx.category_id) === '1' ? '↗' : '↘' }}
              </div>
              <div>
                <div class="tx-title">{{ tx.memo }}</div>
                <div class="tx-meta">
                  {{ store.getCategoryName(tx.category_id) }} · {{ tx.date }}
                </div>
              </div>
            </div>
            <div
              :class="[
                'tx-amount',
                store.getCategoryType(tx.category_id) === '1' ? 'income' : 'expense',
              ]"
            >
              {{ store.getCategoryType(tx.category_id) === '1' ? '+' : '-'
              }}{{ Number(tx.amount).toLocaleString() }}원
            </div>
          </div>

          <div v-if="filteredTransactions.length === 0" class="empty-state">
            기록된 내역이 없습니다.
          </div>

          <button v-if="isFiltering" class="text-btn" @click="resetFilter">
            최근 거래 내역 보기
          </button>
        </div>
      </section>
    </div>

    <DeleteConfirmModal
      :show="isDeleteModalShow"
      @confirm="confirmDelete"
      @cancel="isDeleteModalShow = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from './TransactionStore'
import { useProfileStore } from '../profile/useProfileStore'
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue'

const store = useTransactionStore()
const router = useRouter()

const selectedDate = ref(new Date())
const isFiltering = ref(true)
const selectedDetail = ref(null)
const isDeleteModalShow = ref(false)
const targetDeleteId = ref(null)

const formattedSelectedDate = computed(() => {
  const d = selectedDate.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const onDayClick = (day) => {
  selectedDate.value = day.date
  isFiltering.value = true
  selectedDetail.value = null
}

const resetFilter = () => {
  isFiltering.value = false
  selectedDate.value = new Date()
}

const filteredTransactions = computed(() => {
  let list = [...store.transactions]

  list.sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date)
    if (dateDiff !== 0) return dateDiff
    return b.id - a.id // ID도 내림차순
  })

  if (isFiltering.value) {
    list = list.filter((tx) => tx.date === formattedSelectedDate.value)
  }
  return list.slice(0, 10)
})

// TransactionsView로 'date' 쿼리를 들고 이동
const goToAdd = () => {
  router.push({
    name: 'updateTx',
    query: { date: formattedSelectedDate.value },
  })
}

// 수정 시에는 ID를 들고 이동
const goToUpdate = (tx) => {
  router.push({
    name: 'updateTx',
    query: { id: tx.id },
  })
}

const openDeleteModal = (id) => {
  console.log('삭제id', id)
  targetDeleteId.value = id
  isDeleteModalShow.value = true
}

async function confirmDelete() {
  if (targetDeleteId.value) {
    try {
      await store.deleteTransaction(targetDeleteId.value)
      isDeleteModalShow.value = false
      selectedDetail.value = null
      console.log('삭제 성공')
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }
}

onMounted(async () => {
  await store.fetchTransactions()
  if (store.categories.length === 0) {
    await store.fetchCategories()
  }

  const userData = localStorage.getItem('user')
  if (userData) {
    const user = JSON.parse(userData)
    const profileStore = useProfileStore() // 프로필 스토어 가져오기

    // 유저 정보(daily_limit, last_settled_date)를 최신화한 뒤 정산 실행
    await profileStore.fetchUserProfile(user.id)
    await profileStore.recalculateTotalExp(user.id)
  }
})
</script>

<style scoped src="../assets/css/transaction.css"></style>
<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg);
  padding: var(--space-lg);
}

.container {
  max-width: var(--max-width-mobile);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* 🔥 패널 */
.panel {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.calendar-panel {
  padding: var(--space-sm);
}

/* 🔥 캘린더 override (라이브러리) */
:deep(.vc-container) {
  background: transparent !important;
  border: none !important;
}

:deep(.vc-header) {
  background-color: transparent !important;
  margin-top: var(--space-sm);
}

:deep(.vc-title) {
  background-color: transparent !important;
  font-weight: 700;
}

:deep(.vc-weeks),
:deep(.vc-arrow),
:deep(.vc-nav-arrow),
:deep(.vc-nav-title) {
  background-color: transparent !important;
}

:deep(.vc-title:hover),
:deep(.vc-arrow:hover) {
  background-color: var(--color-bg) !important;
}

:deep(.vc-highlight) {
  background-color: #2ac1bc !important;
}

/* 🔥 버튼 */
.primary-btn {
  width: 100%;
  background: var(--color-primary);
  color: var(--color-white);
  padding: 18px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: var(--space-sm);
  transition: transform 0.1s ease;
}

.primary-btn:active {
  transform: scale(0.98);
}

/* 🔥 거래 아이템 */
.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: var(--space-sm);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.transaction-item:active {
  transform: scale(0.98);
}

.tx-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.tx-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

/* 🔥 수입 / 지출 시스템 */
.tx-icon.income {
  background: var(--color-income-bg);
  color: var(--color-income);
}

.tx-icon.expense {
  background: var(--color-expense-bg);
  color: var(--color-error);
}

.tx-amount {
  font-weight: 800;
  font-size: var(--text-md);
}

.income {
  color: var(--color-income);
}

.expense {
  color: var(--color-error);
}

/* 🔥 상세 row */
.detail-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-bg);
}

/* 🔥 모달 버튼 */
.modal-btns {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.btn-cancel {
  flex: 1;
  padding: 16px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-expense-bg);
  color: var(--color-error);
  font-weight: 700;
  cursor: pointer;
}

.btn-save {
  flex: 2;
  padding: 16px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-text-main);
  color: var(--color-white);
  font-weight: 700;
  cursor: pointer;
}

/* 🔥 텍스트 버튼 */
.text-btn {
  background: none;
  border: none;
  color: var(#64748b);
  font-weight: 500;
  cursor: pointer;

  padding: var(--space-xs) 0 0 0;
  margin: 0 0 var(--space-md) 0;

  display: block;
  text-align: left;
  font-size: var(--text-sm);
}

/* 🔥 닫기 버튼 */
.close-btn {
  background: var(--color-bg);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 🔥 섹션 헤더 */
.section-head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}
</style>
