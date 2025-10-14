# 支付功能完整测试指南

## 🔧 测试环境准备

### 1. 开发环境配置

首先需要在本地开发环境中配置支付服务：

#### 1.1 配置本地环境变量

创建 `.env.local` 文件：

```bash
# Creem 测试环境配置
CREEM_API_KEY=your_creem_test_api_key
CREEM_SECRET_KEY=your_creem_test_secret_key
CREEM_WEBHOOK_SECRET=your_creem_test_webhook_secret

# PayPal 测试环境配置
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_MODE=sandbox

# Stripe 测试环境配置
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_test_webhook_secret

# 本地应用配置
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

#### 1.2 启动本地开发服务器

```bash
npm run dev
```

## 🚀 PayPal 测试（推荐新手）

### 2.1 PayPal 开发者账号设置

1. **注册 PayPal 开发者账号**
   - 访问：https://developer.paypal.com/
   - 使用 PayPal 账号登录或注册新账号

2. **创建测试账号**
   - 进入 Dashboard → Accounts → Create Account
   - 创建一个 "Personal" 类型的测试买家账号
   - 创建一个 "Business" 类型的测试商家账号

3. **获取测试 API 凭据**
   - 进入 Dashboard → Apps & Credentials → Create App
   - 选择 Sandbox 模式
   - 获取 Client ID 和 Client Secret

### 2.2 配置 PayPal 回调 URL

在 PayPal 开发者平台设置：
- **Return URL**: `http://localhost:3000/payment/success`
- **Cancel URL**: `http://localhost:3000/payment/cancel`

### 2.3 测试 PayPal 支付流程

#### 使用 Postman 或 curl 测试 API：

```bash
curl -X POST http://localhost:3000/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9.99,
    "currency": "USD",
    "description": "测试支付 - AI Toolbox Pro",
    "type": "one_time",
    "paymentMethod": "paypal",
    "successUrl": "http://localhost:3000/payment/success",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }'
```

#### 通过 Web 界面测试：

1. 访问 `http://localhost:3000`
2. 查找支付相关页面或按钮
3. 选择 PayPal 作为支付方式
4. 使用测试账号完成支付

### 2.4 验证支付结果

1. **检查本地日志**
   ```bash
   tail -f .nuxt/logs/server.log
   ```

2. **查看支付记录**
   - 检查是否有支付成功的日志
   - 验证支付状态更新

## 💳 Stripe 测试（推荐进阶用户）

### 3.1 Stripe 测试账号设置

1. **注册 Stripe 账号**
   - 访问：https://dashboard.stripe.com/
   - 注册账号并完成邮箱验证

2. **获取测试 API 密钥**
   - 进入 Developers → API keys
   - 复制 "Test mode" 下的 Publishable key 和 Secret key

### 3.2 配置 Stripe Webhook

1. **创建 Webhook 端点**
   - 在 Stripe Dashboard → Developers → Webhooks
   - 添加端点：`http://localhost:3000/api/pay/webhook`
   - 使用 ngrok 将本地端口暴露到公网：
     ```bash
     npm install -g ngrok
     ngrok http 3000
     ```
   - 使用 ngrok 提供的 URL 设置 Webhook

2. **选择 Webhook 事件**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`

### 3.3 使用 Stripe 测试卡号

Stripe 提供了专门的测试卡号：

| 卡号 | 用途 | 结果 |
|------|------|------|
| 4242424242424242 | 成功支付 | ✅ 成功 |
| 4000000000000002 | 卡被拒绝 | ❌ 失败 |
| 4000000000009995 | 余额不足 | ❌ 失败 |
| 4000000000009987 | 卡丢失 | ❌ 失败 |

### 3.4 测试 Stripe 支付

```bash
curl -X POST http://localhost:3000/api/pay/stripe/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 19.99,
    "currency": "USD",
    "description": "Stripe 测试支付",
    "type": "one_time",
    "paymentMethod": "stripe",
    "paymentId": "test_payment_123",
    "successUrl": "http://localhost:3000/payment/success",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }'
