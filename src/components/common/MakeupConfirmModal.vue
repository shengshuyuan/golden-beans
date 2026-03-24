<script setup>
import { computed } from 'vue'
import { HABIT_TYPE_CONFIG } from '../../stores/habit'
import { useUserStore } from '../../stores/user'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['confirm', 'close'])

const userStore = useUserStore()
const typeConfig = computed(() => HABIT_TYPE_CONFIG[props.habit?.type])
const makeupCost = computed(() => (typeConfig.value?.gold || 0) * 2)
const canAfford = computed(() => userStore.gold >= makeupCost.value)

function confirm() {
  if (canAfford.value) {
    emit('confirm')
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-card">
        <div class="warning-badge">!</div>
        <h2 class="modal-title">补打卡确认</h2>
        <p class="modal-text">补打卡需要消耗双倍金豆</p>
        <div class="cost-value" :class="{ danger: !canAfford }">-{{ makeupCost }} 金豆</div>
        <p class="modal-hint">连续天数会继续累计</p>
        <p v-if="!canAfford" class="insufficient">当前金豆不足，暂时无法补卡</p>

        <div class="actions">
          <button class="btn-cancel" @click="emit('close')">取消</button>
          <button class="btn-confirm" :disabled="!canAfford" @click="confirm">确认补卡</button>
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
  padding: 24px;
  z-index: 1000;
}

.modal-card {
  width: min(100%, 600px);
  padding: 32px 24px 24px;
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.97);
  text-align: center;
  box-shadow: $shadow-lg;
}

.warning-badge {
  width: 96px;
  height: 84px;
  margin: 0 auto 16px;
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  background: linear-gradient(180deg, #ffb15f, #ff9540);
  color: $text-white;
  font-size: 48px;
  font-weight: 900;
  line-height: 90px;
}

.modal-title {
  margin-bottom: 16px;
  font-size: 28px;
}

.modal-text {
  margin-bottom: 14px;
  font-size: 17px;
  color: $text-primary;
}

.cost-value {
  margin-bottom: 16px;
  font-size: clamp(30px, 8vw, 40px);
  line-height: 1;
  font-weight: 900;
  color: $danger-color;

  &.danger {
    color: $danger-color;
  }
}

.modal-hint {
  color: $text-light;
  font-size: 15px;
}

.insufficient {
  margin-top: 10px;
  color: $danger-color;
  font-size: $font-sm;
  font-weight: 700;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 24px;
}

.btn-cancel,
.btn-confirm {
  min-height: 56px;
  border-radius: $radius-full;
  font-size: 18px;
  font-weight: 800;
}

.btn-cancel {
  @include button-secondary;
  color: $text-white;
}

.btn-confirm {
  @include button-primary;

  &:disabled {
    background: linear-gradient(180deg, #e1ddd6 0%, #cdc6bc 100%);
    box-shadow: none;
    color: #948a80;
  }
}
</style>
