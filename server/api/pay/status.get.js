/**
 * 支付状态查询接口
 * 查询支付记录和订阅状态
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    // 验证必需参数
    if (!query.paymentId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少支付ID'
      })
    }

    // 获取支付记录
    const paymentRecord = await getPaymentRecord(query.paymentId)
    if (!paymentRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: '支付记录不存在'
      })
    }

    // 返回支付状态信息
    return {
      success: true,
      payment: {
        id: paymentRecord.id,
        status: paymentRecord.status,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        description: paymentRecord.description,
        type: paymentRecord.type,
        paymentMethod: paymentRecord.paymentMethod,
        createdAt: paymentRecord.createdAt,
        completedAt: paymentRecord.completedAt || null,
        failedAt: paymentRecord.failedAt || null,
        failureReason: paymentRecord.failureReason || null
      }
    }

  } catch (error) {
    console.error('查询支付状态失败:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '查询支付状态失败'
    })
  }
})

/**
 * 获取支付记录
 */
async function getPaymentRecord(paymentId) {
  try {
    // 在实际应用中，这里应该从数据库获取
    const storage = useStorage()
    return await storage.getItem(`payments:${paymentId}`)

  } catch (error) {
    console.error('获取支付记录失败:', error)
    return null
  }
}