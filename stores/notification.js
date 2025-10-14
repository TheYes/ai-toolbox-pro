/**
 * 全局通知状态管理
 * 管理成功、错误、信息通知的显示
 */

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    isVisible: false,
    type: 'info', // 'success' | 'error' | 'info'
    message: '',
    description: '',
    duration: 5000, // 显示时长（毫秒）
    autoHide: true
  }),

  actions: {
    // 显示成功通知
    showSuccess(message, description = '', duration = 5000) {
      this.show({
        type: 'success',
        message,
        description,
        duration,
        autoHide: true
      })
    },

    // 显示错误通知
    showError(message, description = '', duration = 8000) {
      this.show({
        type: 'error',
        message,
        description,
        duration,
        autoHide: true
      })
    },

    // 显示信息通知
    showInfo(message, description = '', duration = 5000) {
      this.show({
        type: 'info',
        message,
        description,
        duration,
        autoHide: true
      })
    },

    // 显示通知（内部方法）
    show({ type, message, description, duration, autoHide }) {
      this.type = type
      this.message = message
      this.description = description
      this.duration = duration
      this.autoHide = autoHide
      this.isVisible = true

      // 如果需要自动隐藏，设置定时器
      if (autoHide && duration > 0) {
        setTimeout(() => {
          this.hide()
        }, duration)
      }
    },

    // 隐藏通知
    hide() {
      this.isVisible = false
      // 延迟清空内容，让隐藏动画完成
      setTimeout(() => {
        this.message = ''
        this.description = ''
        this.type = 'info'
      }, 300)
    },

    // 清除自动隐藏定时器
    clearAutoHide() {
      this.autoHide = false
    }
  }
})