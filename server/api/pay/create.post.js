/**
 * 创建支付接口
 * 支持 Creem、PayPal 和 Stripe 支付方式
 */

import crypto from 'crypto'
import { createUniversalPayment, PAYMENT_PROVIDERS } from '~/shared/payment/universal-payment.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    // 验证必需字段
    const requiredFields = ['amount', 'currency', 'description', 'type', 'paymentMethod']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `缺少必需字段: ${missingFields.join(', ')}`
      })
    }

    // 验证支付金额
    if (body.amount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '支付金额必须大于0'
      })
    }

    // 验证支付方式
    const validPaymentMethods = [PAYMENT_PROVIDERS.CREEM, PAYMENT_PROVIDERS.PAYPAL, PAYMENT_PROVIDERS.STRIPE]
    if (!validPaymentMethods.includes(body.paymentMethod)) {
      throw createError({
        statusCode: 400,
        statusMessage: '不支持的支付方式'
      })
    }

    // 验证支付类型
    const validPaymentTypes = ['one_time', 'subscription']
    if (!validPaymentTypes.includes(body.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: '不支持的支付类型'
      })
    }

    // 生成支付ID
    const paymentId = `pay_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`

    // 准备支付数据
    const paymentData = {
      id: paymentId,
      amount: body.amount,
      currency: body.currency,
      description: body.description,
      type: body.type,
      paymentMethod: body.paymentMethod,
      planId: body.planId || null,
      toolId: body.toolId || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      metadata: {
        userAgent: getHeader(event, 'user-agent'),
        ip: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
        referer: getHeader(event, 'referer') || 'direct'
      }
    }

    let response

    // 初始化通用支付模块
    const universalPayment = createUniversalPayment(config)

    // 使用通用支付模块创建支付会话
    const paymentSession = await universalPayment.createPaymentSession(
      body.paymentMethod,
      {
        id: paymentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        type: paymentData.type,
        successUrl: paymentData.successUrl,
        cancelUrl: paymentData.cancelUrl,
        planId: paymentData.planId,
        toolId: paymentData.toolId,
        metadata: paymentData.metadata
      }
    )

    response = paymentSession.payment

    // 保存支付记录到存储
    await savePaymentRecord(paymentId, body.paymentMethod, paymentData, response)

    return {
      success: true,
      payment: {
        id: paymentId,
        ...response
      }
    }

  } catch (error) {
    console.error('创建支付失败:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '创建支付失败'
    })
  }
})

/**
 * 保存支付记录
 */
async function savePaymentRecord(paymentId, paymentMethod, originalData, paymentResponse) {
  try {
    const storage = useStorage()
    const paymentRecord = {
      id: paymentId,
      provider: paymentMethod,
      type: originalData.type,
      amount: originalData.amount,
      currency: originalData.currency,
      description: originalData.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: originalData.metadata,
      paymentResponse: paymentResponse
    }

    await storage.setItem(`payments:${paymentId}`, paymentRecord)
    console.log('支付记录已保存:', paymentId)

  } catch (error) {
    console.error('保存支付记录失败:', error)
    // 不抛出错误，避免影响支付流程
  }
}

