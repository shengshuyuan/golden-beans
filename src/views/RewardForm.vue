<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRewardStore, REWARD_CATEGORIES } from '../stores/reward'

const route = useRoute()
const router = useRouter()
const rewardStore = useRewardStore()

const nameInputRef = ref(null)

const isEditing = ref(false)
const editingRewardId = ref(null)
const form = ref({
  name: '',
  cost: 50,
  category: '美食',
  description: ''
})
const errors = reactive({
  name: '',
  cost: ''
})

const categories = Object.values(REWARD_CATEGORIES)
const presetCosts = [30, 50, 100, 200, 500]

function selectCategory(category) {
  form.value.category = category.name
}

function setCost(cost) {
  form.value.cost = cost
  errors.cost = ''
}

function clearError(field) {
  errors[field] = ''
}

function handleSave() {
  if (!form.value.name.trim()) {
    errors.name = '请输入奖励名称'
    if (nameInputRef.value) {
      nameInputRef.value.focus()
    }
  }

  if (!Number.isFinite(form.value.cost) || form.value.cost < 1) {
    errors.cost = '金豆数量必须大于 0'
  }

  if (errors.name || errors.cost) {
    return
  }

  if (isEditing.value && editingRewardId.value) {
    rewardStore.updateReward(editingRewardId.value, form.value)
  } else {
    rewardStore.addReward(form.value)
  }

  router.back()
}

// 初始化表单数据
onMounted(() => {
  const rewardId = route.params.id

  if (rewardId) {
    isEditing.value = true
    editingRewardId.value = rewardId

    // 查找要编辑的奖励
    const reward = rewardStore.rewards.find(r => r.id === rewardId)
    if (reward) {
      form.value = {
        name: reward.name,
        cost: reward.cost,
        category: reward.category,
        description: reward.description || ''
      }
    } else {
      // 如果奖励不存在，返回列表页
      router.push('/rewards')
    }
  }
})
</script>

<template>
  <div class="reward-form-page page-shell">
    <header class="page-header">
      <button class="back-btn" @click="router.back()">←</button>
      <h1 class="page-title">{{ isEditing ? '编辑奖励' : '新建奖励' }}</h1>
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
          placeholder="比如：吃一顿大餐、买喜欢的东西"
          @input="clearError('name')"
        />
        <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
      </div>

      <div class="form-item">
        <label class="form-label">奖励分类</label>
        <div class="category-grid">
          <button
            v-for="category in categories"
            :key="category.name"
            class="category-chip"
            :class="{ active: form.category === category.name }"
            @click="selectCategory(category)"
          >
            <span>{{ category.icon }}</span>
            {{ category.name }}
          </button>
        </div>
      </div>

      <div class="form-item">
        <label class="form-label">所需金豆</label>
        <div class="preset-row">
          <button
            v-for="cost in presetCosts"
            :key="cost"
            class="preset-btn"
            :class="{ active: form.cost === cost }"
            @click="setCost(cost)"
          >
            {{ cost }}
          </button>
        </div>
        <div class="cost-field" :class="{ invalid: !!errors.cost }">
          <input v-model.number="form.cost" type="number" min="1" max="9999" @input="clearError('cost')" />
          <span>金豆</span>
        </div>
        <p v-if="errors.cost" class="field-error">{{ errors.cost }}</p>
      </div>

      <div class="form-item">
        <label class="form-label">奖励描述 <span>（可选）</span></label>
        <textarea v-model="form.description" class="form-textarea" rows="4" maxlength="100" placeholder="描述一下这份奖励会带来的快乐"></textarea>
      </div>
    </section>

    <footer class="form-footer">
      <button class="save-btn" @click="handleSave">{{ isEditing ? '保存修改' : '创建奖励' }}</button>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.reward-form-page {
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

.title-input,
.cost-field,
.form-textarea {
  width: 100%;
  border-radius: 30px;
  background: rgba(255, 251, 245, 0.92);
  box-shadow: inset 0 0 0 2px rgba(211, 180, 148, 0.72);
}

.title-input.invalid,
.cost-field.invalid {
  box-shadow: inset 0 0 0 2px rgba(242, 77, 61, 0.72);
}

.title-input {
  min-height: 74px;
  padding: 0 20px;
  font-size: 20px;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.category-chip {
  min-height: 48px;
  padding: 0 16px;
  border-radius: $radius-full;
  background: rgba(255, 255, 255, 0.86);
  color: $text-primary;
  font-size: 15px;
  font-weight: 700;
  box-shadow: $shadow-sm;

  span {
    margin-right: 8px;
  }

  &.active {
    background: rgba(255, 232, 198, 0.95);
    color: $primary-dark;
  }
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.preset-btn {
  min-width: 72px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: $radius-full;
  background: rgba(255, 255, 255, 0.82);
  color: $text-secondary;
  font-size: 15px;
  font-weight: 800;
  box-shadow: $shadow-sm;

  &.active {
    background: rgba(255, 232, 198, 0.95);
    color: $primary-dark;
  }
}

.cost-field {
  min-height: 70px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  input {
    flex: 1;
    min-width: 0;
    font-size: 24px;
    font-weight: 900;
    color: $text-primary;
  }

  span {
    color: $primary-brown;
    font-size: 17px;
    font-weight: 800;
  }
}

.form-textarea {
  min-height: 150px;
  padding: 20px 22px;
  resize: none;
  font-size: 16px;
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
</style>
