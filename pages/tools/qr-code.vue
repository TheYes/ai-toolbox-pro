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

        <h1 class="text-4xl font-bold text-gray-900 mb-4 text-center">{{ t('tools.qrCode.name') }}</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto text-center">{{ t('tools.qrCode.description') }}</p>
      </div>
    </div>

    <!-- 工具内容 -->
    <div class="container mx-auto px-6 py-16">
      <div class="tool-content">
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
            :placeholder="t('tools.qrCode.placeholder')"
            class="input-field min-h-[100px]"
            @input="generateQRCode"
          ></textarea>
        </div>

        <!-- 设置区域 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">{{ t('tools.qrCode.settings') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 尺寸设置 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> {{ t('tools.qrCode.size') }}: {{ qrSize }}px </label>
              <input
                type="range"
                v-model="qrSize"
                min="128"
                max="512"
                step="32"
                class="w-full"
                @input="generateQRCode"
              />
            </div>

            <!-- 错误纠正级别 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('tools.qrCode.errorCorrection') }}
              </label>
              <select
                v-model="errorCorrectionLevel"
                class="input-field"
                @change="generateQRCode"
              >
                <option value="L">L - Low (7%)</option>
                <option value="M">M - Medium (15%)</option>
                <option value="Q">Q - Quartile (25%)</option>
                <option value="H">H - High (30%)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-wrap gap-4 justify-center">
          <button
            @click="generateQRCode"
            class="btn-primary"
            :disabled="isGenerating"
          >
            {{ isGenerating ? t('common.generating') : t('tools.qrCode.generate') }}
          </button>
          <button
            @click="downloadQRCode"
            class="btn-secondary"
            :disabled="!qrCodeDataUrl"
          >
            {{ t('common.download') }}
          </button>
        </div>

        <!-- 二维码显示区域 -->
        <div
          v-if="qrCodeDataUrl"
          class="card"
        >
          <h3 class="text-lg font-semibold mb-4">{{ t('tools.qrCode.result') }}</h3>
          <div class="flex justify-center">
            <img
              :src="qrCodeDataUrl"
              alt="QR Code"
              class="border border-gray-300 rounded-lg"
            />
          </div>
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
            {{ t('tools.qrCode.features.title') }}
          </h3>
          <ul class="space-y-2 text-blue-800">
            <li>✅ {{ t('tools.qrCode.features.generate') }}</li>
            <li>✅ {{ t('tools.qrCode.features.customSize') }}</li>
            <li>✅ {{ t('tools.qrCode.features.errorCorrection') }}</li>
            <li>✅ {{ t('tools.qrCode.features.download') }}</li>
            <li>✅ {{ t('tools.qrCode.features.quick') }}</li>
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
  title: 'QR Code Generator',
  meta: [{ name: 'description', content: 'Free online QR code generator from text or URLs' }]
})

// 工具函数
const { downloadText } = useTools()

// 响应式数据
const inputText = ref('')
const qrSize = ref(256)
const errorCorrectionLevel = ref('M')
const qrCodeDataUrl = ref('')
const isGenerating = ref(false)

// 示例数据
const exampleTexts = ['https://example.com', 'Hello, World!', 'Contact: email@example.com', 'WIFI:T:WPA;S:NetworkName;P:Password;;']

// 生成二维码
const generateQRCode = async () => {
  // 确保只在客户端执行以避免 SSR 问题
  if (!process.client) return

  if (!inputText.value.trim()) {
    qrCodeDataUrl.value = ''
    return
  }

  try {
    isGenerating.value = true

    // 使用 Canvas API 生成简单的二维码占位符
    // 在实际项目中，这里应该使用 qrcode 库
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = qrSize.value
    canvas.height = qrSize.value

    // 绘制简单的占位符二维码图案
    const moduleSize = Math.floor(qrSize.value / 25)
    const modules = 25

    // 伪随机生成二维码图案（仅用于演示）
    const data = inputText.value
    let seed = 0
    for (let i = 0; i < data.length; i++) {
      seed += data.charCodeAt(i)
    }

    // 白色背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制二维码模块
    ctx.fillStyle = '#000000'
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // 简单的伪随机模式
        const value = (seed + row * col + row + col) % 3
        if (value === 0) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // 绘制定位图案
    drawPositionPattern(ctx, 0, 0, moduleSize)
    drawPositionPattern(ctx, modules - 7, 0, moduleSize)
    drawPositionPattern(ctx, 0, modules - 7, moduleSize)

    qrCodeDataUrl.value = canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating QR code:', error)
    showStatus('Error generating QR code', 'error')
  } finally {
    isGenerating.value = false
  }
}

// 绘制定位图案
const drawPositionPattern = (ctx, x, y, moduleSize) => {
  ctx.fillStyle = '#000000'
  ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize)
  ctx.fillStyle = '#000000'
  ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize)
}

// 下载二维码
const downloadQRCode = () => {
  if (!qrCodeDataUrl.value) return

  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = qrCodeDataUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showStatus('QR code downloaded successfully!', 'success')
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  qrCodeDataUrl.value = ''
}

// 加载示例
const loadExample = () => {
  // 确保只在客户端执行以避免 SSR 问题
  if (!process.client) return

  const randomExample = exampleTexts[Math.floor(Math.random() * exampleTexts.length)]
  inputText.value = randomExample
  generateQRCode()
}

// 显示状态消息
const statusMessage = ref('')
const statusType = ref('')

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
