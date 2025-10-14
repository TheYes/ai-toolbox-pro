<template>
  <div class="tool-container">
    <!-- 工具头部 -->
    <div class="tool-header">
      <NuxtLink :to="getLocalizedPath('/tools')" class="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Back to Tools
      </NuxtLink>
      <h1 class="tool-title">{{ $t('tools.colorPicker.name') }}</h1>
      <p class="tool-description">{{ $t('tools.colorPicker.description') }}</p>
    </div>

    <div class="tool-content">
      <!-- 颜色选择器 -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Color Picker</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- 可视化选择器 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Visual Color Picker
            </label>
            <div class="space-y-4">
              <input
                v-model="hexColor"
                type="color"
                class="w-full h-32 rounded cursor-pointer"
                @input="updateFromHex"
              />
              <div class="flex items-center space-x-2">
                <input
                  v-model="hexColor"
                  type="text"
                  placeholder="#000000"
                  class="input-field"
                  @input="updateFromHex"
                />
                <div
                  class="w-12 h-12 rounded border-2 border-gray-300"
                  :style="{ backgroundColor: hexColor }"
                ></div>
              </div>
            </div>
          </div>

          <!-- RGB滑块 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              RGB Values
            </label>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-600">Red: {{ rgbValues.r }}</label>
                <input
                  v-model.number="rgbValues.r"
                  type="range"
                  min="0"
                  max="255"
                  class="w-full"
                  @input="updateFromRgb"
                />
              </div>
              <div>
                <label class="text-xs text-gray-600">Green: {{ rgbValues.g }}</label>
                <input
                  v-model.number="rgbValues.g"
                  type="range"
                  min="0"
                  max="255"
                  class="w-full"
                  @input="updateFromRgb"
                />
              </div>
              <div>
                <label class="text-xs text-gray-600">Blue: {{ rgbValues.b }}</label>
                <input
                  v-model.number="rgbValues.b"
                  type="range"
                  min="0"
                  max="255"
                  class="w-full"
                  @input="updateFromRgb"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 颜色格式输出 -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Color Formats</h2>
          <button @click="copyAllFormats" class="btn-secondary text-sm px-3 py-1">
            Copy All
          </button>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- HEX -->
          <div class="color-format">
            <label class="text-sm font-medium text-gray-700">HEX</label>
            <div class="flex items-center space-x-2">
              <input
                :value="hexColor"
                readonly
                class="input-field text-sm"
              />
              <button @click="copyFormat(hexColor)" class="btn-secondary text-xs px-2 py-1">
                {{ $t('common.copy') }}
              </button>
            </div>
          </div>

          <!-- RGB -->
          <div class="color-format">
            <label class="text-sm font-medium text-gray-700">RGB</label>
            <div class="flex items-center space-x-2">
              <input
                :value="rgbString"
                readonly
                class="input-field text-sm"
              />
              <button @click="copyFormat(rgbString)" class="btn-secondary text-xs px-2 py-1">
                {{ $t('common.copy') }}
              </button>
            </div>
          </div>

          <!-- RGBA -->
          <div class="color-format">
            <label class="text-sm font-medium text-gray-700">RGBA</label>
            <div class="flex items-center space-x-2">
              <input
                :value="rgbaString"
                readonly
                class="input-field text-sm"
              />
              <button @click="copyFormat(rgbaString)" class="btn-secondary text-xs px-2 py-1">
                {{ $t('common.copy') }}
              </button>
            </div>
          </div>

          <!-- HSL -->
          <div class="color-format">
            <label class="text-sm font-medium text-gray-700">HSL</label>
            <div class="flex items-center space-x-2">
              <input
                :value="hslString"
                readonly
                class="input-field text-sm"
              />
              <button @click="copyFormat(hslString)" class="btn-secondary text-xs px-2 py-1">
                {{ $t('common.copy') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 预设颜色 -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Preset Colors</h2>
        <div class="grid grid-cols-8 md:grid-cols-12 gap-2">
          <div
            v-for="color in presetColors"
            :key="color"
            class="preset-color"
            :style="{ backgroundColor: color }"
            @click="selectPresetColor(color)"
            :title="color"
          ></div>
        </div>
      </div>

      <!-- 状态信息 -->
      <div v-if="statusMessage" class="p-4 rounded-md text-center" :class="statusClass">
        {{ statusMessage }}
      </div>

      <!-- 功能说明 -->
      <div class="card bg-blue-50 border-blue-200">
        <h3 class="text-lg font-semibold mb-3 text-blue-900">
          Features:
        </h3>
        <ul class="space-y-2 text-blue-800">
          <li>✅ Visual color picker with live preview</li>
          <li>✅ RGB sliders for precise control</li>
          <li>✅ Multiple color format support</li>
          <li>✅ Copy individual formats or all at once</li>
          <li>✅ Preset color palette</li>
          <li>✅ Alpha transparency support</li>
        </ul>
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
  meta: [
    { name: 'description', content: 'Pick colors and get different format codes' }
  ]
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
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E2', '#F8B739', '#52D726', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'
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
  hexColor.value = '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// RGB到HSL转换
const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
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

.color-format {
  @apply space-y-2;
}

.preset-color {
  @apply w-8 h-8 rounded cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors;
}

.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors;
}
</style>