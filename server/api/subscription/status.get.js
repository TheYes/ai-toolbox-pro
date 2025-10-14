/**
 * 订阅状态查询接口
 * 获取用户当前的订阅状态
 */

export default defineEventHandler(async (event) => {
  try {
    // 获取当前用户的订阅状态
    const subscriptionData = await getSubscriptionStatus()

    // 获取订阅历史
    const subscriptionHistory = await getSubscriptionHistory()

    // 计算订阅相关信息
    const subscriptionInfo = {
      ...subscriptionData,
      daysLeft: calculateDaysLeft(subscriptionData.currentPeriodEnd),
      isExpired: isSubscriptionExpired(subscriptionData.currentPeriodEnd),
      willRenew: !subscriptionData.cancelAtPeriodEnd && subscriptionData.status === 'active'
    }

    return {
      success: true,
      subscription: subscriptionInfo,
      history: subscriptionHistory
    }

  } catch (error) {
    console.error('查询订阅状态失败:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '查询订阅状态失败'
    })
  }
})

/**
 * 获取订阅状态
 */
async function getSubscriptionStatus() {
  try {
    // 在实际应用中，这里应该从数据库获取用户的订阅状态
    const storage = useStorage()
    const subscription = await storage.getItem('subscription:current')

    // 如果没有订阅记录，返回默认状态
    if (!subscription) {
      return {
        isActive: false,
        planId: null,
        status: 'inactive',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        startedAt: null,
        paymentId: null
      }
    }

    return subscription

  } catch (error) {
    console.error('获取订阅状态失败:', error)
    return {
      isActive: false,
      planId: null,
      status: 'inactive',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      startedAt: null,
      paymentId: null
    }
  }
}

/**
 * 获取订阅历史
 */
async function getSubscriptionHistory() {
  try {
    // 在实际应用中，这里应该从数据库获取用户的订阅历史
    const storage = useStorage()
    const history = await storage.getItem('subscription:history')

    return history || []

  } catch (error) {
    console.error('获取订阅历史失败:', error)
    return []
  }
}

/**
 * 计算订阅剩余天数
 */
function calculateDaysLeft(currentPeriodEnd) {
  if (!currentPeriodEnd) return 0

  const now = new Date()
  const endDate = new Date(currentPeriodEnd)
  const diffTime = endDate - now

  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

/**
 * 检查订阅是否过期
 */
function isSubscriptionExpired(currentPeriodEnd) {
  if (!currentPeriodEnd) return true

  return new Date(currentPeriodEnd) < new Date()
}