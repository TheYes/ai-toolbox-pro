/**
 * 恢复订阅接口
 * 恢复用户的自动续费
 */

export default defineEventHandler(async (event) => {
  try {
    // 获取当前订阅状态
    const subscription = await getSubscriptionStatus()

    if (!subscription.isActive) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有活跃的订阅'
      })
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw createError({
        statusCode: 400,
        statusMessage: '订阅状态正常，无需恢复'
      })
    }

    // 更新订阅状态
    await updateSubscriptionStatus({
      ...subscription,
      cancelAtPeriodEnd: false,
      resumedAt: new Date().toISOString()
    })

    // 获取更新后的订阅状态
    const updatedSubscription = await getSubscriptionStatus()

    return {
      success: true,
      subscription: updatedSubscription,
      message: '订阅已恢复，将自动续费'
    }

  } catch (error) {
    console.error('恢复订阅失败:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '恢复订阅失败'
    })
  }
})

/**
 * 获取订阅状态
 */
async function getSubscriptionStatus() {
  try {
    const storage = useStorage()
    const subscription = await storage.getItem('subscription:current')

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
 * 更新订阅状态
 */
async function updateSubscriptionStatus(subscriptionData) {
  try {
    const storage = useStorage()

    // 更新当前订阅
    await storage.setItem('subscription:current', subscriptionData)

    // 添加到历史记录
    const history = await storage.getItem('subscription:history') || []
    history.push({
      ...subscriptionData,
      updatedAt: new Date().toISOString(),
      action: 'resume'
    })
    await storage.setItem('subscription:history', history)

    return subscriptionData

  } catch (error) {
    console.error('更新订阅状态失败:', error)
    throw error
  }
}