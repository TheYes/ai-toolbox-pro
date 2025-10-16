<template>
  <div class="min-h-screen">
    <!-- 工具头部 -->
    <div class="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
      <div class="container mx-auto px-6">
        <NuxtLink
          :to="getLocalizedPath('/tools')"
          class="text-primary-600 hover:text-primary-700 mb-4 inline-block"
        >
          ← {{ t('common.backToTools') }}
        </NuxtLink>
        <h1 class="text-4xl font-bold text-gray-900 mb-4 text-center">{{ t('tools.urlEncoder.name') }}</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto text-center">{{ t('tools.urlEncoder.description') }}</p>
      </div>
    </div>

    <!-- 工具内容 -->
    <div class="container mx-auto px-6 py-16">
      <div class="tool-content">
        <!-- 操作模式选择 -->
        <div class="card mb-6">
          <div class="flex flex-wrap gap-4 justify-center">
            <button
              @click="operationMode = 'encode'"
              :class="operationMode === 'encode' ? 'btn-primary' : 'btn-secondary'"
            >
              {{ t('tools.urlEncoder.encode') }}
            </button>
            <button
              @click="operationMode = 'decode'"
              :class="operationMode === 'decode' ? 'btn-primary' : 'btn-secondary'"
            >
              {{ t('tools.urlEncoder.decode') }}
            </button>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">{{ t('common.input') }}</h2>
            <div class="space-x-2">
              <button
                @click="clearInput"
                class="btn-secondary text-sm px-3 py-1"
              >
                {{ t('common.clear') }}
              </button>
              <button
                @click="loadExample"
                class="btn-secondary text-sm px-3 py-1"
              >
                {{ t('common.example') }}
              </button>
            </div>
          </div>
          <textarea
            v-model="inputText"
            :placeholder="operationMode === 'encode' ? t('tools.urlEncoder.encodePlaceholder') : t('tools.urlEncoder.decodePlaceholder')"
            class="input-field min-h-[200px]"
            @input="processUrl"
          ></textarea>
          <div class="mt-2 text-sm text-gray-600">{{ t('common.length') }}: {{ inputText.length }} {{ t('common.characters') }}</div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-wrap gap-4 justify-center">
          <button
            @click="processUrl"
            class="btn-primary"
          >
            {{ operationMode === 'encode' ? $t('tools.urlEncoder.encode') : $t('tools.urlEncoder.decode') }}
          </button>
          <button
            @click="copyResult"
            class="btn-secondary"
          >
            {{ t('common.copy') }}
          </button>
          <button
            @click="downloadResult"
            class="btn-secondary"
          >
            {{ t('common.download') }}
          </button>
        </div>

        <!-- 输出区域 -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">{{ t('common.output') }}</h2>
            <div class="space-x-2">
              <button
                @click="copyResult"
                class="btn-secondary text-sm px-3 py-1"
              >
                {{ t('common.copy') }}
              </button>
              <button
                @click="downloadResult"
                class="btn-secondary text-sm px-3 py-1"
              >
                {{ t('common.download') }}
              </button>
            </div>
          </div>
          <textarea
            v-model="outputText"
            readonly
            class="input-field min-h-[200px] bg-gray-50"
          ></textarea>
          <div class="mt-2 text-sm text-gray-600">{{ t('common.length') }}: {{ outputText.length }} {{ t('common.characters') }}</div>
        </div>

        <!-- 状态信息 -->
        <div
          v-if="statusMessage"
          class="text-center p-4 rounded-md"
          :class="statusClass"
        >
          {{ statusMessage }}
        </div>

        <!-- 工具信息 -->
        <div class="card bg-blue-50 border-blue-200">
          <h3 class="text-lg font-semibold mb-3 text-blue-900">
            {{ t('tools.urlEncoder.features.title') }}
          </h3>
          <ul class="space-y-2 text-blue-800">
            <li>✅ {{ t('tools.urlEncoder.features.encode') }}</li>
            <li>✅ {{ t('tools.urlEncoder.features.decode') }}</li>
            <li>✅ {{ t('tools.urlEncoder.features.safe') }}</li>
            <li>✅ {{ t('tools.urlEncoder.features.quick') }}</li>
            <li>✅ {{ t('tools.urlEncoder.features.download') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 使用统一的国际化路由工具
const { getLocalizedPath } = useI18nRouting()
const { t } = useI18n()

// SEO设置
useHead({
  title: 'URL Encoder/Decoder',
  meta: [
    {
      name: 'description',
      content: 'Encode and decode URLs for safe transmission'
    }
  ]
})

// 工具函数
const { copyToClipboard, downloadText } = useTools()

// 响应式数据
const operationMode = ref('encode')
const inputText = ref('')
const outputText = ref('')
const statusMessage = ref('')
const statusType = ref('')

// 示例数据
const exampleUrls = ['https://example.com/search?q=nuxt.js&lang=en', 'https://www.google.com/search?q=hello world&filter=images', 'https://github.com/user/repo?tab=issues&number=123']

// 状态样式
const statusClass = computed(() => {
  if (statusType.value === 'error') return 'bg-red-100 text-red-700 border border-red-200'
  if (statusType.value === 'success') return 'bg-green-100 text-green-700 border border-green-200'
  return 'bg-blue-100 text-blue-700 border border-blue-200'
})

// 处理URL编码/解码
const processUrl = () => {
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  try {
    if (operationMode.value === 'encode') {
      outputText.value = encodeURIComponent(inputText.value)
      showStatus(t('tools.urlEncoder.encodeSuccess'), 'success')
    } else {
      outputText.value = decodeURIComponent(inputText.value)
      showStatus(t('tools.urlEncoder.decodeSuccess'), 'success')
    }
  } catch (error) {
    outputText.value = ''
    showStatus(`Error: ${error.message}`, 'error')
  }
}

// 复制结果
const copyResult = async () => {
  if (!outputText.value) return

  const result = await copyToClipboard(outputText.value)
  showStatus(result.message, result.success ? 'success' : 'error')
}

// 下载结果
const downloadResult = () => {
  if (!outputText.value) return

  const filename = operationMode.value === 'encode' ? t('tools.urlEncoder.encodedFileName') : t('tools.urlEncoder.decodedFileName')
  downloadText(outputText.value, filename)
  showStatus(t('tools.urlEncoder.downloadSuccess'), 'success')
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  statusMessage.value = ''
  statusType.value = ''
}

// 加载示例
const loadExample = () => {
  // 确保只在客户端执行以避免 SSR 问题
  if (!process.client) return

  const randomExample = exampleUrls[Math.floor(Math.random() * exampleUrls.length)]
  inputText.value = randomExample
  processUrl()
}

// 显示状态消息
const showStatus = (message, type) => {
  statusMessage.value = message
  statusType.value = type
  setTimeout(() => {
    statusMessage.value = ''
    statusType.value = ''
  }, 3000)
}
</script>

<style scoped>
.tool-content {
  @apply space-y-6;
}

.card {
  @apply bg-white rounded-lg shadow-md p-6;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors;
}
</style>
