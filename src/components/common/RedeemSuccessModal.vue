<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  reward: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])
</script>

<template>
  <BaseModal max-width="332px" content-class="redeem-modal" @close="$emit('close')">
    <div class="icon">{{ reward?.icon || '🎁' }}</div>
    <h3 class="title">兑换成功</h3>
    <p class="subtitle">"{{ reward?.name || '奖励' }}"已经兑换完成，记得好好奖励自己。</p>
    <button class="primary-btn" @click="$emit('close')">知道啦</button>
  </BaseModal>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.redeem-modal {
  text-align: center;
}

.icon {
  font-size: 38px;
}

.title {
  margin-top: 10px;
  font-size: 24px;
}

.subtitle {
  margin-top: 8px;
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.6;
}

.primary-btn {
  @include button-primary;
  width: 100%;
  margin-top: 18px;
}
</style>
