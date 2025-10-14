/**
 * 支付 Webhook 处理接口
 * 处理来自 Creem、PayPal 等支付平台的 Webhook 通知
 */

import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const headers = getHeaders(event)
    const body = await readBody(event)

    // 获取 Webhook 签名
    const signature = headers['x-creem-signature'] || headers['x-paypal-signature'] || headers['stripe-signature']

    // 验证 Webhook 来源
    if (!verifyWebhookSignature(body, signature, config)) {
      console.warn('Webhook 签名验证失败:', {
        signature: signature?.substring(0, 20) + '...',
        headers: Object.keys(headers)
      })

      throw createError({
        statusCode: 401,
        statusMessage: 'Webhook 签名验证失败'
      })
    }

    // 确定支付平台类型
    const paymentType = detectPaymentType(headers)

    // 处理不同类型的 Webhook 事件
    let result
    switch (paymentType) {
      case 'creem':
        result = await handleCreemWebhook(body, config)
        break
      case 'paypal':
        result = await handlePayPalWebhook(body, config)
        break
      case 'stripe':
        result = await handleStripeWebhook(body, config)
        break
      default:
        console.warn('未知的 Webhook 类型:', Object.keys(headers))
        throw createError({
          statusCode: 400,
          statusMessage: '未知的 Webhook 类型'
        })
    }

    // 记录 Webhook 事件
    await logWebhookEvent(paymentType, body, result)

    return {
      success: true,
      received: true,
      type: paymentType,
      processed: result.processed
    }

  } catch (error) {
    console.error('Webhook 处理失败:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Webhook 处理失败'
    })
  }
})

/**
 * 验证 Webhook 签名
 */
function verifyWebhookSignature(payload, signature, config) {
  try {
    if (!signature) {
      console.warn('Webhook 缺少签名')
      return false
    }

    // 这里需要根据不同支付平台的签名验证规则进行调整
    // 目前只是简单的验证逻辑

    // Creem 签名验证
    if (signature.startsWith('creem_') && config.creemWebhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', config.creemWebhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex')

      return crypto.timingSafeEqual(
        Buffer.from(signature.split('_')[1]),
        Buffer.from(expectedSignature)
      )
    }

    // PayPal 签名验证
    if (signature.startsWith('paypal_') && config.paypalClientId) {
      // 这里需要实现 PayPal 的签名验证逻辑
      return true // 暂时返回 true
    }

    // Stripe 签名验证
    if (signature.startsWith('stripe_') && config.stripeWebhookSecret) {
      // Stripe 签名验证逻辑
      const sig = signature.split(',').reduce((acc, item) => {
        const [key, value] = item.split('=')
        acc[key] = value
        return acc
      }, {})

      if (sig.t && sig.v1 && config.stripeWebhookSecret) {
        const expectedSignature = crypto
          .createHmac('sha256', config.stripeWebhookSecret)
          .update(`${sig.t}.${JSON.stringify(payload)}`)
          .digest('hex')

        return crypto.timingSafeEqual(
          Buffer.from(sig.v1),
          Buffer.from(expectedSignature)
        )
      }
    }

    return false

  } catch (error) {
    console.error('Webhook 签名验证错误:', error)
    return false
  }
}

/**
 * 检测支付平台类型
 */
function detectPaymentType(headers) {
  if (headers['x-creem-signature']) return 'creem'
  if (headers['x-paypal-signature'] || headers['paypal-auth-algo']) return 'paypal'
  if (headers['stripe-signature']) return 'stripe'
  return 'unknown'
}

/**
 * 处理 Creem Webhook
 */
async function handleCreemWebhook(body, config) {
  try {
    const eventType = body.event_type
    const paymentData = body.data

    console.log('处理 Creem Webhook:', eventType)

    switch (eventType) {
      case 'payment.completed':
        await handlePaymentCompleted(paymentData, 'creem')
        break

      case 'payment.failed':
        await handlePaymentFailed(paymentData, 'creem')
        break

      case 'subscription.created':
        await handleSubscriptionCreated(paymentData, 'creem')
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(paymentData, 'creem')
        break

      default:
        console.log('未处理的 Creem 事件类型:', eventType)
    }

    return { processed: true, eventType }

  } catch (error) {
    console.error('处理 Creem Webhook 失败:', error)
    return { processed: false, error: error.message }
  }
}

/**
 * 处理 PayPal Webhook
 */
async function handlePayPalWebhook(body, config) {
  try {
    const eventType = body.event_type
    const resource = body.resource

    console.log('处理 PayPal Webhook:', eventType)

    switch (eventType) {
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(resource, 'paypal')
        break

      case 'PAYMENT.SALE.DENIED':
        await handlePaymentFailed(resource, 'paypal')
        break

      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(resource, 'paypal')
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(resource, 'paypal')
        break

      default:
        console.log('未处理的 PayPal 事件类型:', eventType)
    }

    return { processed: true, eventType }

  } catch (error) {
    console.error('处理 PayPal Webhook 失败:', error)
    return { processed: false, error: error.message }
  }
}

/**
 * 处理 Stripe Webhook
 */
