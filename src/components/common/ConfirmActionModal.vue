<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  tone: {
    type: String,
    default: 'default'
  }
})

defineEmits(['close', 'confirm'])
</script>

<template>
  <BaseModal @close="$emit('close')">
    <p class="eyebrow">{{ tone === 'danger' ? '请再确认一次' : '操作确认' }}</p>
    <h3 class="title">{{ title }}</h3>
    <p class="message">{{ message }}</p>

    <div class="actions">
      <button class="ghost-btn" @click="$emit('close')">取消</button>
      <button class="confirm-btn" :class="tone" @click="$emit('confirm')">{{ confirmText }}</button>
    </div>
  </BaseModal>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.eyebrow {
  color: $primary-dark;
  font-size: 12px;
  font-weight: 800;
}

.title {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.18;
}

.message {
  margin-top: 10px;
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.6;
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

  &.danger {
    background: linear-gradient(180deg, #ef8d7e, #dd5b50);
  }
}
</style>
