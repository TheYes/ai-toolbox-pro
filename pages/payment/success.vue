<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <AppHeader />

    <!-- 主要内容 -->
    <main class="container mx-auto px-6 py-16">
      <div class="max-w-2xl mx-auto">
        <!-- 成功图标 -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg class="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">支付成功！</h1>
          <p class="text-lg text-gray-600">
            感谢您的购买，您的高级功能已立即激活
          </p>
        </div>

        <!-- 支付详情 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">支付详情</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">订单号:</span>
              <span class="font-medium">{{ paymentId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">商品:</span>
              <span class="font-medium">{{ paymentDescription }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">支付金额:</span>
              <span class="font-medium text-green-600">{{ formatPrice(paymentAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">支付时间:</span>
              <span class="font-medium">{{ formatDate(paymentDate) }}</span>
            </div>
          </div>
        </div>

        <!-- 下一步操作 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">接下来您可以：</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <span class="text-blue-600">✓</span>
              <span class="text-gray-700">开始使用所有高级功能</span>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-blue-600">✓</span>
              <span class="text-gray-700">享受无广告的使用体验</span>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-blue-600">✓</span>
              <span class="text-gray-700">获得优先客服支持</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row gap-4">
          <NuxtLink
            :to="getLocalizedPath('/tools')"
            class="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium text-center hover:bg-primary-700 transition-colors"
          >
            立即开始使用
          </NuxtLink>
          <NuxtLink
            :to="getLocalizedPath('/')"
            class="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors"
          >
            返回首页
          </NuxtLink>
        </div>

        <!-- 帮助信息 -->
        <div class="mt-8 text-center">
          <p class="text-gray-600 mb-4">需要帮助？</p>
          <div class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <a href="#" class="text-primary-600 hover:text-primary-700">查看订阅状态</a>
            <a href="#" class="text-primary-600 hover:text-primary-700">联系客服支持</a>
            <a href="#" class="text-primary-600 hover:text-primary-700">常见问题</a>
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

// 支付信息（从URL参数或存储中获取）
const paymentId = ref(route.query.payment_id || route.query.session_id || 'Unknown')
const paymentDescription = ref(route.query.description || '高级功能订阅')
const paymentAmount = ref(parseFloat(route.query.amount) || 0)
const paymentDate = ref(new Date().toISOString())

// SEO设置
useHead({
  title: 'Payment Successful - AI Toolbox Pro',
  meta: [
    { name: 'description', content: 'Your payment was successful. Thank you for your purchase! Your premium features are now active.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// 方法
const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>