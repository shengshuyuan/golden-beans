<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHabitStore } from '../stores/habit'
import { useUiStore } from '../stores/ui'
import { getTodayString } from '../utils/date'
import HabitItem from '../components/habit/HabitItem.vue'
import MakeupConfirmModal from '../components/common/MakeupConfirmModal.vue'
import ConfirmActionModal from '../components/common/ConfirmActionModal.vue'

const router = useRouter()
const habitStore = useHabitStore()
const uiStore = useUiStore()

const showMakeupModal = ref(false)
const selectedHabit = ref(null)
const showArchived = ref(false)
const confirmState = ref({
  visible: false,
  title: '',
  message: '',
  confirmText: '确认',
  tone: 'default',
  action: null
})

const activeHabits = computed(() => habitStore.habits.filter(habit => !habit.archived))
const archivedHabits = computed(() => habitStore.habits.filter(habit => habit.archived))

function canMakeup(habit) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = getTodayString(yesterday)

  const yesterdayRecord = habitStore.getCheckRecord(habit.id, yesterdayStr)

  return !yesterdayRecord.checked
}

function goToNew() {
  router.push('/habits/new')
}

function goToEdit(habit) {
  router.push(`/habits/${habit.id}/edit`)
}

function handleMakeup(habit) {
  selectedHabit.value = habit
  showMakeupModal.value = true
}

function confirmMakeup() {
  if (selectedHabit.value) {
    const result = habitStore.makeupCheckIn(selectedHabit.value.id)
    if (!result.success) {
      uiStore.showToast(result.message, 'error')
    } else {
      uiStore.showToast(`已补卡，连续 ${result.newStreak} 天`, 'success')
    }
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
    message: `“${habit.name}”会从进行中列表移到已归档，你之后仍然可以恢复它。`,
    confirmText: '确认归档',
    tone: 'default',
    action: () => {
      habitStore.archiveHabit(habit.id)
      uiStore.showToast('已归档到习惯库', 'success')
    }
  }
}

function handleRestore(habit) {
  habitStore.restoreHabit(habit.id)
  uiStore.showToast('已恢复到进行中', 'success')
}

function handleDelete(habit) {
  confirmState.value = {
    visible: true,
    title: '删除习惯',
    message: `删除“${habit.name}”后，相关打卡记录也会一起移除，并且无法恢复。`,
    confirmText: '确认删除',
    tone: 'danger',
    action: () => {
      habitStore.deleteHabit(habit.id)
      uiStore.showToast('习惯已删除', 'success')
    }
  }
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
      <button class="add-btn" @click="goToNew">+</button>
    </header>

    <section v-if="activeHabits.length === 0" class="empty-state glass-panel">
      <div class="empty-icon">🌱</div>
      <h2 class="empty-title">还没有开始第一项习惯</h2>
      <p class="empty-text">从一个最容易坚持的小目标开始，把它养成自己的节奏。</p>
      <button class="empty-btn" @click="goToNew">创建习惯</button>
    </section>

    <section v-else class="habit-list">
      <HabitItem
        v-for="habit in activeHabits"
        :key="habit.id"
        :habit="habit"
        :can-makeup="canMakeup(habit)"
        @click="goToEdit"
        @makeup="handleMakeup"
        @archive="handleArchive"
        @delete="handleDelete"
      />
    </section>

    <section v-if="archivedHabits.length > 0" class="archive-panel glass-panel">
      <button class="archive-toggle" @click="showArchived = !showArchived">
        <span>已归档习惯</span>
        <span class="archive-meta">{{ archivedHabits.length }} 项 {{ showArchived ? '收起' : '展开' }}</span>
      </button>

      <div v-if="showArchived" class="habit-list archived-list">
        <HabitItem
          v-for="habit in archivedHabits"
          :key="habit.id"
          :habit="habit"
          :archived="true"
          @restore="handleRestore"
          @delete="handleDelete"
        />
      </div>
    </section>

    <p class="page-hint">长按习惯卡片可快速操作</p>

    <MakeupConfirmModal
      v-if="showMakeupModal"
      :habit="selectedHabit"
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  margin-bottom: 4px;
  color: $primary-dark;
  font-size: 13px;
  font-weight: 700;
}

.page-title {
  min-width: 0;
  font-size: clamp(17px, 4.2vw, 20px);
  line-height: 1.2;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-btn {
  @include button-primary;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  font-size: 26px;
  font-weight: 500;
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.empty-state {
  text-align: center;
  padding-top: 28px;
  padding-bottom: 28px;
}

.empty-icon {
  font-size: 44px;
  margin-bottom: 10px;
}

.empty-title {
  margin-bottom: 6px;
  font-size: 18px;
}

.empty-text {
  margin-bottom: 16px;
  color: $text-secondary;
  font-size: 13px;
  line-height: 1.45;
}

.empty-btn {
  @include button-primary;
  min-width: 160px;
  min-height: 44px;
  padding: 0 18px;
  font-size: 14px;
}

.archive-panel {
  padding-top: $spacing-md;
  padding-bottom: $spacing-md;
}

.archive-toggle {
  width: 100%;
  @include flex-between;
  gap: $spacing-sm;
  color: $text-primary;
  font-size: 15px;
  font-weight: 800;
}

.archive-meta {
  color: $text-secondary;
  font-size: 12px;
  font-weight: 700;
}

.archived-list {
  margin-top: $spacing-md;
}

.page-hint {
  text-align: center;
  color: $primary-brown;
  font-size: 13px;
  font-weight: 500;
  margin-top: 4px;
}

@media (max-width: 400px) {
  .page-title {
    font-size: 16px;
  }

  .add-btn {
    width: 42px;
    height: 42px;
    font-size: 24px;
  }
}
</style>
