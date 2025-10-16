<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <nav class="container mx-auto px-6 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <NuxtLink :to="localizedPath('/')" class="flex items-center space-x-2">
          <div class="text-2xl font-bold text-primary-600">
            🛠️ AI Toolbox
          </div>
        </NuxtLink>

        <!-- 桌面导航 -->
        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink :to="localizedPath('/')"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ navTexts.home }}
          </NuxtLink>
          <NuxtLink :to="localizedPath('/tools')"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ navTexts.tools }}
          </NuxtLink>
          <NuxtLink :to="localizedPath('/pricing')"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ navTexts.pricing }}
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
          <NuxtLink :to="localizedPath('/')"
                    @click="closeMobileMenu"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ navTexts.home }}
          </NuxtLink>
          <NuxtLink :to="localizedPath('/tools')"
                    @click="closeMobileMenu"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ navTexts.tools }}
          </NuxtLink>
          <NuxtLink :to="localizedPath('/pricing')"
                    @click="closeMobileMenu"
                    class="text-gray-700 hover:text-primary-600 transition-colors">
            {{ navTexts.pricing }}
          </NuxtLink>

          <!-- 移动端语言切换 -->
          <div class="pt-3 border-t border-gray-200">
            <div class="text-sm text-gray-600 mb-2">语言:</div>
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
// 简化的多语言支持
const { locale } = useI18n()
const router = useRouter()
const route = useRoute()

// 响应式数据
const showMobileMenu = ref(false)
const showLanguageMenu = ref(false)

// 导航文本 - 直接使用已知的多语言映射
const navTexts = computed(() => ({
  home: locale.value === 'zh' ? '首页' : 'Home',
  tools: locale.value === 'zh' ? '工具' : 'Tools',
  pricing: locale.value === 'zh' ? '定价' : 'Pricing'
}))

// 可用语言 - 简化配置
const availableLocales = computed(() => [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' }
])

// 当前语言信息
const currentLanguage = computed(() => {
  const currentCode = locale.value
  return availableLocales.value.find(l => l.code === currentCode) || availableLocales.value[0]
})

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

// 获取本地化路径
const localizedPath = (path) => {
  if (locale.value === 'zh' && !path.startsWith('/zh')) {
    return path === '/' ? '/zh' : `/zh${path}`
  }
  if (locale.value === 'en' && path.startsWith('/zh')) {
    return path.replace('/zh', '') || '/'
  }
  return path
}

// 处理语言切换 - 使用Nuxt 3的setLocale方法
const { setLocale } = useI18n()
const handleLanguageSwitch = async (localeCode) => {
  try {
    // 关闭菜单
    showLanguageMenu.value = false
    showMobileMenu.value = false

    // 如果语言相同，不进行切换
    if (locale.value === localeCode) {
      return
    }

    // 使用Nuxt 3的内置语言切换功能
    await setLocale(localeCode)

    // 获取当前路径的纯净版本（移除语言前缀）
    const currentPath = route.path
    let cleanPath = currentPath

    // 移除现有的语言前缀
    if (currentPath.startsWith('/zh/')) {
      cleanPath = currentPath.slice(3) // 移除 "/zh"
    } else if (currentPath === '/zh') {
      cleanPath = '/'
    }

    // 根据目标语言添加相应的前缀
    let newPath = cleanPath
    if (localeCode === 'zh') {
      newPath = cleanPath === '/' ? '/zh' : `/zh${cleanPath}`
    }
    // 如果是英文，不需要前缀，直接使用 cleanPath

    // 如果路径发生变化，进行导航
    if (newPath !== currentPath) {
      await router.push(newPath)
    }
  } catch (error) {
    console.error('Language switch failed:', error)
  }
}

// 点击外部关闭语言菜单
onMounted(() => {
  if (process.client) {
    const handleClickOutside = (event) => {
      const target = event.target
      if (!target.closest('.relative')) {
        showLanguageMenu.value = false
      }
    }
    document.addEventListener('click', handleClickOutside)

    // 清理函数
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
  }
})
</script>