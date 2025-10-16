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
              <NuxtLink :to="localizedPath('/')" class="text-gray-400 hover:text-white transition-colors">
                {{ navTexts.home }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localizedPath('/tools')" class="text-gray-400 hover:text-white transition-colors">
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
              <NuxtLink :to="localizedPath('/tools?category=text')" class="text-gray-400 hover:text-white transition-colors">
                {{ categoryTexts.text }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localizedPath('/tools?category=developer')" class="text-gray-400 hover:text-white transition-colors">
                {{ categoryTexts.developer }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localizedPath('/tools?category=utility')" class="text-gray-400 hover:text-white transition-colors">
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
// 使用Nuxt 3的i18n系统
const { locale, t } = useI18n()

// 导航文本
const navTexts = computed(() => ({
  home: t('nav.home'),
  tools: t('nav.tools')
}))

// 底部文本
const footerTexts = computed(() => ({
  description: t('footer.description'),
  quickLinks: t('footer.quickLinks'),
  categories: t('footer.categories'),
  support: t('footer.support'),
  contact: t('footer.contact'),
  privacy: t('footer.privacy'),
  terms: t('footer.terms'),
  allRightsReserved: t('footer.allRightsReserved')
}))

// 分类文本
const categoryTexts = computed(() => ({
  text: t('categories.text'),
  developer: t('categories.developer'),
  utility: t('categories.utility')
}))

// 获取本地化路径 - 参考 AppHeader.vue 的实现
const localizedPath = (path) => {
  if (locale.value === 'zh' && !path.startsWith('/zh')) {
    return path === '/' ? '/zh' : `/zh${path}`
  }
  if (locale.value === 'en' && path.startsWith('/zh')) {
    return path.replace('/zh', '') || '/'
  }
  return path
}
</script>