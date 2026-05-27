<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRewardStore } from '../stores/reward'
import { useUserStore } from '../stores/user'
import { useHabitStore, HABIT_TYPE_CONFIG } from '../stores/habit'
import { useUiStore } from '../stores/ui'
import GoldBeanIcon from '../components/common/GoldBeanIcon.vue'
import RewardCard from '../components/reward/RewardCard.vue'
import RedeemSuccessModal from '../components/common/RedeemSuccessModal.vue'
import ConfirmActionModal from '../components/common/ConfirmActionModal.vue'

const router = useRouter()
const rewardStore = useRewardStore()
const userStore = useUserStore()
const habitStore = useHabitStore()
const uiStore = useUiStore()

const showSuccessModal = ref(false)
const redeemedReward = ref(null)
const confirmState = ref({
  visible: false,
  title: '',
  message: '',
  confirmText: '确认',
  tone: 'default',
  action: null
})

const affordableCount = computed(() =>
  rewardStore.availableRewards.filter(reward => userStore.gold >= reward.cost).length
)

// 可兑换的奖励（按成本升序）
const affordableRewards = computed(() =>
  rewardStore.availableRewards
    .filter(reward => userStore.gold >= reward.cost)
    .sort((a, b) => a.cost - b.cost)
)

// 暂不可兑换的奖励（按成本升序）
const lockedRewards = computed(() =>
  rewardStore.availableRewards
    .filter(reward => userStore.gold < reward.cost)
    .sort((a, b) => a.cost - b.cost)
)

// 最近目标：离当前金豆最近的不可兑换奖励
const nearestGoal = computed(() => {
  if (lockedRewards.value.length === 0) return null
  const reward = lockedRewards.value[0]
  const deficit = reward.cost - userStore.gold
  const progress = Math.min(100, Math.round((userStore.gold / reward.cost) * 100))
  const activeHabits = habitStore.activeHabits
  if (activeHabits.length === 0) return { reward, deficit, checkInsNeeded: 0, progress }
  const avgGold = activeHabits.reduce((sum, h) => {
    const config = HABIT_TYPE_CONFIG[h.type] || HABIT_TYPE_CONFIG.easy
    return sum + config.gold
  }, 0) / activeHabits.length
  return {
    reward,
    deficit,
    checkInsNeeded: Math.ceil(deficit / avgGold),
    progress
  }
})

function handleRedeem(reward) {
  const result = rewardStore.redeemReward(reward.id)
  if (!result.success) {
    uiStore.showToast(result.message, 'error')
    return
  }
  redeemedReward.value = result.reward
  showSuccessModal.value = true
}

function handleDelete(reward) {
  confirmState.value = {
    visible: true,
    title: '删除奖励',
    message: `删除“${reward.name}”后将无法恢复，但不会影响已经发生过的兑换记录。`,
    confirmText: '确认删除',
    tone: 'danger',
    action: () => {
      rewardStore.deleteReward(reward.id)
      uiStore.showToast('奖励已删除', 'success')
    }
  }
}

function confirmAction() {
  confirmState.value.action?.()
  confirmState.value.visible = false
}
</script>

