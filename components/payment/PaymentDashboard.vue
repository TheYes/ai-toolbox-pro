<template>
  <div class="payment-dashboard">
    <!-- 概览卡片 -->
    <div class="dashboard-grid">
      <!-- 订阅 -->
      <div class="dashboard-card">
        <div class="dashboard-card__icon">💳</div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">订阅状态</h3>
          <p class="dashboard-card__value">
            {{ paymentStore.hasActiveSubscription ? '活跃' : '未订阅' }}
          </p>
          <p class="dashboard-card__description">
            {{ paymentStore.subscriptionDaysLeft }} 天剩余
          </p>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="dashboard-card">
        <div class="dashboard-card__icon">💰</div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">当前计划</h3>
          <p class="dashboard-card__value">
            {{ currentPlanName }}
          </p>
          <p class="dashboard-card__description">
            {{ paymentStore.subscription.currentPeriodEnd ? formatDate(paymentStore.subscription.currentPeriodEnd) : '未知' }}
          </p>
        </div>
      </div>

      <!-- 支付历史统计 -->
      <div class="dashboard-card">
        <div class="dashboard-card__icon">📊</div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">支付历史</h3>
          <p class="dashboard-card__value">
            {{ recentPayments.length }} 次支付记录
          </p>
          <p class="dashboard-card__description">
            总计: {{ formatPrice(totalPaid) }}
          </p>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="dashboard-card">
        <div class="dashboard-card__icon">⚡</div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">快速操作</h3>
          <div class="flex space-x-2">
            <button
              @click="showPaymentModal"
              class="dashboard-button dashboard-button--primary"
            >
              立即升级
            </button>
            <button
              @click="showSubscriptionManager"
              class="dashboard-button dashboard-button--secondary"
            >
              管理订阅
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细信息展示 -->
    <div class="dashboard-grid">
      <!-- 订阅历史 -->
      <div class="dashboard-card dashboard-card--full-width">
        <div class="dashboard-card__icon">📊</div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">订阅历史</h3>
          <div class="space-y-4">
            <div
              v-for="(item, index) in subscriptionHistory"
              :key="index"
              class="flex justify-between items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <span class="text-sm font-medium text-gray-900">{{ formatDate(item.startedAt) }}</span>
              <span class="text-sm text-gray-600">{{ formatDate(item.endedAt || item.startedAt }}</span>
              <span class="text-sm"
                    :class="{
                      'text-green-600': item.status === 'active',
                      'text-orange-600': item.status === 'cancelled',
                      'text-red-600': item.status === 'past_due'
                    }"
              >
                {{ getStatusText(item.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 支付历史 -->
      <div class="dashboard-card dashboard-card--full-width">
        <div class="dashboard-card__icon">💳</div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">支付历史</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span class="text-sm font-medium text-gray-900">订单ID</span>
              <span class="text-sm font-medium text-gray-600">金额</span>
              <span class="text-sm text-gray-600">状态</span>
            </div>

            <div
              v-for="(item, index) in recentPayments"
              :key="index"
              class="flex justify-between items-center bg-white p-3 border border border-gray-100 rounded-md"
            >
              <span class="text-sm text-gray-900">{{ item.id }}</span>
              <span class="text-sm text-gray-600">{{ formatPrice(item.amount) }}</span>
              <span
                class="text-sm font-medium"
                :class="{
                  'text-green-600': item.status === 'completed',
                  'text-yellow-600': item.status === 'pending',
                  'text-red-600': item.status === 'failed'
                }"
              >
                {{ getStatusText(item.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 收入统计 -->
      <div class="dashboard-card dashboard-card--full-width">
        <div class="dashboard-card__icon">💰</div>
        <div class="dashboard-card__content">
          <h3 class="card-title">收入统计</h3>
          <div class="grid grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ formatPrice(monthlyRevenue) }}</p>
              <p class="text-sm text-gray-600">本月收入</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ formatPrice(totalPaid) }}</p>
              <p class="text-sm text-gray-600">总收入</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-green-600">{{ recentPayments.length }}</p>
              <p class="text-sm text-gray-600">总支付次数</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具解锁状态 -->
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="dashboard-card__icon">🔓</div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">工具解锁状态</h3>
          <div class="space-y-3">
            <div
              v-for="(tool, index) in unlockedTools"
              :key="index"
              class="flex justify-between items-center space-x-3 p-3 bg-green-50 rounded-lg"
            >
              <span class="text-sm font-medium">{{ tool.name }}</span>
              <span class="text-sm font-medium">{{ formatPrice(tool.unlockPrice) }}</span>
            </div>
          </div>

          <div v-if="lockedTools.length > 0" class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">未解锁工具</h4>
            <div
              v-for="(tool, index) in lockedTools"
              :key="index"
              class="flex justify-between items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <span class="text-sm text-gray-700">{{ tool.name }}</span>
              <span class="text-sm font-medium">{{ formatPrice(tool.unlockPrice) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订阅管理 -->
      <div class="dashboard-card">
        <div class="dashboard-card__icon">📊</div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">订阅管理</h3>
          <div class="space-y-3">
            <button
              @click="resumeSubscription"
              v-if="paymentStore.subscription.cancelAtPeriodEnd"
              :disabled="paymentStore.isLoading"
              class="dashboard-button dashboard-button--success"
            >
              恢复自动续费
            </button>

            <button
              @click="cancelSubscription"
              v-if="!paymentStore.subscription.cancelAtPeriodEnd"
              :disabled="paymentStore.isLoading"
              class="dashboard-button dashboard-button--warning"
            >
              取消订阅
            </button>

            <button
              @click="showChangePlanDialog"
              class="dashboard-button dashboard-button--outline"
            >
              更换计划
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePayment } from '~/composables/usePayment'

const paymentStore = usePaymentStore()
const { formatPrice, formatDate, getStatusText } = usePayment()

// 计算属性
const currentPlanName = computed(() => {
  const plans = {
    'pro_monthly': 'Pro Monthly',
    'pro_yearly': 'Pro Yearly',
    'pro_lifetime': 'Pro Lifetime'
  }
  return plans[paymentStore.subscription.planId] || '无计划'
})

const monthlyRevenue = computed(() => {
  // 这里应该从API获取实际月收入
  return paymentStore.recentPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0)
})

const totalPaid = computed(() => {
  // 这里应该从API获取总收入
  return paymentStore.recentPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0)
})

const recentPayments = computed(() => {
  return paymentStore.recentPayments.slice(0, 10) // 显示最近10条支付记录
})

const unlockedTools = computed(() => {
  const unlockedTools = []
  // 这里应该从API获取已解锁的工具列表
  return unlockedTools
})

const lockedTools = computed(() => {
  const premiumTools = ['advanced-json-formatter', 'batch-processor', 'custom-theme-editor']
  return premiumTools.map(tool => ({
    name: tool.name,
    unlockPrice: 4.99
  }))
})

// 方法
const resumeSubscription = async () => {
  await paymentStore.resumeSubscription()
}

const cancelSubscription = async () => {
  await paymentStore.cancelSubscription()
}

const showChangePlanDialog = () => {
  // 显示更换计划对话框
  paymentStore.showSubscriptionPayment('yearly')
}

const showSubscriptionManager = () => {
  paymentStore.showSubscriptionPayment('monthly')
}

const showPaymentModal = () => {
  paymentStore.showPaymentModal({
    amount: 9.99,
    description: 'Pro Monthly Subscription',
    type: 'subscription',
    planId: 'pro_monthly'
  })
}

// 计算属性
const getStatusText = (status) => {
  const statusMap = {
    'active': '活跃',
    'inactive': '未激活',
    'cancelled': '已取消',
    'past_due': '已过期'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.payment-dashboard {
  @apply py-8;
}

.dashboard-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.dashboard-card {
  @apply bg-white rounded-lg shadow-md p-6 transition-all duration-300;
}

.dashboard-card:hover {
  @apply shadow-lg;
}

.dashboard-card--full-width {
  @apply md:col-span-2 lg:col-span-3;
}

.dashboard-card__icon {
  @apply text-2xl text-4xl mb-2;
}

.dashboard-card__content {
  @apply flex flex-col;
}

.dashboard-card__title {
  @apply text-lg font-semibold text-gray-900;
}

.dashboard-card__value {
  @apply text-gray-900 font-medium;
}

.dashboard-card__description {
  @apply text-gray-600 text-sm;
}

.dashboard-card__badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.dashboard-card__badge--active {
  @apply bg-green-100 text-green-800;
}

.dashboard-card__badge--cancelled {
  @apply bg-orange-100 text-orange-800;
}

.dashboard-card__badge--past_due {
  @apply bg-red-100 text-red-800;
}

.dashboard-button {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-2 focus:ring-offset-2 focus:ring-ring-primary-500';
}

.dashboard-button--primary {
  @apply bg-primary-600 text-white;
}

.dashboard-button--primary:hover {
  @apply bg-primary-700;
}

.dashboard-button--secondary {
  @apply bg-gray-100 text-gray-700;
}

.dashboard-button--secondary:hover {
  @apply bg-gray-200 text-gray-900;
}

.dashboard-button--success {
  @apply bg-green-600 text-white;
}

.dashboard-button--success:hover {
  @apply bg-green-700;
}

.dashboard-button--warning {
  @apply bg-orange-600 text-white;
}

.dashboard-button--warning:hover {
  @apply bg-orange-700;
}

.dashboard-button--outline {
  @apply border border-gray-300 text-gray-700 hover:bg-white hover:text-gray-700;
}

.dashboard-button--outline:hover {
  @apply border-gray-400 hover:text-gray-700;
}

.dashboard-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>