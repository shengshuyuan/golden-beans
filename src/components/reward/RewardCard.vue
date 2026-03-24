<script setup>
import { computed } from 'vue'
import { REWARD_CATEGORIES } from '../../stores/reward'

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

const emit = defineEmits(['redeem', 'edit', 'delete'])

const category = computed(() => {
  return Object.values(REWARD_CATEGORIES).find(item => item.name === props.reward.category) || REWARD_CATEGORIES.OTHER
})

const hasRedeemed = computed(() => (props.reward.redeemCount || 0) > 0)

function handleRedeem() {
  if (!props.canAfford) return
  emit('redeem', props.reward)
}

function handleEdit() {
  emit('edit', props.reward)
}

function handleDelete() {
  emit('delete', props.reward)
}
</script>

<template>
  <article class="reward-card" :class="{ disabled: !canAfford, redeemed: hasRedeemed }">
    <div class="reward-icon">{{ category.icon }}</div>
    <h3 class="reward-name">{{ reward.name }}</h3>
    <p class="reward-cost">{{ reward.cost }} 金豆</p>
    <span v-if="hasRedeemed" class="redeemed-tag">已兑换</span>

    <button class="redeem-btn" :class="{ disabled: !canAfford, renewed: hasRedeemed }" :disabled="!canAfford" @click="handleRedeem">
      {{ !canAfford ? '金豆不足' : hasRedeemed ? '再次兑换' : '兑换' }}
    </button>

    <div class="card-actions" v-if="!hasRedeemed">
      <button class="action-btn edit-btn" @click="handleEdit">✏️</button>
      <button class="action-btn delete-btn" @click="handleDelete">🗑️</button>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.reward-card {
  position: relative;
  min-height: 212px;
  padding: 18px 14px 14px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(255, 214, 165, 0.9);
  box-shadow: $shadow-sm;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &.disabled {
    opacity: 0.7;
  }

  &.redeemed {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(238, 236, 240, 0.88));
  }
}

.reward-icon {
  margin-bottom: 12px;
  font-size: 38px;
  align-self: center;
}

.reward-name {
  width: 100%;
  margin-bottom: 8px;
  font-size: clamp(17px, 4vw, 20px);
  line-height: 1.24;
  @include text-clamp(3);
}

.reward-cost {
  margin-bottom: auto;
  color: $text-primary;
  font-size: 14px;
  font-weight: 600;
}

.redeemed-tag {
  margin: 8px 0 10px;
  padding: 6px 14px;
  border-radius: $radius-full;
  border: 1.5px solid rgba(121, 121, 121, 0.48);
  color: rgba(104, 104, 104, 0.9);
  font-size: 13px;
  font-weight: 700;
}

.redeem-btn {
  @include button-primary;
  width: 100%;
  min-height: 42px;
  margin-top: 10px;
  font-size: 15px;

  &.renewed {
    background: linear-gradient(180deg, #d9d9d9 0%, #bdbdbd 100%);
    box-shadow: none;
  }

  &.disabled {
    background: #e6dfd6;
    color: #7a6e60;
    box-shadow: none;
    cursor: not-allowed;
  }
}

.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  &.delete-btn {
    background: rgba(255, 112, 67, 0.9);
    color: white;

    &:hover {
      background: rgba(255, 67, 54, 0.9);
    }
  }
}

@media (max-width: 400px) {
  .reward-card {
    min-height: 198px;
    padding: 15px 13px 13px;
  }

  .reward-icon {
    font-size: 34px;
  }

  .reward-name {
    font-size: 17px;
  }

  .reward-cost {
    font-size: 14px;
  }
}
</style>
