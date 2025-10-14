#!/bin/bash

# Vercel 支付系统部署脚本

echo "🚀 开始部署 AI Toolbox Pro 到 Vercel..."

# 检查 Vercel CLI 是否已安装
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录 Vercel
echo "🔐 检查 Vercel 登录状态..."
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "请先登录 Vercel:"
    vercel login
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查环境变量
echo "⚙️  检查环境变量..."
if [ ! -f ".env.example" ]; then
    echo "创建 .env.example 文件..."
    cat > .env.example << EOF
# Creem 支付配置
CREEM_API_KEY=your_creem_api_key
CREEM_SECRET_KEY=your_creem_secret_key
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret

# PayPal 支付配置
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Stripe 支付配置
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# 应用配置
NUXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
EOF
    echo "✅ 已创建 .env.example 文件"
    echo "⚠️  请在 Vercel Dashboard 中配置这些环境变量"
fi

# 部署到 Vercel
echo "🌐 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "📋 后续步骤:"
echo "1. 在 Vercel Dashboard 中配置环境变量"
echo "2. 设置支付服务的 Webhook URLs"
echo "3. 配置自定义域名（可选）"
echo "4. 测试支付功能"
echo ""
echo "📖 详细实施指南请查看: VERCEL_PAYMENT_SETUP.md"