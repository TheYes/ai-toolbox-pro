<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- 支付模态框 -->
    <ClientOnly>
      <PaymentModal />
      <!-- SSR fallback -->
      <template #fallback>
        <!-- Empty fallback to prevent hydration mismatch -->
      </template>
    </ClientOnly>

    <!-- 全局通知 -->
    <div v-if="notificationStore.isVisible"
         class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300"
         :class="notificationClasses">
      <div class="flex items-center space-x-3">
        <div class="notification-icon">
          <svg v-if="notificationStore.type === 'success'" class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="notificationStore.type === 'error'" class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="notification-content">
          <p class="notification-message">{{ notificationStore.message }}</p>
          <p v-if="notificationStore.description" class="notification-description">
            {{ notificationStore.description }}
          </p>
        </div>
        <button @click="hideNotification" class="notification-close">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PaymentModal from '~/components/payment/PaymentModal.vue'

// 设置页面标题和元数据
useHead({
  titleTemplate: '%s - AI Toolbox Pro',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    }
  ]
})

// 初始化支付功能
const { initializePayment } = usePayment()
const paymentStore = usePaymentStore()

// 全局通知 store
const notificationStore = useNotificationStore()

// 计算通知样式类
const notificationClasses = computed(() => {
  const baseClasses = 'notification'
  const typeClasses = {
    success: 'notification--success',
    error: 'notification--error',
    info: 'notification--info'
  }
  return `${baseClasses} ${typeClasses[notificationStore.type] || typeClasses.info}`
})

// 隐藏通知
const hideNotification = () => {
  notificationStore.hide()
}

// 监听支付状态变化
watch(() => paymentStore.error, (error) => {
  if (error) {
    notificationStore.showError(error)
  }
})

watch(() => paymentStore.successMessage, (message) => {
  if (message) {
    notificationStore.showSuccess(message)
  }
})

// 初始化
onMounted(async () => {
  try {
    await initializePayment()
  } catch (error) {
    console.error('支付功能初始化失败:', error)
  }
})
</script>

<style scoped>
.notification {
  @apply max-w-sm;
}

.notification--success {
  @apply bg-green-50 border border-green-200 text-green-800;
}

.notification--error {
  @apply bg-red-50 border border-red-200 text-red-800;
}

.notification--info {
  @apply bg-blue-50 border border-blue-200 text-blue-800;
}

.notification-icon {
  @apply flex-shrink-0;
}

.notification-content {
  @apply flex-1 min-w-0;
}

.notification-message {
  @apply font-medium;
}

.notification-description {
  @apply text-sm mt-1 opacity-90;
}

.notification-close {
  @apply flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors;
}
</style>