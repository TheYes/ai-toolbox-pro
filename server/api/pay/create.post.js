/**
 * 创建支付接口
 * 支持 Creem 和 PayPal 支付方式
 */

import crypto from 'crypto'

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
    const validPaymentMethods = ['creem', 'paypal']
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

    // 根据支付方式创建支付
    switch (body.paymentMethod) {
      case 'creem':
        response = await createCreemPayment(paymentData, config)
        break
      case 'paypal':
        response = await createPayPalPayment(paymentData, config)
        break
      default:
        throw createError({
          statusCode: 400,
          statusMessage: '不支持的支付方式'
        })
    }

    // 保存支付记录到数据库或文件
    await savePaymentRecord(paymentData)

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
 * 创建 Creem 支付
 */
async function createCreemPayment(paymentData, config) {
  try {
    // 这里需要根据 Creem 的实际 API 调整
    // 由于没有 Creem 的具体 API 文档，这里提供一个模拟实现

    if (!config.creemApiKey) {
      throw new Error('Creem API Key 未配置')
    }

    // 模拟 Creem API 调用
    const creemResponse = {
      checkoutUrl: `https://checkout.creem.io/pay/${paymentData.id}`,
      paymentId: paymentData.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分钟后过期
    }

    return {
      checkoutUrl: creemResponse.checkoutUrl,
      paymentId: creemResponse.paymentId,
      expiresAt: creemResponse.expiresAt
    }

  } catch (error) {
    console.error('Creem 支付创建失败:', error)
    throw new Error('Creem 支付创建失败')
  }
}

/**
 * 创建 PayPal 支付
 */
async function createPayPalPayment(paymentData, config) {
  try {
    if (!config.paypalClientId) {
      throw new Error('PayPal Client ID 未配置')
    }

    // PayPal 订单创建逻辑
    const paypalOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: paymentData.currency,
          value: paymentData.amount.toString()
        },
        description: paymentData.description,
        custom_id: paymentData.id
      }],
      application_context: {
        return_url: paymentData.successUrl,
        cancel_url: paymentData.cancelUrl,
        brand_name: 'AI Toolbox Pro',
        locale: 'en-US',
        user_action: 'PAY_NOW'
      }
    }

    // 这里需要调用 PayPal 的实际 API
    // 模拟 PayPal API 响应
    const paypalResponse = {
      orderID: `paypal_${paymentData.id}`,
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${paypalOrder.custom_id}`
    }

    return {
      orderId: paypalResponse.orderID,
      approvalUrl: paypalResponse.approvalUrl
    }

  } catch (error) {
    console.error('PayPal 支付创建失败:', error)
    throw new Error('PayPal 支付创建失败')
  }
}

/**
 * 保存支付记录
 * 这里应该保存到数据库，目前简化为文件存储
 */
async function savePaymentRecord(paymentData) {
  try {
    // 在实际应用中，这里应该保存到数据库
    // 目前只是模拟保存操作
    console.log('保存支付记录:', paymentData.id)

    // 可以使用 Nitro 的存储功能
    // const storage = useStorage()
    // await storage.setItem(`payments:${paymentData.id}`, paymentData)

  } catch (error) {
    console.error('保存支付记录失败:', error)
    // 不抛出错误，避免影响支付流程
  }
}