# Creem 支付集成指南

## 🚀 快速开始

### 1. 注册 Creem 账号
1. 访问 Creem 官网并注册商家账号
2. 完成实名认证和商家验证
3. 进入开发者控制台获取 API 密钥

### 2. 获取 API 密钥
在 Creem 控制台中获取以下密钥：
- **API Key**: 用于发起支付请求
- **Secret Key**: 用于签名验证
- **Webhook Secret**: 用于验证 Webhook 回调

### 3. 配置环境变量
复制 `.env.example` 为 `.env.local` 并填入你的密钥：

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑配置文件
# CREEM_API_KEY=ck_live_xxxxxxxxxxxxxxxxxxxxx
# CREEM_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
# CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 4. 安装依赖
```bash
npm install
```

## 🔧 API 集成

### 基本配置
我们已经集成了官方的 `creem` 和 `nuxt-creem` 包，你可以在代码中这样使用：

```javascript
// 在 server/api 中
import { Creem } from 'creem'

const creem = new Creem({
  apiKey: process.env.CREEM_API_KEY,
  secretKey: process.env.CREEM_SECRET_KEY
})
```

### 创建支付会话
```javascript
// 创建支付
const payment = await creem.payments.create({
  amount: 9.99,
  currency: 'USD',
  description: 'AI Toolbox Pro 订阅',
  returnUrl: 'https://your-site.com/payment/success',
  cancelUrl: 'https://your-site.com/payment/cancel'
})

// 获取支付 URL
const paymentUrl = payment.checkoutUrl
```

## 🧪 测试配置

### 本地测试
1. 启动开发服务器：
```bash
npm run dev
```

2. 使用测试 API 密钥（通常以 `ck_test_` 开头）

3. 测试支付流程：
```bash
curl -X POST http://localhost:3000/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.01,
    "currency": "USD",
    "description": "测试支付",
    "type": "one_time",
    "paymentMethod": "creem"
  }'
```

### Webhook 测试
使用 ngrok 暴露本地端口到公网：

```bash
# 安装 ngrok
npm install -g ngrok

# 暴露本地端口
ngrok http 3000

# 在 Creem 控制台设置 Webhook URL:
# https://your-ngrok-url.ngrok.io/api/pay/webhook
```

## 🎯 支付流程

### 1. 创建支付
```javascript
// 发起支付请求
const paymentResponse = await $fetch('/api/pay/create', {
  method: 'POST',
  body: {
    amount: 9.99,
    currency: 'USD',
    description: 'Pro Monthly 订阅',
    type: 'subscription',
    paymentMethod: 'creem'
  }
})

const { payment } = await paymentResponse.json()
```

### 2. 重定向到支付页面
```javascript
// 跳转到 Creem 支付页面
window.location.href = payment.checkoutUrl
```

### 3. 处理支付回调
用户完成支付后，Creem 会发送 Webhook 到你配置的 URL。

### 4. 验证支付状态
```javascript
// 验证支付
const verificationResponse = await $fetch('/api/pay/verify', {
  method: 'POST',
  body: {
    paymentId: 'creem_payment_123456',
    type: 'creem'
  }
})

const { success, payment } = await verificationResponse.json()
```

## 🔒 安全最佳实践

### 1. 环境变量管理
- 永远不要在代码中硬编码 API 密钥
- 使用 `.env.local` 存储开发环境密钥
- 在生产环境使用平台的环境变量管理

### 2. Webhook 验证
- 验证所有传入的 Webhook 请求
- 使用 Creem 提供的签名验证机制
- 记录和监控异常的 Webhook 请求

### 3. 错误处理
- 实现完善的错误处理机制
- 提供用户友好的错误提示
- 记录详细的错误日志用于调试

## 📊 监控和调试

### 查看日志
```bash
# 查看开发服务器日志
tail -f .nuxt/logs/server.log

# 查看支付相关日志
grep "payment" .nuxt/logs/server.log
```

### 测试数据
使用小金额进行测试（$0.01 - $1.00），避免意外的大额支付。

## 🚨 常见问题

### 1. API 密钥错误
- 确认使用的是测试环境密钥
- 检查环境变量是否正确设置
- 验证密钥格式是否正确

### 2. Webhook 不工作
- 确认 Webhook URL 可以访问
- 使用 ngrok 进行本地测试
- 检查防火墙和网络配置

### 3. 支付创建失败
- 检查请求参数格式
- 验证金额和货币代码
- 确认 API 密钥权限

## 📚 更多资源

- [Creem 官方文档](https://docs.creem.io)
- [Creem API 参考](https://api.creem.io)
- [npm 包页面](https://www.npmjs.com/package/creem)
- [GitHub 仓库](https://github.com/creem-io/creem-js)

---

💡 **提示**: 开始时建议使用测试环境和最小金额进行测试，确认一切正常后再切换到生产环境。