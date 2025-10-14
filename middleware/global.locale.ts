/**
 * 全局路由中间件
 * 确保所有路由都包含正确的语言前缀
 */

export default defineNuxtRouteMiddleware((to, from) => {
  // 如果已经是有效的语言前缀路径，则直接通过
  if (hasValidLanguagePrefix(to.path)) {
    return
  }

  // 获取目标语言
  const targetLocale = getTargetLocale(to.path)

  // 为路径添加语言前缀
  const localizedPath = `/${targetLocale}${to.path}`

  // 重定向到带语言前缀的路径
  return navigateTo(localizedPath, { replace: true })
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
const getTargetLocale = (path: string): string => {
  // 1. 优先从 URL 路径推断
  if (path.startsWith('/zh') || path.includes('/zh')) {
    return 'zh'
  }
  if (path.startsWith('/en') || path.includes('/en')) {
    return 'en'
  }

  // 2. 从 Cookie 读取用户设置
  const userPreference = getUserLanguage()
  if (userPreference) {
    return userPreference
  }

  // 3. 从浏览器语言检测
  const browserLanguage = getBrowserLanguage()
  if (browserLanguage === 'zh') {
    return 'zh'
  }

  // 4. 默认返回英文
  return 'en'
}

/**
 * 获取浏览器语言
 */
const getBrowserLanguage = (): string => {
  if (process.server) {
    // 服务端从请求头获取
    const headers = useRequestHeaders(['accept-language'])
    const acceptLanguage = headers['accept-language'] || ''

    // 支持中文变体 (zh, zh-CN, zh-TW 等)
    if (acceptLanguage.toLowerCase().includes('zh')) {
      return 'zh'
    }
    return 'en'
  } else {
    // 客户端从 navigator 获取
    const lang = navigator.language || navigator.languages?.[0] || 'en'
    if (lang.startsWith('zh')) {
      return 'zh'
    }
    return lang.split('-')[0] || 'en'
  }
}

/**
 * 获取用户偏好语言
 */
const getUserLanguage = (): string => {
  if (process.client) {
    const cookie = document.cookie
    const match = cookie.match(/user_language=([a-z]{2})/)
    if (match && match[1]) {
      return match[1]
    }
  }
  return ''
}