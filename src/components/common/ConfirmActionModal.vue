<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  tone: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['confirm', 'close'])
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-card">
        <div class="modal-badge" :class="tone">{{ tone === 'danger' ? '!' : '⋯' }}</div>
        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-text">{{ message }}</p>

        <div class="actions">
          <button class="btn-cancel" @click="emit('close')">{{ cancelText }}</button>
          <button class="btn-confirm" :class="tone" @click="emit('confirm')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(29, 22, 17, 0.56);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-card {
  width: min(calc(100vw - 40px), 360px);
  padding: 24px 20px 18px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.98);
  text-align: center;
  box-shadow: $shadow-lg;
  border: 1px solid rgba(255, 255, 255, 0.84);
}

.modal-badge {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 240, 215, 0.95);
  color: $primary-dark;
  font-size: 28px;
  font-weight: 800;

  &.danger {
    background: $danger-soft;
    color: $danger-color;
  }
}

.modal-title {
  margin-bottom: 8px;
  font-size: 20px;
  color: $text-primary;
}

.modal-text {
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.55;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.btn-cancel,
.btn-confirm {
  min-height: 46px;
  border-radius: $radius-full;
  font-size: 15px;
  font-weight: 800;
}

.btn-cancel {
  @include button-secondary;
  color: $text-secondary;
}

.btn-confirm {
  @include button-primary;

  &.danger {
    background: linear-gradient(180deg, #ff8f81 0%, #f24d3d 100%);
    box-shadow: 0 12px 26px rgba(242, 77, 61, 0.22);
  }
}
</style>
