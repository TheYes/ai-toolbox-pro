<template>
  <div class="tool-container">
    <!-- 工具头部 -->
    <div class="tool-header">
      <NuxtLink :to="getLocalizedPath('/tools')" class="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Back to Tools
      </NuxtLink>
      <h1 class="tool-title">{{ $t('tools.passwordGenerator.name') }}</h1>
      <p class="tool-description">{{ $t('tools.passwordGenerator.description') }}</p>
    </div>

    <div class="tool-content">
      <!-- 密码设置 -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Password Settings</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- 长度设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Password Length: {{ passwordLength }}
            </label>
            <input
              v-model.number="passwordLength"
              type="range"
              min="4"
              max="64"
              class="w-full"
              @input="generatePassword"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>4</span>
              <span>64</span>
            </div>
          </div>

          <!-- 字符类型选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Character Types
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="useUppercase"
                  type="checkbox"
                  class="mr-2"
                  @change="generatePassword"
                />
                <span>Uppercase Letters (A-Z)</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="useLowercase"
                  type="checkbox"
                  class="mr-2"
                  @change="generatePassword"
                />
                <span>Lowercase Letters (a-z)</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="useNumbers"
                  type="checkbox"
                  class="mr-2"
                  @change="generatePassword"
                />
                <span>Numbers (0-9)</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="useSymbols"
                  type="checkbox"
                  class="mr-2"
                  @change="generatePassword"
                />
                <span>Symbols (!@#$%^&*)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 生成的密码 -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Generated Password</h2>
          <div class="space-x-2">
            <button @click="generatePassword" class="btn-primary text-sm px-3 py-1">
              Generate New
            </button>
            <button @click="copyPassword" class="btn-secondary text-sm px-3 py-1" :disabled="!generatedPassword">
              {{ $t('common.copy') }}
            </button>
          </div>
        </div>
        <div class="relative">
          <input
            :value="generatedPassword"
            readonly
            class="input-field pr-12"
            placeholder="Click 'Generate New' to create a password"
          />
          <div
            v-if="passwordStrength.score > 0"
            class="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <span
              class="px-2 py-1 text-xs rounded"
              :class="passwordStrength.color"
            >
              {{ passwordStrength.text }}
            </span>
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-600">
          {{ $t('common.length') }}: {{ generatedPassword.length }} {{ $t('common.characters') }}
        </div>
      </div>

      <!-- 密码强度指示器 -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Password Strength</h2>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-2">
              <span>Strength Level</span>
              <span>{{ passwordStrength.text }}</span>
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
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div class="flex items-center">
              <span
                class="mr-2"
                :class="passwordChecks.length ? 'text-green-600' : 'text-gray-400'"
              >
                {{ passwordChecks.length ? '✓' : '○' }}
              </span>
              <span>At least 12 characters</span>
            </div>
            <div class="flex items-center">
              <span
                class="mr-2"
                :class="passwordChecks.uppercase ? 'text-green-600' : 'text-gray-400'"
              >
                {{ passwordChecks.uppercase ? '✓' : '○' }}
              </span>
              <span>Contains uppercase</span>
            </div>
            <div class="flex items-center">
              <span
                class="mr-2"
                :class="passwordChecks.lowercase ? 'text-green-600' : 'text-gray-400'"
              >
                {{ passwordChecks.lowercase ? '✓' : '○' }}
              </span>
              <span>Contains lowercase</span>
            </div>
            <div class="flex items-center">
              <span
                class="mr-2"
                :class="passwordChecks.numbers ? 'text-green-600' : 'text-gray-400'"
              >
                {{ passwordChecks.numbers ? '✓' : '○' }}
              </span>
              <span>Contains numbers</span>
            </div>
            <div class="flex items-center">
              <span
                class="mr-2"
                :class="passwordChecks.symbols ? 'text-green-600' : 'text-gray-400'"
              >
                {{ passwordChecks.symbols ? '✓' : '○' }}
              </span>
              <span>Contains symbols</span>
            </div>
            <div class="flex items-center">
              <span
                class="mr-2"
                :class="passwordChecks.noCommon ? 'text-green-600' : 'text-gray-400'"
              >
                {{ passwordChecks.noCommon ? '✓' : '○' }}
              </span>
              <span>Not common password</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量生成 -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Batch Generation</h2>
          <div class="space-x-2">
            <input
              v-model.number="batchCount"
              type="number"
              min="1"
              max="20"
              class="input-field w-20 text-sm"
              placeholder="Count"
            />
            <button @click="generateBatch" class="btn-secondary text-sm px-3 py-1">
              Generate {{ batchCount }} Passwords
            </button>
          </div>
        </div>
        <div v-if="batchPasswords.length > 0" class="space-y-2">
          <div
            v-for="(password, index) in batchPasswords"
            :key="index"
            class="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <span class="font-mono text-sm">{{ password }}</span>
            <button @click="copyPassword(password)" class="btn-secondary text-xs px-2 py-1">
              {{ $t('common.copy') }}
            </button>
          </div>
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
          <li>✅ Customizable password length (4-64 characters)</li>
          <li>✅ Multiple character type options</li>
          <li>✅ Real-time password strength analysis</li>
          <li>✅ Batch password generation</li>
          <li>✅ Password strength indicator</li>
          <li>✅ Security checks and recommendations</li>
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
  title: 'Password Generator',
  meta: [
    { name: 'description', content: 'Generate strong and secure passwords' }
  ]
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

  return strengthLevels.find(level => score <= level.max) || strengthLevels[strengthLevels.length - 1]
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
    noCommon: !commonPasswords.some(common => password.toLowerCase().includes(common))
  }
})

// 生成单个密码
const generatePassword = () => {
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

// 初始化
generatePassword()
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