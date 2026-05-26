<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HABIT_ICON_OPTIONS, HABIT_TYPE_CONFIG, useHabitStore } from '../stores/habit'
import { useUiStore } from '../stores/ui'
import { HABIT_TEMPLATES } from '../config/habitTemplates'

const router = useRouter()
const route = useRoute()
const habitStore = useHabitStore()
const uiStore = useUiStore()

const habitId = computed(() => route.params.id)
const editingHabit = computed(() => (habitId.value ? habitStore.getHabitById(habitId.value) : null))

function useTemplate(tpl) {
  form.name = tpl.name
  form.description = tpl.description
  form.type = tpl.type
  form.icon = tpl.icon
}

const form = reactive({
  name: editingHabit.value?.name || '',
  description: editingHabit.value?.description || '',
  type: editingHabit.value?.type || 'easy',
  icon: editingHabit.value?.icon || ''
})

const errors = reactive({
  name: '',
  icon: ''
})

function validate() {
  errors.name = form.name.trim() ? '' : '请先填写习惯名称'
  errors.icon = form.icon ? '' : '请选择一个习惯图标'
  return !errors.name && !errors.icon
}

function handleSubmit() {
  if (!validate()) {
    uiStore.showToast('还有必填项没有完成', 'error')
    return
  }

  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    type: form.type,
    icon: form.icon
  }

  if (editingHabit.value) {
    habitStore.updateHabit(editingHabit.value.id, payload)
    uiStore.showToast('习惯已更新', 'success')
  } else {
    habitStore.addHabit(payload)
    uiStore.showToast('习惯创建成功', 'success')
  }

  router.push('/habits')
}
</script>

<template>
  <div class="form-page page-shell">
    <section class="glass-panel form-panel">
      <div class="form-head">
        <p class="eyebrow">{{ editingHabit ? '编辑习惯' : '新建习惯' }}</p>
        <h1 class="page-title">{{ editingHabit ? '调整这项习惯' : '创建一项新习惯' }}</h1>
      </div>

      <!-- 推荐习惯模板 -->
      <div v-if="!editingHabit" class="field">
        <label class="label">推荐习惯</label>
        <p class="helper-text">点一下直接填入，也可以自己写。</p>
        <div class="template-grid">
          <button
            v-for="tpl in HABIT_TEMPLATES"
            :key="tpl.name"
            class="template-card"
            @click="useTemplate(tpl)"
          >
            <span class="template-icon">{{ tpl.icon }}</span>
            <span class="template-name">{{ tpl.name }}</span>
          </button>
        </div>
      </div>

      <div class="field">
        <label class="label">习惯名称</label>
        <div class="input-wrap">
          <input v-model="form.name" type="text" maxlength="24" placeholder="例如：每天阅读 1 小时" />
        </div>
        <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
      </div>

      <div class="field">
        <label class="label">习惯描述（可选）</label>
        <div class="input-wrap textarea-wrap">
          <textarea v-model="form.description" rows="3" maxlength="80" placeholder="补充一点提醒，让自己更容易开始"></textarea>
        </div>
      </div>

      <div class="field">
        <label class="label">难度等级</label>
        <div class="type-grid">
          <button
            v-for="(config, key) in HABIT_TYPE_CONFIG"
            :key="key"
            class="type-card"
            :class="{ active: form.type === key }"
            @click="form.type = key"
          >
            <strong>{{ config.name }}</strong>
            <span>{{ config.gold }} 金豆 / 次</span>
          </button>
        </div>
      </div>

      <div class="field">
        <label class="label">习惯图标 <span class="required">*</span></label>
        <p class="helper-text">请手动选择一个图标，后续会跟着这项习惯一起展示。</p>
        <div class="icon-grid">
          <button
            v-for="icon in HABIT_ICON_OPTIONS"
            :key="icon"
            class="icon-btn"
            :class="{ active: form.icon === icon }"
            @click="form.icon = icon"
          >
            {{ icon }}
          </button>
        </div>
        <p v-if="errors.icon" class="error-text">{{ errors.icon }}</p>
      </div>

      <div class="field">
        <label class="label">习惯提醒时间</label>
        <div class="disabled-card">
          <strong>即将上线</strong>
          <span>先把打卡流程和页面体验打磨顺了，提醒功能下一步接上。</span>
        </div>
      </div>

      <div class="actions">
        <button class="ghost-btn" @click="router.back()">取消</button>
        <button class="primary-btn" @click="handleSubmit">{{ editingHabit ? '保存修改' : '创建习惯' }}</button>
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

.required {
  color: $danger-color;
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

.helper-text {
  margin: 0 0 10px;
  color: $text-secondary;
  font-size: 12px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.type-card {
  min-height: 108px;
  padding: 14px 10px;
  border-radius: 22px;
  background: #fbf7f1;
  text-align: left;
  box-shadow: inset 0 0 0 1px rgba(236, 215, 184, 0.92);

  strong {
    display: block;
    font-size: 16px;
  }

  span {
    display: block;
    margin-top: 8px;
    color: $text-secondary;
    font-size: 12px;
    line-height: 1.5;
  }
}

.type-card.active {
  background: linear-gradient(180deg, #fff5dd, #ffe9bc);
  box-shadow: inset 0 0 0 2px rgba(255, 157, 52, 0.45);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.icon-btn {
  aspect-ratio: 1;
  border-radius: 18px;
  background: #f4ecfb;
  font-size: 24px;
}

.icon-btn.active {
  background: linear-gradient(180deg, #fff3d8, #ffe3a9);
  box-shadow: inset 0 0 0 2px rgba(255, 157, 52, 0.48);
}

.disabled-card {
  padding: 14px;
  border-radius: 20px;
  background: #f2ede7;
  color: $text-secondary;
  opacity: 0.78;

  strong,
  span {
    display: block;
  }

  span {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.6;
  }
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

.template-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.template-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border-radius: 16px;
  background: #f8f3ec;
  transition: background 0.2s;
}

.template-card:active {
  background: linear-gradient(180deg, #fff3d8, #ffe3a9);
}

.template-icon {
  font-size: 22px;
}

.template-name {
  font-size: 11px;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.2;
  text-align: center;
}

@media (max-width: 420px) {
  .type-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .icon-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .template-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
