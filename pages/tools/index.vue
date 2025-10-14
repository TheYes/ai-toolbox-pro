<template>
  <div class="min-h-screen">
    <!-- 页面头部 -->
    <div class="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
      <div class="container mx-auto px-6 text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">
          {{ t('tools.title') }}
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {{ t('tools.description') }}
        </p>

        <!-- 搜索框 -->
        <div class="max-w-md mx-auto mb-8">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('tools.searchPlaceholder')"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- 工具列表 -->
    <div class="container mx-auto px-6 py-16">
      <div v-if="filteredTools.length === 0" class="text-center py-12">
        <p class="text-gray-600 text-lg">{{ t('tools.noResults') }}</p>
        <p class="text-gray-500 mt-2">{{ t('tools.tryDifferentSearch') }}</p>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="tool in filteredTools"
          :key="tool.name"
          class="card hover:shadow-lg transition-shadow duration-300"
        >
          <div class="text-center">
            <div class="text-4xl mb-4">{{ tool.icon }}</div>
            <h3 class="text-xl font-semibold mb-2">{{ t(tool.name) }}</h3>
            <p class="text-gray-600 mb-4">{{ t(tool.description) }}</p>
            <NuxtLink :to="getLocalizedPath(tool.link)" class="btn-primary">
              {{ t('common.useNow') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="bg-gray-50 py-16">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          {{ t('categories.title') }}
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(category, key) in categories"
            :key="key"
            class="card hover:shadow-md transition-shadow cursor-pointer"
            @click="filterByCategory(key)"
          >
            <h3 class="text-lg font-semibold mb-2">{{ t(category.name) }}</h3>
            <p class="text-gray-600">{{ category.count }} {{ t('common.tools') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 使用统一的国际化路由工具
const { getLocalizedPath } = useI18nRouting()

// SEO设置
useHead({
  title: 'All Free Online Tools - Complete Collection | AI Toolbox Pro',
  meta: [
    { name: 'description', content: 'Browse our complete collection of free online tools. JSON formatter, Base64 encoder, QR code generator, URL encoder, color picker, password generator and more.' },
    { name: 'keywords', content: 'online tools collection, json formatter, base64 encoder, qr code generator, url encoder, color picker, password generator, free tools list' },
    { name: 'author', content: 'AI Toolbox Pro' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'All Free Online Tools - Complete Collection' },
    { property: 'og:description', content: 'Browse our complete collection of free online tools for developers and daily use.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://ai-toolbox-pro.com/tools' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'All Free Online Tools - Complete Collection' },
    { name: 'twitter:description', content: 'Browse our complete collection of free online tools for developers and daily use.' }
  ]
})

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('')

// 所有工具数据
const allTools = ref([
  {
    name: 'tools.jsonFormatter.name',
    description: 'tools.jsonFormatter.description',
    icon: '📝',
    link: '/tools/json-formatter',
    category: 'developer'
  },
  {
    name: 'tools.base64.name',
    description: 'tools.base64.description',
    icon: '🔐',
    link: '/tools/base64',
    category: 'developer'
  },
  {
    name: 'tools.qrCode.name',
    description: 'tools.qrCode.description',
    icon: '📱',
    link: '/tools/qr-code',
    category: 'utility'
  },
  {
    name: 'tools.urlEncoder.name',
    description: 'tools.urlEncoder.description',
    icon: '🔗',
    link: '/tools/url-encoder',
    category: 'developer'
  },
  {
    name: 'tools.colorPicker.name',
    description: 'tools.colorPicker.description',
    icon: '🎨',
    link: '/tools/color-picker',
    category: 'design'
  },
  {
    name: 'tools.passwordGenerator.name',
    description: 'tools.passwordGenerator.description',
    icon: '🔑',
    link: '/tools/password-generator',
    category: 'security'
  }
])

// 分类数据
const categories = ref({
  developer: {
    name: 'categories.developer',
    count: 3
  },
  utility: {
    name: 'categories.utility',
    count: 1
  },
  design: {
    name: 'categories.design',
    count: 1
  },
  security: {
    name: 'categories.security',
    count: 1
  }
})

// 获取i18n实例 - 使用正确的Nuxt 3方式
const { t } = useI18n()

// 过滤后的工具
const filteredTools = computed(() => {
  let tools = allTools.value

  // 按分类过滤
  if (selectedCategory.value) {
    tools = tools.filter(tool => tool.category === selectedCategory.value)
  }

  // 按搜索词过滤 - 仅在客户端执行搜索逻辑
  if (searchQuery.value.trim() && process.client) {
    const query = searchQuery.value.toLowerCase()
    tools = tools.filter(tool => {
      const name = t(tool.name).toLowerCase()
      const description = t(tool.description).toLowerCase()
      return name.includes(query) || description.includes(query)
    })
  }

  return tools
})

// 按分类过滤
const filterByCategory = (categoryKey) => {
  if (selectedCategory.value === categoryKey) {
    selectedCategory.value = ''
  } else {
    selectedCategory.value = categoryKey
  }
}
</script>