/**
 * 用户偏好管理
 * 记住用户的语言选择
 */

/**
 * 获取用户偏好语言
 */
const getUserLanguage = (): string => {
  // 优先从 Cookie 读取
  const cookieMatch = document.cookie.match(/user_language=([a-z]{2})/i)
  return cookieMatch ? cookieMatch[1] : 'en'
}

/**
 * 保存用户偏好到本地存储
 */
const saveUserLanguage = (locale: string): void => {
  if (typeof window !== 'undefined') {
    const cookie = `user_language=${locale}`
    document.cookie = `${cookie}; expires=${new Date(Date.now() + 365 * 24 * 60 * 1000)};`
  }
}

/**
 * 页面加载时检查用户偏好
onMounted(() => {
  const currentPath = window.location.pathname
  // 如果是根路径且不是英文，且没有中文前缀，检查用户偏好
  if (currentPath === '/' || currentPath === '/en') {
    const userPreference = getUserLanguage()
    if (userPreference !== 'en') {
      window.location.href = userPreference === 'zh' ? '/zh' : '/'
    }
  }
})

// 自动处理语言切换
const handleLanguageSwitch = (locale: string): void => {
  saveUserLanguage(locale)

  // 触发页面切换逻辑
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname
    const newUrl = locale === 'en' ? '/' : `/${locale}`

    if (currentPath !== newUrl) {
      window.location.href = newUrl
    }
  }
}

/**
 * 用户偏好 Hook
export const useUserPreference = () => {
  const userLanguage = getUserLanguage()

  return {
    userLanguage,
    saveUserLanguage,
    handleLanguageSwitch
  }
}