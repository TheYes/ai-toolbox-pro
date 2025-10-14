<template>
  <div class="subscription-manager">
    <!-- 当前订阅状态 -->
    <div class="subscription-manager__status">
      <div class="subscription-manager__status-header">
        <h3 class="subscription-manager__title">订阅状态</h3>
        <div class="subscription-manager__badge" :class="statusBadgeClass">
          {{ statusText }}
        </div>
      </div>

      <div v-if="paymentStore.subscription.isActive" class="subscription-manager__details">
        <div class="subscription-manager__detail-item">
          <span class="subscription-manager__label">当前计划:</span>
          <span class="subscription-manager__value">{{ currentPlanName }}</span>
        </div>

        <div class="subscription-manager__detail-item">
          <span class="subscription-manager__label">到期时间:</span>
          <span class="subscription-manager__value">
            {{ formatDate(paymentStore.subscription.currentPeriodEnd) }}
          </span>
        </div>

        <div class="subscription-manager__detail-item">
          <span class="subscription-manager__label">剩余天数:</span>
          <span class="subscription-manager__value" :class="daysLeftClass">
            {{ paymentStore.subscriptionDaysLeft }} 天
          </span>
        </div>

        <div v-if="paymentStore.subscription.cancelAtPeriodEnd" class="subscription-manager__detail-item">
          <span class="subscription-manager__label">自动续费:</span>
          <span class="subscription-manager__value text-orange-600">已取消</span>
        </div>
      </div>

      <div v-else class="subscription-manager__no-subscription">
        <div class="subscription-manager__no-subscription-icon">🔒</div>
        <p class="subscription-manager__no-subscription-text">
          您还没有订阅任何计划
        </p>
        <p class="subscription-manager__no-subscription-description">
          订阅后可以无限制使用所有高级功能
        </p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="subscription-manager__actions">
      <!-- 如果没有订阅，显示升级按钮 -->
      <button
        v-if="!paymentStore.subscription.isActive"
        @click="showUpgradeOptions"
        class="subscription-manager__button subscription-manager__button--primary"
      >
        立即升级
      </button>

      <!-- 如果有订阅 -->
      <template v-else>
        <!-- 恢复订阅按钮 -->
        <button
          v-if="paymentStore.subscription.cancelAtPeriodEnd"
          @click="resumeSubscription"
          :disabled="paymentStore.isLoading"
          class="subscription-manager__button subscription-manager__button--success"
        >
          <span v-if="paymentStore.isLoading" class="subscription-manager__button-spinner"></span>
          <span v-else>恢复自动续费</span>
        </button>

        <!-- 取消订阅按钮 -->
        <button
          v-else
          @click="showCancelConfirmation"
          :disabled="paymentStore.isLoading"
          class="subscription-manager__button subscription-manager__button--secondary"
        >
          取消自动续费
        </button>

        <!-- 更换计划按钮 -->
        <button
          @click="showChangePlanOptions"
          :disabled="paymentStore.isLoading"
          class="subscription-manager__button subscription-manager__button--outline"
        >
          更换计划
        </button>
      </template>
    </div>

    <!-- 取消确认对话框 -->
    <div v-if="showCancelDialog" class="subscription-manager__dialog">
      <div class="subscription-manager__dialog-content">
        <h4 class="subscription-manager__dialog-title">取消订阅确认</h4>
        <p class="subscription-manager__dialog-text">
          确定要取消自动续费吗？取消后您仍可以使用到当前订阅期结束，但到期后将无法使用高级功能。
        </p>
        <div class="subscription-manager__dialog-actions">
          <button
            @click="confirmCancelSubscription"
            :disabled="paymentStore.isLoading"
            class="subscription-manager__button subscription-manager__button--danger"
          >
            <span v-if="paymentStore.isLoading" class="subscription-manager__button-spinner"></span>
            <span v-else>确认取消</span>
          </button>
          <button
            @click="hideCancelConfirmation"
            :disabled="paymentStore.isLoading"
            class="subscription-manager__button subscription-manager__button--secondary"
          >
            再想想
          </button>
        </div>
      </div>
    </div>

    <!-- 升级/更换计划对话框 -->
    <div v-if="showPlanDialog" class="subscription-manager__dialog">
      <div class="subscription-manager__dialog-content subscription-manager__dialog-content--large">
        <h4 class="subscription-manager__dialog-title">
          {{ dialogMode === 'upgrade' ? '选择订阅计划' : '更换订阅计划' }}
        </h4>

        <div class="subscription-manager__plans">
          <div
            v-for="(plan, planId) in availablePlans"
            :key="planId"
            class="subscription-manager__plan"
            :class="{
              'subscription-manager__plan--current': planId === paymentStore.subscription.planId,
              'subscription-manager__plan--selected': selectedPlanId === planId
            }"
            @click="selectPlan(planId)"
          >
            <div class="subscription-manager__plan-header">
              <h5 class="subscription-manager__plan-name">{{ plan.name }}</h5>
              <span class="subscription-manager__plan-price">{{ formatPrice(plan.price) }}</span>
            </div>
            <ul class="subscription-manager__plan-features">
              <li v-for="feature in plan.features" :key="feature" class="subscription-manager__plan-feature">
                ✓ {{ feature }}
              </li>
            </ul>
            <div v-if="planId === paymentStore.subscription.planId" class="subscription-manager__plan-current-badge">
              当前计划
            </div>
          </div>
        </div>

        <div class="subscription-manager__dialog-actions">
          <button
            @click="confirmPlanChange"
            :disabled="paymentStore.isLoading || !selectedPlanId"
            class="subscription-manager__button subscription-manager__button--primary"
          >
            <span v-if="paymentStore.isLoading" class="subscription-manager__button-spinner"></span>
            <span v-else>{{ getPlanChangeButtonText() }}</span>
          </button>
          <button
            @click="hidePlanDialog"
            :disabled="paymentStore.isLoading"
            class="subscription-manager__button subscription-manager__button--secondary"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const paymentStore = usePaymentStore()
