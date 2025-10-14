/**
 * 支付状态管理
 * 管理支付流程、订阅状态和用户支付历史
 */

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    // 支付状态
    isLoading: false,
    paymentModalVisible: false,

    // 当前支付信息
    currentPayment: {
      amount: 0,
      currency: 'USD',
      description: '',
      type: 'one_time', // 'one_time' | 'subscription'
      planId: null,
      toolId: null
    },

    // 支付方式
    paymentMethod: 'creem', // 'creem' | 'paypal'

    // 用户订阅状态
    subscription: {
      isActive: false,
      planId: null,
      status: 'inactive', // 'active' | 'inactive' | 'cancelled' | 'past_due'
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false
    },

    // 支付历史
    paymentHistory: [],

    // 错误信息
    error: null,

    // 成功信息
    successMessage: null
  }),

  getters: {
    // 检查用户是否有有效订阅
    hasActiveSubscription: (state) => {
      return state.subscription.isActive &&
             state.subscription.status === 'active' &&
             new Date(state.subscription.currentPeriodEnd) > new Date()
    },

    // 获取订阅剩余天数
    subscriptionDaysLeft: (state) => {
      if (!state.subscription.currentPeriodEnd) return 0
      const now = new Date()
      const endDate = new Date(state.subscription.currentPeriodEnd)
      const diffTime = endDate - now
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },

    // 获取最近的支付记录
    recentPayments: (state) => {
      return state.paymentHistory.slice(0, 10)
    },

    // 检查特定工具是否已解锁
    isToolUnlocked: (state) => (toolId) => {
      // 如果有有效订阅，所有工具都解锁
      if (state.subscription.isActive && state.subscription.status === 'active') {
        return true
      }

      // 检查单独购买的工具
      const payment = state.paymentHistory.find(p =>
        p.toolId === toolId &&
        p.status === 'completed' &&
        p.type === 'one_time'
      )

      return !!payment
    }
  },

  actions: {
    // 显示支付弹窗
    showPaymentModal(paymentData) {
      this.currentPayment = {
        amount: paymentData.amount || 0,
        currency: paymentData.currency || 'USD',
        description: paymentData.description || '',
        type: paymentData.type || 'one_time',
        planId: paymentData.planId || null,
        toolId: paymentData.toolId || null
      }
      this.paymentModalVisible = true
      this.error = null
    },

    // 隐藏支付弹窗
    hidePaymentModal() {
      this.paymentModalVisible = false
      this.currentPayment = {
        amount: 0,
        currency: 'USD',
        description: '',
        type: 'one_time',
        planId: null,
        toolId: null
      }
    },

    // 设置支付方式
    setPaymentMethod(method) {
      this.paymentMethod = method
    },

    // 开始支付
    async startPayment() {
      this.isLoading = true
      this.error = null

      try {
        const response = await $fetch('/api/pay/create', {
          method: 'POST',
          body: {
            ...this.currentPayment,
            paymentMethod: this.paymentMethod,
            successUrl: `${window.location.origin}/payment/success`,
            cancelUrl: `${window.location.origin}/payment/cancel`
          }
        })

        return response
      } catch (error) {
        this.error = error.message || '支付创建失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 支付成功处理
    async handlePaymentSuccess(paymentData) {
      this.isLoading = true

      try {
        // 更新支付历史
        await this.fetchPaymentHistory()

        // 如果是订阅，更新订阅状态
        if (paymentData.type === 'subscription') {
          await this.fetchSubscriptionStatus()
        }

        this.successMessage = '支付成功！'
        this.hidePaymentModal()

        // 3秒后清除成功消息
        setTimeout(() => {
          this.successMessage = null
        }, 3000)

      } catch (error) {
        this.error = '支付验证失败，请联系客服'
      } finally {
        this.isLoading = false
      }
    },

    // 获取订阅状态
    async fetchSubscriptionStatus() {
      try {
        const response = await $fetch('/api/pay/subscription/status')
        this.subscription = response.subscription
      } catch (error) {
        console.error('获取订阅状态失败:', error)
      }
    },

    // 获取支付历史
    async fetchPaymentHistory() {
      try {
        const response = await $fetch('/api/pay/history')
        this.paymentHistory = response.payments || []
      } catch (error) {
        console.error('获取支付历史失败:', error)
      }
    },

    // 取消订阅
    async cancelSubscription() {
      this.isLoading = true

      try {
        await $fetch('/api/pay/subscription/cancel', {
          method: 'POST'
        })

        await this.fetchSubscriptionStatus()
        this.successMessage = '订阅已取消'

        setTimeout(() => {
          this.successMessage = null
        }, 3000)

      } catch (error) {
        this.error = '取消订阅失败'
      } finally {
        this.isLoading = false
      }
    },

    // 恢复订阅
    async resumeSubscription() {
      this.isLoading = true

      try {
        await $fetch('/api/pay/subscription/resume', {
          method: 'POST'
        })

        await this.fetchSubscriptionStatus()
        this.successMessage = '订阅已恢复'

        setTimeout(() => {
          this.successMessage = null
        }, 3000)

      } catch (error) {
        this.error = '恢复订阅失败'
      } finally {
        this.isLoading = false
      }
    },

    // 清除错误信息
    clearError() {
      this.error = null
    },

    // 清除成功信息
    clearSuccess() {
      this.successMessage = null
    }
  }
})