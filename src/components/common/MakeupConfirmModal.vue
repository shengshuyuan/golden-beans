<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  habit: {
    type: Object,
    default: null
  },
  makeupCost: {
    type: Number,
    default: 0
  },
  currentGold: {
    type: Number,
    default: 0
  }
})

defineEmits(['close', 'confirm'])

const canAfford = computed(() => props.currentGold >= props.makeupCost)
const remaining = computed(() => props.currentGold - props.makeupCost)
</script>

<template>
  <BaseModal content-class="text-center" @close="$emit('close')">
    <div class="icon">🕰️</div>
    <h3 class="title">补打昨天的习惯</h3>
    <p class="message">
      为"{{ habit?.name || '这项习惯' }}"补上昨天的记录，连续天数会重新连上。
    </p>

    <div class="cost-card">
      <div class="cost-row">
        <span>当前余额</span>
        <strong>{{ currentGold }} 金豆</strong>
      </div>
      <div class="cost-row cost-deduct">
        <span>补卡消耗（2 倍）</span>
        <strong>-{{ makeupCost }} 金豆</strong>
      </div>
      <div class="cost-divider"></div>
      <div class="cost-row">
        <span>补卡后余额</span>
        <strong :class="{ 'text-danger': !canAfford }">{{ remaining }} 金豆</strong>
      </div>
    </div>

    <p v-if="!canAfford" class="warning">
      金豆不足，先完成几个习惯再补卡吧
    </p>
    <p v-else class="warning">
      ⚠️ 补卡仅保连续天数，不发放打卡奖励
    </p>

    <div class="actions">
      <button class="ghost-btn" @click="$emit('close')">再想想</button>
      <button class="confirm-btn" :disabled="!canAfford" @click="$emit('confirm')">
        {{ canAfford ? '立即补卡' : '金豆不足' }}
      </button>
    </div>
  </BaseModal>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.text-center {
  text-align: center;
}

.icon {
  font-size: 34px;
}

.title {
  margin-top: 8px;
  font-size: 22px;
}

.message {
  margin-top: 10px;
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.6;
}

.cost-card {
  margin-top: 14px;
  padding: 14px;
  border-radius: 16px;
  background: #fbf6ef;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  color: $text-secondary;

  strong {
    color: $text-primary;
    font-size: 14px;
  }
}

.cost-deduct strong {
  color: #e65100;
}

.cost-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 4px 0;
}

.text-danger {
  color: #e65100 !important;
}

.warning {
  margin-top: 8px;
  color: #e65100;
  font-size: 13px;
  font-weight: 700;
  background: #fff3e0;
  padding: 8px 12px;
  border-radius: 12px;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.ghost-btn,
.confirm-btn {
  min-height: 44px;
  border-radius: $radius-full;
  font-size: 15px;
  font-weight: 800;
}

.ghost-btn {
  color: $text-secondary;
  background: #f4eee6;
}

.confirm-btn {
  background: linear-gradient(180deg, $primary-color, $primary-deep);
  color: $text-white;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