async function handleStripeWebhook(body, config) {
  try {
    const eventType = body.type
    const data = body.data

    console.log('处理 Stripe Webhook:', eventType)

    switch (eventType) {
      case 'checkout.session.completed':
        await handlePaymentCompleted(data.object, 'stripe')
        break

      case 'invoice.payment_succeeded':
        await handlePaymentCompleted(data.object, 'stripe')
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(data.object, 'stripe')
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(data.object, 'stripe')
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(data.object, 'stripe')
        break

      default:
        console.log('未处理的 Stripe 事件类型:', eventType)
    }

    return { processed: true, eventType }

  } catch (error) {
    console.error('处理 Stripe Webhook 失败:', error)
    return { processed: false, error: error.message }
  }
}

/**
 * 处理支付完成事件
 */
async function handlePaymentCompleted(paymentData, provider) {
  try {
    const paymentId = paymentData.id || paymentData.payment_id
    const amount = paymentData.amount || paymentData.amount_total / 100
    const currency = paymentData.currency || 'USD'

    // 更新支付记录
    await updatePaymentRecord(paymentId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      provider: provider,
      amount: amount,
      currency: currency
    })

    // 处理订阅激活
    if (paymentData.type === 'subscription' || paymentData.object === 'subscription') {
      await activateSubscriptionFromPayment(paymentData, provider)
    }

    // 处理工具解锁
    if (paymentData.toolId) {
      await unlockToolFromPayment(paymentData, provider)
    }

    console.log('支付完成处理成功:', paymentId)

  } catch (error) {
    console.error('处理支付完成事件失败:', error)
    throw error
  }
}

/**
 * 处理支付失败事件
 */
async function handlePaymentFailed(paymentData, provider) {
  try {
    const paymentId = paymentData.id || paymentData.payment_id

    await updatePaymentRecord(paymentId, {
      status: 'failed',
      failedAt: new Date().toISOString(),
      provider: provider,
      failureReason: paymentData.failure_reason || '支付失败'
    })

    console.log('支付失败处理成功:', paymentId)

  } catch (error) {
    console.error('处理支付失败事件失败:', error)
  }
}

/**
 * 处理订阅创建事件
 */
async function handleSubscriptionCreated(subscriptionData, provider) {
  try {
    console.log('订阅创建处理:', subscriptionData.id)

    // 更新订阅状态
    const subscriptionInfo = {
      isActive: true,
      planId: subscriptionData.plan_id || subscriptionData.items?.[0]?.price?.lookup_key,
      status: 'active',
      provider: provider,
      providerSubscriptionId: subscriptionData.id,
      startedAt: new Date().toISOString(),
      currentPeriodEnd: calculateSubscriptionPeriodEnd(subscriptionData),
      cancelAtPeriodEnd: false
    }

    const storage = useStorage()
    await storage.setItem('subscription:current', subscriptionInfo)

  } catch (error) {
    console.error('处理订阅创建事件失败:', error)
  }
}

/**
 * 处理订阅取消事件
 */
async function handleSubscriptionCancelled(subscriptionData, provider) {
  try {
    console.log('订阅取消处理:', subscriptionData.id)

    const storage = useStorage()
    const currentSubscription = await storage.getItem('subscription:current')

    if (currentSubscription && currentSubscription.providerSubscriptionId === subscriptionData.id) {
      await storage.setItem('subscription:current', {
        ...currentSubscription,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        isActive: false
      })
    }

  } catch (error) {
    console.error('处理订阅取消事件失败:', error)
  }
}

/**
 * 从支付数据激活订阅
 */
async function activateSubscriptionFromPayment(paymentData, provider) {
  // 实现订阅激活逻辑
  console.log('从支付激活订阅:', paymentData.id)
}

/**
 * 从支付解锁工具
 */
async function unlockToolFromPayment(paymentData, provider) {
  // 实现工具解锁逻辑
  console.log('从支付解锁工具:', paymentData.id)
}

/**
 * 更新支付记录
 */
async function updatePaymentRecord(paymentId, updateData) {
  try {
    const storage = useStorage()
    const existingRecord = await storage.getItem(`payments:${paymentId}`)

    if (existingRecord) {
      const updatedRecord = { ...existingRecord, ...updateData }
      await storage.setItem(`payments:${paymentId}`, updatedRecord)
    }

  } catch (error) {
    console.error('更新支付记录失败:', error)
  }
}

/**
 * 计算订阅周期结束时间
 */
function calculateSubscriptionPeriodEnd(subscriptionData) {
  const now = new Date()

  // 根据订阅计划计算结束时间
  // 这里需要根据实际订阅计划来确定
  return new Date(now.setMonth(now.getMonth() + 1)).toISOString()
}

/**
 * 记录 Webhook 事件
 */
async function logWebhookEvent(type, body, result) {
  try {
    const logEntry = {
      type: type,
      timestamp: new Date().toISOString(),
      body: body,
      result: result,
      processed: result.processed
    }

    const storage = useStorage()
    const logs = await storage.getItem('webhook_logs') || []
    logs.push(logEntry)

    // 只保留最近的100条日志
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100)
    }

    await storage.setItem('webhook_logs', logs)

  } catch (error) {
    console.error('记录 Webhook 事件失败:', error)
  }
}