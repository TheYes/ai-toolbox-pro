#!/usr/bin/env node

/**
 * AI Toolbox Pro 生产环境启动脚本
 * 包含基本的错误处理和优雅关闭
 */

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 启动 AI Toolbox Pro 生产服务器...')

// 设置环境变量
process.env.NODE_ENV = 'production'
process.env.PORT = process.env.PORT || '3001'

const child = spawn('node', [path.join(__dirname, '.output/server/index.mjs')], {
  stdio: 'inherit',
  env: process.env
})

// 错误处理
child.on('error', (error) => {
  console.error('❌ 启动失败:', error)
  process.exit(1)
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 收到关闭信号，正在优雅关闭服务器...')
  child.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在优雅关闭服务器...')
  child.kill('SIGTERM')
})

child.on('exit', (code) => {
  console.log(`📝 服务器已退出，代码: ${code}`)
  process.exit(code)
})