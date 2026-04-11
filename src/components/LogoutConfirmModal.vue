<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: '로그아웃' },
  description: { type: String, default: '정말 로그아웃 하시겠습니까?' },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('cancel')">
      <div class="modal-panel">
        <div class="modal-content">
          <div class="warning-icon">👋</div>
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="emit('cancel')">취소</button>
          <button class="btn-delete" @click="emit('confirm')">로그아웃</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: var(--space-lg);
}

.modal-panel {
  background: var(--color-white);
  width: 100%;
  max-width: 320px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-content {
  padding: 32px 24px 20px;
  text-align: center;
}

.warning-icon {
  font-size: 40px;
  margin-bottom: var(--space-md);
}

h3 {
  margin: 0 0 var(--space-xs);
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-main);
}

p {
  margin: 0;
  font-size: var(--text-md);
  color: var(--color-text-sub);
  line-height: 1.5;
}

/* 🔥 버튼 영역 */
.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: var(--color-bg);
}

button {
  border: none;
  padding: 14px;
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease;
}

button:active {
  transform: scale(0.96);
}

/* 🔥 취소 버튼 */
.btn-cancel {
  background: var(--color-white);
  color: var(--color-text-sub);
  border: 1px solid var(--color-border);
}

/* 🔥 삭제 버튼 (핵심) */
.btn-delete {
  background: var(--color-error);
  color: var(--color-white);
}

/* 🔥 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
