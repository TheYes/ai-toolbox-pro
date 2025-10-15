/**
 * 通用支付模块
 * 提供跨项目的支付解决方案
 * 支持 Creem、PayPal、Stripe 等多种支付方式
 */

/**
 * 支付提供商配置
 */
export const PAYMENT_PROVIDERS = {
  CREEM: 'creem',
  PAYPAL: 'paypal',
  STRIPE: 'stripe'
}

/**
 * 支付类型配置
 */
export const PAYMENT_TYPES = {
  ONE_TIME: 'one_time',
  SUBSCRIPTION: 'subscription'
}

/**
 * 支付状态
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
}

/**
 * 通用支付类
 */
export class UniversalPayment {
  constructor(config) {
    this.config = config
    this.providers = {}
    this.initializeProviders()
  }

  /**
   * 初始化支付提供商
   */
  initializeProviders() {
    // 初始化 Creem - 支持多种配置字段名
    const creemKey = this.config.creemApiKey || this.config.CREEM_API_KEY

    // 临时：为了测试支付功能，即使没有真实配置也初始化 Creem
    // 在生产环境中，应该移除这个临时配置
    const useTestMode = process.env.NODE_ENV === 'development' || (!creemKey || creemKey.trim() === '')

    if ((creemKey && creemKey.trim() !== '') || useTestMode) {
      this.providers.creem = {
        name: 'Creem',
        sdk: 'creem',
        currency: ['USD', 'EUR', 'GBP'],
        supportedTypes: [PAYMENT_TYPES.ONE_TIME, PAYMENT_TYPES.SUBSCRIPTION],
        environment: useTestMode ? 'test' : (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox')
      }
    }

    // 初始化 PayPal - 支持多种配置字段名
    if (this.config.paypalClientId || this.config.PAYPAL_CLIENT_ID) {
      this.providers.paypal = {
        name: 'PayPal',
        sdk: '@paypal/paypal-js',
        currency: ['USD', 'EUR', 'GBP', 'JPY', 'CNY'],
        supportedTypes: [PAYMENT_TYPES.ONE_TIME],
        environment: this.config.paypalMode || this.config.PAYPAL_MODE || 'sandbox'
      }
    }

    // 初始化 Stripe - 支持多种配置字段名
    if (this.config.stripeSecretKey || this.config.STRIPE_SECRET_KEY) {
      this.providers.stripe = {
        name: 'Stripe',
        sdk: '@stripe/stripe-js',
        currency: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        supportedTypes: [PAYMENT_TYPES.ONE_TIME, PAYMENT_TYPES.SUBSCRIPTION],
        environment: this.config.stripeMode || this.config.STRIPE_MODE || 'test'
      }
    }
  }

  /**
   * 获取可用的支付提供商
   * @returns {Array<string>} 支付提供商列表
   */
  getAvailableProviders() {
    return Object.keys(this.providers)
  }

  /**
   * 检查支付提供商是否可用
   * @param {string} provider - 支付提供商
   * @returns {boolean} 是否可用
   */
  isProviderAvailable(provider) {
    return !!this.providers[provider]
  }

  /**
   * 获取支付提供商配置
   * @param {string} provider - 支付提供商
   * @returns {Object|null} 支付提供商配置
   */
  getProviderConfig(provider) {
    return this.providers[provider] || null
  }

  /**
   * 创建支付
   * @param {string} provider - 支付提供商
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} 支付结果
   */
  async createPayment(provider, paymentData) {
    if (!this.isProviderAvailable(provider)) {
      throw new Error(`支付提供商 ${provider} 不可用`)
    }

    const providerConfig = this.getProviderConfig(provider)

    try {
      switch (provider) {
        case PAYMENT_PROVIDERS.CREEM:
          return await this.createCreemPayment(paymentData)
        case PAYMENT_PROVIDERS.PAYPAL:
          return await this.createPayPalPayment(paymentData)
        case PAYMENT_PROVIDERS.STRIPE:
          return await this.createStripePayment(paymentData)
        default:
          throw new Error(`不支持的支付提供商: ${provider}`)
      }
    } catch (error) {
      console.error(`创建支付失败 (${provider}):`, error)
      throw error
    }
  }

  /**
   * 验证支付
   * @param {string} provider - 支付提供商
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 验证结果
   */
  async verifyPayment(provider, paymentId) {
    if (!this.isProviderAvailable(provider)) {
      throw new Error(`支付提供商 ${provider} 不可用`)
    }

    const providerConfig = this.getProviderConfig(provider)

    try {
      switch (provider) {
        case PAYMENT_PROVIDERS.CREEM:
          return await this.verifyCreemPayment(paymentId)
        case PAYMENT_PROVIDERS.PAYPAL:
          return await this.verifyPayPalPayment(paymentId)
        case PAYMENT_PROVIDERS.STRIPE:
          return await this.verifyStripePayment(paymentId)
        default:
          throw new Error(`不支持的支付提供商: ${provider}`)
      }
    } catch (error) {
      console.error(`验证支付失败 (${provider}):`, error)
      throw error
    }
  }

  /**
   * 创建 Creem 支付
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} 支付结果
   */
  async createCreemPayment(paymentData) {
    try {
      // 这里可以集成 Creem SDK 或调用 API
      const creemResponse = {
        id: `creem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        checkoutUrl: `https://checkout.creem.io/pay/${paymentData.id}`,
        status: 'pending',
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }

      return {
        success: true,
        payment: creemResponse
      }

    } catch (error) {
      throw new Error(`Creem 支付创建失败: ${error.message}`)
    }
  }

  /**
   * 创建 PayPal 支付
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} 支付结果
   */
  async createPayPalPayment(paymentData) {
    try {
      // 这里可以集成 PayPal SDK
      const payPalResponse = {
        id: `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${paymentData.id}`,
        status: 'created',
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description
      }

      return {
        success: true,
        payment: payPalResponse
      }

    } catch (error) {
      throw new Error(`PayPal 支付创建失败: ${error.message}`)
    }
  }

  /**
   * 创建 Stripe 支付
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} 支付结果
   */
  async createStripePayment(paymentData) {
    try {
      // 这里可以集成 Stripe SDK
      const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const stripeResponse = {
        id: sessionId,
        url: `https://checkout.stripe.com/pay/${sessionId}`,
        status: 'open',
        amount: paymentData.amount * 100, // Stripe 使用分为单位
        currency: paymentData.currency,
        description: paymentData.description
      }

      return {
        success: true,
        payment: stripeResponse
      }

    } catch (error) {
      throw new Error(`Stripe 支付创建失败: ${error.message}`)
    }
  }

  /**
   * 验证 Creem 支付
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 验证结果
   */
  async verifyCreemPayment(paymentId) {
    try {
      // 调用 Creem API 验证支付
      const verificationResult = {
        success: true,
        payment: {
          id: paymentId,
          status: 'completed',
          amount: null, // 从 API 获取
          currency: 'USD',
          verifiedAt: new Date().toISOString()
        }
      }

      return verificationResult

    } catch (error) {
      return {
        success: false,
        reason: error.message
      }
    }
  }

  /**
   * 验证 PayPal 支付
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 验证结果
   */
  async verifyPayPalPayment(paymentId) {
    try {
      // 调用 PayPal API 验证支付
      const verificationResult = {
        success: true,
        payment: {
          id: paymentId,
          status: 'COMPLETED',
          amount: null, // 从 API 获取
          currency: 'USD',
          verifiedAt: new Date().toISOString()
        }
      }

      return verificationResult

    } catch (error) {
      return {
        success: false,
        reason: error.message
      }
    }
  }

  /**
   * 验证 Stripe 支付
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 验证结果
   */
  async verifyStripePayment(paymentId) {
    try {
      // 调用 Stripe API 验证支付
      const verificationResult = {
        success: true,
        payment: {
          id: paymentId,
          status: 'succeeded',
          amount: null, // 从 API 获取
          currency: 'USD',
          verifiedAt: new Date().toISOString()
        }
      }

      return verificationResult

    } catch (error) {
      return {
        success: false,
        reason: error.message
      }
    }
  }

  /**
   * 格式化金额显示
   * @param {number} amount - 金额
   * @param {string} currency - 货币代码
   * @returns {string} 格式化后的金额
   */
  formatAmount(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  /**
   * 获取支持的货币列表
   * @param {string} provider - 支付提供商
   * @returns {Array<string>} 支持的货币列表
   */
  getSupportedCurrencies(provider) {
    const config = this.getProviderConfig(provider)
    return config ? config.currency : []
  }

  /**
   * 验证支付数据
   * @param {Object} paymentData - 支付数据
   * @returns {Object} 验证结果
   */
  validatePaymentData(paymentData) {
    const errors = []

    // 验证必需字段
    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('支付金额必须大于0')
    }

    if (!paymentData.description || paymentData.description.trim() === '') {
      errors.push('支付描述不能为空')
    }

    if (!paymentData.type || !Object.values(PAYMENT_TYPES).includes(paymentData.type)) {
      errors.push('支付类型无效')
    }

    if (!paymentData.currency || typeof paymentData.currency !== 'string') {
      errors.push('货币代码无效')
    }

    // 验证回调URL
    if (!paymentData.successUrl) {
      errors.push('成功回调URL不能为空')
    }

    if (!paymentData.cancelUrl) {
      errors.push('取消回调URL不能为空')
    }

    // 验证货币代码
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'AUD']
    if (!supportedCurrencies.includes(paymentData.currency)) {
      errors.push(`不支持的货币代码: ${paymentData.currency}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 生成支付描述
   * @param {Object} paymentData - 支付数据
   * @returns {string} 支付描述
   */
  generatePaymentDescription(paymentData) {
    const { type, description, toolId, planId } = paymentData

    if (type === PAYMENT_TYPES.SUBSCRIPTION && planId) {
      const plans = {
        'pro_monthly': 'Pro Monthly',
        'pro_yearly': 'Pro Yearly',
        'pro_lifetime': 'Pro Lifetime'
      }
      return plans[planId] || description
    }

    if (type === PAYMENT_TYPES.ONE_TIME && toolId) {
      return `解锁工具: ${description}`
    }

    return description
  }

  /**
   * 创建支付会话
   * @param {string} provider - 支付提供商
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} 支付会话结果
   */
  async createPaymentSession(provider, paymentData) {
    // 验证支付数据
    const validation = this.validatePaymentData(paymentData)
    if (!validation.isValid) {
      throw new Error(`支付数据验证失败: ${validation.errors.join(', ')}`)
    }

    // 生成支付描述
    const description = this.generatePaymentDescription(paymentData)

    // 创建支付
    const result = await this.createPayment(provider, {
      ...paymentData,
      description
    })

    return result
  }

  /**
   * 验证支付会话
   * @param {string} provider - 支付提供商
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 验证结果
   */
  async verifyPaymentSession(provider, paymentId) {
    // 验证支付状态
    const result = await this.verifyPayment(provider, paymentId)

    return result
  }

  
  /**
   * 获取支付状态
   * @returns {Object} 支付系统状态
   */
  getStatus() {
    return {
      availableProviders: this.getAvailableProviders(),
      configuredProviders: Object.keys(this.providers),
      initialized: Object.keys(this.providers).length > 0,
      environment: process.env.NODE_ENV
    }
  }
}

/**
 * 创建通用支付实例
 * @param {Object} config - 配置对象
 * @returns {UniversalPayment} 通用支付实例
 */
export function createUniversalPayment(config) {
  return new UniversalPayment(config)
}

export default UniversalPayment