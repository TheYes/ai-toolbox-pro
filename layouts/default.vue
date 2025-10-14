<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <ClientOnly>
      <AppHeader />
      <template #fallback>
        <header class="bg-white shadow-sm border-b border-gray-200">
          <nav class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
              <div class="text-2xl font-bold text-primary-600">
                🛠️ AI Toolbox
              </div>
            </div>
          </nav>
        </header>
      </template>
    </ClientOnly>

    <!-- 主要内容 -->
    <main>
      <slot />
    </main>

    <!-- 页脚 -->
    <ClientOnly>
      <AppFooter />
      <template #fallback>
        <footer class="bg-gray-900 text-white py-12">
          <div class="container mx-auto px-6">
            <div class="text-center text-gray-400">
              <p>&copy; 2024 AI Toolbox Pro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </template>
    </ClientOnly>
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