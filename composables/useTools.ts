// 工具相关的通用逻辑
export const useTools = () => {
  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    // 在服务端渲染时直接返回，不执行任何操作
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { success: false, message: 'Copy to clipboard is only available in the browser' }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        return { success: true, message: 'Copied to clipboard!' }
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
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
    } catch (err) {
      return { success: false, message: 'Failed to copy to clipboard' }
    }
  }

  // 下载文本为文件
  const downloadText = (text: string, filename: string) => {
    // 在服务端渲染时直接返回，不执行任何操作
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    try {
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download file:', err)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
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