#!/usr/bin/env node

/**
 * 快速修复脚本 - 自动解决常见的开发环境问题
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class QuickFix {
  constructor() {
    this.steps = [
      { name: '强制停止所有进程', action: this.stopProcesses.bind(this) },
      { name: '清理缓存文件', action: this.cleanCache.bind(this) },
      { name: '更新依赖', action: this.updateDependencies.bind(this) },
      { name: '启动开发服务器', action: this.startDevServer.bind(this) },
      { name: '验证修复结果', action: this.verifyFix.bind(this) }
    ]
  }

  log(message, type = 'info') {
    const icons = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      progress: '🔄'
    }
    console.log(`${icons[type]} ${message}`)
  }

  async executeCommand(command, description, timeout = 60000) {
    return new Promise((resolve, reject) => {
      this.log(`执行: ${description}`, 'progress')

      const child = spawn(command, {
        shell: true,
        cwd: __dirname,
        stdio: 'pipe'
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      const timer = setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error(`命令超时: ${description}`))
      }, timeout)

      child.on('close', (code) => {
        clearTimeout(timer)
        if (code === 0) {
          this.log(`✅ ${description} - 成功`, 'success')
          resolve({ stdout, stderr, code })
        } else {
          this.log(`❌ ${description} - 失败 (代码: ${code})`, 'error')
          reject(new Error(`${description} 失败: ${stderr}`))
        }
      })

      child.on('error', (error) => {
        clearTimeout(timer)
        reject(error)
      })
    })
  }

  async stopProcesses() {
    this.log('强制停止所有相关进程...', 'progress')

    try {
      // 尝试多种方式停止进程
      await this.executeCommand('taskkill /F /IM node.exe 2>nul', '停止Node进程')
      await this.sleep(2000)
      this.log('所有进程已停止', 'success')
    } catch (error) {
      this.log('进程清理完成（可能没有运行的进程）', 'warning')
    }
  }

  async cleanCache() {
    this.log('清理缓存文件...', 'progress')

    const dirsToClean = ['.nuxt', '.output', 'node_modules/.cache', 'dist']

    for (const dir of dirsToClean) {
      try {
        if (fs.existsSync(path.join(__dirname, dir))) {
          fs.rmSync(path.join(__dirname, dir), { recursive: true, force: true })
          this.log(`已删除: ${dir}`, 'success')
        }
      } catch (error) {
        this.log(`无法删除 ${dir}: ${error.message}`, 'warning')
      }
    }

    // 清理package-lock.json以解决依赖冲突
    try {
      if (fs.existsSync(path.join(__dirname, 'package-lock.json'))) {
        fs.unlinkSync(path.join(__dirname, 'package-lock.json'))
        this.log('已删除: package-lock.json', 'success')
      }
    } catch (error) {
      this.log(`无法删除package-lock.json: ${error.message}`, 'warning')
    }
  }

  async updateDependencies() {
    this.log('重新安装依赖...', 'progress')

    try {
      // 使用npm ci进行清洁安装
      await this.executeCommand('npm install --force', '强制重新安装依赖', 180000)
      this.log('依赖安装完成', 'success')
    } catch (error) {
      this.log('依赖安装出现问题，尝试备用方案...', 'warning')

      // 备用方案：删除node_modules后重新安装
      try {
        if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
          fs.rmSync(path.join(__dirname, 'node_modules'), { recursive: true, force: true })
        }
        await this.executeCommand('npm install', '重新安装依赖', 180000)
        this.log('依赖重新安装完成', 'success')
      } catch (fallbackError) {
        throw new Error(`依赖安装失败: ${fallbackError.message}`)
      }
    }
  }

  async startDevServer() {
    this.log('启动开发服务器...', 'progress')

    // 启动开发服务器
    this.devServer = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    })

    // 等待服务器启动
    await this.sleep(10000)

    this.log('开发服务器启动中...', 'info')
  }

  async verifyFix() {
    this.log('验证修复结果...', 'progress')

    let attempts = 0
    const maxAttempts = 6

    while (attempts < maxAttempts) {
      try {
        const response = await this.checkUrl('http://localhost:3000')
        if (response.statusCode === 200) {
          this.log('✅ 开发服务器运行正常！', 'success')
          this.log('🎉 问题已成功修复！', 'success')
          this.log('📍 访问地址: http://localhost:3000', 'info')
          return true
        }
      } catch (error) {
        this.log(`尝试 ${attempts + 1}/${maxAttempts} 失败，继续等待...`, 'warning')
      }

      attempts++
      await this.sleep(5000)
    }

    throw new Error('开发服务器启动失败或无法访问')
  }

  async checkUrl(url, retries = 2) {
    for (let i = 0; i < retries; i++) {
      try {
        const http = await import('http')
        const response = await new Promise((resolve, reject) => {
          const req = http.get(url, (res) => {
            resolve(res)
          })
          req.on('error', reject)
          req.setTimeout(3000, () => {
            req.destroy()
            reject(new Error('请求超时'))
          })
        })
        return response
      } catch (error) {
        if (i === retries - 1) throw error
        await this.sleep(1000)
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async run() {
    this.log('🚀 开始快速修复...', 'info')
    this.log('这个脚本将自动修复常见的开发环境问题', 'info')
    this.log('请稍候，全程大约需要2-3分钟...\n', 'info')

    try {
      for (const step of this.steps) {
        this.log(`\n📍 步骤: ${step.name}`, 'progress')
        await step.action()
      }

      this.log('\n🎊 修复完成！您的开发环境现已正常运行！', 'success')
      this.log('💡 提示：您可以开始正常开发了', 'info')

    } catch (error) {
      this.log(`\n❌ 修复失败: ${error.message}`, 'error')
      this.log('\n🔧 手动解决步骤：', 'info')
      this.log('1. 确保没有其他程序占用端口3000', 'info')
      this.log('2. 手动删除 node_modules 和 .nuxt 文件夹', 'info')
      this.log('3. 运行: npm install', 'info')
      this.log('4. 运行: npm run dev', 'info')
      process.exit(1)
    }
  }
}

// 运行快速修复
const fix = new QuickFix()
fix.run()