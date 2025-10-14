# Vercel 平台支付 API 完整实施指南

## 概述

本指南详细说明如何在 Vercel 平台上部署支持多种支付方式（Creem、PayPal、Stripe）的后端 API。

## 1. 环境变量配置

### 在 Vercel Dashboard 中设置环境变量

进入 Vercel 项目设置 → Environment Variables，添加以下环境变量：

#### 支付服务配置
```bash
# Creem 支付
CREEM_API_KEY=your_creem_api_key
CREEM_SECRET_KEY=your_creem_secret_key
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret

# PayPal 支付
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # 生产环境改为 'live'

# Stripe 支付
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# 应用配置
NUXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## 2. 支付 API 实现

### 已实现的 API 端点

1. **POST** `/api/pay/create` - 创建支付
2. **POST** `/api/pay/verify` - 验证支付
3. **GET** `/api/pay/status` - 获取支付状态
4. **GET** `/api/pay/subscription/status` - 获取订阅状态
5. **GET** `/api/pay/history` - 获取支付历史
6. **POST** `/api/pay/webhook` - 处理支付回调

### 完善支付实现

#### 2.1 实现真实的 PayPal 集成

更新 `pages/api/pay/create.post.js` 中的 PayPal 实现：

```javascript
async function createPayPalPayment(paymentData, config) {
  try {
    const { createOrder } = require('@paypal/checkout-server-sdk')

    // PayPal SDK 配置
    const paypalClient = () => {
      return config.paypalMode === 'live'
        ? new core.LiveEnvironment(config.paypalClientId, config.paypalClientSecret)
        : new core.SandboxEnvironment(config.paypalClientId, config.paypalClientSecret)
    }

    const client = () => new core.PayPalHttpClient(paypalClient())

    const request = new orders.OrdersCreateRequest()
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: paymentData.currency,
          value: paymentData.amount.toString()
        },
        description: paymentData.description,
        custom_id: paymentData.id
      }],
      application_context: {
        return_url: paymentData.successUrl,
        cancel_url: paymentData.cancelUrl,
        brand_name: 'AI Toolbox Pro',
        locale: 'en-US',
        user_action: 'PAY_NOW'
      }
    })

    const response = await client().execute(request)
    const order = response.result

    // 查找 approval URL
    const approvalUrl = order.links.find(link => link.rel === 'approve')?.href

    return {
      orderId: order.id,
      approvalUrl: approvalUrl
    }

  } catch (error) {
    console.error('PayPal 支付创建失败:', error)
    throw new Error('PayPal 支付创建失败')
  }
}
```

#### 2.2 实现 Stripe 集成

创建 `pages/api/pay/stripe/create.post.js`：

```javascript
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    const stripe = new Stripe(config.stripeSecretKey)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: body.currency.toLowerCase(),
          product_data: {
            name: body.description,
            metadata: {
              payment_id: body.paymentId
            }
          },
          unit_amount: Math.round(body.amount * 100) // 转换为分
        },
        quantity: 1
      }],
      mode: body.type === 'subscription' ? 'subscription' : 'payment',
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      metadata: {
        payment_id: body.paymentId,
        plan_id: body.planId || null
      }
    })

    return {
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url
    }

  } catch (error) {
    console.error('Stripe 支付创建失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe 支付创建失败'
    })
  }
})
```

## 3. Webhook 处理

### 完善 PayPal Webhook

更新 `pages/api/pay/webhook.post.js`：

```javascript
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const headers = getHeaders(event)

    // 验证 webhook 签名
    const webhookId = headers['paypal-transmission-id']
    const timestamp = headers['paypal-transmission-time']
    const certId = headers['paypal-cert-id']
    const signature = headers['paypal-auth-algo'] + ' ' + headers['paypal-transmission-sig']

    // 这里需要实现 PayPal webhook 签名验证
    // 详细实现参考 PayPal 文档

    const eventType = body.event_type
    const resource = body.resource

    switch (eventType) {
      case 'PAYMENT.AUTHORIZATION.CREATED':
        await handlePaymentCreated(resource)
        break
      case 'PAYMENT.AUTHORIZATION.VOIDED':
        await handlePaymentVoided(resource)
        break
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(resource)
        break
      case 'CHECKOUT.ORDER.COMPLETED':
        await handleOrderCompleted(resource)
        break
    }

    return { success: true, received: true }

  } catch (error) {
    console.error('Webhook 处理失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook 处理失败'
    })
  }
})

