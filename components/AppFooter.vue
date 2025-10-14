<template>
  <footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-6">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Logo和描述 -->
        <div class="md:col-span-1">
          <div class="flex items-center space-x-2 mb-4">
            <div class="text-2xl font-bold">🛠️ AI Toolbox</div>
          </div>
          <p class="text-gray-400">
            {{ $t('footer.description') }}
          </p>
        </div>

        <!-- 快速链接 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ $t('footer.quickLinks') }}</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink :to="getLocalizedPath('/')" class="text-gray-400 hover:text-white transition-colors">
                {{ $t('nav.home') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="getLocalizedPath('/tools')" class="text-gray-400 hover:text-white transition-colors">
                {{ $t('nav.tools') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 工具分类 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ $t('footer.categories') }}</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink :to="getLocalizedPath('/tools?category=text')" class="text-gray-400 hover:text-white transition-colors">
                {{ $t('categories.text') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="getLocalizedPath('/tools?category=developer')" class="text-gray-400 hover:text-white transition-colors">
                {{ $t('categories.developer') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="getLocalizedPath('/tools?category=utility')" class="text-gray-400 hover:text-white transition-colors">
                {{ $t('categories.utility') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 支持 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ $t('footer.support') }}</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                {{ $t('footer.contact') }}
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                {{ $t('footer.privacy') }}
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                {{ $t('footer.terms') }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2024 AI Toolbox Pro. {{ $t('footer.allRightsReserved') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 使用统一的国际化路由工具 - 添加SSR保护
const { getLocalizedPath } = useI18nRouting()

// 确保在客户端渲染前不执行可能导致hydration错误的代码
const isClient = process.client
</script>