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
        <h1 class="text-4xl font-bold text-gray-900 mb-4 text-center">{{ t('tools.passwordGenerator.name') }}</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto text-center">{{ t('tools.passwordGenerator.description') }}</p>
      </div>
    </div>

    <!-- 工具内容 -->
    <div class="container mx-auto px-6 py-16">
      <div class="tool-content">
        <!-- 密码生成设置 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">{{ t('tools.passwordGenerator.settings') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 密码长度 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> {{ t('tools.passwordGenerator.length') }}: {{ passwordLength }} </label>
              <input
                type="range"
                v-model="passwordLength"
                min="6"
                max="128"
                class="w-full"
                @input="generatePassword"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>6</span>
                <span>128</span>
              </div>
            </div>

            <!-- 字符类型选项 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('tools.passwordGenerator.characterTypes') }}
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="useUppercase"
                    class="mr-2"
                    @change="generatePassword"
                  />
                  <span class="text-sm">{{ t('tools.passwordGenerator.uppercase') }} (A-Z)</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="useLowercase"
                    class="mr-2"
                    @change="generatePassword"
                  />
                  <span class="text-sm">{{ t('tools.passwordGenerator.lowercase') }} (a-z)</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="useNumbers"
                    class="mr-2"
                    @change="generatePassword"
                  />
                  <span class="text-sm">{{ t('tools.passwordGenerator.numbers') }} (0-9)</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="useSymbols"
                    class="mr-2"
                    @change="generatePassword"
                  />
                  <span class="text-sm">{{ t('tools.passwordGenerator.symbols').replace('{at}', '@') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 生成的密码 -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">{{ t('tools.passwordGenerator.generatedPassword') }}</h3>
            <button
              @click="copyPassword"
              class="btn-secondary text-sm px-3 py-1"
            >
              {{ t('common.copy') }}
            </button>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="font-mono text-lg text-center break-all word-break-all">
              {{ generatedPassword || t('tools.passwordGenerator.clickGenerate') }}
            </div>
          </div>

          <!-- 密码强度指示器 -->
          <div class="mt-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium">{{ t('tools.passwordGenerator.strength') }}</span>
              <span
                class="text-sm font-medium"
                :class="passwordStrength.color.replace('bg-', 'text-')"
              >
                {{ passwordStrength.text }}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="passwordStrength.barColor"
                :style="{ width: passwordStrength.percentage + '%' }"
              ></div>
            </div>
          </div>

          <!-- 密码检查项 -->
          <div class="mt-4 space-y-2">
            <div class="flex items-center text-sm">
              <div
                class="w-4 h-4 rounded-full mr-2"
                :class="passwordChecks.length ? 'bg-green-500' : 'bg-gray-300'"
              ></div>
              <span :class="passwordChecks.length ? 'text-green-700' : 'text-gray-500'">
                {{ t('tools.passwordGenerator.checks.length') }}
              </span>
            </div>
            <div class="flex items-center text-sm">
              <div
                class="w-4 h-4 rounded-full mr-2"
                :class="passwordChecks.uppercase ? 'bg-green-500' : 'bg-gray-300'"
              ></div>
              <span :class="passwordChecks.uppercase ? 'text-green-700' : 'text-gray-500'">
                {{ t('tools.passwordGenerator.checks.uppercase') }}
              </span>
            </div>
            <div class="flex items-center text-sm">
              <div
                class="w-4 h-4 rounded-full mr-2"
                :class="passwordChecks.lowercase ? 'bg-green-500' : 'bg-gray-300'"
              ></div>
              <span :class="passwordChecks.lowercase ? 'text-green-700' : 'text-gray-500'">
                {{ t('tools.passwordGenerator.checks.lowercase') }}
              </span>
            </div>
            <div class="flex items-center text-sm">
              <div
                class="w-4 h-4 rounded-full mr-2"
                :class="passwordChecks.numbers ? 'bg-green-500' : 'bg-gray-300'"
              ></div>
              <span :class="passwordChecks.numbers ? 'text-green-700' : 'text-gray-500'">
                {{ t('tools.passwordGenerator.checks.numbers') }}
              </span>
            </div>
            <div class="flex items-center text-sm">
              <div
                class="w-4 h-4 rounded-full mr-2"
                :class="passwordChecks.symbols ? 'bg-green-500' : 'bg-gray-300'"
              ></div>
              <span :class="passwordChecks.symbols ? 'text-green-700' : 'text-gray-500'">
                {{ t('tools.passwordGenerator.checks.symbols') }}
              </span>
            </div>
            <div class="flex items-center text-sm">
              <div
                class="w-4 h-4 rounded-full mr-2"
                :class="passwordChecks.noCommon ? 'bg-green-500' : 'bg-gray-300'"
              ></div>
              <span :class="passwordChecks.noCommon ? 'text-green-700' : 'text-gray-500'">
                {{ t('tools.passwordGenerator.checks.noCommon') }}
              </span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-wrap gap-4 justify-center">
          <button
            @click="generatePassword"
            class="btn-primary"
          >
            {{ t('tools.passwordGenerator.generate') }}
          </button>
          <button
            @click="copyPassword"
            class="btn-secondary"
          >
            {{ t('common.copy') }}
          </button>
        </div>

        <!-- 批量生成 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">{{ t('tools.passwordGenerator.batchGeneration') }}</h3>
          <div class="flex items-end gap-4 mb-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('tools.passwordGenerator.batchCount') }}
              </label>
              <input
                type="number"
                v-model="batchCount"
                min="1"
                max="50"
                class="input-field"
              />
            </div>
            <button
              @click="generateBatch"
              class="btn-primary"
            >
              {{ t('tools.passwordGenerator.generateBatch') }}
            </button>
          </div>

          <div
            v-if="batchPasswords.length > 0"
            class="space-y-2"
          >
            <div
              v-for="(password, index) in batchPasswords"
              :key="index"
              class="flex items-center justify-between bg-gray-50 p-3 rounded"
            >
              <span class="font-mono text-sm">{{ password }}</span>
              <button
                @click="copyPassword(password)"
                class="btn-secondary text-sm px-3 py-1"
              >
                {{ t('common.copy') }}
              </button>
            </div>
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
            {{ t('tools.passwordGenerator.features.title') }}
          </h3>
          <ul class="space-y-2 text-blue-800">
            <li>✅ {{ t('tools.passwordGenerator.features.customize') }}</li>
            <li>✅ {{ t('tools.passwordGenerator.features.strength') }}</li>
            <li>✅ {{ t('tools.passwordGenerator.features.batch') }}</li>
            <li>✅ {{ t('tools.passwordGenerator.features.secure') }}</li>
            <li>✅ {{ t('tools.passwordGenerator.features.quick') }}</li>
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
  title: 'Password Generator',
  meta: [{ name: 'description', content: 'Generate strong and secure passwords' }]
})

