<script setup>
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  buttonLabel: { type: String, default: '' },
  compact: { type: Boolean, default: false }
})

defineEmits(['action'])
</script>

<template>
  <div class="empty-state" :class="{ compact }">
    <div v-if="icon" class="empty-icon">{{ icon }}</div>
    <h2 v-if="title" class="empty-title">{{ title }}</h2>
    <p v-if="text" class="empty-text">{{ text }}</p>
    <slot />
    <button
      v-if="buttonLabel"
      class="primary-btn"
      @click="$emit('action')"
    >{{ buttonLabel }}</button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.empty-state {
  padding: 22px 10px 10px;
  text-align: center;
}

.empty-state.compact {
  padding-bottom: 4px;
}

.empty-icon {
  font-size: 34px;
}

.empty-title {
  margin-top: 10px;
  font-size: 18px;
  line-height: 1.3;
}

.empty-text {
  margin-top: 8px;
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.6;
}

.primary-btn {
  @include button-primary;
  margin-top: 16px;
}
</style>
