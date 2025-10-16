<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="paymentStore.paymentModalVisible" class="payment-modal-overlay" @click="handleOverlayClick">
        <div class="payment-modal" @click.stop>
          <!-- 模态框头部 -->
          <div class="payment-modal__header">
            <h2 class="payment-modal__title">{{ t('payment.selectPaymentMethod') }}</h2>
            <button @click="handleClose" class="payment-modal__close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 支付信息摘要 -->
          <div class="payment-modal__summary">
            <div class="payment-modal__summary-item">
              <span class="payment-modal__summary-label">{{ t('payment.product') }}:</span>
              <span class="payment-modal__summary-value">{{ paymentStore.currentPayment.description }}</span>
            </div>
            <div class="payment-modal__summary-item">
              <span class="payment-modal__summary-label">{{ t('payment.amount') }}:</span>
              <span class="payment-modal__summary-value payment-modal__summary-value--price">
                {{ formatPrice(paymentStore.currentPayment.amount, paymentStore.currentPayment.currency) }}
              </span>
            </div>
            <div v-if="paymentStore.currentPayment.type === 'subscription'" class="payment-modal__summary-item">
              <span class="payment-modal__summary-label">{{ t('payment.type') }}:</span>
              <span class="payment-modal__summary-value">{{ t('payment.subscription') }}</span>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-if="paymentStore.error" class="payment-modal__error">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ paymentStore.error }}</span>
          </div>

          <!-- 成功信息 -->
          <div v-if="paymentStore.successMessage" class="payment-modal__success">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ paymentStore.successMessage }}</span>
          </div>

          <!-- 支付方式选择 -->
          <div class="payment-modal__methods">
            <h3 class="payment-modal__methods-title">{{ t('payment.selectPaymentMethod') }}</h3>

            <!-- Creem 支付 -->
            <div
              class="payment-method"
              :class="{ 'payment-method--selected': paymentStore.paymentMethod === 'creem' }"
              @click="handlePaymentMethodSelect('creem')"
            >
              <div class="payment-method__radio">
                <div class="payment-method__radio-circle" :class="{ 'payment-method__radio-circle--selected': paymentStore.paymentMethod === 'creem' }"></div>
              </div>
              <div class="payment-method__content">
                <div class="payment-method__header">
                  <span class="payment-method__icon">💳</span>
                  <span class="payment-method__name">Creem</span>
                  <span class="payment-method__badge">{{ t('payment.recommended') }}</span>
                </div>
                <p class="payment-method__description">
                  {{ t('payment.creemDescription') }}
                </p>
              </div>
            </div>

            <!-- PayPal 支付 -->
            <div
              class="payment-method"
              :class="{ 'payment-method--selected': paymentStore.paymentMethod === 'paypal' }"
              @click="handlePaymentMethodSelect('paypal')"
            >
              <div class="payment-method__radio">
                <div class="payment-method__radio-circle" :class="{ 'payment-method__radio-circle--selected': paymentStore.paymentMethod === 'paypal' }"></div>
              </div>
              <div class="payment-method__content">
                <div class="payment-method__header">
                  <span class="payment-method__icon">🅿️</span>
                  <span class="payment-method__name">PayPal</span>
                </div>
                <p class="payment-method__description">
                  {{ t('payment.paypalDescription') }}
                </p>
              </div>
            </div>
          </div>

          <!-- 支付按钮 -->
          <div class="payment-modal__actions">
            <button
              @click="handlePayment"
              :disabled="paymentStore.isLoading"
              class="payment-modal__button"
            >
              <span v-if="paymentStore.isLoading" class="payment-modal__button-spinner"></span>
              <span v-else>
                {{ getPaymentButtonText() }}
              </span>
            </button>

            <button
              @click="handleClose"
              :disabled="paymentStore.isLoading"
              class="payment-modal__button payment-modal__button--secondary"
            >
              {{ t('common.cancel') }}
            </button>
          </div>

          <!-- 安全提示 -->
          <div class="payment-modal__security">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ t('payment.securityText') }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const { t } = useI18n()
const paymentStore = usePaymentStore()

// 计算属性
const isLoading = computed(() => paymentStore.isLoading)

// 方法
const handleClose = () => {
  if (!isLoading.value) {
    paymentStore.hidePaymentModal()
    paymentStore.clearError()
    paymentStore.clearSuccess()
  }
}

const handleOverlayClick = () => {
  handleClose()
}

const handlePaymentMethodSelect = (method) => {
  if (!isLoading.value) {
    paymentStore.setPaymentMethod(method)
    paymentStore.clearError()
  }
}

