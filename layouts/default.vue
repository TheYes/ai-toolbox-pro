<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <AppHeader />

    <!-- 主要内容 -->
    <main>
      <slot />
    </main>

    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup>
// SEO设置
useHead({
  htmlAttrs: {
    lang: 'en'
  }
})
</script>