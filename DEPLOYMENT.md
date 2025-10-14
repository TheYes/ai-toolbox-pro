# AI Toolbox Pro 部署指南

## 🚀 快速部署

### 方法 1: 直接运行

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 启动生产服务器
npm start
```

### 方法 2: 使用部署脚本

```bash
# 运行自动化部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 方法 3: Docker 部署

```bash
# 使用 Docker Compose（推荐）
docker-compose up -d

# 或者手动构建和运行
docker build -t ai-toolbox .
docker run -p 3000:3000 ai-toolbox
```

### 方法 4: Vercel 部署（最简单）

1. **创建 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **部署到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - 点击 "Deploy"

3. **完成！** 🎉

## 📋 环境要求

- Node.js >= 20.19.0
- npm 或 yarn
- 至少 1GB 内存
- 至少 512MB 磁盘空间

## ⚙️ 环境变量配置

创建 `.env.production` 文件：

```env
NODE_ENV=production
PORT=3000
NUXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 🔧 部署选项

### 1. 传统服务器部署

```bash
# 在服务器上
git clone <your-repo>
cd ai-small-tools
npm install
npm run build
npm start
```

### 2. PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start .output/server/index.mjs --name ai-toolbox

# 查看状态
pm2 status

# 查看日志
pm2 logs ai-toolbox

# 重启应用
pm2 restart ai-toolbox
```

### 3. Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 静态文件部署（SSG）

```bash
# 生成静态文件
npm run generate

# 将 .output/public 目录内容部署到 CDN 或静态文件服务器
```

## 🔍 健康检查

应用启动后，可以通过以下方式检查健康状态：

```bash
# 检查应用是否响应
curl http://localhost:3000

# 检查 API 健康状态
curl http://localhost:3000/api/health
```

## 🛠️ 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   lsof -i :3000
   # 或者使用不同端口
   PORT=3001 npm start
   ```

2. **内存不足**
   ```bash
   # 增加 Node.js 内存限制
   node --max-old-space-size=2048 .output/server/index.mjs
   ```

3. **构建失败**
   ```bash
   # 清理并重新安装
   npm run clean
   npm install
   npm run build
   ```

## 📊 监控

### 基础监控

```bash
# 使用 PM2 监控
pm2 monit

# 查看应用状态
pm2 describe ai-toolbox
```

### 日志管理

```bash
# PM2 日志轮转
pm2 install pm2-logrotate

# 查看应用日志
pm2 logs ai-toolbox --lines 100
```

## 🔒 安全建议

1. 使用 HTTPS（通过 Nginx 或 CDN）
2. 定期更新依赖包
3. 配置防火墙
4. 使用环境变量管理敏感信息
5. 定期备份数据

## 📈 性能优化

1. 启用 Gzip 压缩
2. 配置 CDN
3. 使用缓存策略
4. 监控性能指标

## 🚀 自动部署

可以使用 GitHub Actions 或其他 CI/CD 工具实现自动部署：

```yaml
# .github/workflows/deploy.yml 示例
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '20'
    - run: npm install
    - run: npm run build
    - name: Deploy to server
      run: |
        # 部署脚本
```

## 📞 支持

如果遇到部署问题，请检查：
1. Node.js 版本是否符合要求
2. 依赖是否正确安装
3. 端口是否可用
4. 环境变量是否正确配置

更多信息请参考 [Nuxt.js 部署文档](https://nuxt.com/docs/getting-started/deployment)。

---

🎉 **恭喜！你的AI工具站点已经可以部署了！**