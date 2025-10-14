/**
 * 全局路由中间件
 * 处理英文无前缀，其他语言有前缀的URL结构
 */

export default defineNuxtRouteMiddleware((to, from) => {
  // 默认语言（英文）不需要前缀
  const defaultLocale = 'en'

  // 检查路径是否已经处理过
  if (isPathProcessed(to.path)) {
    return
  }

  // 获取目标语言
  const targetLocale = getTargetLocale(to.path)

  // 如果是默认语言且路径没有前缀，直接通过
  if (targetLocale === defaultLocale && !hasLanguagePrefix(to.path)) {
    return
  }

  // 如果是默认语言但路径有前缀，移除前缀
  if (targetLocale === defaultLocale && hasLanguagePrefix(to.path)) {
    const pathWithoutLocale = removeLanguagePrefix(to.path)
    return navigateTo(pathWithoutLocale || '/', { replace: true })
  }

  // 如果是非默认语言且没有前缀，添加前缀
  if (targetLocale !== defaultLocale && !hasLanguagePrefix(to.path)) {
    const localizedPath = `/${targetLocale}${to.path}`
    return navigateTo(localizedPath, { replace: true })
  }

  // 其他情况直接通过
})

/**
 * 检查路径是否已经处理过（避免无限重定向）
 */
const isPathProcessed = (path: string): boolean => {
  // 根路径需要处理
  if (path === '/') return false

  // 已经有语言前缀的路径认为是已处理的
  return hasLanguagePrefix(path)
}

/**
 * 检查路径是否有语言前缀
 */
const hasLanguagePrefix = (path: string): boolean => {
  const validPrefixes = ['/en/', '/zh/', '/en', '/zh']
  return validPrefixes.some(prefix => path === prefix || path.startsWith(prefix))
}

/**
 * 移除路径的语言前缀
 */
const removeLanguagePrefix = (path: string): string => {
  const localeMatch = path.match(/^\/([a-z]{2})(\/|$)/)
  if (localeMatch) {
    return path.replace(/^\/[a-z]{2}/, '') || '/'
  }
  return path
}

/**
 * 获取目标语言
 */
const getTargetLocale = (path: string): string => {
  // 1. 优先从 URL 路径推断
  if (path.startsWith('/zh')) {
    return 'zh'
  }
  if (path.startsWith('/en')) {
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