<template>
  <div class="rewards-page page-shell">
    <header class="balance-strip">
      <div class="balance-pill">
        <GoldBeanIcon :size="24" />
        <span class="value">{{ userStore.gold }} 金豆</span>
      </div>
      <button class="icon-btn" aria-label="查看统计" @click="router.push('/stats')">↗</button>
    </header>

    <section class="glass-panel rewards-panel">
      <div class="section-head">
        <h1 class="section-title">我的奖励</h1>
        <div class="head-actions">
          <button class="ghost-btn" @click="router.push('/rewards/history')">兑换记录</button>
          <button class="icon-btn" aria-label="新建奖励" @click="router.push('/rewards/new')">+</button>
        </div>
      </div>

      <div v-if="rewardStore.availableRewards.length > 0" class="reward-overview">
        <div class="overview-item">
          <span class="overview-label">可兑换</span>
          <strong>{{ affordableCount }}</strong>
        </div>
        <div class="overview-item">
          <span class="overview-label">奖励总数</span>
          <strong>{{ rewardStore.availableRewards.length }}</strong>
        </div>
      </div>

      <!-- 最近目标 -->
      <div v-if="nearestGoal && nearestGoal.checkInsNeeded > 0" class="goal-banner">
        <div class="goal-left">
          <span class="goal-icon">{{ nearestGoal.reward.icon }}</span>
          <div>
            <p class="goal-label">最近目标</p>
            <p class="goal-name">{{ nearestGoal.reward.name }}</p>
          </div>
        </div>
        <div class="goal-right">
          <span class="goal-deficit">还差 {{ nearestGoal.deficit }} 金豆</span>
          <span class="goal-hint">约 {{ nearestGoal.checkInsNeeded }} 次打卡</span>
        </div>
        <div class="goal-progress-bar">
          <div class="goal-progress-fill" :style="{ width: `${nearestGoal.progress}%` }"></div>
        </div>
        <p class="goal-progress-label">{{ userStore.gold }} / {{ nearestGoal.reward.cost }} 金豆</p>
      </div>

      <div v-if="rewardStore.availableRewards.length === 0" class="empty-state">
        <div class="empty-icon">🎁</div>
        <h2 class="empty-title">还没有奖励清单</h2>
        <p class="empty-text">把想要的小确幸放进这里，用积累的金豆换一份满足感。</p>
        <button class="primary-btn" @click="router.push('/rewards/new')">添加第一个奖励</button>
      </div>

      <div v-else>
        <!-- 可兑换推荐 -->
        <div v-if="affordableRewards.length > 0" class="reward-section">
          <h2 class="section-label accent">现在可兑换</h2>
          <div class="rewards-grid">
            <RewardCard
              v-for="reward in affordableRewards"
              :key="reward.id"
              :reward="reward"
              can-afford
              @redeem="handleRedeem"
              @edit="router.push(`/rewards/${reward.id}/edit`)"
              @delete="handleDelete"
            />
          </div>
        </div>

        <!-- 暂不可兑换 -->
        <div v-if="lockedRewards.length > 0" class="reward-section">
          <h2 class="section-label">继续积累</h2>
          <div class="rewards-grid">
            <RewardCard
              v-for="reward in lockedRewards"
              :key="reward.id"
              :reward="reward"
              :can-afford="false"
              @redeem="handleRedeem"
              @edit="router.push(`/rewards/${reward.id}/edit`)"
              @delete="handleDelete"
            />
          </div>
        </div>
      </div>
    </section>

    <RedeemSuccessModal v-if="showSuccessModal" :reward="redeemedReward" @close="showSuccessModal = false" />
    <ConfirmActionModal
      v-if="confirmState.visible"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :tone="confirmState.tone"
      @close="confirmState.visible = false"
      @confirm="confirmAction"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.rewards-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.balance-strip,
.section-head {
  @include flex-between;
  gap: 12px;
}

.balance-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: $shadow-sm;
}

.value {
  font-size: 16px;
  font-weight: 900;
}

.icon-btn {
  @include button-primary;
  width: 44px;
  min-width: 44px;
  padding: 0;
  border-radius: 16px;
  font-size: 22px;
}

.rewards-panel {
  padding: 18px 16px;
}

.section-title {
  font-size: 24px;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ghost-btn {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  color: $text-secondary;
  font-size: 13px;
  font-weight: 700;
  box-shadow: $shadow-sm;
}

.reward-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.overview-item {
  padding: 12px;
  border-radius: 20px;
  background: linear-gradient(180deg, #fffaf0, #fff4e2);

  strong {
    display: block;
    margin-top: 6px;
    color: $primary-brown;
    font-size: 20px;
    line-height: 1;
  }
}

.overview-label {
  color: $text-secondary;
  font-size: 12px;
  font-weight: 700;
}

/* 最近目标 */
.goal-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding: 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, #fff8ef 0%, #ffecd2 100%);
  border: 1px solid rgba(255, 157, 52, 0.2);
}

.goal-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.goal-icon {
  font-size: 28px;
}

.goal-label {
  font-size: 11px;
  color: $text-secondary;
  font-weight: 700;
  margin: 0;
}

.goal-name {
  font-size: 15px;
  font-weight: 800;
  color: $text-primary;
  margin: 2px 0 0;
}

.goal-right {
  text-align: right;
}

.goal-deficit {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: $primary-deep;
}

.goal-hint {
  display: block;
  font-size: 11px;
  color: $text-secondary;
  margin-top: 2px;
}

.goal-progress-bar {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 157, 52, 0.15);
  margin-top: 12px;
  overflow: hidden;
}

.goal-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #ffc664, #ff9b31);
  transition: width 0.5s ease;
}

.goal-progress-label {
  font-size: 11px;
  color: $text-light;
  text-align: right;
  margin: 4px 0 0;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.reward-section {
  margin-top: 16px;
}

.reward-section:first-child {
  margin-top: 14px;
}

.section-label {
  font-size: 14px;
  font-weight: 800;
  color: $text-secondary;
  margin: 0;
}

.section-label.accent {
  color: #e65100;
}

.empty-state {
  padding: 22px 10px 10px;
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
  @include button-primary;
  margin-top: 16px;
}
</style>
