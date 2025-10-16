<template>
  <div class="min-h-screen">
    <!-- 英雄区域 -->
    <section class="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
      <div class="container mx-auto px-6 text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          {{ $t('hero.title') }}
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {{ $t('hero.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            :to="getLocalizedPath('/tools')"
            class="btn-primary text-lg px-8 py-3"
          >
            {{ $t('hero.browseTools') }}
          </NuxtLink>
          <a
            href="#featured-tools"
            class="btn-secondary text-lg px-8 py-3"
          >
            {{ $t('hero.featuredTools') }}
          </a>
        </div>
      </div>
    </section>

    <!-- 特色工具 -->
    <section
      id="featured-tools"
      class="py-20"
    >
      <div class="container mx-auto px-6">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          {{ $t('featured.title') }}
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="tool in featuredTools"
            :key="tool.name"
            class="card hover:shadow-lg transition-shadow duration-300"
          >
            <div class="text-center">
              <div class="text-4xl mb-4">{{ tool.icon }}</div>
              <h3 class="text-xl font-semibold mb-2">{{ $t(tool.name) }}</h3>
              <p class="text-gray-600 mb-4">{{ $t(tool.description) }}</p>
              <NuxtLink
                :to="getLocalizedPath(tool.link)"
                class="btn-primary"
              >
                {{ $t('common.useNow') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特点 -->
    <section class="bg-gray-50 py-20">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          {{ $t('features.title') }}
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="text-center"
          >
            <div class="text-3xl mb-4">{{ feature.icon }}</div>
            <h3 class="text-lg font-semibold mb-2">{{ $t(feature.title) }}</h3>
            <p class="text-gray-600">{{ $t(feature.description) }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// 使用统一的国际化路由工具
const { getLocalizedPath } = useI18nRouting()

// SEO设置
useHead({
  title: 'Free Online Tools for Developers and Daily Use - AI Toolbox Pro',
  meta: [
    { name: 'description', content: 'Collection of useful web tools for developers and daily use. JSON formatter, Base64 encoder, QR code generator and more - all free and easy to use.' },
    { name: 'keywords', content: 'online tools, web tools, json formatter, base64 encoder, qr code generator, url encoder, color picker, password generator, free tools, developer tools' },
    { name: 'author', content: 'AI Toolbox Pro' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Free Online Tools for Developers and Daily Use' },
    { property: 'og:description', content: 'Collection of useful web tools for developers and daily use. JSON formatter, Base64 encoder, QR code generator and more.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://ai-toolbox-pro.com' },
    { property: 'og:image', content: '/og-image.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Free Online Tools for Developers and Daily Use' },
    { name: 'twitter:description', content: 'Collection of useful web tools for developers and daily use. JSON formatter, Base64 encoder, QR code generator and more.' },
    { name: 'twitter:image', content: '/twitter-image.jpg' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'AI Toolbox Pro',
        description: 'Collection of useful web tools for developers and daily use. JSON formatter, Base64 encoder, QR code generator and more.',
        url: 'https://ai-toolbox-pro.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://ai-toolbox-pro.com/tools?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        },
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: 'AI Toolbox Pro',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          }
        }
      })
    }
  ]
})

// 特色工具数据
const featuredTools = ref([
  {
    name: 'tools.jsonFormatter.name',
    description: 'tools.jsonFormatter.description',
    icon: '📝',
    link: '/tools/json-formatter'
  },
  {
    name: 'tools.base64.name',
    description: 'tools.base64.description',
    icon: '🔐',
    link: '/tools/base64'
  },
  {
    name: 'tools.qrCode.name',
    description: 'tools.qrCode.description',
    icon: '📱',
    link: '/tools/qr-code'
  }
])

// 功能特点
const features = ref([
  {
    title: 'features.free.title',
    description: 'features.free.description',
    icon: '🆓'
  },
  {
    title: 'features.noAds.title',
    description: 'features.noAds.description',
    icon: '🚫'
  },
  {
    title: 'features.privacy.title',
    description: 'features.privacy.description',
    icon: '🔒'
  },
  {
    title: 'features.fast.title',
    description: 'features.fast.description',
    icon: '⚡'
  }
])
</script>
