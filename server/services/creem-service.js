/**
 * Creem 支付服务
 * 使用官方 Creem SDK 进行支付处理
 */

import { Creem } from 'creem'

class CreemService {
  constructor(config) {
    this.config = config
    this.client = null
    this.initialize()
  }

  /**
   * 初始化 Creem 客户端
   */
  initialize() {
    try {
      if (!this.config.creemApiKey) {
        console.warn('Creem API Key 未配置')
        return
      }

      this.client = new Creem({
        apiKey: this.config.creemApiKey,
        secretKey: this.config.creemSecretKey,
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
      })

      console.log('Creem 客户端初始化成功')
    } catch (error) {
      console.error('Creem 客户端初始化失败:', error)
      throw new Error('Creem SDK 初始化失败')
    }
  }

  /**
   * 创建支付会话
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} 支付结果
   */
  async createPayment(paymentData) {
    try {
      if (!this.client) {
        throw new Error('Creem 客户端未初始化')
      }

      const {
        amount,
        currency = 'USD',
        description,
        type = 'one_time',
        successUrl,
        cancelUrl,
        metadata = {}
      } = paymentData

      // 验证必需参数
      if (!amount || amount <= 0) {
        throw new Error('支付金额必须大于0')
      }

      if (!description || description.trim() === '') {
        throw new Error('支付描述不能为空')
      }

      if (!successUrl) {
        throw new Error('成功回调URL不能为空')
      }

      if (!cancelUrl) {
        throw new Error('取消回调URL不能为空')
      }

      // 构建支付请求
      const paymentRequest = {
        amount: Math.round(amount * 100), // Creem 使用分为单位
        currency: currency.toUpperCase(),
        description: description.trim(),
        metadata: {
          ...metadata,
          type: type,
          createdAt: new Date().toISOString()
        },
        returnUrl: successUrl,
        cancelUrl: cancelUrl
      }

      // 如果是订阅，添加订阅相关参数
      if (type === 'subscription') {
        paymentRequest.subscription = {
          interval: 'month', // 或 'year', 'week'
          trialPeriodDays: 0
        }
      }

      // 创建支付
      const payment = await this.client.payments.create(paymentRequest)

      console.log('Creem 支付创建成功:', payment.id)

      return {
        success: true,
        payment: {
          id: payment.id,
          checkoutUrl: payment.checkoutUrl,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          description: paymentRequest.description,
          status: payment.status,
          expiresAt: payment.expiresAt,
          metadata: paymentRequest.metadata
        }
      }

    } catch (error) {
      console.error('Creem 支付创建失败:', error)
      throw new Error(`Creem 支付创建失败: ${error.message}`)
    }
  }

  /**
   * 验证支付状态
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 验证结果
   */
  async verifyPayment(paymentId) {
    try {
      if (!this.client) {
        throw new Error('Creem 客户端未初始化')
      }

      // 获取支付详情
      const payment = await this.client.payments.retrieve(paymentId)

      console.log('Creem 支付验证结果:', {
        id: payment.id,
        status: payment.status,
        amount: payment.amount
      })

      return {
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount / 100, // 转换回元
          currency: payment.currency,
          description: payment.description,
          metadata: payment.metadata,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          completedAt: payment.completedAt
        }
      }

    } catch (error) {
      console.error('Creem 支付验证失败:', error)
      return {
        success: false,
        error: error.message,
        payment: null
      }
    }
  }

  /**
   * 创建订阅
   * @param {Object} subscriptionData - 订阅数据
   * @returns {Promise<Object>} 订阅结果
   */
  async createSubscription(subscriptionData) {
    try {
      if (!this.client) {
        throw new Error('Creem 客户端未初始化')
      }

      const {
        planId,
        amount,
        currency = 'USD',
        description,
        interval = 'month',
        trialPeriodDays = 0,
        successUrl,
        cancelUrl,
        metadata = {}
      } = subscriptionData

      // 构建订阅请求
      const subscriptionRequest = {
        planId: planId,
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        description: description.trim(),
        interval: interval,
        trialPeriodDays: trialPeriodDays,
        metadata: {
          ...metadata,
          type: 'subscription',
          createdAt: new Date().toISOString()
        },
        returnUrl: successUrl,
        cancelUrl: cancelUrl
      }

      const subscription = await this.client.subscriptions.create(subscriptionRequest)

      console.log('Creem 订阅创建成功:', subscription.id)

      return {
        success: true,
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          status: subscription.status,
          amount: subscription.amount / 100,
          currency: subscription.currency,
          interval: subscription.interval,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          checkoutUrl: subscription.checkoutUrl
        }
      }

    } catch (error) {
      console.error('Creem 订阅创建失败:', error)
      throw new Error(`Creem 订阅创建失败: ${error.message}`)
    }
  }

  /**
   * 取消订阅
   * @param {string} subscriptionId - 订阅ID
   * @returns {Promise<Object>} 取消结果
   */
  async cancelSubscription(subscriptionId) {
    try {
      if (!this.client) {
        throw new Error('Creem 客户端未初始化')
      }

      const subscription = await this.client.subscriptions.cancel(subscriptionId)

      console.log('Creem 订阅取消成功:', subscriptionId)

      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          canceledAt: subscription.canceledAt
        }
      }

    } catch (error) {
      console.error('Creem 订阅取消失败:', error)
      throw new Error(`Creem 订阅取消失败: ${error.message}`)
    }
  }

  /**
   * 获取支付历史
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 支付历史
   */
  async getPaymentHistory(options = {}) {
    try {
      if (!this.client) {
        throw new Error('Creem 客户端未初始化')
      }

      const { limit = 10, startingAfter, endingBefore } = options

      const payments = await this.client.payments.list({
        limit,
        startingAfter,
        endingBefore
      })

      return {
        success: true,
        payments: payments.data.map(payment => ({
          id: payment.id,
          amount: payment.amount / 100,
          currency: payment.currency,
          description: payment.description,
          status: payment.status,
          metadata: payment.metadata,
          createdAt: payment.createdAt
        })),
        hasMore: payments.hasMore,
        total: payments.total
      }

    } catch (error) {
      console.error('获取支付历史失败:', error)
      return {
        success: false,
        error: error.message,
        payments: []
      }
    }
  }

  /**
   * 验证 Webhook 签名
   * @param {Object} payload - Webhook 载荷
   * @param {string} signature - 签名
   * @returns {boolean} 验证结果
   */
  verifyWebhookSignature(payload, signature) {
    try {
      if (!this.config.creemWebhookSecret) {
        console.warn('Creem Webhook Secret 未配置，跳过签名验证')
        return true // 如果没有配置密钥，选择信任请求
      }

      // 这里需要根据 Creem 的实际签名验证规则来实现
      // 由于官方文档可能提供不同的验证方法，这里提供一个基础实现
      const crypto = require('crypto')

      const expectedSignature = crypto
        .createHmac('sha256', this.config.creemWebhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex')

      return signature === expectedSignature

    } catch (error) {
      console.error('Webhook 签名验证失败:', error)
      return false
    }
  }

  /**
   * 获取客户端状态
   * @returns {Object} 客户端状态
   */
  getStatus() {
    return {
      initialized: !!this.client,
      configured: !!this.config.creemApiKey,
      environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
    }
  }
}

// 单例模式
let creemServiceInstance = null

/**
 * 获取 Creem 服务实例
 * @param {Object} config - 配置对象
 * @returns {CreemService} Creem 服务实例
 */
export function getCreemService(config) {
  if (!creemServiceInstance) {
    creemServiceInstance = new CreemService(config)
  }
  return creemServiceInstance
}

export default CreemService