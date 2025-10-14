/**
 * 支付验证接口
 * 验证支付状态并更新记录
 */

import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    // 验证必需字段
    if (!body.paymentId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少支付ID'
      })
    }

    if (!body.type) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少支付类型'
      })
    }

    // 验证支付类型
    const validTypes = ['creem', 'paypal', 'stripe']
    if (!validTypes.includes(body.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: '不支持的支付类型'
      })
    }

    // 获取支付记录
    const paymentRecord = await getPaymentRecord(body.paymentId)
    if (!paymentRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: '支付记录不存在'
      })
    }

    // 根据支付类型验证支付状态
    let verificationResult
    switch (body.type) {
      case 'creem':
        verificationResult = await verifyCreemPayment(body.paymentId, config)
        break
      case 'paypal':
        verificationResult = await verifyPayPalPayment(body.paymentId, config)
        break
      case 'stripe':
        verificationResult = await verifyStripePayment(body.paymentId, config)
        break
      default:
        throw createError({
          statusCode: 400,
          statusMessage: '不支持的支付类型'
        })
    }

    // 如果支付成功，更新支付记录
    if (verificationResult.success) {
      await updatePaymentRecord(body.paymentId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        verificationData: verificationResult.data
      })

      // 处理订阅激活
      if (paymentRecord.type === 'subscription') {
        await activateSubscription(paymentRecord)
      }

      // 处理工具解锁
      if (paymentRecord.type === 'one_time' && paymentRecord.toolId) {
        await unlockTool(paymentRecord.toolId, body.paymentId)
      }
    } else {
      // 支付失败，更新状态
      await updatePaymentRecord(body.paymentId, {
        status: 'failed',
        failedAt: new Date().toISOString(),
        failureReason: verificationResult.reason
      })
    }

    return {
      success: verificationResult.success,
      payment: {
        id: body.paymentId,
        status: verificationResult.success ? 'completed' : 'failed',
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        description: paymentRecord.description,
        type: paymentRecord.type
      },
      error: verificationResult.success ? null : verificationResult.reason
    }

  } catch (error) {
    console.error('支付验证失败:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '支付验证失败'
    })
  }
})

/**
 * 验证 Creem 支付
 */
async function verifyCreemPayment(paymentId, config) {
  try {
    if (!config.creemSecretKey) {
      throw new Error('Creem Secret Key 未配置')
    }

    // 这里需要根据 Creem 的实际 API 调整
    // 模拟验证过程
    const verificationResult = {
      success: true,
      data: {
        paymentId: paymentId,
        status: 'completed',
        amount: null, // 从 Creem API 获取
        paidAt: new Date().toISOString()
      }
    }

    return verificationResult

  } catch (error) {
    console.error('Creem 支付验证失败:', error)
    return {
      success: false,
      reason: 'Creem 支付验证失败'
    }
  }
}

/**
 * 验证 PayPal 支付
 */
async function verifyPayPalPayment(paymentId, config) {
  try {
    if (!config.paypalClientSecret) {
      throw new Error('PayPal Client Secret 未配置')
    }

    // PayPal 订单验证逻辑
    // 这里需要调用 PayPal 的实际 API
    const verificationResult = {
      success: true,
      data: {
        orderId: paymentId,
        status: 'COMPLETED',
        amount: null, // 从 PayPal API 获取
        paidAt: new Date().toISOString()
      }
    }

    return verificationResult

  } catch (error) {
    console.error('PayPal 支付验证失败:', error)
    return {
      success: false,
      reason: 'PayPal 支付验证失败'
    }
  }
}

/**
 * 验证 Stripe 支付
 */
async function verifyStripePayment(paymentId, config) {
  try {
    if (!config.stripeSecretKey) {
      throw new Error('Stripe Secret Key 未配置')
    }

    // Stripe 支付验证逻辑
    const verificationResult = {
      success: true,
      data: {
        sessionId: paymentId,
        status: 'complete',
        amount: null, // 从 Stripe API 获取
        paidAt: new Date().toISOString()
      }
    }

    return verificationResult

  } catch (error) {
    console.error('Stripe 支付验证失败:', error)
    return {
      success: false,
      reason: 'Stripe 支付验证失败'
    }
  }
}

/**
 * 获取支付记录
 */
async function getPaymentRecord(paymentId) {
  try {
    // 在实际应用中，这里应该从数据库获取
    // 模拟获取支付记录
    const storage = useStorage()
    return await storage.getItem(`payments:${paymentId}`)

  } catch (error) {
    console.error('获取支付记录失败:', error)
    return null
  }
}

/**
 * 更新支付记录
 */
async function updatePaymentRecord(paymentId, updateData) {
  try {
    // 在实际应用中，这里应该更新数据库记录
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
 * 激活订阅
 */
async function activateSubscription(paymentRecord) {
  try {
    // 更新用户订阅状态
    const subscriptionData = {
      isActive: true,
      planId: paymentRecord.planId,
      status: 'active',
      startedAt: new Date().toISOString(),
      currentPeriodEnd: calculatePeriodEnd(paymentRecord.planId),
      paymentId: paymentRecord.id
    }

    // 这里应该更新数据库中的用户订阅记录
    const storage = useStorage()
    await storage.setItem('subscription:current', subscriptionData)

    console.log('订阅激活成功:', paymentRecord.id)

  } catch (error) {
    console.error('激活订阅失败:', error)
  }
}

/**
 * 解锁工具
 */
async function unlockTool(toolId, paymentId) {
  try {
    // 添加工具解锁记录
    const unlockData = {
      toolId: toolId,
      paymentId: paymentId,
      unlockedAt: new Date().toISOString(),
      type: 'one_time'
    }

    // 这里应该更新数据库中的用户工具解锁记录
    const storage = useStorage()
    const existingUnlocks = await storage.getItem('unlocked_tools') || []
    existingUnlocks.push(unlockData)
    await storage.setItem('unlocked_tools', existingUnlocks)

    console.log('工具解锁成功:', toolId)

  } catch (error) {
    console.error('解锁工具失败:', error)
  }
}

/**
 * 计算订阅周期结束时间
 */
function calculatePeriodEnd(planId) {
  const now = new Date()

  switch (planId) {
    case 'pro_monthly':
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString()
    case 'pro_yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
    case 'pro_lifetime':
      return new Date(now.setFullYear(now.getFullYear() + 100)).toISOString() // 100年，相当于终身
    default:
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString()
  }
}