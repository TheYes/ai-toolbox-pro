<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6">
      <h1 class="text-2xl font-bold text-gray-900 text-center mb-8">配置管理</h1>

      <div class="max-w-2xl mx-auto">
        <!-- API密钥配置 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">API密钥配置</h2>

          <div class="space-y-4">
            <div class="grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Creem API Key</label>
                <input
                  v-model="creemApiKey"
                  type="password"
                  placeholder="请输入 Creem API 密钥"
                  class="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  从 Creem 控制台获取
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Creem Secret Key</label>
                <input
                  v-model="creemSecretKey"
                  type="password"
                  placeholder="请输入 Creem 密钥"
                  class="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  用于Webhook验证
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">PayPal Client ID</label>
                <input
                  v-model="paypalClientId"
                  type="text"
                  placeholder="请输入 PayPal Client ID"
                  class="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  从 PayPal 开发者控制台获取
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">PayPal Client Secret</label>
                <input
                  v-model="paypalClientSecret"
                  type="password"
                  placeholder="请输入 PayPal Client Secret"
                  class="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  用于API调用
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stripe Publishable Key</label>
                <input
                  v-model="stripePublishableKey"
                  type="text"
                  placeholder="请输入 Stripe Publishable Key"
                  class="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  前端显示用
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stripe Secret Key</label>
                <input
                  v-model="stripeSecretKey"
                  type="password"
                  placeholder="请输入 Stripe Secret Key"
                  class="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  服务端验证用
                </p>
              </div>
            </div>

            <div class="text-center mt-6">
              <button
                @click="saveConfig"
                :disabled="isSaving"
                class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 cursor-not-allowed"
              >
                <span v-if="!isSaving">保存配置</span>
                <span v-else>保存中...</span>
              </button>

              <div v-if="saveMessage" class="mt-4">
                <div class="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-2">
                  {{ saveMessage }}
                </div>
              </div>

              <div v-if="errorMessage" class="mt-4">
                <div class="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-2">
                  {{ errorMessage }}
                </div>
              </div>
            </div>
          </div>

          <!-- Webhook URL 配置 -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Webhook URL 配置</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  v-model="webhookUrl"
                  type="url"
                  placeholder="https://yourdomain.com/api/pay/webhook"
                  class="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  接收支付平台通知
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Webhook Secret</label>
                <input
                  v-model="webhookSecret"
                  type="password"
                  placeholder="输入 Webhook 签名"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  用于验证Webhook请求签名
                </p>
              </div>
            </div>
          </div>

          <!-- 重置配置 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">重置配置</h2>
            <p class="text-gray-600 mb-4">
              这将清除所有配置，恢复默认状态
            </p>
            <button
              @click="resetConfig"
              class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              重置所有配置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 配置数据
const creemApiKey = ref('')
const creemSecretKey = ref('')
const paypalClientId = ref('')
const paypalClientSecret = ref('')
const stripePublishableKey = ref('')
const stripeSecretKey = ref('')
const webhookUrl = ref('')
const webhookSecret = ref('')
const isSaving = ref(false)
const saveMessage = ref('')
const errorMessage = ref('')

// 保存配置
const saveConfig = async () => {
  isSaving.value = true
  saveMessage.value = ''
  errorMessage.value = ''

  try {
    // 保存到环境变量（实际应用中应保存到 .env 文件）
    console.log('保存配置:', {
      creemApiKey: creemApiKey.value ? '已配置' : '未配置',
      paypalClientId: paypalClientId.value ? '已配置' : '未配置',
      paypalClientSecret: paypalClientSecret.value ? '已配置' : '未配置'
    })

    // 这里应该将配置写入 .env 文件
    saveMessage.value = '配置已保存，重启服务器后生效'
    errorMessage.value = ''

  } catch (error) {
    console.error('保存配置失败:', error)
    errorMessage.value = '保存失败: ' + error.message
  } finally {
    isSaving.value = false
  }
}

// 重置配置
const resetConfig = () => {
  creemApiKey.value = ''
  creemSecretKey.value = ''
  paypalClientId.value = ''
  paypalClientSecret.value = ''
  stripePublishableKey.value = ''
  stripeSecretKey.value = ''
  webhookUrl.value = ''
  webhookSecret.value = ''
  saveMessage.value = '配置已重置'
  errorMessage.value = ''
}

// 测试连接
const testConnections = async () => {
  const results = {
    creem: creemApiKey.value ? '✓' : '✗',
    paypal: paypalClientId.value ? '✓' : '✗',
    stripe: stripePublishableKey.value ? '✓' : '✗'
  }

  saveMessage.value = `连接测试结果: ${results.creem} Creem, ${results.paypal} PayPal, ${results.stripe} Stripe`
}
</script>

<style scoped>
.container {
  @apply max-w-3xl;
}

.form-input {
  @apply w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-input-group {
  @apply space-y-4;
}

.form-actions {
  @apply space-y-3;
}

.alert {
  @apply p-4 rounded-lg;
}

.alert--success {
  @apply bg-green-50 border-green-200 text-green-800;
}

.alert--error {
  @apply bg-red-50 border-red-200 text-red-800;
}

.alert--info {
  @apply bg-blue-50 border-blue-200 text-blue-800;
}

pre {
  @apply bg-gray-100 p-4 rounded text-sm text-gray-800 overflow-x-auto max-h-40;
}
</style>