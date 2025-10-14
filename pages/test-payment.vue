<template>
  <div class="min-h-screen bg-gray-50 py-16">
    <div class="container mx-auto px-6">
      <h1 class="text-3xl font-bold text-center mb-8">支付功能测试</h1>

      <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">支付功能状态</h2>

        <div class="space-y-4">
          <div class="flex justify-between">
            <span>支付状态:</span>
            <span class="font-medium">{{ paymentStore.paymentModalVisible ? '显示' : '隐藏' }}</span>
          </div>

          <div class="flex justify-between">
            <span>当前支付方式:</span>
            <span class="font-medium">{{ paymentStore.paymentMethod }}</span>
          </div>

          <div class="flex justify-between">
            <span>订阅状态:</span>
            <span class="font-medium">{{ paymentStore.hasActiveSubscription ? '活跃' : '未订阅' }}</span>
          </div>

          <div class="flex justify-between">
            <span>订阅剩余天数:</span>
            <span class="font-medium">{{ paymentStore.subscriptionDaysLeft }} 天</span>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <button
            @click="testShowPaymentModal"
            class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
          >
            显示支付模态框
          </button>

          <button
            @click="testSubscriptionPayment"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            测试订阅支付 ($9.99)
          </button>

          <button
            @click="testToolPayment"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            测试工具解锁 ($4.99)
          </button>
        </div>

        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-2">测试结果</h3>
          <div class="bg-gray-50 p-4 rounded">
            <pre>{{ testResults }}</pre>
          </div>
        </div>
      </div>

      <!-- 支付模态框 -->
      <PaymentModal />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const paymentStore = usePaymentStore()
const testResults = ref('')

// 测试方法
const testShowPaymentModal = () => {
  paymentStore.showPaymentModal({
    amount: 19.99,
    description: '测试支付',
    type: 'one_time'
  })
  testResults.value = '显示支付模态框成功'
}

const testSubscriptionPayment = () => {
  paymentStore.showSubscriptionPayment('monthly')
  testResults.value = '显示订阅支付成功'
}

const testToolPayment = () => {
  paymentStore.showToolUnlockPayment('test-tool', '测试工具')
  testResults.value = '显示工具解锁支付成功'
}

// 页面标题
useHead({
  title: 'Payment Test - AI Toolbox Pro'
})
</script>