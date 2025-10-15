#!/usr/bin/env node

/**
 * 🔧 支付配置检查脚本
 * 用于验证支付 API 密钥配置是否正确
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 检查环境变量文件是否存在
function checkEnvFile() {
  logHeader('📁 环境变量文件检查');

  const envFiles = ['.env.local', '.env', '.env.example'];
  let hasLocalConfig = false;

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      if (file === '.env.local') {
        hasLocalConfig = true;
        logSuccess(`找到 ${file} - 本地配置文件`);
      } else {
        logInfo(`找到 ${file} - 配置文件`);
      }
    } else {
      logWarning(`未找到 ${file}`);
    }
  });

  if (!hasLocalConfig) {
    logError('未找到 .env.local 文件');
    logInfo('请复制 .env.example 为 .env.local 并配置你的 API 密钥');
    return false;
  }

  return true;
}

// 检查环境变量格式
function checkEnvFormat() {
  logHeader('🔑 API 密钥格式检查');

  const envPath = '.env.local';
  if (!fs.existsSync(envPath)) {
    logError('.env.local 文件不存在');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  const checks = [
    {
      name: 'Creem API Key',
      pattern: /^CREEM_API_KEY=ck_(test|live)_/,
      example: 'ck_test_xxxxxxxxxxxxxxxxxxxxx'
    },
    {
      name: 'Creem Secret Key',
      pattern: /^CREEM_SECRET_KEY=sk_(test|live)_/,
      example: 'sk_test_xxxxxxxxxxxxxxxxxxxxx'
    },
    {
      name: 'Creem Webhook Secret',
      pattern: /^CREEM_WEBHOOK_SECRET=whsec_(test|live)_/,
      example: 'whsec_test_xxxxxxxxxxxxxxxxxxxxx'
    },
    {
      name: 'PayPal Client ID',
      pattern: /^PAYPAL_CLIENT_ID=[A-Za-z0-9_-]+$/,
      example: 'your_paypal_client_id_here'
    },
    {
      name: 'Stripe Secret Key',
      pattern: /^STRIPE_SECRET_KEY=sk_(test|live)_/,
      example: 'sk_test_xxxxxxxxxxxxxxxxxxxxx'
    }
  ];

  let allValid = true;

  checks.forEach(check => {
    const line = lines.find(line => check.pattern.test(line));

    if (line) {
      const value = line.split('=')[1];
      if (value.includes('here') || value.includes('example')) {
        logWarning(`${check.name}: 使用示例值，需要替换为真实密钥`);
        allValid = false;
      } else {
        logSuccess(`${check.name}: 格式正确`);
      }
    } else {
      logWarning(`${check.name}: 未配置或格式错误`);
      logInfo(`  期望格式: ${check.example}`);
      allValid = false;
    }
  });

  return allValid;
}

// 检查依赖包是否安装
function checkDependencies() {
  logHeader('📦 依赖包检查');

  const requiredPackages = [
    'creem',
    '@paypal/paypal-js',
    '@stripe/stripe-js',
    'nuxt-creem'
  ];

  const packageJsonPath = 'package.json';
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json 文件不存在');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  requiredPackages.forEach(pkg => {
    if (dependencies[pkg]) {
      logSuccess(`${pkg}: 已安装 (${dependencies[pkg]})`);
    } else {
      logWarning(`${pkg}: 未安装`);
      logInfo(`  运行: npm install ${pkg}`);
    }
  });

  return true;
}

// 检查文件结构
function checkFileStructure() {
  logHeader('📂 文件结构检查');

  const requiredFiles = [
    'server/api/pay/create.post.js',
    'server/api/pay/verify.post.js',
    'server/services/creem-service.js',
    'shared/payment/universal-payment.js',
    'CREEM_SETUP_GUIDE.md',
    'CONFIG_GUIDE.md'
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`${file}: 存在`);
    } else {
      logError(`${file}: 不存在`);
    }
  });
}

// 生成配置报告
function generateReport() {
  logHeader('📊 配置报告');

  const envPath = '.env.local';
  let configStatus = '未配置';
  let providers = [];

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('ck_test_') || envContent.includes('ck_live_')) {
      configStatus = '已配置';

      if (envContent.includes('CREEM_API_KEY')) providers.push('Creem');
      if (envContent.includes('PAYPAL_CLIENT_ID')) providers.push('PayPal');
      if (envContent.includes('STRIPE_SECRET_KEY')) providers.push('Stripe');
    }
  }

  logInfo(`配置状态: ${configStatus}`);
  logInfo(`已配置支付方式: ${providers.join(', ') || '无'}`);

  if (providers.length === 0) {
    logWarning('建议至少配置一种支付方式');
  }

  log('\n📋 下一步操作:');
  if (configStatus === '未配置') {
    log('1. 复制 .env.example 为 .env.local', 'yellow');
    log('2. 编辑 .env.local，配置你的 API 密钥', 'yellow');
    log('3. 运行 npm run dev 启动开发服务器', 'yellow');
  } else {
    log('1. 运行 npm run dev 启动开发服务器', 'green');
    log('2. 使用 test-payment.cjs 测试支付功能', 'green');
    log('3. 查看 CONFIG_GUIDE.md 了解详细配置说明', 'green');
  }
}

// 主函数
function main() {
  logHeader('🔧 AI Toolbox Pro - 支付配置检查工具');

  const checks = [
    checkEnvFile,
    checkEnvFormat,
    checkDependencies,
    checkFileStructure
  ];

  let allPassed = true;

  checks.forEach(check => {
    const result = check();
    if (!result) allPassed = false;
  });

  generateReport();

  logHeader('🎯 检查完成');

  if (allPassed) {
    log('✅ 所有检查通过！配置看起来正确。', 'green');
    process.exit(0);
  } else {
    log('⚠️  发现一些问题，请根据上述提示修复配置。', 'yellow');
    process.exit(1);
  }
}

// 运行检查
if (require.main === module) {
  main().catch(error => {
    logError(`检查过程中发生错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkEnvFile,
  checkEnvFormat,
  checkDependencies,
  checkFileStructure,
  generateReport
};