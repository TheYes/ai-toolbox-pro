<template>
  <div class="tool-container">
    <!-- 工具头部 -->
    <div class="tool-header">
      <NuxtLink :to="getLocalizedPath('/tools')" class="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← {{ t('common.backToTools') }}
      </NuxtLink>
      <h1 class="tool-title">{{ t('tools.jsonFormatter.name') }}</h1>
      <p class="tool-description">{{ t('tools.jsonFormatter.description') }}</p>
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
          v-model="inputJson"
          placeholder='{"name": "John", "age": 30, "city": "New York"}'
          class="input-field min-h-[200px] font-mono text-sm"
          @input="formatJson"
        ></textarea>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-wrap gap-4 justify-center">
        <button @click="formatJson" class="btn-primary">
          {{ t('tools.jsonFormatter.format') }}
        </button>
        <button @click="minifyJson" class="btn-secondary">
          {{ t('tools.jsonFormatter.minify') }}
        </button>
        <button @click="validateJson" class="btn-secondary">
          {{ t('tools.jsonFormatter.validate') }}
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
          v-model="outputJson"
          readonly
          class="input-field min-h-[200px] font-mono text-sm bg-gray-50"
          :class="{ 'border-red-300': error, 'border-green-300': isValid && !error }"
        ></textarea>
      </div>

      <!-- 状态信息 -->
      <div v-if="statusMessage" class="text-center p-4 rounded-md" :class="statusClass">
        {{ statusMessage }}
      </div>

      <!-- 工具信息 -->
      <div class="card bg-blue-50 border-blue-200">
        <h3 class="text-lg font-semibold mb-3 text-blue-900">
          {{ t('tools.jsonFormatter.features.title') }}
        </h3>
        <ul class="space-y-2 text-blue-800">
          <li>✅ {{ t('tools.jsonFormatter.features.format') }}</li>
          <li>✅ {{ t('tools.jsonFormatter.features.validate') }}</li>
          <li>✅ {{ t('tools.jsonFormatter.features.minify') }}</li>
          <li>✅ {{ t('tools.jsonFormatter.features.syntax') }}</li>
          <li>✅ {{ t('tools.jsonFormatter.features.download') }}</li>
        </ul>
      </div>
    </div>

    <!-- 支付模态框暂时禁用 -->
    <!-- PaymentModal 暂时移除 -->
  </div>
</template>

<script setup>
// 导入国际化函数
const { t } = useI18n()
const { $i18n } = useNuxtApp()

// 简单的路由函数
const getLocalizedPath = (path) => {
  const currentLocale = $i18n.locale.value
  if (path === '/') {
    return `/${currentLocale}`
  }
  return `/${currentLocale}${path}`
}

// SEO设置
useHead({
  title: 'JSON Formatter',
  meta: [
    { name: 'description', content: 'free online JSON formatter, validator and minifier tool' }
  ]
})

// 工具函数
const { copyToClipboard, downloadText } = useTools()

// 响应式数据
const inputJson = ref('')
const outputJson = ref('')
const error = ref('')
const isValid = ref(false)
const statusMessage = ref('')

// 示例JSON
const exampleJson = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "address": {
    "street": "123 Main St",
    "zipCode": "10001"
  }
}`

// 状态样式
const statusClass = computed(() => {
  if (error.value) return 'bg-red-100 text-red-700 border border-red-200'
  if (isValid.value) return 'bg-green-100 text-green-700 border border-green-200'
  return 'bg-blue-100 text-blue-700 border border-blue-200'
})

// 格式化JSON
const formatJson = () => {
  if (!inputJson.value.trim()) {
    clearOutput()
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, 2)
    error.value = ''
    isValid.value = true
    showStatus('JSON formatted successfully!', 'success')
  } catch (err) {
    error.value = err.message
    isValid.value = false
    outputJson.value = inputJson.value
    showStatus(`Invalid JSON: ${err.message}`, 'error')
  }
}

// 压缩JSON
const minifyJson = () => {
  if (!inputJson.value.trim()) {
    clearOutput()
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    error.value = ''
    isValid.value = true
    showStatus('JSON minified successfully!', 'success')
  } catch (err) {
    error.value = err.message
    isValid.value = false
    outputJson.value = inputJson.value
    showStatus(`Invalid JSON: ${err.message}`, 'error')
  }
}

// 验证JSON
const validateJson = () => {
  if (!inputJson.value.trim()) {
    showStatus('Please enter JSON to validate', 'info')
    return
  }

  try {
    JSON.parse(inputJson.value)
    error.value = ''
    isValid.value = true
    showStatus('Valid JSON!', 'success')
  } catch (err) {
    error.value = err.message
    isValid.value = false
    showStatus(`Invalid JSON: ${err.message}`, 'error')
  }
}

// 复制结果
const copyResult = async () => {
  if (!outputJson.value) {
    showStatus('No result to copy', 'info')
    return
  }

  const result = await copyToClipboard(outputJson.value)
  showStatus(result.message, result.success ? 'success' : 'error')
}

// 下载结果
const downloadResult = () => {
  if (!outputJson.value) {
    showStatus('No result to download', 'info')
    return
  }

  downloadText(outputJson.value, 'formatted.json')
  showStatus('File downloaded successfully!', 'success')
}

// 清空输入
const clearInput = () => {
  inputJson.value = ''
  clearOutput()
}

// 清空输出
const clearOutput = () => {
  outputJson.value = ''
  error.value = ''
  isValid.value = false
  statusMessage.value = ''
}

// 加载示例
const loadExample = () => {
  inputJson.value = exampleJson
  formatJson()
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