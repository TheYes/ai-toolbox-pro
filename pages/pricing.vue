<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <AppHeader />

    <!-- 主要内容 -->
    <main>
      <!-- 定价部分 -->
      <PricingSection />

      <!-- 订阅管理部分 -->
      <div class="container mx-auto px-6 py-16">
        <SubscriptionManager />
      </div>
    </main>

    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup>
import { useI18nRouting } from '~/composables/useI18nRouting'

// SEO设置
useHead({
  title: 'Pricing Plans - Choose Your Perfect Plan',
  meta: [
    { name: 'description', content: 'Choose the perfect pricing plan for your needs. Unlock all premium features with our affordable subscription plans.' },
    { name: 'keywords', content: 'pricing, subscription, plans, pro features, premium tools' },
    { name: 'author', content: 'AI Toolbox Pro' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Pricing Plans - Choose Your Perfect Plan' },
    { property: 'og:description', content: 'Choose the perfect pricing plan for your needs. Unlock all premium features with our affordable subscription plans.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://ai-toolbox-pro.com/pricing' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Pricing Plans - Choose Your Perfect Plan' },
    { name: 'twitter:description', content: 'Choose the perfect pricing plan for your needs. Unlock all premium features with our affordable subscription plans.' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Pricing Plans',
        description: 'Choose the perfect pricing plan for your needs. Unlock all premium features with our affordable subscription plans.',
        url: 'https://ai-toolbox-pro.com/pricing',
        mainEntity: {
          '@type': 'Product',
          name: 'AI Toolbox Pro Subscription',
          offers: [
            {
              '@type': 'Offer',
              name: 'Pro Monthly',
              price: '9.99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              name: 'Pro Yearly',
              price: '79.99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            }
          ]
        }
      })
    }
  ]
})
</script>