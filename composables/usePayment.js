/**
 * 支付相关工具函数
 * 提供统一的支付接口和工具方法
 */

export const usePayment = () => {
  const paymentStore = usePaymentStore()
  const { $i18n } = useNuxtApp()

  // 支付计划配置
  const pricingPlans = {
    monthly: {
      id: 'pro_monthly',
      name: 'Pro Monthly',
      price: 9.99,
      currency: 'USD',
      features: [
        '无限制使用所有工具',
        '优先客服支持',
        '云端同步设置',
        '去除广告'
      ],
      badge: '最受欢迎'
    },
    yearly: {
      id: 'pro_yearly',
      name: 'Pro Yearly',
      price: 79.99,
      currency: 'USD',
      features: [
        '无限制使用所有工具',
        '优先客服支持',
        '云端同步设置',
        '去除广告',
        '节省33%费用'
      ],
      badge: '最优惠'
    },
    lifetime: {
      id: 'pro_lifetime',
      name: 'Pro Lifetime',
      price: 299.99,
      currency: 'USD',
      features: [
        '终身无限制使用',
        '所有未来功能更新',
        '优先客服支持',
        '云端同步设置',
        '永久去除广告'
      ],
      badge: '限时优惠'
    }
  }

  // 工具解锁价格
  const toolUnlockPrice = 4.99

  /**
   * 显示订阅支付弹窗
   */
  const showSubscriptionPayment = (planId) => {
    // 根据 planId 查找对应的计划
    let plan = null
    for (const key in pricingPlans) {
      if (pricingPlans[key].id === planId) {
        plan = pricingPlans[key]
        break
      }
    }

    if (!plan) {
      console.error('未找到订阅计划:', planId)
      return
    }

    paymentStore.showPaymentModal({
      amount: plan.price,
      currency: plan.currency,
      description: plan.name,
      type: 'subscription',
      planId: plan.id
    })
  }

  /**
   * 显示工具解锁支付弹窗
   */
  const showToolUnlockPayment = (toolId, toolName) => {
    paymentStore.showPaymentModal({
      amount: toolUnlockPrice,
      currency: 'USD',
      description: `解锁 ${toolName}`,
      type: 'one_time',
      toolId: toolId
    })
  }

  /**
   * 格式化价格显示
   */
  const formatPrice = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  /**
   * 格式化订阅周期显示
   */
  const formatBillingPeriod = (planId) => {
    const periods = {
      monthly: '月付',
      yearly: '年付',
      lifetime: '终身'
    }
    return periods[planId] || planId
  }

  /**
   * 检查工具是否需要付费
   */
  const isToolPremium = (toolId) => {
    // 这里可以配置哪些工具是付费的
    const premiumTools = [
      'advanced-json-formatter',
      'batch-processor',
      'custom-theme-editor'
    ]
    return premiumTools.includes(toolId)
  }

  /**
   * 获取工具的付费状态
   */
  const getToolPaymentStatus = (toolId) => {
    if (!isToolPremium(toolId)) {
      return {
        needsPayment: false,
        isUnlocked: true,
        canAccess: true
      }
    }

    const isUnlocked = paymentStore.isToolUnlocked(toolId)
    const hasSubscription = paymentStore.hasActiveSubscription

    return {
      needsPayment: !isUnlocked && !hasSubscription,
      isUnlocked: isUnlocked || hasSubscription,
      canAccess: isUnlocked || hasSubscription
    }
  }

  /**
   * 获取支付方式图标
   */
  const getPaymentMethodIcon = (method) => {
    const icons = {
      creem: '💳',
      paypal: '🅿️',
      stripe: '🔷'
    }
    return icons[method] || '💳'
  }

  /**
   * 生成支付描述
   */
  const generatePaymentDescription = (paymentData) => {
    const { type, description, toolId, planId } = paymentData

    if (type === 'subscription') {
      const plan = pricingPlans[planId]
      return plan ? `${plan.name} 订阅` : description
    }

    if (type === 'one_time' && toolId) {
      return `解锁工具: ${description}`
    }

    return description
  }

  /**
   * 验证支付数据
   */
  const validatePaymentData = (paymentData) => {
    const errors = []

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('支付金额必须大于0')
    }

    if (!paymentData.description || paymentData.description.trim() === '') {
      errors.push('支付描述不能为空')
    }

    if (!['one_time', 'subscription'].includes(paymentData.type)) {
      errors.push('支付类型无效')
    }

    if (paymentData.type === 'subscription' && !paymentData.planId) {
      errors.push('订阅计划ID不能为空')
    }

    if (paymentData.type === 'one_time' && !paymentData.toolId) {
      errors.push('工具ID不能为空')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 处理支付回跳
   */
  const handlePaymentRedirect = async () => {
    const route = useRoute()
    const query = route.query

    if (query.payment_id || query.session_id) {
      try {
        // 验证支付状态
        const response = await $fetch('/api/pay/verify', {
          method: 'POST',
          body: {
            paymentId: query.payment_id || query.session_id,
            type: query.type || 'creem'
          }
        })

        if (response.success) {
          await paymentStore.handlePaymentSuccess(response.payment)

          // 重定向到成功页面，清除URL参数
          await navigateTo('/payment/success', {
            replace: true
          })
        } else {
          // 重定向到失败页面
          await navigateTo('/payment/failed', {
            replace: true,
            query: { error: response.error }
          })
        }
      } catch (error) {
        console.error('支付验证失败:', error)
        await navigateTo('/payment/failed', {
          replace: true,
          query: { error: '支付验证失败' }
        })
      }
    }
  }

  /**
   * 初始化支付功能
   */
  const initializePayment = async () => {
    // 获取用户订阅状态
    await paymentStore.fetchSubscriptionStatus()

    // 获取支付历史
    await paymentStore.fetchPaymentHistory()

    // 处理支付回跳
    await handlePaymentRedirect()
  }

  return {
    // 数据
    pricingPlans,
    toolUnlockPrice,

    // 方法
    showSubscriptionPayment,
    showToolUnlockPayment,
    formatPrice,
    formatBillingPeriod,
    isToolPremium,
    getToolPaymentStatus,
    getPaymentMethodIcon,
    generatePaymentDescription,
    validatePaymentData,
    initializePayment,

    // Store 访问
    paymentStore
  }
}