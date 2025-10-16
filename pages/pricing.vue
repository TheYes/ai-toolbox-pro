<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <!-- <AppHeader /> -->

    <!-- 主要内容 -->
    <main>
      <div class="container mx-auto px-6 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            {{ locale === 'zh' ? '选择适合您的计划' : 'Choose Your Perfect Plan' }}
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            {{ locale === 'zh' ? '选择适合您需求的定价方案。通过我们经济实惠的订阅计划解锁所有高级功能。' : 'Select the perfect pricing plan for your needs. Unlock all premium features with our affordable subscription plans.' }}
          </p>
        </div>

        <!-- 价格卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <!-- 月付计划 -->
          <div class="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ locale === 'zh' ? '专业版 月付' : 'Pro Monthly' }}
            </h3>
            <div class="text-4xl font-bold text-gray-900 mb-4">
              ${{ pricingPlans.monthly.price }}<span class="text-lg text-gray-600">/month</span>
            </div>
            <ul class="space-y-2 mb-6">
              <li v-for="feature in (locale === 'zh' ? ['无限制使用所有工具', '优先客服支持', '云端同步设置', '无广告体验'] : ['Unlimited access to all tools', 'Priority customer support', 'Cloud sync settings', 'Ad-free experience'])" :key="feature" class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span>{{ feature }}</span>
              </li>
            </ul>
            <button
              @click="handleSubscribe(pricingPlans.monthly)"
              :disabled="paymentStore.isLoading"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="paymentStore.isLoading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>{{ locale === 'zh' ? '选择月付计划' : 'Choose Monthly' }}</span>
            </button>
          </div>

          <!-- 年付计划 -->
          <div class="bg-white rounded-lg border-2 border-blue-500 p-6 hover:shadow-lg transition-shadow transform scale-105 relative">
            <div class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
              {{ locale === 'zh' ? '最受欢迎' : 'Most Popular' }}
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ locale === 'zh' ? '专业版 年付' : 'Pro Yearly' }}
            </h3>
            <div class="text-4xl font-bold text-gray-900 mb-4">
              ${{ pricingPlans.yearly.price }}<span class="text-lg text-gray-600">/year</span>
            </div>
            <ul class="space-y-2 mb-6">
              <li v-for="feature in (locale === 'zh' ? ['无限制使用所有工具', '优先客服支持', '云端同步设置', '无广告体验', '年付节省33%'] : ['Unlimited access to all tools', 'Priority customer support', 'Cloud sync settings', 'Ad-free experience', 'Save 33% annually'])" :key="feature" class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span>{{ feature }}</span>
              </li>
            </ul>
            <button
              @click="handleSubscribe(pricingPlans.yearly)"
              :disabled="paymentStore.isLoading"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="paymentStore.isLoading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>{{ locale === 'zh' ? '选择年付计划' : 'Choose Yearly' }}</span>
            </button>
          </div>

          <!-- 终身计划 -->
          <div class="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ locale === 'zh' ? '专业版 终身' : 'Pro Lifetime' }}
            </h3>
            <div class="text-4xl font-bold text-gray-900 mb-4">
              ${{ pricingPlans.lifetime.price }}<span class="text-lg text-gray-600">/once</span>
            </div>
            <ul class="space-y-2 mb-6">
              <li v-for="feature in (locale === 'zh' ? ['终身无限制使用', '所有未来功能更新', '优先客服支持', '云端同步设置', '永久去除广告'] : ['Lifetime unlimited access', 'All future feature updates', 'Priority customer support', 'Cloud sync settings', 'Permanent ad removal'])" :key="feature" class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span>{{ feature }}</span>
              </li>
            </ul>
            <button
              @click="handlePurchase(pricingPlans.lifetime)"
              :disabled="paymentStore.isLoading"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="paymentStore.isLoading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>{{ locale === 'zh' ? '选择终身计划' : 'Choose Lifetime' }}</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 支付模态框 -->
    <PaymentModal />

    <!-- 页脚 -->
    <!-- <AppFooter /> -->
  </div>
</template>

<script setup>
import { useI18nRouting } from '~/composables/useI18nRouting'
import PaymentModal from '~/components/payment/PaymentModal.vue'

// 多语言支持
const { t, locale } = useI18n()

// 根据当前语言选择内容
const currentLang = computed(() => locale.value)

// SEO设置 - 使用直接的多语言文本避免 i18n 问题
const headData = computed(() => {
  const title = locale.value === 'zh' ? '选择适合您的计划' : 'Choose Your Perfect Plan'
  const description = locale.value === 'zh'
    ? '选择适合您需求的定价方案。通过我们经济实惠的订阅计划解锁所有高级功能。'
    : 'Select the perfect pricing plan for your needs. Unlock all premium features with our affordable subscription plans.'
  const monthlyName = locale.value === 'zh' ? '专业版 月付' : 'Pro Monthly'
  const yearlyName = locale.value === 'zh' ? '专业版 年付' : 'Pro Yearly'

  return {
    title: title + ' - AI Toolbox Pro',
    htmlAttrs: {
      lang: locale.value
    },
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: 'pricing, subscription, plans, pro features, premium tools' },
      { name: 'author', content: 'AI Toolbox Pro' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: title + ' - AI Toolbox Pro' },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: locale.value === 'zh' ? 'https://ai-toolbox-pro.com/zh/pricing' : 'https://ai-toolbox-pro.com/pricing' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title + ' - AI Toolbox Pro' },
      { name: 'twitter:description', content: description }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description: description,
          url: locale.value === 'zh' ? 'https://ai-toolbox-pro.com/zh/pricing' : 'https://ai-toolbox-pro.com/pricing',
          inLanguage: locale.value,
          mainEntity: {
            '@type': 'Product',
            name: 'AI Toolbox Pro Subscription',
            offers: [
              {
                '@type': 'Offer',
                name: monthlyName,
                price: '9.99',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock'
              },
              {
                '@type': 'Offer',
                name: yearlyName,
                price: '79.99',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock'
              }
            ]
          }
        })
      }
    ]
  }
})

// 使用计算属性确保响应式
useHead(headData)

// 支付功能
const paymentStore = usePaymentStore()
const { pricingPlans } = usePayment()

// 处理订阅购买
const handleSubscribe = async (plan) => {
  try {
    await paymentStore.showSubscriptionPayment(plan.id)
  } catch (error) {
    console.error('启动订阅支付失败:', error)
  }
}

// 处理一次性购买
const handlePurchase = async (plan) => {
  try {
    await paymentStore.showPaymentModal({
      amount: plan.price,
      currency: plan.currency,
      description: plan.name || plan.id,
      type: plan.type,
      planId: plan.id
    })
  } catch (error) {
    console.error('启动购买支付失败:', error)
  }
}
</script>