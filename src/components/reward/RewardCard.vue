<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../stores/user'

const props = defineProps({
  reward: {
    type: Object,
    required: true
  },
  canAfford: {
    type: Boolean,
    default: false
  }
})

defineEmits(['redeem', 'edit', 'delete'])

const userStore = useUserStore()

// 还差多少金豆
const shortage = computed(() => {
  if (props.canAfford) return 0
  return props.reward.cost - userStore.gold
})
</script>

<template>
  <article class="reward-card">
    <div class="reward-icon">{{ reward.icon }}</div>
    <div class="reward-cost">{{ reward.cost }} 金豆</div>
    <h3 class="reward-name">{{ reward.name }}</h3>
    <p class="reward-desc">{{ reward.description || '给坚持一个明确的小奖励。' }}</p>

    <div class="reward-actions">
      <button class="edit-btn" @click="$emit('edit', reward)">编辑</button>
      <button class="delete-btn" @click="$emit('delete', reward)">删除</button>
    </div>

    <button class="redeem-btn" :class="{ 'can-redeem': canAfford }" :disabled="!canAfford" @click="$emit('redeem', reward)">
      {{ canAfford ? '立即兑换' : `还差 ${shortage} 金豆` }}
    </button>
  </article>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.reward-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: $shadow-sm;
}

.reward-icon {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff8ef, #ffe8c7);
  font-size: 28px;
}

.reward-cost {
  color: $primary-deep;
  font-size: 13px;
  font-weight: 800;
}

.reward-name {
  font-size: 18px;
  line-height: 1.2;
}

.reward-desc {
  color: $text-secondary;
  font-size: 13px;
  line-height: 1.6;
}

.reward-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.edit-btn,
.delete-btn,
.redeem-btn {
  min-height: 40px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 800;
}

.edit-btn {
  background: #f6efe6;
  color: $text-secondary;
}

.delete-btn {
  background: rgba(221, 91, 80, 0.12);
  color: $danger-color;
}

.redeem-btn {
  @include button-primary;
  width: 100%;
  min-height: 42px;
  font-size: 14px;
}

.redeem-btn:disabled {
  background: #efe7dd;
  color: $text-light;
  box-shadow: none;
}

.redeem-btn.can-redeem {
  background: linear-gradient(135deg, #ff9b31 0%, #ff6b00 100%);
  box-shadow: 0 4px 16px rgba(255, 107, 0, 0.3);
}
</style>