const { pricingPlans } = usePayment()

// 响应式数据
const showCancelDialog = ref(false)
const showPlanDialog = ref(false)
const dialogMode = ref('upgrade') // 'upgrade' | 'change'
const selectedPlanId = ref(null)

// 计算属性
const statusBadgeClass = computed(() => {
  if (!paymentStore.subscription.isActive) {
    return 'subscription-manager__badge--inactive'
  }
  if (paymentStore.subscription.cancelAtPeriodEnd) {
    return 'subscription-manager__badge--cancelled'
  }
  return 'subscription-manager__badge--active'
})

const statusText = computed(() => {
  if (!paymentStore.subscription.isActive) {
    return '未订阅'
  }
  if (paymentStore.subscription.cancelAtPeriodEnd) {
    return '即将到期'
  }
  return '活跃'
})

const currentPlanName = computed(() => {
  const planId = paymentStore.subscription.planId
  return pricingPlans[planId]?.name || '未知计划'
})

const daysLeftClass = computed(() => {
  const daysLeft = paymentStore.subscriptionDaysLeft
  if (daysLeft <= 7) {
    return 'text-red-600 font-semibold'
  }
  if (daysLeft <= 30) {
    return 'text-orange-600'
  }
  return 'text-green-600'
})

const availablePlans = computed(() => {
  return pricingPlans
})

// 方法
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

const showUpgradeOptions = () => {
  dialogMode.value = 'upgrade'
  selectedPlanId.value = null
  showPlanDialog.value = true
}

const showChangePlanOptions = () => {
  dialogMode.value = 'change'
  selectedPlanId.value = paymentStore.subscription.planId
  showPlanDialog.value = true
}

const selectPlan = (planId) => {
  if (planId !== paymentStore.subscription.planId) {
    selectedPlanId.value = planId
  }
}

const getPlanChangeButtonText = () => {
  if (dialogMode.value === 'upgrade') {
    return `订阅 ${selectedPlanId.value ? pricingPlans[selectedPlanId.value]?.name : ''}`
  }
  return '更换计划'
}

const confirmPlanChange = async () => {
  if (!selectedPlanId.value) return

  try {
    const plan = pricingPlans[selectedPlanId.value]
    paymentStore.showPaymentModal({
      amount: plan.price,
      currency: plan.currency,
      description: plan.name,
      type: 'subscription',
      planId: plan.id
    })

    hidePlanDialog()
  } catch (error) {
    console.error('计划更改失败:', error)
  }
}

const showCancelConfirmation = () => {
  showCancelDialog.value = true
}

const hideCancelConfirmation = () => {
  showCancelDialog.value = false
}

