/**
 * SEO 优化插件
 * 自动设置 hreflang 标签和 canonical URL
 */

export default defineNuxtPlugin(() => {
  const { canonicalUrl, hreflangTags } = useI18nSeo()

  // 动态更新 meta 标签
  useHead(() => ({
    link: [
      // Canonical URL
      { rel: 'canonical', href: canonicalUrl.value },

      // Hreflang 标签
      ...hreflangTags.value
    ]
  }))
})