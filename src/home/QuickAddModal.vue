<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">빠른 거래 추가</h3>

      <div class="input-group">
        <label>항목명</label>
        <input v-model="newTx.title" placeholder="예: 점심 식사, 급여" />

        <label>금액</label>
        <input v-model.number="newTx.amount" type="number" placeholder="금액을 입력하세요" />

        <label>구분</label>
        <select v-model="newTx.type">
          <option value="expense">지출 (-)</option>
          <option value="income">수입 (+)</option>
        </select>

        <label>카테고리</label>
        <input v-model="newTx.category" placeholder="예: 식비, 교통" />
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

  await store.addTransaction({
    memo: newTx.title, 
    amount: newTx.amount,
    category: newTx.category,
    inandout_id: newTx.type === 'income' ? 'in' : 'out', 
    user_id: '0001', // 유저 ID (JSON에 있는 값)
    date: new Date().toISOString().split('T')[0], 
  })

  newTx.title = ''
  newTx.amount = 0
  emit('close')
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
  padding: 28px;
  border-radius: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 800;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.input-group label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  margin-top: 8px;
}

.input-group input,
.input-group select {
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-size: 15px;
  background: #f8fafc;
}

.modal-btns {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 18px;
  font-weight: 700;
  background: #f1f5f9;
  cursor: pointer;
}

.btn-save {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 18px;
  font-weight: 700;
  background: #0f172a;
  color: white;
  cursor: pointer;
}
</style>
