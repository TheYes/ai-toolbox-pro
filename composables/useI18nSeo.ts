/**
 * 国际化 SEO 优化 composables
 * 处理 hreflang 标签、canonical URL 等 SEO 相关功能
 */

export const useI18nSeo = () => {
  const { $i18n } = useNuxtApp()
  const route = useRoute()

  /**
   * 生成 canonical URL
   * @param locale 可选的语言代码，默认使用当前语言
   * @returns canonical URL
   */
  const canonicalUrl = computed(() => {
    const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://ai-toolbox-pro.vercel.app'
    const path = route.path
    return `${baseUrl}${path}`
  })

  /**
   * 生成 hreflang 标签
   * @returns hreflang 标签数组
   */
  const hreflangTags = computed(() => {
    // 移除当前语言前缀获得通用路径
    const currentPath = route.path.replace(/^\/[a-z]{2}/, '') || '/'
    const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://ai-toolbox-pro.vercel.app'
    const tags = []

    // 中文版本
    tags.push({
      rel: 'alternate',
      hreflang: 'zh',
      href: `${baseUrl}/zh${currentPath}`
    })

    // 英文版本
    tags.push({
      rel: 'alternate',
      hreflang: 'en',
      href: `${baseUrl}/en${currentPath}`
    })

    // x-default (Google 指定，指向英文版本作为默认)
    tags.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${baseUrl}/en${currentPath}`
    })

    return tags
  })

  /**
   * 生成页面特定的 meta 标签
   * @param options 页面选项
   * @returns meta 标签数组
   */
  const pageMeta = (options: {
    title?: string
    description?: string
    keywords?: string
    ogImage?: string
  } = {}) => {
    const defaultTitle = options.title || 'AI Toolbox Pro - Free Online Tools'
    const defaultDescription = options.description || 'Collection of useful web tools for developers and daily use. JSON formatter, Base64 encoder, QR code generator and more - all free and easy to use.'
    const defaultKeywords = options.keywords || 'online tools, web tools, json formatter, base64 encoder, qr code generator, free tools'
    const defaultOgImage = options.ogImage || '/og-image.jpg'

    return [
      // 基础 meta
      { name: 'description', content: defaultDescription },
      { name: 'keywords', content: defaultKeywords },
      { name: 'author', content: 'AI Toolbox Pro' },
      { name: 'robots', content: 'index, follow' },

      // Open Graph
      { property: 'og:title', content: defaultTitle },
      { property: 'og:description', content: defaultDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:image', content: defaultOgImage },
      { property: 'og:locale', content: $i18n.locale.value === 'zh' ? 'zh_CN' : 'en_US' },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: defaultTitle },
      { name: 'twitter:description', content: defaultDescription },
      { name: 'twitter:image', content: defaultOgImage },
      { name: 'twitter:site', content: '@ai_toolbox_pro' },

      // Canonical
      { name: 'canonical', content: canonicalUrl.value },

      // Hreflang
      ...hreflangTags.value
    ]
  }

  /**
   * 生成结构化数据 (JSON-LD)
   * @param type 结构化数据类型
   * @param data 结构化数据
   * @returns JSON-LD 脚本
   */
  const structuredData = (type: string, data: Record<string, any>) => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
      url: canonicalUrl.value,
      inLanguage: $i18n.locale.value === 'zh' ? 'zh-CN' : 'en-US'
    }

    return JSON.stringify({ ...baseData, ...data })
  }

  return {
    canonicalUrl,
    hreflangTags,
    pageMeta,
    structuredData
  }
}