<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: '알림' },
  icon: { type: String, default: '💡' },
  message: { type: String, default: '' },
})

const emit = defineEmits(['close'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-panel">
        <div class="modal-content">
          <div class="info-icon">{{ icon }}</div>
          <h3>{{ message }}</h3>
        </div>

        <div class="modal-actions">
          <button class="btn-confirm" @click="emit('close')">확인</button>
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
  z-index: 1000;
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
  word-break: keep-all;
  text-align: center;
}

.info-icon {
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

.modal-actions {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  background: var(--color-bg);
}

button {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.btn-confirm {
  background: var(--color-primary);
  color: var(--color-white);
}

button:active {
  transform: scale(0.98);
}

/* 🔥 페이드 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 🔥 슬라이드 애니메이션 */
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
