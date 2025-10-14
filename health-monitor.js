#!/usr/bin/env node

/**
 * 健康监测脚本 - 自动监控项目状态
 * 可以设置为定期运行，自动发现问题并通知
 */

import http from 'http'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class HealthMonitor {
  constructor() {
    this.config = {
      devPort: 3000,
      prodPort: 3001,
      checkInterval: 30000, // 30秒检查一次
      endpoints: [
        '/',
        '/tools',
        '/tools/json-formatter',
        '/tools/base64',
        '/tools/password-generator',
        '/tools/color-picker',
        '/tools/url-encoder',
        '/tools/qr-code',
        '/zh',
        '/zh/tools'
      ]
    }
    this.logFile = path.join(__dirname, 'health-monitor.log')
    this.statusFile = path.join(__dirname, 'project-status.json')
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString()
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }

    const logMessage = `${timestamp} [${level.toUpperCase()}] ${icons[level]} ${message}`
    console.log(logMessage)

    // 写入日志文件
    fs.appendFileSync(this.logFile, logMessage + '\n')
  }

  async checkUrl(url, port) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: port,
        path: url,
        timeout: 5000
      }

      const request = http.request(options, (response) => {
        resolve({
          url: `http://localhost:${port}${url}`,
          status: response.statusCode,
          working: response.statusCode === 200
        })
      })

      request.on('error', () => {
        resolve({
          url: `http://localhost:${port}${url}`,
          status: 'ERROR',
          working: false
        })
      })

      request.on('timeout', () => {
        request.destroy()
        resolve({
          url: `http://localhost:${port}${url}`,
          status: 'TIMEOUT',
          working: false
        })
      })

      request.end()
    })
  }

  async checkServerHealth(port, serverType) {
    this.log(`检查 ${serverType} 服务器健康状态 (端口 ${port})...`, 'info')

    const results = []
    for (const endpoint of this.config.endpoints) {
      const result = await this.checkUrl(endpoint, port)
      results.push(result)

      if (!result.working) {
        this.log(`${serverType} 服务器问题: ${result.url} - ${result.status}`, 'error')
      }
    }

    const workingCount = results.filter(r => r.working).length
    const totalCount = results.length

    if (workingCount === totalCount) {
      this.log(`${serverType} 服务器完全正常 (${workingCount}/${totalCount})`, 'success')
    } else {
      this.log(`${serverType} 服务器部分异常 (${workingCount}/${totalCount})`, 'warning')
    }

    return {
      serverType,
      port,
      total: totalCount,
      working: workingCount,
      results
    }
  }

  async autoFixIssues() {
    this.log('尝试自动修复问题...', 'info')

    try {
      // 清理可能的进程冲突
      await this.executeCommand('taskkill /F /IM node.exe 2>nul', '清理Node进程')
      await this.sleep(2000)

      // 重新安装依赖
      await this.executeCommand('npm install', '重新安装依赖')

      // 重新构建
      await this.executeCommand('npm run build', '重新构建')

      this.log('自动修复完成', 'success')
      return true
    } catch (error) {
      this.log(`自动修复失败: ${error.message}`, 'error')
      return false
    }
  }

  executeCommand(command, description) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true, stdio: 'pipe' })

      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`${description} 失败`))
        }
      })

      child.on('error', reject)
    })
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  generateReport(devHealth, prodHealth) {
    const report = {
      timestamp: new Date().toISOString(),
      development: devHealth,
      production: prodHealth,
      summary: {
        devHealthy: devHealth && devHealth.working === devHealth.total,
        prodHealthy: prodHealth && prodHealth.working === prodHealth.total,
        overallHealthy: (devHealth?.working || 0) + (prodHealth?.working || 0) ===
                        (devHealth?.total || 0) + (prodHealth?.total || 0)
      }
    }

    // 保存状态报告
    fs.writeFileSync(this.statusFile, JSON.stringify(report, null, 2))

    return report
  }

  async startContinuousMonitoring() {
    this.log('开始持续监控...', 'info')
    this.log('按 Ctrl+C 停止监控', 'warning')

    const monitor = async () => {
      try {
        // 检查开发环境
        const devHealth = await this.checkServerHealth(this.config.devPort, '开发')

        // 检查生产环境
        const prodHealth = await this.checkServerHealth(this.config.prodPort, '生产')

        // 生成报告
        const report = this.generateReport(devHealth, prodHealth)

        // 如果有问题，尝试自动修复
        if (!report.summary.overallHealthy) {
          this.log('检测到问题，尝试自动修复...', 'warning')
          const fixed = await this.autoFixIssues()
          if (fixed) {
            this.log('问题已自动修复', 'success')
          }
        }

      } catch (error) {
        this.log(`监控错误: ${error.message}`, 'error')
      }
    }

    // 立即执行一次
    await monitor()

    // 设置定期检查
    setInterval(monitor, this.config.checkInterval)
  }

  async runOnce() {
    this.log('执行一次性健康检查...', 'info')

    try {
      const devHealth = await this.checkServerHealth(this.config.devPort, '开发')
      const prodHealth = await this.checkServerHealth(this.config.prodPort, '生产')
      const report = this.generateReport(devHealth, prodHealth)

      console.log('\n📊 健康检查报告')
      console.log('=' .repeat(50))

      if (report.summary.overallHealthy) {
        console.log('✅ 所有服务运行正常')
      } else {
        console.log('⚠️ 存在问题需要处理')
        if (!report.summary.devHealthy) console.log('  - 开发环境异常')
        if (!report.summary.prodHealthy) console.log('  - 生产环境异常')
      }

      console.log(`📄 详细报告已保存到: ${this.statusFile}`)
      console.log(`📝 监控日志: ${this.logFile}`)

    } catch (error) {
      this.log(`健康检查失败: ${error.message}`, 'error')
    }
  }
}

// 处理命令行参数
const args = process.argv.slice(2)
const monitor = new HealthMonitor()

if (args.includes('--continuous')) {
  monitor.startContinuousMonitoring()
} else if (args.includes('--once')) {
  await monitor.runOnce()
} else {
  console.log('用法:')
  console.log('  node health-monitor.js --once      # 执行一次性检查')
  console.log('  node health-monitor.js --continuous # 开始持续监控')
  process.exit(1)
}