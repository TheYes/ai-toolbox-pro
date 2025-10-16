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
        <h1 class="text-4xl font-bold text-gray-900 mb-4 text-center">{{ t('tools.colorPicker.name') }}</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto text-center">{{ t('tools.colorPicker.description') }}</p>
      </div>
    </div>

    <!-- 工具内容 -->
    <div class="container mx-auto px-6 py-16">
      <div class="tool-content">
        <!-- 颜色输入区域 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">{{ t('tools.colorPicker.inputColor') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- HEX输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">HEX</label>
              <input
                v-model="hexColor"
                type="text"
                placeholder="#000000"
                class="input-field"
                @input="updateFromHex"
              />
            </div>

            <!-- RGB输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">RGB</label>
              <div class="flex space-x-2">
                <input
                  v-model="rgbValues.r"
                  type="number"
                  min="0"
                  max="255"
                  class="input-field flex-1"
                  @input="updateFromRgb"
                />
                <input
                  v-model="rgbValues.g"
                  type="number"
                  min="0"
                  max="255"
                  class="input-field flex-1"
                  @input="updateFromRgb"
                />
                <input
                  v-model="rgbValues.b"
                  type="number"
                  min="0"
                  max="255"
                  class="input-field flex-1"
                  @input="updateFromRgb"
                />
              </div>
            </div>
          </div>

          <!-- 颜色预览 -->
          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('tools.colorPicker.preview') }}</label>
            <div
              class="w-full h-24 rounded-lg border-2 border-gray-300"
              :style="{ backgroundColor: hexColor }"
            ></div>
          </div>
        </div>

        <!-- 预设颜色 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">{{ t('tools.colorPicker.presetColors') }}</h3>
          <div class="grid grid-cols-8 md:grid-cols-16 gap-2">
            <button
              v-for="color in presetColors"
              :key="color"
              @click="selectPresetColor(color)"
              class="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
              :style="{ backgroundColor: color }"
              :title="color"
            ></button>
          </div>
        </div>

        <!-- 颜色格式输出 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">{{ t('tools.colorPicker.colorFormats') }}</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <code class="font-mono text-sm">HEX: {{ hexColor }}</code>
              <button
                @click="copyFormat(hexColor)"
                class="btn-secondary text-sm px-3 py-1"
              >
                {{ t('common.copy') }}
              </button>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <code class="font-mono text-sm">RGB: {{ rgbString }}</code>
              <button
                @click="copyFormat(rgbString)"
                class="btn-secondary text-sm px-3 py-1"
              >
                {{ t('common.copy') }}
              </button>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <code class="font-mono text-sm">RGBA: {{ rgbaString }}</code>
              <button
                @click="copyFormat(rgbaString)"
                class="btn-secondary text-sm px-3 py-1"
              >
                {{ t('common.copy') }}
              </button>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <code class="font-mono text-sm">HSL: {{ hslString }}</code>
              <button
                @click="copyFormat(hslString)"
                class="btn-secondary text-sm px-3 py-1"
              >
                {{ t('common.copy') }}
              </button>
            </div>
          </div>

          <div class="mt-4">
            <button
              @click="copyAllFormats"
              class="btn-primary w-full"
            >
              {{ t('tools.colorPicker.copyAllFormats') }}
            </button>
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
            {{ t('tools.colorPicker.features.title') }}
          </h3>
          <ul class="space-y-2 text-blue-800">
            <li>✅ {{ t('tools.colorPicker.features.pickColor') }}</li>
            <li>✅ {{ t('tools.colorPicker.features.multipleFormats') }}</li>
            <li>✅ {{ t('tools.colorPicker.features.presetColors') }}</li>
            <li>✅ {{ t('tools.colorPicker.features.realTime') }}</li>
            <li>✅ {{ t('tools.colorPicker.features.copyAll') }}</li>
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
  title: 'Color Picker',
  meta: [{ name: 'description', content: 'Pick colors and get different format codes' }]
})

// 工具函数
const { copyToClipboard } = useTools()

// 响应式数据
const hexColor = ref('#3B82F6')
const rgbValues = ref({ r: 59, g: 130, b: 246 })
const alphaValue = ref(1)
const statusMessage = ref('')
const statusType = ref('')

// 预设颜色
const presetColors = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#800000',
  '#008000',
  '#000080',
  '#808000',
  '#800080',
  '#008080',
  '#C0C0C0',
  '#808080',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B739',
  '#52D726',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4'
]

// 计算属性
const rgbString = computed(() => `rgb(${rgbValues.value.r}, ${rgbValues.value.g}, ${rgbValues.value.b})`)

const rgbaString = computed(() => `rgba(${rgbValues.value.r}, ${rgbValues.value.g}, ${rgbValues.value.b}, ${alphaValue.value})`)

const hslString = computed(() => {
  const hsl = rgbToHsl(rgbValues.value.r, rgbValues.value.g, rgbValues.value.b)
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
})

// 状态样式
const statusClass = computed(() => {
  if (statusType.value === 'error') return 'bg-red-100 text-red-700 border border-red-200'
  if (statusType.value === 'success') return 'bg-green-100 text-green-700 border border-green-200'
  return 'bg-blue-100 text-blue-700 border border-blue-200'
})

// 从HEX更新
const updateFromHex = () => {
  try {
    const hex = hexColor.value.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      rgbValues.value = { r, g, b }
    }
  } catch (error) {
    console.error('Invalid hex color:', error)
  }
}

// 从RGB更新
const updateFromRgb = () => {
  const { r, g, b } = rgbValues.value
  hexColor.value =
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
}

// RGB到HSL转换
const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// 选择预设颜色
const selectPresetColor = (color) => {
  hexColor.value = color
  updateFromHex()
  showStatus(`Color ${color} selected!`, 'success')
}

// 复制格式
const copyFormat = async (format) => {
  const result = await copyToClipboard(format)
  showStatus(result.message, result.success ? 'success' : 'error')
}

// 复制所有格式
const copyAllFormats = async () => {
  const allFormats = `HEX: ${hexColor.value}\nRGB: ${rgbString.value}\nRGBA: ${rgbaString.value}\nHSL: ${hslString.value}`
  const result = await copyToClipboard(allFormats)
  showStatus(result.message, result.success ? 'success' : 'error')
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

// 初始化
updateFromHex()
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
