<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRewardStore } from '../stores/reward'
import { useUserStore } from '../stores/user'
import { useUiStore } from '../stores/ui'
import GoldBeanIcon from '../components/common/GoldBeanIcon.vue'
import RewardCard from '../components/reward/RewardCard.vue'
import RedeemSuccessModal from '../components/common/RedeemSuccessModal.vue'
import DeleteConfirmModal from '../components/common/DeleteConfirmModal.vue'

const router = useRouter()
const rewardStore = useRewardStore()
const userStore = useUserStore()
const uiStore = useUiStore()

const showSuccessModal = ref(false)
const redeemedReward = ref(null)
const showDeleteModal = ref(false)
const rewardToDelete = ref(null)

function goToNew() {
  router.push('/rewards/new')
}

function handleRedeem(reward) {
  const result = rewardStore.redeemReward(reward.id)

  if (result.success) {
    redeemedReward.value = result.reward
    showSuccessModal.value = true
  } else {
    uiStore.showToast(result.message, 'error')
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  redeemedReward.value = null
}

function handleEdit(reward) {
  router.push(`/rewards/${reward.id}/edit`)
}

function handleDelete(reward) {
  rewardToDelete.value = reward
  showDeleteModal.value = true
}

function confirmDelete() {
  if (rewardToDelete.value) {
    rewardStore.deleteReward(rewardToDelete.value.id)
    showDeleteModal.value = false
    rewardToDelete.value = null
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  rewardToDelete.value = null
}
</script>

<template>
  <div class="rewards-page page-shell">
    <header class="balance-strip">
      <div class="balance-pill">
        <GoldBeanIcon class="coin" :size="24" :tilt="-12" />
        <span class="value">{{ userStore.gold }} 金豆</span>
      </div>
      <button class="history-btn" @click="router.push('/stats')">↗</button>
    </header>

    <section class="rewards-panel glass-panel">
      <div class="section-head">
        <h1 class="section-title">我的奖励</h1>
        <button class="add-btn" @click="goToNew">+</button>
      </div>

      <div v-if="rewardStore.availableRewards.length === 0" class="empty-state">
        <div class="empty-icon">🎁</div>
        <h2 class="empty-title">还没有奖励清单</h2>
        <p class="empty-text">把想要的小确幸放进这里，用积累的金豆换一份满足感。</p>
        <button class="empty-btn" @click="goToNew">添加第一个奖励</button>
      </div>

      <div v-else class="rewards-grid">
        <RewardCard
          v-for="reward in rewardStore.availableRewards"
          :key="reward.id"
          :reward="reward"
          :can-afford="userStore.gold >= reward.cost"
          @redeem="handleRedeem"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </section>

    <RedeemSuccessModal v-if="showSuccessModal" :reward="redeemedReward" @close="closeSuccessModal" />
    <DeleteConfirmModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :reward="rewardToDelete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.rewards-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.balance-strip {
  @include flex-between;
}

.balance-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: $shadow-sm;

  .coin {
    flex-shrink: 0;
  }

  .value {
    font-size: 16px;
    font-weight: 900;
  }
}

.history-btn,
.add-btn {
  @include button-primary;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  font-size: 22px;
  line-height: 1;
}

.rewards-panel {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.section-head {
  @include flex-between;
  gap: $spacing-md;
}

.section-title {
  max-width: 10ch;
  font-size: clamp(24px, 5.8vw, 29px);
  line-height: 1.15;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
  gap: $spacing-md;
}

.empty-state {
  padding: $spacing-2xl $spacing-md;
  text-align: center;
}

.empty-icon {
  font-size: 44px;
  margin-bottom: $spacing-sm;
}

.empty-title {
  margin-bottom: $spacing-xs;
  font-size: 20px;
}

.empty-text {
  margin-bottom: $spacing-lg;
  color: $text-secondary;
  font-size: 14px;
}

.empty-btn {
  @include button-primary;
  min-height: 46px;
  padding: 0 20px;
  font-size: 15px;
}

@media (max-width: 400px) {
  .rewards-page {
    gap: $spacing-md;
  }

  .rewards-grid {
    gap: 12px;
  }
}
</style>