const handlePayment = async () => {
  try {
    await paymentStore.startPayment()
  } catch (error) {
    console.error('支付启动失败:', error)
  }
}

const getPaymentButtonText = () => {
  const method = paymentStore.paymentMethod
  const amount = paymentStore.currentPayment.amount
  const currency = paymentStore.currentPayment.currency

  switch (method) {
    case 'creem':
      return `${t('payment.payWith')} Creem ${formatPrice(amount, currency)}`
    case 'paypal':
      return `${t('payment.payWith')} PayPal ${formatPrice(amount, currency)}`
    default:
      return `${t('payment.pay')} ${formatPrice(amount, currency)}`
  }
}

const formatPrice = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount)
}

// ESC键关闭模态框
const handleKeydown = (event) => {
  if (event.key === 'Escape' && paymentStore.paymentModalVisible && !isLoading.value) {
    handleClose()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 模态框遮罩 */
.payment-modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

/* 模态框 */
.payment-modal {
  @apply bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto;
}

/* 模态框过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .payment-modal,
.modal-leave-active .payment-modal {
  transition: all 0.3s ease;
}

.modal-enter-from .payment-modal,
.modal-leave-to .payment-modal {
  transform: scale(0.9) translateY(-20px);
}

/* 模态框头部 */
.payment-modal__header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.payment-modal__title {
  @apply text-xl font-semibold text-gray-900;
}

.payment-modal__close {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

/* 支付摘要 */
.payment-modal__summary {
  @apply p-6 border-b border-gray-200 bg-gray-50;
}

.payment-modal__summary-item {
  @apply flex justify-between items-center mb-2;
}

.payment-modal__summary-item:last-child {
  @apply mb-0;
}

.payment-modal__summary-label {
  @apply text-gray-600;
}

.payment-modal__summary-value {
  @apply text-gray-900 font-medium;
}

.payment-modal__summary-value--price {
  @apply text-lg text-primary-600 font-bold;
}

/* 错误和成功信息 */
.payment-modal__error,
.payment-modal__success {
  @apply mx-6 mt-4 p-3 rounded-lg flex items-center space-x-2;
}

.payment-modal__error {
  @apply bg-red-50 text-red-800 border border-red-200;
}

.payment-modal__success {
  @apply bg-green-50 text-green-800 border border-green-200;
}

/* 支付方式 */
.payment-modal__methods {
  @apply p-6;
}

.payment-modal__methods-title {
  @apply text-lg font-medium text-gray-900 mb-4;
}

.payment-method {
  @apply flex items-start p-4 border border-gray-200 rounded-lg mb-3 cursor-pointer transition-all duration-200;
}

.payment-method:hover {
  @apply border-gray-300 bg-gray-50;
}

.payment-method--selected {
  @apply border-primary-500 bg-primary-50;
}

.payment-method__radio {
  @apply mr-3 pt-1;
}

.payment-method__radio-circle {
  @apply w-4 h-4 border-2 border-gray-300 rounded-full;
}

.payment-method__radio-circle--selected {
  @apply border-primary-500 bg-primary-500 relative;
}

.payment-method__radio-circle--selected::after {
  @apply content-[''] absolute inset-1 bg-white rounded-full;
}

.payment-method__content {
  @apply flex-1;
}

.payment-method__header {
  @apply flex items-center space-x-2 mb-1;
}

.payment-method__icon {
  @apply text-xl;
}

.payment-method__name {
  @apply font-medium text-gray-900;
}

.payment-method__badge {
  @apply bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full;
}

.payment-method__description {
  @apply text-sm text-gray-600;
}

/* 操作按钮 */
.payment-modal__actions {
  @apply p-6 border-t border-gray-200 space-y-3;
}

.payment-modal__button {
  @apply w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center;
}

.payment-modal__button:hover:not(:disabled) {
  @apply bg-primary-700;
}

.payment-modal__button:disabled {
  @apply bg-gray-300 cursor-not-allowed;
}

.payment-modal__button--secondary {
  @apply bg-gray-100 text-gray-700;
}

.payment-modal__button--secondary:hover:not(:disabled) {
  @apply bg-gray-200;
}

.payment-modal__button-spinner {
  @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2;
}

/* 安全提示 */
.payment-modal__security {
  @apply px-6 pb-6 flex items-center justify-center space-x-2 text-xs text-gray-500;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .payment-modal {
    @apply mx-4;
  }
}
</style>