const confirmCancelSubscription = async () => {
  try {
    await paymentStore.cancelSubscription()
    hideCancelConfirmation()
  } catch (error) {
    console.error('取消订阅失败:', error)
  }
}

const resumeSubscription = async () => {
  try {
    await paymentStore.resumeSubscription()
  } catch (error) {
    console.error('恢复订阅失败:', error)
  }
}

const hidePlanDialog = () => {
  showPlanDialog.value = false
  selectedPlanId.value = null
}
</script>

<style scoped>
.subscription-manager {
  @apply bg-white rounded-lg border border-gray-200 p-6;
}

/* 状态部分 */
.subscription-manager__status-header {
  @apply flex items-center justify-between mb-4;
}

.subscription-manager__title {
  @apply text-lg font-semibold text-gray-900;
}

.subscription-manager__badge {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}

.subscription-manager__badge--active {
  @apply bg-green-100 text-green-800;
}

.subscription-manager__badge--cancelled {
  @apply bg-orange-100 text-orange-800;
}

.subscription-manager__badge--inactive {
  @apply bg-gray-100 text-gray-800;
}

.subscription-manager__details {
  @apply space-y-2;
}

.subscription-manager__detail-item {
  @apply flex justify-between items-center;
}

.subscription-manager__label {
  @apply text-gray-600;
}

.subscription-manager__value {
  @apply text-gray-900 font-medium;
}

.subscription-manager__no-subscription {
  @apply text-center py-8;
}

.subscription-manager__no-subscription-icon {
  @apply text-4xl mb-4;
}

.subscription-manager__no-subscription-text {
  @apply text-gray-900 font-medium mb-2;
}

.subscription-manager__no-subscription-description {
  @apply text-gray-600 text-sm;
}

/* 操作按钮 */
.subscription-manager__actions {
  @apply mt-6 space-y-3;
}

.subscription-manager__button {
  @apply w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center;
}

.subscription-manager__button--primary {
  @apply bg-primary-600 text-white;
}

.subscription-manager__button--primary:hover:not(:disabled) {
  @apply bg-primary-700;
}

.subscription-manager__button--secondary {
  @apply bg-gray-100 text-gray-700;
}

.subscription-manager__button--secondary:hover:not(:disabled) {
  @apply bg-gray-200;
}

.subscription-manager__button--success {
  @apply bg-green-600 text-white;
}

.subscription-manager__button--success:hover:not(:disabled) {
  @apply bg-green-700;
}

.subscription-manager__button--danger {
  @apply bg-red-600 text-white;
}

.subscription-manager__button--danger:hover:not(:disabled) {
  @apply bg-red-700;
}

.subscription-manager__button--outline {
  @apply border border-gray-300 text-gray-700 bg-white;
}

.subscription-manager__button--outline:hover:not(:disabled) {
  @apply bg-gray-50;
}

.subscription-manager__button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.subscription-manager__button-spinner {
  @apply w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2;
}

/* 对话框 */
.subscription-manager__dialog {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

.subscription-manager__dialog-content {
  @apply bg-white rounded-lg max-w-md w-full p-6;
}

.subscription-manager__dialog-content--large {
  @apply max-w-2xl;
}

.subscription-manager__dialog-title {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

.subscription-manager__dialog-text {
  @apply text-gray-600 mb-6;
}

.subscription-manager__dialog-actions {
  @apply flex space-x-3;
}

/* 计划选择 */
.subscription-manager__plans {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-6;
}

.subscription-manager__plan {
  @apply border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 relative;
}

.subscription-manager__plan:hover {
  @apply border-gray-300;
}

.subscription-manager__plan--current {
  @apply border-green-500 bg-green-50;
}

.subscription-manager__plan--selected {
  @apply border-primary-500 bg-primary-50;
}

.subscription-manager__plan-header {
  @apply flex justify-between items-center mb-3;
}

.subscription-manager__plan-name {
  @apply font-medium text-gray-900;
}

.subscription-manager__plan-price {
  @apply text-lg font-bold text-primary-600;
}

.subscription-manager__plan-features {
  @apply space-y-1 mb-3;
}

.subscription-manager__plan-feature {
  @apply text-sm text-gray-600;
}

.subscription-manager__plan-current-badge {
  @apply absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subscription-manager__plans {
    @apply grid-cols-1;
  }

  .subscription-manager__dialog-content--large {
    @apply max-w-md;
  }
}
</style>