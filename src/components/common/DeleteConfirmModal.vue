<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  reward: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const dialogVisible = ref(props.show)

function handleConfirm() {
  emit('confirm', props.reward)
}

function handleCancel() {
  emit('cancel')
}

// 监听 props 变化
watch(() => props.show, (newVal) => {
  dialogVisible.value = newVal
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="dialogVisible" class="dialog-overlay" @click="handleCancel">
        <div class="dialog-content" @click.stop>
          <div class="dialog-icon">🗑️</div>
          <h3 class="dialog-title">删除奖励</h3>
          <p class="dialog-message">
            确定要删除奖励「<strong>{{ reward.name }}</strong>」吗？<br>
            删除后无法恢复。
          </p>
          <div class="dialog-actions">
            <button class="cancel-btn" @click="handleCancel">取消</button>
            <button class="confirm-btn" @click="handleConfirm">确认删除</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  width: 90%;
  max-width: 320px;
  background: white;
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dialog-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.dialog-title {
  font-size: 22px;
  font-weight: 800;
  color: $primary-dark;
  margin-bottom: 12px;
}

.dialog-message {
  font-size: 15px;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 24px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-btn,
.confirm-btn {
  min-height: 44px;
  padding: 0 24px;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.cancel-btn {
  background: rgba(240, 240, 240, 0.9);
  color: $text-primary;

  &:hover {
    background: rgba(220, 220, 220, 0.9);
  }
}

.confirm-btn {
  background: rgba(255, 112, 67, 0.9);
  color: white;

  &:hover {
    background: rgba(255, 67, 54, 0.9);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>