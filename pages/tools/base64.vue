<template>
  <div class="tool-container">
    <!-- 工具头部 -->
    <div class="tool-header">
      <NuxtLink to="/tools" class="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← {{ t('common.backToTools') }}
      </NuxtLink>
      <h1 class="tool-title">{{ t('tools.base64.name') }}</h1>
      <p class="tool-description">{{ t('tools.base64.description') }}</p>
    </div>

    <!-- 操作模式选择 -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-4 justify-center">
        <button
          @click="mode = 'encode'"
          :class="mode === 'encode' ? 'btn-primary' : 'btn-secondary'"
        >
          {{ t('tools.base64.encode') }}
        </button>
        <button
          @click="mode = 'decode'"
          :class="mode === 'decode' ? 'btn-primary' : 'btn-secondary'"
        >
          {{ t('tools.base64.decode') }}
        </button>
      </div>
    </div>

    <div class="tool-content">
      <!-- 输入区域 -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">{{ t('common.input') }}</h2>
          <div class="space-x-2">
            <button @click="clearInput" class="btn-secondary text-sm px-3 py-1">
              {{ t('common.clear') }}
            </button>
            <button @click="loadExample" class="btn-secondary text-sm px-3 py-1">
              {{ t('common.example') }}
            </button>
          </div>
        </div>
        <textarea
          v-model="inputText"
          :placeholder="mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'"
          class="input-field min-h-[200px]"
          @input="processText"
        ></textarea>
        <div class="mt-2 text-sm text-gray-600">
          {{ t('common.length') }}: {{ inputText.length }} {{ t('common.characters') }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-wrap gap-4 justify-center">
        <button @click="processText" class="btn-primary">
          {{ mode === 'encode' ? $t('tools.base64.encode') : $t('tools.base64.decode') }}
        </button>
        <button @click="swapInputOutput" class="btn-secondary">
          {{ t('common.swap') }}
        </button>
        <button @click="copyResult" class="btn-secondary">
          {{ t('common.copy') }}
        </button>
      </div>

      <!-- 输出区域 -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">{{ t('common.output') }}</h2>
          <div class="space-x-2">
            <button @click="copyResult" class="btn-secondary text-sm px-3 py-1">
              {{ t('common.copy') }}
            </button>
            <button @click="downloadResult" class="btn-secondary text-sm px-3 py-1">
              {{ t('common.download') }}
            </button>
          </div>
        </div>
        <textarea
          v-model="outputText"
          readonly
          class="input-field min-h-[200px] bg-gray-50"
          :class="{ 'border-red-300': error, 'border-green-300': !error && outputText }"
        ></textarea>
        <div class="mt-2 text-sm text-gray-600">
          {{ t('common.length') }}: {{ outputText.length }} {{ t('common.characters') }}
        </div>
      </div>

      <!-- 状态信息 -->
      <div v-if="statusMessage" class="text-center p-4 rounded-md" :class="statusClass">
        {{ statusMessage }}
      </div>

      <!-- 工具信息 -->
      <div class="card bg-blue-50 border-blue-200">
        <h3 class="text-lg font-semibold mb-3 text-blue-900">
          {{ t('tools.base64.features.title') }}
        </h3>
        <ul class="space-y-2 text-blue-800">
          <li>✅ {{ t('tools.base64.features.encode') }}</li>
          <li>✅ {{ t('tools.base64.features.decode') }}</li>
          <li>✅ {{ t('tools.base64.features.safe') }}</li>
          <li>✅ {{ t('tools.base64.features.quick') }}</li>
          <li>✅ {{ t('tools.base64.features.download') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入国际化函数 - 使用正确的Nuxt 3方式
const { t } = useI18n()

// SEO设置
useHead({
  title: 'Base64 Encoder/Decoder',
  meta: [
    { name: 'description', content: 'Free online Base64 encoder and decoder tool for text and data' }
  ]
})

// 工具函数
const { copyToClipboard, downloadText } = useTools()

// 响应式数据
const mode = ref<'encode' | 'decode'>('encode')
const inputText = ref('')
const outputText = ref('')
const error = ref('')
const statusMessage = ref('')

// 示例文本
const exampleText = 'Hello, World! This is a test message for Base64 encoding.'

// 状态样式
const statusClass = computed(() => {
  if (error.value) return 'bg-red-100 text-red-700 border border-red-200'
  return 'bg-green-100 text-green-700 border border-green-200'
})

// 处理文本
const processText = () => {
  if (!inputText.value.trim()) {
    clearOutput()
    return
  }

  try {
    if (mode.value === 'encode') {
      outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
      showStatus('Text encoded successfully!', 'success')
    } else {
      outputText.value = decodeURIComponent(escape(atob(inputText.value)))
      showStatus('Base64 decoded successfully!', 'success')
    }
    error.value = ''
  } catch (err) {
    error.value = err.message
    outputText.value = ''
    showStatus(`Error: ${err.message}`, 'error')
  }
}

// 交换输入输出
const swapInputOutput = () => {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
  processText()
}

// 复制结果
const copyResult = async () => {
  if (!outputText.value) {
    showStatus('No result to copy', 'info')
    return
  }

  const result = await copyToClipboard(outputText.value)
  showStatus(result.message, result.success ? 'success' : 'error')
}

// 下载结果
const downloadResult = () => {
  if (!outputText.value) {
    showStatus('No result to download', 'info')
    return
  }

  const filename = mode.value === 'encode' ? 'encoded.txt' : 'decoded.txt'
  downloadText(outputText.value, filename)
  showStatus('File downloaded successfully!', 'success')
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  clearOutput()
}

// 清空输出
const clearOutput = () => {
  outputText.value = ''
  error.value = ''
  statusMessage.value = ''
}

// 加载示例
const loadExample = () => {
  inputText.value = exampleText
  processText()
}

// 显示状态消息
/**
 * @param {string} message
 * @param {string} type
 */
const showStatus = (message, type) => {
  statusMessage.value = message
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// 监听模式变化
watch(mode, () => {
  clearOutput()
  if (inputText.value) {
    processText()
  }
})
</script>

<style scoped>
.tool-container {
  max-width: 4xl;
  margin: 0 auto;
  padding: 1rem;
}

.tool-header {
  margin-bottom: 2rem;
}

.tool-title {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.tool-description {
  @apply text-gray-600;
}

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