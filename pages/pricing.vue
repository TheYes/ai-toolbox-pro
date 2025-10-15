<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <!-- <AppHeader /> -->

    <!-- 主要内容 -->
    <main>
      <div class="container mx-auto px-6 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ t('pricing.title') }}</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            {{ t('pricing.description') }}
          </p>
        </div>

        <!-- 价格卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <!-- 月付计划 -->
          <div class="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('pricing.plans.monthly.name') }}</h3>
            <div class="text-4xl font-bold text-gray-900 mb-4">
              ${{ pricingPlans.monthly.price }}<span class="text-lg text-gray-600">/month</span>
            </div>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">无限制使用所有工具</span>
                <span v-else>Unlimited access to all tools</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">优先客服支持</span>
                <span v-else>Priority customer support</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">云端同步设置</span>
                <span v-else>Cloud sync settings</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">无广告体验</span>
                <span v-else>Ad-free experience</span>
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
              <span v-else>{{ t('pricing.plans.monthly.button') }}</span>
            </button>
          </div>

          <!-- 年付计划 -->
          <div class="bg-white rounded-lg border-2 border-blue-500 p-6 hover:shadow-lg transition-shadow transform scale-105 relative">
            <div class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
              {{ t('pricing.mostPopular') }}
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('pricing.plans.yearly.name') }}</h3>
            <div class="text-4xl font-bold text-gray-900 mb-4">
              ${{ pricingPlans.yearly.price }}<span class="text-lg text-gray-600">/year</span>
            </div>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">无限制使用所有工具</span>
                <span v-else>Unlimited access to all tools</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">优先客服支持</span>
                <span v-else>Priority customer support</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">云端同步设置</span>
                <span v-else>Cloud sync settings</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">无广告体验</span>
                <span v-else>Ad-free experience</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">年付节省33%</span>
                <span v-else>Save 33% annually</span>
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
              <span v-else>{{ t('pricing.plans.yearly.button') }}</span>
            </button>
          </div>

          <!-- 终身计划 -->
          <div class="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('pricing.plans.lifetime.name') }}</h3>
            <div class="text-4xl font-bold text-gray-900 mb-4">
              ${{ pricingPlans.lifetime.price }}<span class="text-lg text-gray-600">/once</span>
            </div>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">终身无限制使用</span>
                <span v-else>Lifetime unlimited access</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">所有未来功能更新</span>
                <span v-else>All future feature updates</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">优先客服支持</span>
                <span v-else>Priority customer support</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">云端同步设置</span>
                <span v-else>Cloud sync settings</span>
              </li>
              <li class="flex items-center text-gray-700">
                <span class="text-green-500 mr-2">✓</span>
                <span v-if="locale === 'zh'">永久去除广告</span>
                <span v-else>Permanent ad removal</span>
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
              <span v-else>{{ t('pricing.plans.lifetime.button') }}</span>
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

// 多语言支持
const { t, locale } = useI18n()

// 根据当前语言选择内容
const currentLang = computed(() => locale.value)

// SEO设置
useHead(() => ({
  title: t('pricing.title') + ' - AI Toolbox Pro',
  meta: [
    { name: 'description', content: t('pricing.description') },
    { name: 'keywords', content: 'pricing, subscription, plans, pro features, premium tools' },
    { name: 'author', content: 'AI Toolbox Pro' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: t('pricing.title') + ' - AI Toolbox Pro' },
    { property: 'og:description', content: t('pricing.description') },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://ai-toolbox-pro.com/pricing' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: t('pricing.title') + ' - AI Toolbox Pro' },
    { name: 'twitter:description', content: t('pricing.description') }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: t('pricing.title'),
        description: t('pricing.description'),
        url: 'https://ai-toolbox-pro.com/pricing',
        mainEntity: {
          '@type': 'Product',
          name: 'AI Toolbox Pro Subscription',
          offers: [
            {
              '@type': 'Offer',
              name: t('pricing.plans.monthly.name'),
              price: '9.99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              name: t('pricing.plans.yearly.name'),
              price: '79.99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            }
          ]
        }
      })
    }
  ]
}))

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