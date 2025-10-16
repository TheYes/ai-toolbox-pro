export default defineNuxtPlugin((nuxtApp) => {
  // 全局错误处理
  const handleError = (error, instance, info) => {
    console.error('Global error:', error)
    console.error('Component instance:', instance)
    console.error('Error info:', info)

    // 在生产环境中，你可以将错误发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成 Sentry、LogRocket 等错误监控服务
      // 例如: Sentry.captureException(error)
    }

    // 显示用户友好的错误消息
    if (import.meta.client) {
      const errorMessage = error?.message || 'An unexpected error occurred'
      console.error('Error occurred:', errorMessage)
    }
  }

  // 使用 Vue 应用的全局错误处理器替代 onErrorCaptured
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    handleError(error, instance, info)
    return false // 阻止错误继续传播
  }

  // 未处理的 Promise 错误
  if (import.meta.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      event.preventDefault() // 阻止默认的控制台错误输出
    })

    // 全局 JavaScript 错误
    window.addEventListener('error', (event) => {
      console.error('Global JavaScript error:', event.error)
    })
  }
})