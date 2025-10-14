<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <AppHeader />

    <!-- 主要内容 -->
    <main class="container mx-auto px-6 py-16">
      <div class="max-w-2xl mx-auto">
        <!-- 失败图标 -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg class="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">支付失败</h1>
          <p class="text-lg text-gray-600">
            很抱歉，您的支付未能成功完成
          </p>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-red-800 font-medium">支付失败原因</h3>
              <p class="text-red-700 mt-1">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- 可能的原因 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">可能的原因</h2>
          <div class="space-y-3">
            <div class="flex items-start space-x-3">
              <span class="text-gray-500 mt-1">•</span>
              <span class="text-gray-700">银行卡余额不足或信用额度不够</span>
            </div>
            <div class="flex items-start space-x-3">
              <span class="text-gray-500 mt-1">•</span>
              <span class="text-gray-700">银行卡信息输入错误</span>
            </div>
            <div class="flex items-start space-x-3">
              <span class="text-gray-500 mt-1">•</span>
              <span class="text-gray-700">银行拒绝了这笔交易</span>
            </div>
            <div class="flex items-start space-x-3">
              <span class="text-gray-500 mt-1">•</span>
              <span class="text-gray-700">网络连接问题导致支付超时</span>
            </div>
            <div class="flex items-start space-x-3">
              <span class="text-gray-500 mt-1">•</span>
              <span class="text-gray-700">支付平台临时维护</span>
            </div>
          </div>
        </div>

        <!-- 解决方案 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">如何解决？</h3>
          <div class="space-y-2 text-gray-700">
            <p>1. 检查您的银行卡余额和可用信用额度</p>
            <p>2. 确认银行卡信息（卡号、有效期、CVV）正确无误</p>
            <p>3. 尝试使用其他支付方式（如PayPal）</p>
            <p>4. 联系您的银行确认交易限制</p>
            <p>5. 如果问题持续存在，请联系我们的客服团队</p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            @click="retryPayment"
            class="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            重新尝试支付
          </button>
          <NuxtLink
            :to="getLocalizedPath('/pricing')"
            class="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors"
          >
            选择其他计划
          </NuxtLink>
        </div>

        <!-- 帮助信息 -->
        <div class="mt-8 text-center">
          <p class="text-gray-600 mb-4">仍需要帮助？</p>
          <div class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <a href="#" class="text-primary-600 hover:text-primary-700">联系客服支持</a>
            <a href="#" class="text-primary-600 hover:text-primary-700">查看支付帮助</a>
            <a href="#" class="text-primary-600 hover:text-primary-700">常见支付问题</a>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup>
import { useI18nRouting } from '~/composables/useI18nRouting'

const { getLocalizedPath } = useI18nRouting()
const route = useRoute()
const paymentStore = usePaymentStore()

// 错误信息
const errorMessage = computed(() => {
  return route.query.error || '支付处理过程中发生未知错误'
})

// SEO设置
useHead({
  title: 'Payment Failed - AI Toolbox Pro',
  meta: [
    { name: 'description', content: 'Your payment could not be completed. Please try again or contact support for assistance.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// 方法
const retryPayment = () => {
  // 重新显示支付模态框
  if (paymentStore.currentPayment.amount > 0) {
    paymentStore.paymentModalVisible = true
  } else {
    // 如果没有支付信息，跳转到定价页面
    navigateTo(getLocalizedPath('/pricing'))
  }
}
</script>