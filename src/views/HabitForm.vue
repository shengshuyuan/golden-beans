<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHabitStore, HABIT_TYPES, HABIT_TYPE_CONFIG } from '../stores/habit'

const route = useRoute()
const router = useRouter()
const habitStore = useHabitStore()

const nameInputRef = ref(null)

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEdit.value ? '编辑习惯' : '新建习惯'))
const errors = reactive({
  name: '',
  icon: ''
})

const form = ref({
  name: '',
  type: HABIT_TYPES.SIMPLE,
  description: '',
  icon: '',
  reminderTime: ''
})

const iconOptions = [
  { emoji: '🛌', label: '睡觉' },
  { emoji: '🏃', label: '运动' },
  { emoji: '📚', label: '阅读' },
  { emoji: '✍️', label: '写作' },
  { emoji: '💻', label: '编程' },
  { emoji: '🧠', label: '学习' },
  { emoji: '🧘', label: '冥想' },
  { emoji: '💧', label: '喝水' },
  { emoji: '🥗', label: '饮食' },
  { emoji: '🧹', label: '整理' },
  { emoji: '🎵', label: '音乐' },
  { emoji: '🗣️', label: '口语' },
  { emoji: '🎯', label: '专注' },
  { emoji: '🚶', label: '散步' },
  { emoji: '📝', label: '复盘' },
  { emoji: '🧾', label: '记账' },
  { emoji: '🪥', label: '洗漱' },
  { emoji: '🌞', label: '早起' }
]

onMounted(() => {
  if (isEdit.value) {
    const habit = habitStore.habits.find(item => item.id === route.params.id)
    if (habit) {
      form.value = {
        name: habit.name,
        type: habit.type,
        description: habit.description || '',
        icon: iconOptions.some(option => option.emoji === habit.icon) ? habit.icon : '',
        reminderTime: habit.reminderTime || ''
      }
    } else {
      router.back()
    }
  }
})

function selectType(type) {
  form.value.type = type
}

function selectIcon(icon) {
  form.value.icon = icon
  errors.icon = ''
}

function clearError(field) {
  errors[field] = ''
}

function handleSave() {
  if (!form.value.name.trim()) {
    errors.name = '请输入习惯名称'
    if (nameInputRef.value) {
      nameInputRef.value.focus()
    }
  }

  if (!form.value.icon) {
    errors.icon = '请选择一个习惯图标'
  }

  if (errors.name || errors.icon) {
    return
  }

  if (isEdit.value) {
    habitStore.updateHabit(route.params.id, form.value)
  } else {
    habitStore.addHabit(form.value)
  }

  router.back()
}
</script>

<template>
  <div class="habit-form-page page-shell">
    <header class="page-header">
      <button class="back-btn" @click="router.back()">←</button>
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="spacer"></div>
    </header>

    <section class="form-card glass-panel">
      <div class="form-item">
        <input
          ref="nameInputRef"
          v-model="form.name"
          class="title-input"
          :class="{ invalid: !!errors.name }"
          type="text"
          maxlength="20"
          placeholder="比如：早起、运动、阅读"
          @input="clearError('name')"
        />
        <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
      </div>

      <div class="form-item">
        <label class="form-label">习惯类别</label>
        <div class="type-grid">
          <button
            v-for="(config, type) in HABIT_TYPE_CONFIG"
            :key="type"
            class="type-card"
            :class="{ active: form.type === type }"
            :style="{ '--type-color': config.color }"
            @click="selectType(type)"
          >
            <strong>{{ config.name }}</strong>
            <span>+{{ config.gold }}金豆/次</span>
            <em>{{ config.icon }}</em>
          </button>
        </div>
      </div>

      <div class="form-item">
        <label class="form-label">习惯描述 <span>（可选）</span></label>
        <textarea v-model="form.description" class="form-textarea" rows="4" maxlength="100" placeholder="添加备注或目标"></textarea>
      </div>

      <div class="form-item">
        <label class="form-label">
          习惯图标
          <span class="required-mark">*</span>
          <span>{{ form.icon ? `已选择 ${form.icon}` : '必选，请手动选择一个图标' }}</span>
        </label>
        <div class="icon-row">
          <button
            v-for="option in iconOptions"
            :key="option.emoji"
            class="icon-btn"
            :class="{ active: form.icon === option.emoji }"
            :title="option.label"
            :aria-label="option.label"
            @click="selectIcon(option.emoji)"
          >
            {{ option.emoji }}
          </button>
        </div>
        <p v-if="errors.icon" class="field-error">{{ errors.icon }}</p>
      </div>

      <div class="form-item disabled">
        <label class="form-label">习惯提醒时间 <span>（可选）</span></label>
        <div class="disabled-field">
          <span>提醒时间</span>
          <strong>即将上线</strong>
        </div>
      </div>
    </section>

    <footer class="form-footer">
      <button class="save-btn" @click="handleSave">{{ isEdit ? '保存习惯' : '创建习惯' }}</button>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.habit-form-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.page-header {
  @include flex-between;
}

