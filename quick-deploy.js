#!/usr/bin/env node

/**
 * AI Toolbox Pro 快速部署脚本
 * 一键完成生产环境部署
 */

import { spawn, exec } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 AI Toolbox Pro 快速部署启动...')
console.log('=' .repeat(50))

// 1. 清理环境
function cleanup() {
  return new Promise((resolve, reject) => {
    console.log('🧹 清理现有服务...')
    exec('taskkill /F /IM node.exe', (error) => {
      // 忽略错误，继续执行
      resolve()
    })
  })
}

// 2. 构建项目
function buildProject() {
  return new Promise((resolve, reject) => {
    console.log('🔨 构建生产版本...')
    const build = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: __dirname
    })

    build.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 构建完成')
        resolve()
      } else {
        reject(new Error(`构建失败，代码: ${code}`))
      }
    })
  })
}

// 3. 启动生产服务器
function startProduction() {
  return new Promise((resolve, reject) => {
    console.log('🌟 启动生产服务器...')

    // 设置环境变量
    const env = { ...process.env }
    env.NODE_ENV = 'production'
    env.PORT = '3001'

    const child = spawn('node', ['start-prod.js'], {
      stdio: 'inherit',
      env: env,
      cwd: __dirname
    })

    child.on('error', (error) => {
      reject(error)
    })

    // 等待服务器启动
    setTimeout(() => {
      console.log('✅ 服务器启动成功!')
      console.log('📱 访问地址: http://localhost:3001')
      console.log('🛑 按 Ctrl+C 停止服务器')
      resolve(child)
    }, 3000)
  })
}

// 4. 验证部署
function verifyDeployment() {
  return new Promise((resolve) => {
    console.log('🔍 验证部署状态...')

    const test = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://localhost:3001'], {
      stdio: 'pipe'
    })

    let output = ''
    test.stdout.on('data', (data) => {
      output += data.toString()
    })

    test.on('close', (code) => {
      if (output.trim() === '200') {
        console.log('✅ 部署验证成功 - 服务正常运行')
        console.log('🎉 MVP 已就绪，可以开始测试!')
      } else {
        console.log('⚠️  验证失败，请检查服务状态')
      }
      resolve()
    })
  })
}

// 主执行流程
async function main() {
  try {
    await cleanup()
    await buildProject()
    const server = await startProduction()
    await verifyDeployment()

    // 优雅关闭处理
    process.on('SIGINT', () => {
      console.log('\n🛑 正在关闭服务器...')
      server.kill('SIGINT')
      process.exit(0)
    })

  } catch (error) {
    console.error('❌ 部署失败:', error.message)
    process.exit(1)
  }
}

main()