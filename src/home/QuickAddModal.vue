<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">빠른 거래 추가</h3>

      <div class="input-group">
        <div class="field">
          <label>금액</label>
          <input v-model.number="newTx.amount" type="number" placeholder="금액 입력" />
        </div>

        <div class="field">
          <label>구분</label>
          <div class="type-selector">
            <button v-for="item in inandout" :key="item.id" :class="[
              'type-btn',
              { active: selectedType === item.id },
              item.id === '1' ? 'income' : 'expense',
            ]" @click="selectedType = item.id">
              {{ item.name }}
            </button>
          </div>
        </div>


        <div class="field">
          <label>카테고리</label>
          <select v-model="newTx.category_id">
            <option v-for="c in filteredCategories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>메모</label>
          <input v-model="newTx.memo" placeholder="상세 내용 (선택)" />
        </div>
      </div>

      <div class="modal-btns">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-save" @click="onSave">저장하기</button>
      </div>
    </div>
  </div>
  <AlertModal :show="isAlertShow" :message="alertMsg" @close="isAlertShow = false" />
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from 'vue'
import { useHomeStore } from './HomeStore'
import { useTransactionStore } from '../transaction-history/TransactionStore'
import { storeToRefs } from 'pinia'
import AlertModal from '../components/AlertModal.vue'

const homeStore = useHomeStore()
const transactionStore = useTransactionStore()
const emit = defineEmits(['close'])

const { categories, inandout } = storeToRefs(transactionStore)
const isAlertShow = ref(false)
const alertMsg = ref('')

const newTx = reactive({
  id: '',
  user_id: '',
  category_id: '',
  amount: null,
  date: '',
  memo: '',
})

const showAlert = (msg) => {
  alertMsg.value = msg
  isAlertShow.value = true
}

const selectedType = ref('2') // '2' for 지출 (expense)

const filteredCategories = computed(() => {
  return categories.value.filter((c) => c.type_id === selectedType.value)
})

watch(selectedType, () => {
  const matched = filteredCategories.value
  if (matched.length > 0) {
    newTx.category_id = matched[0].id
  } else {
    newTx.category_id = ''
  }
})

const onSave = async () => {
  if (!newTx.amount) {
    return showAlert('금액을 입력해주세요.')
  }

  const payload = {
    category_id: newTx.category_id,
    amount: newTx.amount,
    memo: newTx.memo
  }

  const isSuccess = await homeStore.addTransaction(payload)

  if (isSuccess) {
    emit('close')
  } else {
    alert('거래 저장에 실패했습니다.')
  }
}

onMounted(async () => {
  if (inandout.value.length === 0) {
    await transactionStore.fetchInAndOut()
  }
  if (categories.value.length === 0) {
    await transactionStore.fetchCategories()
  }

  // 지출이 기본값이므로 지출의 첫번째 카테고리로 설정
  if (selectedType.value === '2' && filteredCategories.value.length > 0) {
    newTx.category_id = filteredCategories.value[0].id
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: var(--color-white);
  width: 90%;
  max-width: 380px;
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

/* 제목 */
.modal-title {
  margin: 0 0 var(--space-md);
  font-size: var(--text-lg);
  font-weight: 800;
  color: var(--color-text-main);
}

/* 입력 그룹 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text-sub);
  margin-left: 4px;
}

/* input / select */
.input-group input,
.input-group select {
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-md);
  background: var(--color-bg);
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

/* select 커스텀 */
.input-group select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  padding-right: 36px !important;
  background-repeat: no-repeat;
  background-position: right var(--space-md) center;
  background-size: 14px;
}

.input-group select::-ms-expand {
  display: none;
}

/* 버튼 영역 */
.modal-btns {
  display: flex;
  gap: var(--space-sm);
}

/* 공통 버튼 */
.btn-cancel,
.btn-save {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--text-md);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.btn-cancel:active,
.btn-save:active {
  transform: scale(0.97);
}

/* 취소 */
.btn-cancel {
  background: var(--color-bg);
  color: var(--color-text-sub);
}

/* 저장 */
.btn-save {
  background: var(--color-text-main);
  color: var(--color-white);
}

/* 🔥 타입 선택 */
.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  background-color: var(--color-bg);
  padding: 5px;
  border-radius: var(--radius-md);
}

.type-btn {
  border: none;
  background: transparent;
  padding: 10px;
  border-radius: var(--radius-sm);
  font-size: var(--text-md);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: var(--color-text-sub);
}

/* 🔥 수입 */
.type-btn.active.income {
  background-color: var(--color-income);
  color: var(--color-white);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

/* 🔥 지출 */
.type-btn.active.expense {
  background-color: var(--color-error);
  color: var(--color-white);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}
</style>