// 工具函数
const { copyToClipboard } = useTools()

// 响应式数据
const passwordLength = ref(16)
const useUppercase = ref(true)
const useLowercase = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(true)
const generatedPassword = ref('')
const batchPasswords = ref([])
const batchCount = ref(5)
const statusMessage = ref('')
const statusType = ref('')

// 字符集
const charSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

// 常见弱密码列表
const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein']

// 状态样式
const statusClass = computed(() => {
  if (statusType.value === 'error') return 'bg-red-100 text-red-700 border border-red-200'
  if (statusType.value === 'success') return 'bg-green-100 text-green-700 border border-green-200'
  return 'bg-blue-100 text-blue-700 border border-blue-200'
})

// 密码强度分析
const passwordStrength = computed(() => {
  if (!generatedPassword.value) {
    return { score: 0, text: 'None', color: 'bg-gray-300', barColor: 'bg-gray-400', percentage: 0 }
  }

  let score = 0
  const password = generatedPassword.value

  // 长度评分
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // 字符类型评分
  if (useUppercase.value && /[A-Z]/.test(password)) score += 1
  if (useLowercase.value && /[a-z]/.test(password)) score += 1
  if (useNumbers.value && /[0-9]/.test(password)) score += 1
  if (useSymbols.value && /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1

  // 复杂度评分
  if (password.length >= 20 && score >= 6) score += 1

  const strengthLevels = [
    { max: 2, text: 'Very Weak', color: 'bg-red-500', barColor: 'bg-red-500', percentage: 20 },
    { max: 4, text: 'Weak', color: 'bg-orange-500', barColor: 'bg-orange-500', percentage: 40 },
    { max: 6, text: 'Fair', color: 'bg-yellow-500', barColor: 'bg-yellow-500', percentage: 60 },
    { max: 8, text: 'Good', color: 'bg-blue-500', barColor: 'bg-blue-500', percentage: 80 },
    { max: 10, text: 'Strong', color: 'bg-green-500', barColor: 'bg-green-500', percentage: 100 }
  ]

  return strengthLevels.find((level) => score <= level.max) || strengthLevels[strengthLevels.length - 1]
})

// 密码检查项
const passwordChecks = computed(() => {
  const password = generatedPassword.value
  return {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    noCommon: !commonPasswords.some((common) => password.toLowerCase().includes(common))
  }
})

// 生成单个密码
const generatePassword = () => {
  // 确保只在客户端执行以避免 SSR 问题
  if (!process.client) return

  let charset = ''
  if (useUppercase.value) charset += charSets.uppercase
  if (useLowercase.value) charset += charSets.lowercase
  if (useNumbers.value) charset += charSets.numbers
  if (useSymbols.value) charset += charSets.symbols

  if (!charset) {
    showStatus('Please select at least one character type', 'error')
    return
  }

  let password = ''
  for (let i = 0; i < passwordLength.value; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  generatedPassword.value = password
}

// 批量生成密码
const generateBatch = () => {
  // 确保只在客户端执行以避免 SSR 问题
  if (!process.client) return

  batchPasswords.value = []
  for (let i = 0; i < batchCount.value; i++) {
    let charset = ''
    if (useUppercase.value) charset += charSets.uppercase
    if (useLowercase.value) charset += charSets.lowercase
    if (useNumbers.value) charset += charSets.numbers
    if (useSymbols.value) charset += charSets.symbols

    if (!charset) {
      showStatus('Please select at least one character type', 'error')
      return
    }

    let password = ''
    for (let j = 0; j < passwordLength.value; j++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    batchPasswords.value.push(password)
  }
}

// 复制密码
const copyPassword = async (password = generatedPassword.value) => {
  if (!password) return

  const result = await copyToClipboard(password)
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

// 初始化 - 只在客户端生成密码以避免 SSR 水合不匹配
onMounted(() => {
  if (process.client) {
    generatePassword()
  }
})
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
