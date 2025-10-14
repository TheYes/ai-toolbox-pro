<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <nav class="container mx-auto px-6 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <NuxtLink :to="getLocalizedPath('/')" class="flex items-center space-x-2">
          <div class="text-2xl font-bold text-primary-600">
            🛠️ AI Toolbox
          </div>
        </NuxtLink>

        <!-- 桌面导航 -->
        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink :to="getLocalizedPath('/')"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ $t('nav.home') }}
          </NuxtLink>
          <NuxtLink :to="getLocalizedPath('/tools')"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ $t('nav.tools') }}
          </NuxtLink>
          <NuxtLink :to="getLocalizedPath('/pricing')"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ $t('nav.pricing') }}
          </NuxtLink>

          <!-- 语言切换 -->
          <div class="relative">
            <button @click="toggleLanguageMenu"
                    class="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <span>🌐</span>
              <span>{{ currentLanguage.name }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="showLanguageMenu"
                 class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <div v-for="locale in availableLocales" :key="locale.code"
                   @click="handleLanguageSwitch(locale.code)"
                   class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                {{ locale.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- 移动端菜单按钮 -->
        <button @click="toggleMobileMenu"
                class="md:hidden text-gray-700 hover:text-primary-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 移动端菜单 -->
      <div v-if="showMobileMenu" class="md:hidden mt-4 pt-4 border-t border-gray-200">
        <div class="flex flex-col space-y-3">
          <NuxtLink :to="getLocalizedPath('/')"
                    @click="closeMobileMenu"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ $t('nav.home') }}
          </NuxtLink>
          <NuxtLink :to="getLocalizedPath('/tools')"
                    @click="closeMobileMenu"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ $t('nav.tools') }}
          </NuxtLink>
          <NuxtLink :to="getLocalizedPath('/pricing')"
                    @click="closeMobileMenu"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ $t('nav.pricing') }}
          </NuxtLink>

          <!-- 移动端语言切换 -->
          <div class="pt-3 border-t border-gray-200">
            <div class="text-sm text-gray-600 mb-2">{{ $t('nav.language') }}:</div>
            <div class="flex flex-col space-y-2">
              <div v-for="locale in availableLocales" :key="locale.code"
                   @click="handleLanguageSwitch(locale.code)"
                   class="text-gray-700 hover:text-primary-600 cursor-pointer">
                {{ locale.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
// 使用统一的国际化路由工具 - 添加SSR保护
const { getLocalizedPath, switchLanguage, getAvailableLocales, getCurrentLanguageInfo } = useI18nRouting()

// 确保在客户端渲染前不执行可能导致hydration错误的代码
const isClient = process.client

// 响应式数据
const showMobileMenu = ref(false)
const showLanguageMenu = ref(false)

// 可用语言
const availableLocales = computed(() => getAvailableLocales())

// 当前语言
const currentLanguage = computed(() => getCurrentLanguageInfo())

// 切换移动端菜单
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    showLanguageMenu.value = false
  }
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// 切换语言菜单
const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

// 处理语言切换
const handleLanguageSwitch = async (localeCode) => {
  await switchLanguage(localeCode)
  showLanguageMenu.value = false
  showMobileMenu.value = false
}

// 点击外部关闭语言菜单 - 只在客户端执行
onMounted(() => {
  if (process.client) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside)
  }
})

const handleClickOutside = (event) => {
  const target = event.target
  if (!target.closest('.relative')) {
    showLanguageMenu.value = false
  }
}
</script>