.back-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: $shadow-sm;
  color: $primary-brown;
  font-size: 24px;
  font-weight: 700;
}

.page-title {
  font-size: clamp(24px, 6.2vw, 30px);
  color: $primary-brown;
}

.spacer {
  width: 48px;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  &.disabled {
    opacity: 1;
  }
}

.form-label {
  font-size: 17px;
  font-weight: 800;
  color: $primary-brown;

  span {
    font-weight: 500;
    color: $text-secondary;
  }
}

.required-mark {
  margin: 0 4px;
  color: $danger-color;
  font-weight: 800;
}

.title-input,
.form-textarea,
.disabled-field {
  width: 100%;
  border-radius: 30px;
  background: rgba(255, 251, 245, 0.92);
  box-shadow: inset 0 0 0 2px rgba(211, 180, 148, 0.72);
}

.title-input.invalid {
  box-shadow: inset 0 0 0 2px rgba(242, 77, 61, 0.72);
}

.title-input {
  min-height: 74px;
  padding: 0 20px;
  font-size: 20px;
  color: $text-primary;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: $spacing-sm;
}

.type-card {
  position: relative;
  min-height: 138px;
  padding: 16px 14px;
  border-radius: 24px;
  text-align: left;
  color: $text-white;
  background: linear-gradient(160deg, color-mix(in srgb, var(--type-color) 85%, white), var(--type-color));
  opacity: 0.72;
  transition: transform $transition-fast, opacity $transition-fast, box-shadow $transition-fast;

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 17px;
    line-height: 1.1;
  }

  span {
    margin-top: 6px;
    font-size: clamp(12px, 3.2vw, 14px);
    font-weight: 700;
  }

  em {
    position: absolute;
    right: 14px;
    bottom: 12px;
    font-style: normal;
    font-size: 30px;
  }

  &.active {
    opacity: 1;
    transform: translateY(-2px);
    box-shadow: 0 18px 34px color-mix(in srgb, var(--type-color) 32%, transparent);
  }
}

.form-textarea {
  min-height: 150px;
  padding: 20px 22px;
  resize: none;
  font-size: 16px;
}

.icon-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: $spacing-sm;
}

.icon-btn {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(180deg, #d9d1ff, #cbc1ff);
  font-size: 26px;
  box-shadow: $shadow-sm;

  &.active {
    box-shadow: 0 0 0 3px rgba(255, 165, 59, 0.82), 0 18px 34px rgba(255, 165, 59, 0.18);
  }
}

.disabled-field {
  min-height: 74px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #b5aea7;
  background:
    repeating-linear-gradient(
      -45deg,
      rgba(233, 229, 223, 0.88),
      rgba(233, 229, 223, 0.88) 10px,
      rgba(245, 242, 237, 0.96) 10px,
      rgba(245, 242, 237, 0.96) 20px
    );
  box-shadow: inset 0 0 0 2px rgba(214, 206, 197, 0.9);
  cursor: not-allowed;

  strong {
    padding: 6px 14px;
    border-radius: $radius-full;
    background: rgba(181, 174, 167, 0.95);
    color: $text-white;
    font-size: 13px;
  }
}

.field-error {
  margin-top: -2px;
  color: $danger-color;
  font-size: 13px;
  line-height: 1.4;
}

.form-footer {
  position: sticky;
  bottom: 18px;
  padding-top: 6px;
}

.save-btn {
  @include button-primary;
  width: 100%;
  min-height: 58px;
  font-size: 18px;
}

@media (max-width: 420px) {
  .type-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .type-card {
    min-height: 110px;
    padding: 14px 12px;
  }

  .icon-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
