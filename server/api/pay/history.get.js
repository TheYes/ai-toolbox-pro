/**
 * 支付历史查询接口
 * 获取用户的所有支付记录
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    // 分页参数
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    const status = query.status // 过滤状态
    const type = query.type // 过滤类型

    // 获取支付历史
    const allPayments = await getPaymentHistory()

    // 过滤支付记录
    let filteredPayments = allPayments

    if (status) {
      filteredPayments = filteredPayments.filter(payment => payment.status === status)
    }

    if (type) {
      filteredPayments = filteredPayments.filter(payment => payment.type === type)
    }

    // 排序（最新的在前）
    filteredPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // 分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex)

    // 计算统计信息
    const stats = calculatePaymentStats(allPayments)

    return {
      success: true,
      payments: paginatedPayments,
      pagination: {
        page: page,
        limit: limit,
        total: filteredPayments.length,
        totalPages: Math.ceil(filteredPayments.length / limit),
        hasNext: endIndex < filteredPayments.length,
        hasPrev: page > 1
      },
      stats: stats
    }

  } catch (error) {
    console.error('查询支付历史失败:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '查询支付历史失败'
    })
  }
})

/**
 * 获取支付历史
 */
async function getPaymentHistory() {
  try {
    // 在实际应用中，这里应该从数据库获取用户的支付历史
    const storage = useStorage()

    // 获取所有支付记录（在实际应用中应该只获取当前用户的记录）
    const allKeys = await storage.getKeys('payments:')
    const payments = []

    for (const key of allKeys) {
      const payment = await storage.getItem(key)
      if (payment) {
        payments.push(payment)
      }
    }

    // 获取单独的工具解锁记录
    const unlockedTools = await storage.getItem('unlocked_tools') || []
    for (const unlock of unlockedTools) {
      payments.push({
        id: unlock.paymentId,
        type: 'one_time',
        amount: 4.99, // 工具解锁价格
        currency: 'USD',
        description: `解锁工具: ${unlock.toolId}`,
        status: 'completed',
        createdAt: unlock.unlockedAt,
        completedAt: unlock.unlockedAt,
        toolId: unlock.toolId
      })
    }

    return payments

  } catch (error) {
    console.error('获取支付历史失败:', error)
    return []
  }
}

/**
 * 计算支付统计信息
 */
function calculatePaymentStats(payments) {
  const totalPayments = payments.filter(p => p.status === 'completed')
  const totalAmount = totalPayments.reduce((sum, payment) => sum + payment.amount, 0)

  const subscriptionPayments = totalPayments.filter(p => p.type === 'subscription')
  const oneTimePayments = totalPayments.filter(p => p.type === 'one_time')

  const monthlyRevenue = calculateMonthlyRevenue(payments)
  const mostRecentPayment = getMostRecentPayment(payments)

  return {
    totalPayments: totalPayments.length,
    totalAmount: totalAmount,
    subscriptionPayments: subscriptionPayments.length,
    oneTimePayments: oneTimePayments.length,
    monthlyRevenue: monthlyRevenue,
    mostRecentPayment: mostRecentPayment,
    averagePaymentValue: totalPayments.length > 0 ? totalAmount / totalPayments.length : 0
  }
}

/**
 * 计算月收入
 */
function calculateMonthlyRevenue(payments) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthlyPayments = payments.filter(payment => {
    if (payment.status !== 'completed') return false

    const paymentDate = new Date(payment.createdAt || payment.completedAt)
    return (
      paymentDate.getMonth() === currentMonth &&
      paymentDate.getFullYear() === currentYear
    )
  })

  return monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0)
}

/**
 * 获取最近的支付
 */
function getMostRecentPayment(payments) {
  const completedPayments = payments.filter(p => p.status === 'completed')

  if (completedPayments.length === 0) return null

  return completedPayments.reduce((mostRecent, payment) => {
    const mostRecentDate = new Date(mostRecent.createdAt || mostRecent.completedAt)
    const paymentDate = new Date(payment.createdAt || payment.completedAt)

    return paymentDate > mostRecentDate ? payment : mostRecent
  })
}