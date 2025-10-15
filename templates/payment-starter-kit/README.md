# Universal Payment Starter Kit

一个通用的支付解决方案，支持 Creem、PayPal、Stripe 等多种支付方式。

## 🚀 快速开始

### 1. 安装依赖
```bash
# 使用 npm
npm install universal-payment-starter-kit

# 使用 yarn
yarn add universal-payment-starter-kit

# 使用 pnpm
pnpm add universal-payment-starter-kit
```

### 2. 复制配置文件
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件，填入你的 API 密钥
# nano .env
```

### 3. 启动项目
```bash
# 开发环境
npm run dev

# 构建项目
npm run build

# 启动预览
npm run start
```

## 🔧 配置说明

### 环境变量
```bash
# Creem 配置
CREEM_API_KEY=your_creem_api_key
CREEM_SECRET_KEY=your_creem_secret_key
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret

# PayPal 配置（可选）
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Stripe 配置（可选）
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# 应用配置
NUXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=development
```

### 支持的支付方式
- **Creem**: 新兴支付平台，API简单易用
- **PayPal**: 全球广泛使用的支付服务
- **Stripe**: 功能最全面的支付解决方案

## 📦 使用示例

### 基本支付创建
```javascript
import { createUniversalPayment } from '~/shared/payment/universal-payment'

// 创建支付实例
const payment = createUniversalPayment({
  creemApiKey: process.env.CREEM_API_KEY,
  creemSecretKey: process.env.CREEM_SECRET_KEY,
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET
})

// 创建支付
const result = await payment.createPaymentSession('creem', {
  amount: 9.99,
  currency: 'USD',
  description: 'Pro Monthly Subscription',
  type: 'subscription',
  successUrl: 'https://your-site.com/success',
  cancelUrl: 'https://your-site.com/cancel',
  metadata: {
    userId: 'user_123',
    planId: 'pro_monthly'
  }
})

console.log('支付创建成功:', result)
```

### 多支付方式支持
```javascript
// 支持的支付方式
const providers = payment.getAvailableProviders()
console.log('可用支付方式:', providers) // ['creem', 'paypal', 'stripe']

// 根据用户偏好选择支付方式
const preferredProvider = 'creem'
const result = await payment.createPaymentSession(preferredProvider, paymentData)
```

### 支付验证
```javascript
// 验证支付状态
const verification = await payment.verifyPaymentSession('creem', paymentId)

if (verification.success) {
  console.log('支付验证成功:', verification.payment)
  // 处理支付成功逻辑
} else {
  console.error('支付验证失败:', verification.error)
}
```

## 🔧 API 参考

### UniversalPayment 类
```javascript
const payment = createUniversalPayment(config)

// 检查支付系统状态
const status = payment.getStatus()
console.log('支付系统状态:', status)

// 获取支持的支付提供商
const providers = payment.getAvailableProviders()

// 检查特定支付提供商是否可用
const isCreemAvailable = payment.isProviderAvailable('creem')
const supportedCurrencies = payment.getSupportedCurrencies('creem')
```

### 支付方法
```javascript
// 创建支付会话
const result = await payment.createPaymentSession(provider, paymentData)

// 验证支付
const verification = await payment.verifyPaymentSession(provider, paymentId)

// 格式化金额
const formattedAmount = payment.formatAmount(9.99, 'USD') // $9.99

