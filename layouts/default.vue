<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <ClientOnly>
      <AppHeader />
      <!-- SSR fallback -->
      <template #fallback>
        <header class="bg-white shadow-sm border-b border-gray-200">
          <nav class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
              <NuxtLink to="/" class="flex items-center space-x-2">
                <div class="text-2xl font-bold text-primary-600">
                  🛠️ AI Toolbox
                </div>
              </NuxtLink>
              <div class="hidden md:flex items-center space-x-8">
                <NuxtLink to="/" class="text-gray-700 hover:text-primary-600 transition-colors">Home</NuxtLink>
                <NuxtLink to="/tools" class="text-gray-700 hover:text-primary-600 transition-colors">Tools</NuxtLink>
                <NuxtLink to="/pricing" class="text-gray-700 hover:text-primary-600 transition-colors">Pricing</NuxtLink>
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
      <!-- SSR fallback -->
      <template #fallback>
        <footer class="bg-gray-900 text-white py-12">
          <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-4 gap-8">
              <div class="md:col-span-1">
                <div class="flex items-center space-x-2 mb-4">
                  <div class="text-2xl font-bold">🛠️ AI Toolbox</div>
                </div>
                <p class="text-gray-400">AI-powered online tools collection for developers and daily use.</p>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
                <ul class="space-y-2">
                  <li><NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors">Home</NuxtLink></li>
                  <li><NuxtLink to="/tools" class="text-gray-400 hover:text-white transition-colors">Tools</NuxtLink></li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4">Categories</h3>
                <ul class="space-y-2">
                  <li><NuxtLink to="/tools?category=text" class="text-gray-400 hover:text-white transition-colors">Text Tools</NuxtLink></li>
                  <li><NuxtLink to="/tools?category=developer" class="text-gray-400 hover:text-white transition-colors">Developer Tools</NuxtLink></li>
                  <li><NuxtLink to="/tools?category=utility" class="text-gray-400 hover:text-white transition-colors">Utility Tools</NuxtLink></li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4">Support</h3>
                <ul class="space-y-2">
                  <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 AI Toolbox Pro. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </template>
    </ClientOnly>

    <!-- 支付模态框 -->
    <ClientOnly>
      <PaymentModal />
    </ClientOnly>
  </div>
</template>

<script setup>
// 手动导入组件（因为禁用了自动导入）
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
import PaymentModal from '~/components/payment/PaymentModal.vue'

// SEO设置
useHead({
  htmlAttrs: {
    lang: 'en'
  }
})
</script>