async function handleOrderCompleted(order) {
  // 更新订单状态为已完成
  console.log('订单已完成:', order.id)

  // 这里应该：
  // 1. 更新数据库中的支付状态
  // 2. 激活用户服务/订阅
  // 3. 发送确认邮件
  // 4. 记录支付完成日志
}
```

### Stripe Webhook 实现

```javascript
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const signature = getHeader(event, 'stripe-signature')

    const stripe = new Stripe(config.stripeSecretKey)

    let stripeEvent

    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripeWebhookSecret
      )
    } catch (err) {
      console.error('Webhook 签名验证失败:', err.message)
      throw createError({
        statusCode: 400,
        statusMessage: 'Webhook 签名无效'
      })
    }

    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleStripePaymentCompleted(stripeEvent.data.object)
        break
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(stripeEvent.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object)
        break
    }

    return { success: true, received: true }

  } catch (error) {
    console.error('Stripe webhook 处理失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook 处理失败'
    })
  }
})
```

## 4. 数据持久化

### 使用 Vercel KV (Redis) 存储支付数据

在 Vercel 项目中添加 KV 存储：

```javascript
// 在 nuxt.config.ts 中配置
export default defineNuxtConfig({
  nitro: {
    experimental: {
      wasm: false
    },
    storage: {
      'payments': {
        driver: 'vercelKV',
        // KV 配置自动从环境变量读取
      }
    }
  }
})
```

### 支付记录管理

创建 `server/utils/payments.js`：

```javascript
/**
 * 支付数据管理工具
 */

// 保存支付记录
export async function savePaymentRecord(paymentData) {
  const storage = useStorage()
  await storage.setItem(`payments:${paymentData.id}`, paymentData)

  // 同时保存到用户记录
  if (paymentData.userId) {
    const userPayments = await storage.getItem(`user_payments:${paymentData.userId}`) || []
    userPayments.push(paymentData.id)
    await storage.setItem(`user_payments:${paymentData.userId}`, userPayments)
  }
}

// 获取支付记录
export async function getPaymentRecord(paymentId) {
  const storage = useStorage()
  return await storage.getItem(`payments:${paymentId}`)
}

// 更新支付状态
export async function updatePaymentStatus(paymentId, status, additionalData = {}) {
  const storage = useStorage()
  const payment = await storage.getItem(`payments:${paymentId}`)

  if (payment) {
    payment.status = status
    payment.updatedAt = new Date().toISOString()
    Object.assign(payment, additionalData)
    await storage.setItem(`payments:${paymentId}`, payment)
  }

  return payment
}

// 获取用户支付历史
export async function getUserPaymentHistory(userId, limit = 10) {
  const storage = useStorage()
  const paymentIds = await storage.getItem(`user_payments:${userId}`) || []

  const payments = []
  for (const id of paymentIds.slice(-limit)) {
    const payment = await storage.getItem(`payments:${id}`)
    if (payment) payments.push(payment)
  }

  return payments.reverse() // 最新的在前
}
```

## 5. 部署配置

### 构建配置

更新 `package.json`：

```json
{
  "scripts": {
    "build": "nuxt build",
    "vercel-build": "nuxt build",
    "start": "node .output/server/index.mjs"
  },
  "dependencies": {
    "@paypal/checkout-server-sdk": "^2.203.0",
    "stripe": "^16.12.0",
    "crypto": "^1.0.1"
  }
}
```

### Vercel 忽略文件

创建 `.vercelignore`：

```
.nuxt
.output
node_modules
.env*.local
README.md
```

## 6. 安全最佳实践

### 6.1 API 安全

```javascript
// 在 API 路由中添加安全检查
export default defineEventHandler(async (event) => {
  // 验证请求来源
  const origin = getHeader(event, 'origin')
  const allowedOrigins = [
    'https://your-domain.vercel.app',
    'https://localhost:3000'
  ]

  if (!allowedOrigins.includes(origin)) {
    throw createError({
      statusCode: 403,
      statusMessage: '访问被拒绝'
    })
  }

  // 验证用户身份（如果有用户系统）
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: '未授权访问'
    })
  }

  // 继续 API 逻辑...
})
```

### 6.2 环境变量安全

- 使用 Vercel 的加密环境变量功能
- 定期轮换 API 密钥
- 不要在代码中硬编码任何敏感信息

## 7. 监控和日志

### 错误监控

使用 Vercel Analytics 或集成第三方监控：

```javascript
// 在 API 中添加错误记录
export default defineEventHandler(async (event) => {
  try {
    // API 逻辑
  } catch (error) {
    // 记录错误到 Vercel Analytics
    console.error('API Error:', {
      error: error.message,
      stack: error.stack,
      url: event.path,
      method: event.node.req.method,
      timestamp: new Date().toISOString()
    })

    throw createError({
      statusCode: 500,
      statusMessage: '内部服务器错误'
    })
  }
})
```

## 8. 测试

### 本地测试

```bash
# 安装 Vercel CLI
npm i -g vercel

# 本地测试
vercel dev

# 测试支付 API
curl -X POST http://localhost:3000/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9.99,
    "currency": "USD",
    "description": "测试支付",
    "type": "one_time",
    "paymentMethod": "paypal"
  }'
```

### 生产测试

1. 部署到 Vercel
2. 使用真实的支付账号进行测试
3. 测试 webhook 回调
4. 验证支付流程完整性

## 9. 维护

### 定期任务

- 检查支付服务 API 更新
- 监控 API 性能和错误率
- 定期备份数据
- 更新依赖包

### 故障排除

常见问题及解决方案：

1. **支付创建失败** - 检查 API 密钥配置
2. **Webhook 不工作** - 验证 URL 和签名
3. **跨域问题** - 检查 CORS 配置
4. **性能问题** - 优化数据库查询和缓存

---

这个实施指南提供了在 Vercel 上部署完整支付系统所需的所有步骤。根据您的具体需求，可以调整和扩展这些实现。