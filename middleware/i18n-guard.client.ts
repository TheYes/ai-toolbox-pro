/**
 * 国际化路由守卫中间件
 * 确保所有路由都包含正确的语言前缀
 */

export default defineNuxtPlugin(() => {
  const { $i18n } = useNuxtApp()
  const route = useRoute()

  addRouteMiddleware('i18n-guard', (to, from) => {
    // 跳过已经是完整语言前缀的路径
    if (hasValidLanguagePrefix(to.path)) {
      return
    }

    // 获取目标语言
    const targetLocale = getTargetLocale()

    // 为路径添加语言前缀
    const localizedPath = `/${targetLocale}${to.path}`

    // 重定向到带语言前缀的路径
    return navigateTo(localizedPath, { replace: true })
  })
})

/**
 * 检查路径是否已经有有效的语言前缀
 */
const hasValidLanguagePrefix = (path: string): boolean => {
  const validPrefixes = ['/en/', '/zh/', '/en', '/zh']
  return validPrefixes.some(prefix => path === prefix || path.startsWith(prefix))
}

/**
 * 获取目标语言
 */
const getTargetLocale = (): string => {
  // 1. 优先从 Cookie 读取用户设置
  const userPreference = getUserLanguage()
  if (userPreference) {
    return userPreference
  }

  // 2. 其次从浏览器语言检测
  const browserLanguage = getBrowserLanguage()
  if (browserLanguage === 'zh') {
    return 'zh'
  }

  // 3. 默认返回英文
  return 'en'
}

/**
 * 获取浏览器语言
 */
const getBrowserLanguage = (): string => {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language || navigator.languages?.[0] || 'en'
    // 支持中文变体 (zh, zh-CN, zh-TW 等)
    if (lang.startsWith('zh')) {
      return 'zh'
    }
    return lang.split('-')[0] || 'en'
  }
  return 'en'
}

/**
 * 获取用户偏好语言
 */
const getUserLanguage = (): string => {
  if (typeof document !== 'undefined') {
    const cookie = document.cookie
    const match = cookie.match(/user_language=([a-z]{2})/)
    if (match && match[1]) {
      return match[1]
    }
  }
  return ''
}