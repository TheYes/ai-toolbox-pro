/**
 * 国际化路由处理工具
 * 提供统一的路径生成和语言切换功能
 * 支持英文无前缀，其他语言有前缀的URL结构
 */

export const useI18nRouting = () => {
  const { $i18n } = useNuxtApp()
  const router = useRouter()
  const route = useRoute()

  // 默认语言（无前缀）
  const defaultLocale = 'en'

  /**
   * 获取当前语言代码
   * 确保返回有效的语言代码
   */
  const getCurrentLocale = (): string => {
    const locale = $i18n.locale.value

    // 如果语言代码无效，使用默认语言
    if (!locale || typeof locale !== 'string' || !['en', 'zh'].includes(locale)) {
      return defaultLocale
    }

    return locale
  }

  /**
   * 生成本地化路径
   * 英文（默认语言）无前缀，其他语言有前缀
   */
  const getLocalizedPath = (path: string | undefined | null): string => {
    const currentLocale = getCurrentLocale()

    // 处理无效路径参数
    if (!path || typeof path !== 'string') {
      path = '/'
    }

    // 确保路径以 / 开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    // 如果是默认语言（英文），不添加前缀
    if (currentLocale === defaultLocale) {
      return normalizedPath === '/' ? '/' : normalizedPath
    }

    // 其他语言添加前缀
    if (normalizedPath === '/') {
      return `/${currentLocale}`
    }

    return `/${currentLocale}${normalizedPath}`
  }

  /**
   * 生成语言切换路径
   * 用于在不同语言间切换
   */
  const getLanguageSwitchPath = (targetLocale: string): string => {
    // 验证目标语言参数
    if (!targetLocale || typeof targetLocale !== 'string') {
      targetLocale = defaultLocale
    }

    const currentPath = route.path

    // 处理无效当前路径
    if (!currentPath || typeof currentPath !== 'string') {
      return targetLocale === defaultLocale ? '/' : `/${targetLocale}`
    }

    // 如果是默认语言且目标是默认语言
    if (getCurrentLocale() === defaultLocale && targetLocale === defaultLocale) {
      return currentPath
    }

    // 如果当前是默认语言（无前缀），切换到非默认语言
    if (getCurrentLocale() === defaultLocale) {
      return targetLocale === defaultLocale
        ? currentPath
        : `/${targetLocale}${currentPath === '/' ? '' : currentPath}`
    }

    // 如果当前是非默认语言，获取去掉语言前缀的路径
    let pathWithoutLocale = currentPath

    // 移除当前语言前缀
    const localePrefix = `/${getCurrentLocale()}`
    if (currentPath.startsWith(localePrefix)) {
      pathWithoutLocale = currentPath.replace(localePrefix, '') || '/'
    }

    // 如果目标是默认语言，返回无前缀路径
    if (targetLocale === defaultLocale) {
      return pathWithoutLocale === '/' ? '/' : pathWithoutLocale
    }

    // 如果目标是非默认语言，添加新前缀
    return pathWithoutLocale === '/'
      ? `/${targetLocale}`
      : `/${targetLocale}${pathWithoutLocale}`
  }

  /**
   * 切换语言并导航
   */
  const switchLanguage = async (localeCode: string) => {
    // 保存用户语言偏好到 Cookie
    if (process.client) {
      document.cookie = `user_language=${localeCode}; path=/; max-age=31536000` // 保存一年
    }

    // 切换语言并导航
    await $i18n.setLocale(localeCode)
    await router.push(getLanguageSwitchPath(localeCode))
  }

  /**
   * 获取所有可用语言
   */
  const getAvailableLocales = () => [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' }
  ]

  /**
   * 获取当前语言信息
   */
  const getCurrentLanguageInfo = () => {
    const availableLocales = getAvailableLocales()
    const currentLocale = getCurrentLocale()
    return availableLocales.find(locale => locale.code === currentLocale) || availableLocales[0]
  }

  return {
    getCurrentLocale,
    getLocalizedPath,
    getLanguageSwitchPath,
    switchLanguage,
    getAvailableLocales,
    getCurrentLanguageInfo,
    defaultLocale
  }
}