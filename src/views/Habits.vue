<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHabitStore, HABIT_TYPE_CONFIG } from '../stores/habit'
import { useUserStore } from '../stores/user'
import { useUiStore } from '../stores/ui'
import HabitItem from '../components/habit/HabitItem.vue'
import MakeupConfirmModal from '../components/common/MakeupConfirmModal.vue'
import ConfirmActionModal from '../components/common/ConfirmActionModal.vue'

const router = useRouter()
const habitStore = useHabitStore()
const userStore = useUserStore()
const uiStore = useUiStore()

const makeupCost = computed(() => {
  if (!selectedHabit.value) return 0
  const config = HABIT_TYPE_CONFIG[selectedHabit.value.type] || HABIT_TYPE_CONFIG.easy
  return config.gold * 2
})

const selectedHabit = ref(null)
const showMakeupModal = ref(false)
const showArchived = ref(false)
const confirmState = ref({
  visible: false,
  title: '',
  message: '',
  confirmText: '确认',
  tone: 'default',
  action: null
})

const activeHabits = computed(() => habitStore.activeHabits)
const archivedHabits = computed(() => habitStore.habits.filter(item => item.archived))
const makeupReadyCount = computed(() => activeHabits.value.filter(item => habitStore.canMakeup(item.id)).length)

function handleMakeup(habit) {
  selectedHabit.value = habit
  showMakeupModal.value = true
}

function confirmMakeup() {
  const result = habitStore.makeupCheckIn(selectedHabit.value.id)
  if (!result.success) {
    uiStore.showToast(result.message, 'error')
  } else {
    uiStore.showToast(`已补卡，连续 ${result.newStreak} 天`, 'success')
  }
  showMakeupModal.value = false
  selectedHabit.value = null
}

function closeMakeupModal() {
  showMakeupModal.value = false
  selectedHabit.value = null
}

function handleArchive(habit) {
  confirmState.value = {
    visible: true,
    title: '归档习惯',
    message: `“${habit.name}”会从进行中列表移到已归档，之后仍然可以恢复回来。`,
    confirmText: '确认归档',
    tone: 'default',
    action: () => {
      habitStore.archiveHabit(habit.id)
      uiStore.showToast('已归档到习惯库', 'success')
    }
  }
}

function handleDelete(habit) {
  confirmState.value = {
    visible: true,
    title: '删除习惯',
    message: `删除“${habit.name}”后，相关打卡记录也会一起删除，并且无法恢复。`,
    confirmText: '确认删除',
    tone: 'danger',
    action: () => {
      habitStore.deleteHabit(habit.id)
      uiStore.showToast('习惯已删除', 'success')
    }
  }
}

function handleRestore(habit) {
  habitStore.restoreHabit(habit.id)
  uiStore.showToast('已恢复到进行中', 'success')
}

function closeConfirmModal() {
  confirmState.value.visible = false
}

function confirmAction() {
  confirmState.value.action?.()
  closeConfirmModal()
}
</script>

<template>
  <div class="habits-page page-shell">
    <header class="page-header">
      <div>
        <p class="eyebrow">我的习惯</p>
        <h1 class="page-title">保持一点点持续，结果会很大</h1>
      </div>
      <button class="add-btn" @click="router.push('/habits/new')">+</button>
    </header>

    <section v-if="activeHabits.length > 0" class="summary-strip">
      <div class="summary-pill">
        <span class="summary-label">进行中</span>
        <strong>{{ activeHabits.length }}</strong>
      </div>
      <div class="summary-pill">
        <span class="summary-label">可补卡</span>
        <strong>{{ makeupReadyCount }}</strong>
      </div>
      <div class="summary-pill">
        <span class="summary-label">已归档</span>
        <strong>{{ archivedHabits.length }}</strong>
      </div>
    </section>

    <section v-if="activeHabits.length === 0" class="glass-panel empty-state">
      <div class="empty-icon">🌱</div>
      <h2 class="empty-title">还没有开始第一项习惯</h2>
      <p class="empty-text">从一个最容易坚持的小目标开始，把它养成自己的节奏。</p>
      <button class="primary-btn" @click="router.push('/habits/new')">创建习惯</button>
    </section>

    <section v-else class="habit-list">
      <HabitItem
        v-for="habit in activeHabits"
        :key="habit.id"
        :habit="habit"
        :can-makeup="habitStore.canMakeup(habit.id)"
        @click="router.push(`/habits/${habit.id}/edit`)"
        @makeup="handleMakeup"
        @archive="handleArchive"
        @delete="handleDelete"
      />
    </section>

    <section v-if="archivedHabits.length > 0" class="glass-panel archive-panel">
      <button class="archive-toggle" @click="showArchived = !showArchived">
        <span>已归档习惯</span>
        <span class="archive-meta">{{ archivedHabits.length }} 项 {{ showArchived ? '收起' : '展开' }}</span>
      </button>

      <div v-if="showArchived" class="habit-list archived-list">
        <HabitItem
          v-for="habit in archivedHabits"
          :key="habit.id"
          :habit="habit"
          archived
          @restore="handleRestore"
          @delete="handleDelete"
        />
      </div>
    </section>

    <p class="page-hint">点开每张卡片右侧的 ••• 可快捷操作</p>

    <MakeupConfirmModal
      v-if="showMakeupModal"
      :habit="selectedHabit"
      :makeup-cost="makeupCost"
      :current-gold="userStore.gold"
      @confirm="confirmMakeup"
      @close="closeMakeupModal"
    />
    <ConfirmActionModal
      v-if="confirmState.visible"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :tone="confirmState.tone"
      @confirm="confirmAction"
      @close="closeConfirmModal"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.habits-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.eyebrow {
  margin: 0 0 4px;
  color: $primary-dark;
  font-size: 13px;
  font-weight: 800;
}

.page-title {
  font-size: clamp(18px, 4.2vw, 20px);
  line-height: 1.2;
}

.add-btn,
.primary-btn {
  @include button-primary;
}

.add-btn {
  width: 46px;
  min-width: 46px;
  padding: 0;
  border-radius: 50%;
  font-size: 24px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summary-pill {
  padding: 12px;
  border-radius: 20px;
  background: linear-gradient(180deg, #fffaf0, #fff4e2);
  text-align: center;

  strong {
    display: block;
    margin-top: 6px;
    color: $primary-brown;
    font-size: 20px;
    line-height: 1;
  }
}

.summary-label {
  color: $text-secondary;
  font-size: 12px;
  font-weight: 700;
}

.habit-list {
  display: grid;
  gap: 12px;
}

.archive-panel {
  padding: 16px;
}

.archive-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $text-primary;
  font-size: 15px;
  font-weight: 800;
}

.archive-meta {
  color: $text-secondary;
  font-size: 12px;
}

.archived-list {
  margin-top: 12px;
}

.empty-state {
  padding: 24px 18px;
  text-align: center;
}

.empty-icon {
  font-size: 34px;
}

.empty-title {
  margin-top: 10px;
  font-size: 18px;
}

.empty-text {
  margin-top: 8px;
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.6;
}

.primary-btn {
  margin-top: 16px;
}

.page-hint {
  color: $text-secondary;
  font-size: 12px;
  text-align: center;
}
</style>
