# 🚀 支付功能快速测试指南

## ⚡ 5分钟快速开始

### 第一步：配置 PayPal（最简单）

1. **注册 PayPal 开发者账号**
   - 访问：https://developer.paypal.com/
   - 使用您的 PayPal 账号登录

2. **创建测试账号**
   - 进入 Dashboard → Accounts → Create Account
   - 创建 Personal 类型的测试买家账号
   - 保存测试账号的登录信息

3. **获取 API 密钥**
   - 进入 Dashboard → Apps & Credentials → Create App
   - 选择 Sandbox 模式
   - 复制 Client ID 和 Client Secret

4. **配置本地环境**
   ```bash
   # 复制环境变量文件
   cp .env.local.example .env.local

   # 编辑 .env.local 文件，填入您的 PayPal 测试密钥
   PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
   PAYPAL_MODE=sandbox
   ```

### 第二步：启动测试

1. **确保开发服务器运行**
   ```bash
   npm run dev
   ```

2. **运行测试脚本**
   ```bash
   node test-payment.js
   ```

3. **选择 PayPal 进行测试**
   - 输入数字 `1` 选择 PayPal
   - 查看生成的支付链接

4. **完成测试支付**
   - 使用测试账号登录 PayPal
   - 完成支付流程
   - 检查控制台日志

## 🎯 实际测试步骤

### 使用测试脚本测试

```bash
# 运行测试工具
node test-payment.js

# 按提示选择支付方式（推荐先选 PayPal）
# 使用提供的支付链接进行测试
# 观察控制台输出的日志信息
```

### 使用 Web 界面测试

1. 访问：http://localhost:3000
2. 查找支付相关功能
3. 选择支付方式并完成测试

### 手动 API 测试

```bash
# 测试创建支付
curl -X POST http://localhost:3000/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.01,
    "currency": "USD",
    "description": "测试支付",
    "type": "one_time",
    "paymentMethod": "paypal",
    "successUrl": "http://localhost:3000/payment/success",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }'
```

## 🔍 验证支付结果

### 检查本地日志

开发服务器会显示支付相关的日志：

```bash
# 服务器会输出类似这样的日志：
# 保存支付记录: pay_1234567890_abcdef
# PayPal 支付创建成功
# 支付状态更新: completed
```

### 检查支付状态

使用脚本检查支付状态：

```bash
# 运行测试脚本
node test-payment.js

# 选择检查支付状态功能
# 输入支付ID查看状态
```

## 🎪 测试账号信息

### PayPal 测试账号

1. **买家测试账号**
   - 在 PayPal Developer Dashboard 中创建
   - 用于完成测试支付
   - 包含虚拟余额

2. **测试卡号**
   - 使用 PayPal 提供的测试账号
   - 无需真实信用卡

### Stripe 测试卡号（如果使用）

- **成功支付**: `4242424242424242`
- **支付失败**: `4000000000000002`
- **余额不足**: `4000000000009995`
-有效期**: 任意未来日期
- **CVC**: 任意3位数字

## 📊 预期结果

### 成功的支付流程

1. ✅ API 返回支付创建成功
2. ✅ 生成有效的支付链接
3. ✅ 跳转到支付平台页面
4. ✅ 完成支付流程
5. ✅ 接收到支付成功回调
6. ✅ 支付状态更新为完成

### 日志示例

```log
[INFO] 创建支付: pay_1234567890_abcdef
[INFO] PayPal 支付创建成功: PAY-1234567890
[INFO] Webhook 接收: PAYMENT.AUTHORIZATION.CREATED
[INFO] 支付状态更新: completed
[SUCCESS] 支付流程完成
```

## 🚨 注意事项

### 安全提醒

- ⚠️ **仅使用测试环境 API 密钥**
- ⚠️ **测试金额限制在 $0.01 - $1.00**
- ⚠️ **不要使用真实信用卡或 PayPal 账号**
- ⚠️ **测试完成后检查并撤销测试支付**

### 常见问题

1. **API 密钥错误**
   - 确保使用 Sandbox 模式的密钥
   - 检查 .env.local 文件配置

2. **支付链接无效**
   - 确认开发服务器正在运行
   - 检查 URL 格式是否正确

3. **回调接收不到**
   - 检查支付平台配置
   - 使用 ngrok 暴露本地端口（如需要）

## 🎉 成功标准

当您看到以下情况时，说明支付功能测试成功：

- ✅ 支付创建 API 返回成功响应
- ✅ 生成了有效的支付链接
- ✅ 能够跳转到支付平台
- ✅ 完成支付后能看到成功回调
- ✅ 支付状态正确更新
- ✅ 本地日志显示完整的支付流程

## 📞 下一步

测试成功后，您可以：

1. **部署到 Vercel**
   ```bash
   vercel --prod
   ```

2. **配置生产环境**
   - 在 Vercel Dashboard 中设置环境变量
   - 使用真实的支付 API 密钥

3. **配置 Webhook URLs**
   - PayPal: `https://your-domain.vercel.app/api/pay/webhook`
   - Stripe: `https://your-domain.vercel.app/api/pay/webhook`

---

通过这个快速测试指南，您可以在几分钟内验证支付功能是否正常工作！