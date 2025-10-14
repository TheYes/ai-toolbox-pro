// 工具相关的通用逻辑
export const useTools = () => {
  // 复制到剪贴板
  const copyToClipboard = async (text) => {
    // 检查是否在客户端
    if (!import.meta.client) {
      return { success: false, message: 'Copy to clipboard is only available in the browser' }
    }

    try {
      await navigator.clipboard.writeText(text)
      return { success: true, message: 'Copied to clipboard!' }
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return { success: true, message: 'Copied to clipboard!' }
      } catch (err) {
        document.body.removeChild(textArea)
        return { success: false, message: 'Failed to copy to clipboard' }
      }
    }
  }

  // 下载文本为文件
  const downloadText = (text, filename) => {
    // 检查是否在客户端
    if (!import.meta.client) {
      return
    }

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    copyToClipboard,
    downloadText,
    formatFileSize
  }
}