import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '今日概览' }
  },
  {
    path: '/habits',
    name: 'Habits',
    component: () => import('../views/Habits.vue'),
    meta: { title: '我的习惯' }
  },
  {
    path: '/habits/new',
    name: 'NewHabit',
    component: () => import('../views/HabitForm.vue'),
    meta: { title: '新建习惯' }
  },
  {
    path: '/habits/:id/edit',
    name: 'EditHabit',
    component: () => import('../views/HabitForm.vue'),
    meta: { title: '编辑习惯' }
  },
  {
    path: '/rewards',
    name: 'Rewards',
    component: () => import('../views/Rewards.vue'),
    meta: { title: '奖励中心' }
  },
  {
    path: '/rewards/new',
    name: 'NewReward',
    component: () => import('../views/RewardForm.vue'),
    meta: { title: '新建奖励' }
  },
  {
    path: '/rewards/:id/edit',
    name: 'EditReward',
    component: () => import('../views/RewardForm.vue'),
    meta: { title: '编辑奖励' }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/Stats.vue'),
    meta: { title: '数据统计' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 习惯养成` : '习惯养成'
  next()
})

export default router
