# 🔧 API 密钥配置指南

## 📋 目录
- [快速开始](#快速开始)
- [Creem 支付配置](#creem-支付配置)
- [PayPal 支付配置](#paypal-支付配置)
- [Stripe 支付配置](#stripe-支付配置)
- [Vercel 部署配置](#vercel-部署配置)
- [安全最佳实践](#安全最佳实践)
- [故障排除](#故障排除)

## 🚀 快速开始

### 1. 复制环境变量模板
```bash
# 复制示例配置文件
cp .env.example .env.local
```

### 2. 编辑配置文件
编辑 `.env.local` 文件，将示例密钥替换为你的真实 API 密钥。

### 3. 重启开发服务器
```bash
npm run dev
```

## 💳 Creem 支付配置

### 获取 Creem API 密钥

1. **注册账号**
   - 访问 [Creem 官网](https://creem.io)
   - 注册商家账号并完成实名认证

2. **创建 API 密钥**
   - 登录 Creem 控制台
   - 进入 "开发者设置" → "API 密钥"
   - 创建新的 API 密钥对

3. **配置环境变量**
   ```env
   CREEM_API_KEY=ck_test_xxxxxxxxxxxxxxxxxxxxx
   CREEM_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
   CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

### 密钥格式说明
- **测试环境**: 以 `ck_test_` 和 `sk_test_` 开头
- **生产环境**: 以 `ck_live_` 和 `sk_live_` 开头

## 💰 PayPal 支付配置

### 获取 PayPal API 密钥

1. **创建开发者账号**
   - 访问 [PayPal Developer](https://developer.paypal.com)
   - 注册并登录开发者账号

2. **创建应用**
   - 进入 "My Apps & Credentials"
   - 创建新应用
   - 获取 Client ID 和 Client Secret

3. **配置环境变量**
   ```env
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox  # 或 live
   ```

### Sandbox vs Live
- **测试环境**: 使用 `sandbox` 模式
- **生产环境**: 使用 `live` 模式

## 🎯 Stripe 支付配置

### 获取 Stripe API 密钥

1. **注册账号**
   - 访问 [Stripe Dashboard](https://dashboard.stripe.com)
   - 注册并完成账号设置

2. **获取 API 密钥**
   - 进入 "Developers" → "API keys"
   - 复制可发布的密钥和秘密密钥

3. **配置环境变量**
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_MODE=test  # 或 live
   ```

### 密钥类型
- **可发布密钥**: 以 `pk_test_` 或 `pk_live_` 开头
- **秘密密钥**: 以 `sk_test_` 或 `sk_live_` 开头

## 🌐 Vercel 部署配置

### 1. 设置环境变量

1. **进入 Vercel Dashboard**
   - 选择你的项目
   - 进入 "Settings" → "Environment Variables"

2. **添加环境变量**
   ```
   NODE_ENV=production
   CREEM_API_KEY=ck_live_xxxxxxxxxxxxxxxxxxxxx
   CREEM_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

### 2. 配置 Webhook URLs

在各支付平台设置以下 Webhook URL：
```
https://your-domain.vercel.app/api/pay/webhook
```

### 3. 部署项目
```bash
npx vercel --prod
```

## 🔒 安全最佳实践

### 1. 环境变量管理
- ✅ 使用 `.env.local` 存储本地开发密钥
- ✅ 永远不要将 `.env.local` 提交到 Git
- ✅ 生产环境使用部署平台的环境变量功能
- ✅ 定期轮换 API 密钥

### 2. 密钥格式验证
```bash
# 检查 Creem 密钥格式
echo $CREEM_API_KEY | grep -E "^ck_(test|live)_"

# 检查 PayPal 密钥格式
echo $PAYPAL_CLIENT_ID | grep -E "^[A-Za-z0-9_-]+$"
```

### 3. 权限控制
- 为不同的环境使用不同的 API 密钥
- 限制 API 密钥的权限范围
- 监控 API 使用情况

## 🧪 测试配置

### 验证 API 连接
```bash
# 测试支付创建 API
curl -X POST http://localhost:3000/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.01,
    "currency": "USD",
    "description": "测试支付",
    "type": "one_time",
    "paymentMethod": "creem",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

### 验证支付提供商状态
```bash
# 检查 Creem 服务状态
curl -X GET http://localhost:3000/api/pay/status
```

## 🔧 故障排除

### 常见错误及解决方案

#### 1. "支付提供商不可用"
**原因**: API 密钥未正确配置
**解决**: 检查 `.env.local` 文件中的密钥是否正确

#### 2. "API 密钥无效"
**原因**: 使用了错误环境的密钥
**解决**: 确保测试环境使用 test 密钥，生产环境使用 live 密钥

#### 3. "Webhook 验证失败"
**原因**: Webhook 密钥不匹配
**解决**: 确保 CREEM_WEBHOOK_SECRET 与支付平台设置一致

#### 4. "环境变量未加载"
**原因**: 服务器未重启
**解决**: 重启开发服务器 `npm run dev`

### 调试技巧

1. **检查环境变量**
   ```bash
   # 打印所有环境变量（调试用）
   printenv | grep -E "(CREEM|PAYPAL|STRIPE)"
   ```

2. **查看日志**
   ```bash
   # 查看服务器日志
   tail -f .nuxt/logs/server.log
   ```

3. **测试 API 连接**
   ```bash
   # 使用测试脚本
   node test-payment.cjs
   ```

## 📞 获取帮助

如果遇到配置问题：

1. **查看文档**: [CREEM_SETUP_GUIDE.md](./CREEM_SETUP_GUIDE.md)
2. **检查日志**: 查看浏览器控制台和服务器日志
3. **测试环境**: 先在测试环境验证配置
4. **联系支持**: 各支付平台提供技术支持

---

**⚠️ 重要提醒**:
- 绝不要在代码中硬编码 API 密钥
- 定期更新和轮换密钥
- 在生产环境使用 HTTPS 协议
- 监控 API 调用和异常情况