export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { planId, metadata } = body

    // 验证请求数据
    if (!planId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Plan ID is required'
      })
    }

    // 模拟支付会话创建
    // 在实际项目中，这里会调用 Stripe 或 Creem 的 API
    const session = {
      id: `cs_${Math.random().toString(36).substr(2, 9)}`,
      planId,
      amount: 9.99,
      currency: 'USD',
      metadata: metadata || {},
      paymentUrl: `https://checkout.stripe.com/pay/${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }

    return {
      success: true,
      session
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})