#!/bin/bash

# AI Toolbox Pro 部署脚本
# 此脚本用于部署项目到生产环境

echo "🚀 开始部署 AI Toolbox Pro..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装项目依赖..."
npm ci

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建是否成功
if [ ! -d ".output" ]; then
    echo "❌ 构建失败！请检查错误信息。"
    exit 1
fi

echo "✅ 构建成功！"
echo "📁 构建产物位于 .output 目录"
echo ""
echo "🎯 部署选项："
echo "1. 本地运行: node .output/server/index.mjs"
echo "2. PM2 运行: pm2 start .output/server/index.mjs --name ai-toolbox"
echo "3. Docker 部署: docker build -t ai-toolbox . && docker run -p 3000:3000 ai-toolbox"
echo "4. 静态部署: npm run generate (生成静态文件)"
echo ""
echo "🔧 环境变量配置："
echo "- NODE_ENV: production"
echo "- PORT: 3000 (或其他端口)"
echo "- NUXT_PUBLIC_API_URL: 你的 API 地址 (可选)"
echo ""
echo "🎉 部署完成！现在可以启动应用了。"