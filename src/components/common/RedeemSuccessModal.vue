<script setup>
import GoldBeanIcon from './GoldBeanIcon.vue'

defineProps({
  reward: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-card">
        <div class="burst"></div>
        <div class="celebrate-icon">🎉</div>
        <h2 class="modal-title">恭喜你！</h2>
        <div class="reward-name">{{ reward?.name }}</div>
        <div class="blessing">快去享受吧～</div>

        <div class="coin-burst">
          <span v-for="coin in 5" :key="coin" class="coin">
            <GoldBeanIcon :size="26" :tilt="-10" />
          </span>
        </div>

        <button class="confirm-btn" @click="emit('close')">好的</button>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 20, 14, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.modal-card {
  position: relative;
  overflow: hidden;
  width: min(100%, 620px);
  padding: 40px 24px 24px;
  border-radius: 36px;
  background: rgba(255, 255, 255, 0.98);
  text-align: center;
  box-shadow: $shadow-lg;
}

.burst {
  position: absolute;
  left: 50%;
  top: 36px;
  width: 240px;
  height: 180px;
  transform: translateX(-50%);
  background: radial-gradient(circle at center, rgba(255, 220, 110, 0.5), rgba(255, 220, 110, 0) 70%);
}

.celebrate-icon {
  position: relative;
  z-index: 1;
  font-size: 78px;
  margin-bottom: 12px;
}

.modal-title {
  position: relative;
  z-index: 1;
  margin-bottom: 14px;
  font-size: clamp(28px, 7vw, 36px);
  color: $primary-brown;
}

.reward-name {
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
  font-size: clamp(30px, 8vw, 40px);
  line-height: 1.12;
  font-weight: 900;
}

.blessing {
  position: relative;
  z-index: 1;
  margin-bottom: 26px;
  font-size: 17px;
  color: $primary-brown;
}

.coin-burst {
  position: relative;
  height: 150px;
  margin-bottom: 18px;
}

.coin {
  position: absolute;
  filter: drop-shadow(0 12px 14px rgba(255, 186, 63, 0.2));
}

.coin:nth-child(1) { left: 12%; top: 62px; }
.coin:nth-child(2) { left: 28%; top: 98px; }
.coin:nth-child(3) { left: 45%; top: 78px; }
.coin:nth-child(4) { right: 20%; top: 58px; }
.coin:nth-child(5) { right: 6%; top: 90px; }

.confirm-btn {
  @include button-primary;
  width: 100%;
  min-height: 58px;
  font-size: 18px;
}
</style>
