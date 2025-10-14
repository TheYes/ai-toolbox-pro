#!/usr/bin/env node

/**
 * 支付功能测试脚本
 * 用于快速测试本地开发环境的支付 API
 */

const http = require('http');

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testPayment: {
    amount: 0.01, // 使用最小金额进行测试
    currency: 'USD',
    description: 'API 测试支付 - AI Toolbox Pro',
    type: 'one_time',
    successUrl: 'http://localhost:3000/payment/success',
    cancelUrl: 'http://localhost:3000/payment/cancel'
  }
};

// 支付方式选项
const PAYMENT_METHODS = {
  '1': { name: 'PayPal', method: 'paypal' },
  '2': { name: 'Stripe', method: 'stripe' },
  '3': { name: 'Creem', method: 'creem' }
};

// 发送 HTTP 请求
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 测试支付创建
async function testPaymentCreation(paymentMethod) {
  console.log(`\n🚀 测试 ${paymentMethod.name} 支付创建...`);

  const paymentData = {
    ...TEST_CONFIG.testPayment,
    paymentMethod: paymentMethod.method
  };

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/pay/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(paymentData))
    }
  };

  try {
    const result = await makeRequest(options, paymentData);

    if (result.statusCode === 200) {
      console.log('✅ 支付创建成功!');
      console.log('📋 支付详情:', JSON.stringify(result.data, null, 2));

      if (result.data.payment) {
        console.log('\n🔗 支付链接:');
        if (result.data.payment.checkoutUrl) {
          console.log(`   支付页面: ${result.data.payment.checkoutUrl}`);
        }
        if (result.data.payment.approvalUrl) {
          console.log(`   PayPal 批准页面: ${result.data.payment.approvalUrl}`);
        }
        if (result.data.payment.checkoutUrl) {
          console.log(`   Stripe 结账页面: ${result.data.payment.checkoutUrl}`);
        }
      }

      return result.data;
    } else {
      console.log('❌ 支付创建失败');
      console.log(`状态码: ${result.statusCode}`);
      console.log('错误信息:', result.data);
      return null;
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return null;
  }
}

// 检查支付状态
async function checkPaymentStatus(paymentId) {
  if (!paymentId) {
    console.log('⚠️  无支付ID，跳过状态检查');
    return;
  }

  console.log(`\n🔍 检查支付状态: ${paymentId}`);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/pay/status?paymentId=${paymentId}`,
    method: 'GET'
  };

  try {
    const result = await makeRequest(options);

    if (result.statusCode === 200) {
      console.log('✅ 支付状态查询成功');
      console.log('📊 支付状态:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ 支付状态查询失败');
      console.log(`状态码: ${result.statusCode}`);
      console.log('错误信息:', result.data);
    }
  } catch (error) {
    console.log('❌ 状态查询失败:', error.message);
  }
}

// 测试服务器连接
async function testServerConnection() {
  console.log('🔗 测试服务器连接...');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  };

  try {
    const result = await makeRequest(options);

    if (result.statusCode === 200) {
      console.log('✅ 服务器连接正常');
      return true;
    } else {
      console.log('❌ 服务器响应异常');
      return false;
    }
  } catch (error) {
    console.log('❌ 无法连接到服务器');
    console.log('请确保开发服务器正在运行: npm run dev');
    return false;
  }
}

// 显示菜单
function showMenu() {
  console.log('\n🎯 AI Toolbox Pro - 支付功能测试');
  console.log('=====================================');
  console.log('请选择支付方式:');
  Object.entries(PAYMENT_METHODS).forEach(([key, method]) => {
    console.log(`${key}. ${method.name}`);
  });
  console.log('0. 退出');
  console.log('=====================================');
}

// 主程序
async function main() {
  console.log('🛠️  AI Toolbox Pro 支付测试工具');
  console.log('=====================================');

  // 检查服务器连接
  const serverConnected = await testServerConnection();
  if (!serverConnected) {
    process.exit(1);
  }

  while (true) {
    showMenu();

    // 在 Node.js 中获取用户输入
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question('请输入选择 (0-3): ', resolve);
    });
    rl.close();

    if (answer === '0') {
      console.log('👋 退出测试程序');
      break;
    }

    const paymentMethod = PAYMENT_METHODS[answer];
    if (!paymentMethod) {
      console.log('❌ 无效选择，请重试');
      continue;
    }

    // 执行支付测试
    const paymentResult = await testPaymentCreation(paymentMethod);

    if (paymentResult && paymentResult.payment) {
      // 检查支付状态
      await checkPaymentStatus(paymentResult.payment.id || paymentResult.payment.paymentId);

      console.log('\n💡 提示:');
      console.log('1. 使用提供的支付链接完成测试支付');
      console.log('2. 使用测试账号或测试卡号');
      console.log('3. 测试金额为 $0.01，确保安全');
      console.log('4. 检查控制台日志查看支付回调');
    }

    console.log('\n按回车键继续...');
    const rl2 = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    await new Promise((resolve) => {
      rl2.question('', resolve);
    });
    rl2.close();
  }
}

// 运行主程序
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testPaymentCreation,
  checkPaymentStatus,
  testServerConnection
};