```

## 🔗 Creem 测试

### 4.1 Creem 账号设置

1. **注册 Creem 账号**
   - 访问 Creem 平台（请提供具体 URL）
   - 注册商家账号并完成验证

2. **获取 API 密钥**
   - 进入开发者设置或 API 管理
   - 获取测试环境的 API Key 和 Secret

### 4.2 配置 Webhook

在 Creem 平台设置 Webhook URL：
- **测试环境**: 使用 ngrok 提供的 URL
- **生产环境**: 部署后的实际域名

### 4.3 测试 Creem 支付

```bash
curl -X POST http://localhost:3000/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 29.99,
    "currency": "USD",
    "description": "Creem 测试支付",
    "type": "one_time",
    "paymentMethod": "creem",
    "successUrl": "http://localhost:3000/payment/success",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }'
```

## 🧪 自动化测试脚本

创建 `test-payment.js` 脚本：

```javascript
// test-payment.js
const testPayment = async () => {
  try {
    console.log('🚀 开始测试支付功能...')

    // 测试创建支付
    const response = await fetch('http://localhost:3000/api/pay/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1.00, // 测试用小额支付
        currency: 'USD',
        description: '自动化测试支付',
        type: 'one_time',
        paymentMethod: 'paypal',
        successUrl: 'http://localhost:3000/payment/success',
        cancelUrl: 'http://localhost:3000/payment/cancel'
      })
    })

    const result = await response.json()
    console.log('✅ 支付创建成功:', result)

    // 这里可以添加支付验证逻辑

  } catch (error) {
    console.error('❌ 支付测试失败:', error)
  }
}

testPayment()
```

运行测试：
```bash
node test-payment.js
```

## 🔍 支付验证和调试

### 5.1 查看支付日志

```bash
# 查看开发服务器日志
tail -f .nuxt/logs/server.log

# 或者查看控制台输出
# 开发服务器会显示支付相关的日志信息
```

### 5.2 数据库/存储验证

如果您使用了数据持久化：

```javascript
// 检查支付记录是否正确保存
async function verifyPayment(paymentId) {
  const response = await fetch(`http://localhost:3000/api/pay/status?paymentId=${paymentId}`)
  const payment = await response.json()
  console.log('支付状态:', payment)
  return payment
}
```

### 5.3 Webhook 测试工具

使用工具测试 Webhook：

```bash
# 使用 stripe-cli 测试 Stripe webhook
stripe listen --forward-to localhost:3000/api/pay/webhook

# 使用 ngrok + curl 测试其他平台的 webhook
curl -X POST http://your-ngrok-url/api/pay/webhook \
  -H "Content-Type: application/json" \
  -d '{"event_type": "payment.completed", "data": {...}}'
```

## 🎯 推荐的测试流程

### 步骤 1: PayPal 测试（最简单）
1. 配置 PayPal Sandbox
2. 使用测试账号进行小额支付（$0.01）
3. 验证支付流程和回调

### 步骤 2: Stripe 测试
1. 配置 Stripe 测试环境
2. 使用测试卡号进行支付
3. 验证 Webhook 接收

### 步骤 3: 完整流程测试
1. 测试成功支付流程
2. 测试失败支付流程
3. 测试取消支付流程
4. 测试退款流程（如果支持）

## 🚨 注意事项

### 安全提醒
- **永远不要在代码中硬编码真实的 API 密钥**
- **仅在测试环境使用测试账号和卡号**
- **测试完成后及时检查并撤销测试支付**

### 测试金额建议
- 使用最小金额（$0.01 - $1.00）进行测试
- 避免使用大额测试支付
- 定期检查测试账号的余额和交易记录

### 环境隔离
- 测试环境和生产环境完全分离
- 不要在生产环境使用测试配置
- 部署前确保所有测试配置已移除

## 📞 故障排除

### 常见问题

1. **API 密钥错误**
   - 检查环境变量是否正确设置
   - 确认使用的是测试环境密钥

2. **Webhook 不工作**
   - 使用 ngrok 暴露本地端口
   - 检查防火墙设置
   - 验证 Webhook URL 格式

3. **支付创建失败**
   - 检查 API 参数格式
   - 验证金额和货币代码
   - 查看错误日志详情

4. **回调接收不到**
   - 检查支付平台配置
   - 验证 Webhook 签名
   - 查看网络连接状态

---

通过这个详细的测试指南，您可以安全、完整地测试所有支付功能，确保系统在正式上线前能够正常工作。