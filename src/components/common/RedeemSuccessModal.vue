<script setup>
defineProps({
  reward: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="icon">{{ reward?.icon || '🎁' }}</div>
      <h3 class="title">兑换成功</h3>
      <p class="subtitle">“{{ reward?.name || '奖励' }}”已经兑换完成，记得好好奖励自己。</p>
      <button class="primary-btn" @click="$emit('close')">知道啦</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(44, 29, 12, 0.36);
}

.modal {
  width: min(100%, 332px);
  padding: 24px 20px 20px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: $shadow-md;
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
