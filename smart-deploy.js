#!/usr/bin/env node

/**
 * 智能部署脚本 - 一键完成从开发到上线的完整流程
 * 自动检测问题、修复、测试、构建和部署
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class SmartDeploy {
  constructor() {
    this.steps = [
      { name: '检查项目状态', action: this.checkProject.bind(this) },
      { name: '清理环境', action: this.cleanEnvironment.bind(this) },
      { name: '安装依赖', action: this.installDependencies.bind(this) },
      { name: '开发环境测试', action: this.testDev.bind(this) },
      { name: '构建生产版本', action: this.buildProduction.bind(this) },
      { name: '生产环境测试', action: this.testProduction.bind(this) },
      { name: '生成部署报告', action: this.generateReport.bind(this) }
    ]
    this.results = []
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

  async checkUrl(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.makeHttpRequest(url)
        if (response.statusCode === 200) {
          return true
        }
      } catch (error) {
        if (i === retries - 1) throw error
        await this.sleep(2000)
      }
    }
    return false
  }

  makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const request = http.get(url, (response) => {
        resolve(response)
      })

      request.on('error', reject)
      request.setTimeout(5000, () => {
        request.destroy()
        reject(new Error('请求超时'))
      })
    })
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async checkProject() {
    this.log('检查项目结构和配置文件...', 'progress')

    const requiredFiles = [
      'package.json',
      'nuxt.config.ts',
      'start-prod.js'
    ]

    for (const file of requiredFiles) {
      try {
        await this.executeCommand(`if exist "${file}" (echo OK)`, `检查 ${file}`)
      } catch (error) {
        throw new Error(`缺少必要文件: ${file}`)
      }
    }

    this.results.push({ step: '项目检查', status: 'success', message: '所有必要文件存在' })
  }

  async cleanEnvironment() {
    this.log('清理开发环境...', 'progress')
    try {
      await this.executeCommand('taskkill /F /IM node.exe 2>nul', '终止Node进程')
      await this.sleep(2000)
      this.results.push({ step: '环境清理', status: 'success', message: '环境清理完成' })
    } catch (error) {
      this.log('环境清理跳过（没有运行的进程）', 'warning')
      this.results.push({ step: '环境清理', status: 'warning', message: '没有需要清理的进程' })
    }
  }

  async installDependencies() {
    this.log('安装项目依赖...', 'progress')
    await this.executeCommand('npm install', '安装依赖', 120000)
    this.results.push({ step: '依赖安装', status: 'success', message: '依赖安装完成' })
  }

  async testDev() {
    this.log('启动开发环境测试...', 'progress')

    // 启动开发服务器
    const devServer = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      stdio: 'pipe',
      detached: true
    })

    await this.sleep(10000) // 等待服务器启动

    try {
      const devWorking = await this.checkUrl('http://localhost:3000')
      if (devWorking) {
        this.log('开发环境测试通过', 'success')
        this.results.push({ step: '开发测试', status: 'success', message: '开发环境正常工作' })
      }
    } catch (error) {
      throw new Error('开发环境测试失败')
    }

    // 关闭开发服务器
    process.kill(-devServer.pid)
    await this.sleep(3000)
  }

  async buildProduction() {
    this.log('构建生产版本...', 'progress')
    await this.executeCommand('npm run build', '生产构建', 300000)
    this.results.push({ step: '生产构建', status: 'success', message: '构建成功完成' })
  }

  async testProduction() {
    this.log('测试生产版本...', 'progress')

    // 启动生产服务器
    const prodServer = spawn('npm', ['run', 'start:prod'], {
      cwd: __dirname,
      stdio: 'pipe',
      detached: true
    })

    await this.sleep(8000) // 等待服务器启动

    try {
      const urls = [
        'http://localhost:3001/',
        'http://localhost:3001/tools',
        'http://localhost:3001/tools/json-formatter',
        'http://localhost:3001/zh',
        'http://localhost:3001/zh/tools'
      ]

      let allWorking = true
      for (const url of urls) {
        try {
          const working = await this.checkUrl(url)
          if (!working) {
            allWorking = false
            break
          }
        } catch (error) {
          allWorking = false
          break
        }
      }

      if (allWorking) {
        this.log('生产环境测试通过', 'success')
        this.results.push({ step: '生产测试', status: 'success', message: '所有页面正常工作' })
      } else {
        throw new Error('部分页面测试失败')
      }
    } catch (error) {
      throw new Error('生产环境测试失败')
    }

    // 关闭生产服务器
    process.kill(-prodServer.pid)
    await this.sleep(3000)
  }

  generateReport() {
    this.log('\n📊 部署报告', 'info')
    this.log('=' .repeat(50), 'info')

    let successCount = 0
    this.results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
      this.log(`${icon} ${result.step}: ${result.message}`, result.status)
      if (result.status === 'success') successCount++
    })

    this.log('\n' + '=' .repeat(50), 'info')
    this.log(`总体结果: ${successCount}/${this.results.length} 步骤成功`,
      successCount === this.results.length ? 'success' : 'warning')

    if (successCount === this.results.length) {
      this.log('\n🎉 项目已准备就绪，可以部署！', 'success')
      this.log('部署命令: npm run start:prod', 'info')
    } else {
      this.log('\n⚠️ 项目存在问题，需要手动检查', 'warning')
    }

    // 保存报告到文件
    const reportContent = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: this.results.length,
        success: successCount,
        ready: successCount === this.results.length
      }
    }

    require('fs').writeFileSync(
      path.join(__dirname, 'deploy-report.json'),
      JSON.stringify(reportContent, null, 2)
    )

    this.log('📄 详细报告已保存到 deploy-report.json', 'info')
  }

  async run() {
    this.log('🚀 开始智能部署流程...', 'info')
    this.log('这个脚本将自动完成所有检查和部署步骤', 'info')
    this.log('您不需要进行任何操作，请耐心等待...\n', 'info')

    try {
      for (const step of this.steps) {
        this.log(`\n📍 步骤: ${step.name}`, 'progress')
        await step.action()
      }
    } catch (error) {
      this.log(`\n❌ 部署流程失败: ${error.message}`, 'error')
      this.log('请检查错误信息并手动处理相关问题', 'warning')
      process.exit(1)
    }
  }
}

// 运行智能部署
const deploy = new SmartDeploy()
deploy.run()