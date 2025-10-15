/**
 * 支付验证接口
 * 验证支付状态并更新记录
 */

import crypto from 'crypto'
import { createUniversalPayment, PAYMENT_PROVIDERS } from '~/shared/payment/universal-payment.js'

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
    const validTypes = [PAYMENT_PROVIDERS.CREEM, PAYMENT_PROVIDERS.PAYPAL, PAYMENT_PROVIDERS.STRIPE]
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

    // 初始化通用支付模块
    const universalPayment = createUniversalPayment(config)

    // 使用通用支付模块验证支付会话
    const verificationResult = await universalPayment.verifyPaymentSession(
      body.type,
      body.paymentId
    )

    // 如果支付成功，更新支付记录
    if (verificationResult.success) {
      await updatePaymentRecord(body.paymentId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        verificationData: verificationResult.payment
      })

      // 处理订阅激活
      if (paymentRecord.type === 'subscription') {
        await activateSubscription(paymentRecord, body.paymentId)
      }

      // 处理工具解锁
      if (paymentRecord.type === 'one_time' && paymentRecord.metadata?.toolId) {
        await unlockTool(paymentRecord.metadata.toolId, body.paymentId)
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
      payment: verificationResult.payment || {
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
 * 获取支付记录
 */
async function getPaymentRecord(paymentId) {
  try {
    const storage = useStorage()
    let record = await storage.getItem(`payments:${paymentId}`)

    // 如果没有找到记录，返回测试数据（仅用于测试）
    if (!record && paymentId.startsWith('creem_')) {
      record = {
        id: paymentId,
        provider: 'creem',
        type: 'one_time',
        amount: 0.01,
        currency: 'USD',
        description: '测试支付',
        status: 'pending',
        createdAt: new Date().toISOString(),
        metadata: {}
      }
    }

    return record

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
    const storage = useStorage()
    const existingRecord = await storage.getItem(`payments:${paymentId}`)

    if (existingRecord) {
      const updatedRecord = { ...existingRecord, ...updateData }
      await storage.setItem(`payments:${paymentId}`, updatedRecord)
      console.log('支付记录已更新:', paymentId)
    }

  } catch (error) {
    console.error('更新支付记录失败:', error)
  }
}

/**
 * 激活订阅
 */
async function activateSubscription(paymentRecord, paymentId) {
  try {
    const subscriptionInfo = {
      isActive: true,
      provider: paymentRecord.provider,
      providerSubscriptionId: paymentId,
      planId: paymentRecord.metadata?.planId,
      amount: paymentRecord.amount,
      currency: paymentRecord.currency,
      status: 'active',
      startedAt: new Date().toISOString(),
      currentPeriodEnd: calculatePeriodEnd(paymentRecord.metadata?.planId),
      paymentId: paymentId
    }

    const storage = useStorage()
    await storage.setItem('subscription:current', subscriptionInfo)

    console.log('订阅已激活:', subscriptionInfo)

  } catch (error) {
    console.error('激活订阅失败:', error)
  }
}

/**
 * 解锁工具
 */
async function unlockTool(toolId, paymentId) {
  try {
    const unlockInfo = {
      toolId: toolId,
      paymentId: paymentId,
      unlockedAt: new Date().toISOString(),
      type: 'one_time'
    }

    const storage = useStorage()
    const unlockedTools = await storage.getItem('unlocked_tools') || []

    if (!unlockedTools.includes(toolId)) {
      unlockedTools.push(toolId)
      await storage.setItem('unlocked_tools', unlockedTools)
      console.log('工具已解锁:', toolId)
    }

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