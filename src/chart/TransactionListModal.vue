<script setup>
defineProps({
    show: Boolean,
    title: String,
    transactions: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['close']);

// Helper to format numbers with commas
const formatAmount = (amount) => {
    return Number(amount).toLocaleString();
};
</script>

<template>
    <Transition name="fade">
        <div v-if="show" class="modal-overlay" @click.self="emit('close')">
            <div class="modal-panel">
                <header class="modal-header">
                    <h3>{{ title }} 지출 내역</h3>
                    <button class="close-btn" @click="emit('close')">&times;</button>
                </header>
                <div class="modal-content">
                    <div v-if="transactions.length > 0" class="transaction-list">
                        <div v-for="tx in transactions" :key="tx.id" class="transaction-item">
                            <div class="tx-left">
                                <div>
                                    <p class="tx-date">{{ tx.date }}</p>
                                    <p class="tx-memo">{{ tx.memo || '메모 없음' }}</p>
                                </div>
                            </div>
                            <p class="tx-amount">-{{ formatAmount(tx.amount) }}원</p>
                        </div>
                    </div>
                    <div v-else class="empty-state">
                        <p>해당 카테고리의 지출 내역이 없습니다.</p>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* Basic modal styles, inspired by DeleteConfirmModal */
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
    padding: 20px;
}

.modal-panel {
    background: #fff;
    width: 100%;
    max-width: 400px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease-out;
    display: flex;
    flex-direction: column;
    max-height: 80vh;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #94a3b8;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.modal-content {
    padding: 8px 24px 24px;
    overflow-y: auto;
}

.transaction-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
}

.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
}

.transaction-item:last-child {
    border-bottom: none;
}

.tx-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.tx-date {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin: 0 0 4px;
}

.tx-memo {
    font-size: 13px;
    color: #64748b;
    margin: 0;
}

.tx-amount {
    font-size: 15px;
    font-weight: 700;
    color: #e11d48;
    white-space: nowrap;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #94a3b8;
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
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

export default Modal