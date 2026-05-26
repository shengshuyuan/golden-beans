<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRewardStore } from '../stores/reward'
import { useUiStore } from '../stores/ui'

const REWARD_ICONS = ['☕', '🍰', '🎬', '🛍️', '🎮', '📺', '🍜', '🧋', '🌷', '🎁', '🧸', '🎧']

const router = useRouter()
const route = useRoute()
const rewardStore = useRewardStore()
const uiStore = useUiStore()

const rewardId = computed(() => route.params.id)
const editingReward = computed(() => (rewardId.value ? rewardStore.getRewardById(rewardId.value) : null))

const form = reactive({
  name: editingReward.value?.name || '',
  description: editingReward.value?.description || '',
  cost: editingReward.value?.cost || '',
  icon: editingReward.value?.icon || '🎁'
})

const errors = reactive({
  name: '',
  cost: ''
})

function validate() {
  errors.name = form.name.trim() ? '' : '请先填写奖励名称'
  errors.cost = Number(form.cost) > 0 ? '' : '请填写正确的金豆数量'
  return !errors.name && !errors.cost
}

function handleSubmit() {
  if (!validate()) {
    uiStore.showToast('还有内容需要补充', 'error')
    return
  }

  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    cost: Number(form.cost),
    icon: form.icon
  }

  if (editingReward.value) {
    rewardStore.updateReward(editingReward.value.id, payload)
    uiStore.showToast('奖励已更新', 'success')
  } else {
    rewardStore.addReward(payload)
    uiStore.showToast('奖励创建成功', 'success')
  }

  router.push('/rewards')
}
</script>

<template>
  <div class="form-page page-shell">
    <section class="glass-panel form-panel">
      <div class="form-head">
        <p class="eyebrow">{{ editingReward ? '编辑奖励' : '新建奖励' }}</p>
        <h1 class="page-title">{{ editingReward ? '调整奖励内容' : '给自己准备一个奖励' }}</h1>
      </div>

      <div class="field">
        <label class="label">奖励名称</label>
        <div class="input-wrap">
          <input v-model="form.name" type="text" maxlength="24" placeholder="例如：周末一杯奶茶" />
        </div>
        <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
      </div>

      <div class="field">
        <label class="label">奖励描述（可选）</label>
        <div class="input-wrap textarea-wrap">
          <textarea v-model="form.description" rows="3" maxlength="80" placeholder="写一点具体标准，让奖励更有仪式感"></textarea>
        </div>
      </div>

      <div class="field">
        <label class="label">需要多少金豆</label>
        <div class="input-wrap">
          <input v-model="form.cost" type="number" min="1" placeholder="例如：10" />
        </div>
        <p v-if="errors.cost" class="error-text">{{ errors.cost }}</p>
      </div>

      <div class="field">
        <label class="label">奖励图标</label>
        <div class="icon-grid">
          <button
            v-for="icon in REWARD_ICONS"
            :key="icon"
            class="icon-btn"
            :class="{ active: form.icon === icon }"
            @click="form.icon = icon"
          >
            {{ icon }}
          </button>
        </div>
      </div>

      <div class="actions">
        <button class="ghost-btn" @click="router.back()">取消</button>
        <button class="primary-btn" @click="handleSubmit">{{ editingReward ? '保存修改' : '创建奖励' }}</button>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.form-panel {
  padding: 20px 16px;
}

.eyebrow {
  color: $primary-dark;
  font-size: 13px;
  font-weight: 800;
}

.page-title {
  margin-top: 4px;
  font-size: 22px;
  line-height: 1.2;
}

.field + .field {
  margin-top: 18px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 800;
}

.input-wrap {
  padding: 14px;
  border-radius: 20px;
  background: #fbf7f1;
  box-shadow: inset 0 0 0 1px rgba(236, 215, 184, 0.92);
}

.textarea-wrap {
  min-height: 104px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.icon-btn {
  aspect-ratio: 1;
  border-radius: 18px;
  background: #fbf7f1;
  font-size: 24px;
}

.icon-btn.active {
  background: linear-gradient(180deg, #fff5dd, #ffe9bc);
  box-shadow: inset 0 0 0 2px rgba(255, 157, 52, 0.45);
}

.error-text {
  margin-top: 8px;
  color: $danger-color;
  font-size: 12px;
  font-weight: 700;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 22px;
}

.ghost-btn,
.primary-btn {
  min-height: 46px;
  border-radius: $radius-full;
  font-size: 15px;
  font-weight: 800;
}

.ghost-btn {
  background: #f4eee6;
  color: $text-secondary;
}

.primary-btn {
  @include button-primary;
}

@media (max-width: 420px) {
  .icon-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
