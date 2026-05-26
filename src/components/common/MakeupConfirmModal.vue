<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  habit: {
    type: Object,
    default: null
  }
})

defineEmits(['close', 'confirm'])
</script>

<template>
  <BaseModal content-class="text-center" @close="$emit('close')">
    <div class="icon">🕰️</div>
    <h3 class="title">补打昨天的习惯</h3>
    <p class="message">
      为"{{ habit?.name || '这项习惯' }}"补上昨天的记录，连续天数会重新连上。
    </p>
    <p class="warning">
      ⚠️ 补卡消耗 2 倍金豆，仅保连续天数
    </p>

    <div class="actions">
      <button class="ghost-btn" @click="$emit('close')">再想想</button>
      <button class="confirm-btn" @click="$emit('confirm')">立即补卡</button>
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
</style>