// 验证支付数据
const validation = payment.validatePaymentData(paymentData)
```

## 🎨 支付类型

### 一次性支付
```javascript
const oneTimePayment = {
  amount: 9.99,
  currency: 'USD',
  description: '解锁高级功能',
  type: 'one_time',
  toolId: 'advanced-tool'
}
```

### 订阅支付
```javascript
const subscriptionPayment = {
  amount: 9.99,
  currency: 'USD',
  description: 'Pro Monthly Subscription',
  type: 'subscription',
  planId: 'pro_monthly'
}
```

## 🔐 错误处理

### 常见错误类型
- `支付提供商不可用`: 检查API密钥配置
- `支付数据验证失败`: 检查必需字段
- `支付创建失败`: 检查API调用和网络连接
- `支付验证失败`: 检查支付ID是否正确

### 错误处理示例
```javascript
try {
  const result = await payment.createPaymentSession('creem', paymentData)
  console.log('支付创建成功:', result)
} catch (error) {
  if (error.message.includes('Creem')) {
    console.error('Creem 相关错误:', error.message)
    // 处理 Creem 特定错误
  } else if (error.message.includes('API密钥')) {
    console.error('配置错误: 检查环境变量')
    // 提示配置解决方案
  } else {
    console.error('支付创建失败:', error.message)
  }
}
```

## 🛡️ 安全最佳实践

### 1. 环境变量管理
- 使用 `.env` 文件存储敏感信息
- 永远不要在代码中硬编码API密钥
- 在生产环境使用环境变量管理

### 2. 支付验证
- 始终验证Webhook签名
- 记录所有支付事件
- 实现双重验证机制

### 3. 错误处理
- 提供用户友好的错误提示
- 记录详细的错误日志
- 实现重试机制

## 📊 监控和日志

### 日志记录
```javascript
// 支付创建日志
console.log('支付创建:', {
  provider: 'creem',
  paymentId: payment.id,
  amount: payment.amount,
  status: payment.status
})

// 错误日志
console.error('支付错误:', {
  error: error.message,
  stack: error.stack
})
```

### 状态监控
```javascript
// 检查支付系统状态
const status = payment.getStatus()
console.log('支付系统状态:', status)

// 检查特定支付提供商
const creemStatus = payment.isProviderAvailable('creem')
console.log('Creem 可用性:', creemStatus)
```

## 🔄 部署配置

### Vercel 部署
1. 在 Vercel Dashboard 中配置环境变量
2. 设置正确的 Webhook URLs
3. 确保域名已验证

### 环境变量配置
```json
{
  "CREEM_API_KEY": "ck_live_xxxxxxxxxxxx",
  "CREEM_SECRET_KEY": "sk_live_xxxxxxxxxxxx",
  "CREEM_WEBHOOK_SECRET": "whsec_xxxxxxxxxxxx"
}
```

### Webhook URLs
```
# Creem
https://your-domain.com/api/pay/webhook

# PayPal
https://your-domain.com/api/pay/webhook

# Stripe
https://your-domain.com/api/pay/webhook
```

## 📚 进阶功能

### 多货币支持
```javascript
// 支持的货币
const supportedCurrencies = payment.getSupportedCurrencies('creem')
console.log('支持的货币:', supportedCurrencies)
```

### 自定义支付流程
```javascript
// 自定义支付创建逻辑
payment.onPaymentCreated = (payment) => {
  console.log('新支付创建:', payment.id)
  // 发送通知
  // 更新数据库
  // 触发邮件等
}
```

### 批量支付验证
```javascript
const paymentIds = ['payment_1', 'payment_2', 'payment_3']
const verifications = await Promise.all(
  paymentIds.map(id => payment.verifyPaymentSession('creem', id))
)
)
```

## 🎯 故障排除

### 常见问题
1. **支付创建失败**: 检查API密钥和网络连接
2. **Webhook不工作**: 确认URL配置和签名验证
3. **支付验证失败**: 检查支付ID和状态
4. **跨域问题**: 检查CORS设置

### 调试步骤
1. 检查环境变量配置
2. 验证API密钥有效性
3. 测试支付创建和验证流程
4. 检查Webhook接收状态
5. 监控错误日志

## 📞 更多资源

- [Creem 官方文档](https://docs.creem.io)
- [PayPal 开发者文档](https://developer.paypal.com/)
- [Stripe API 文档](https://stripe.com/docs/api)
- [Nuxt.js 文档](https://nuxt.com/)

---

💡 **提示**: 这个starter kit 提供了基础的支付功能，可以根据项目需求进行扩展和定制。