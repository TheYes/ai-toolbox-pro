<template>
  <footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-6">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Logo和描述 -->
        <div class="md:col-span-1">
          <div class="flex items-center space-x-2 mb-4">
            <div class="text-2xl font-bold">🛠️ AI Toolbox</div>
          </div>
          <p class="text-gray-400">
            {{ footerTexts.description }}
          </p>
        </div>

        <!-- 快速链接 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ footerTexts.quickLinks }}</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors">
                {{ navTexts.home }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tools" class="text-gray-400 hover:text-white transition-colors">
                {{ navTexts.tools }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 工具分类 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ footerTexts.categories }}</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/tools?category=text" class="text-gray-400 hover:text-white transition-colors">
                {{ categoryTexts.text }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tools?category=developer" class="text-gray-400 hover:text-white transition-colors">
                {{ categoryTexts.developer }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tools?category=utility" class="text-gray-400 hover:text-white transition-colors">
                {{ categoryTexts.utility }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 支持 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ footerTexts.support }}</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                {{ footerTexts.contact }}
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                {{ footerTexts.privacy }}
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                {{ footerTexts.terms }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2024 AI Toolbox Pro. {{ footerTexts.allRightsReserved }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 简化的SSR安全版本
const isClient = process.client

// 静态导航文本
const navTexts = computed(() => {
  if (isClient) {
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/zh')) {
      return {
        home: '首页',
        tools: '工具'
      }
    }
  }
  return {
    home: 'Home',
    tools: 'Tools'
  }
})

// 底部文本
const footerTexts = computed(() => {
  if (isClient) {
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/zh')) {
      return {
        description: 'AI驱动的在线小工具集合网站，为开发者和日常使用提供便利的工具。',
        quickLinks: '快速链接',
        categories: '工具分类',
        support: '支持',
        contact: '联系我们',
        privacy: '隐私政策',
        terms: '服务条款',
        allRightsReserved: '版权所有'
      }
    }
  }
  return {
    description: 'AI-powered online tools collection website for developers and daily use.',
    quickLinks: 'Quick Links',
    categories: 'Categories',
    support: 'Support',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    allRightsReserved: 'All Rights Reserved'
  }
})

// 分类文本
const categoryTexts = computed(() => {
  if (isClient) {
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/zh')) {
      return {
        text: '文本工具',
        developer: '开发者工具',
        utility: '实用工具'
      }
    }
  }
  return {
    text: 'Text Tools',
    developer: 'Developer Tools',
    utility: 'Utility Tools'
  }
})
</script>