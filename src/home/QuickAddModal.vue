<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">빠른 거래 추가</h3>

      <div class="input-group">
        <div class="field">
          <label>항목명</label>
          <input v-model="newTx.title" placeholder="예: 점심 식사" />
        </div>

        <div class="field">
          <label>금액</label>
          <input v-model.number="newTx.amount" type="number" placeholder="금액 입력" />
        </div>

        <div class="field">
          <label>구분</label>
          <select v-model="newTx.type">
            <option value="expense">지출 (-)</option>
            <option value="income">수입 (+)</option>
          </select>
        </div>

        <div class="input-row">
          <div class="field">
            <label>은행명</label>
            <input v-model="newTx.bank" placeholder="은행" />
          </div>
          <div class="field">
            <label>계좌번호</label>
            <input v-model="newTx.acc_num" placeholder="번호 입력" />
          </div>
        </div>

        <div class="field">
          <label>카테고리</label>
          <input v-model="newTx.category" placeholder="예: 식비, 교통" />
        </div>

        <div class="field">
          <label>메모</label>
          <input v-model="newTx.memo" placeholder="상세 내용" />
        </div>
      </div>

      <div class="modal-btns">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-save" @click="onSave">저장하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useHomeStore } from './HomeStore'

const store = useHomeStore()
const emit = defineEmits(['close'])

const newTx = reactive({
  title: '',
  amount: 0,
  type: 'expense',
  category: '기타',
})

const onSave = async () => {
  if (!newTx.title || newTx.amount <= 0) return alert('내용을 입력해주세요!')

  const isSuccess = await store.addTransaction({
    memo: newTx.title,
    amount: newTx.amount,
    category: newTx.category,
    inandout_id: newTx.type === 'income' ? 'in' : 'out',
    bank_name: newTx.bank,
    account_number: newTx.acc_num,
    detail_memo: newTx.memo,
  })

  if (isSuccess) {
    newTx.title = ''
    newTx.amount = 0
    emit('close')
  } else {
    alert('거래 저장에 실패했습니다.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 380px;
  padding: 24px; /* 살짝 줄임 */
  border-radius: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 800;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 필드 간 간격 */
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-left: 4px;
}

.input-group input,
.input-group select {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  background: #f8fafc;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.input-group select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  padding-right: 36px !important;

  background-repeat: no-repeat;

  background-position: right 16px center;
  background-size: 14px;
}

.input-group select::-ms-expand {
  display: none;
}

.input-row {
  display: grid;
  grid-template-columns: 0.7fr 1.3fr;
  gap: 8px;
}

.modal-btns {
  display: flex;
  gap: 10px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-save {
  background: #0f172a;
  color: white;
}
</style>
