@echo off
echo 正在清除 Nuxt 缓存和依赖...

REM 步骤 1: 清除 .nuxt 目录
if exist .nuxt (
    echo 删除 .nuxt 目录...
    rmdir /s /q .nuxt
) else (
    echo .nuxt 目录不存在。
)

REM 清除 node_modules 缓存 (npm)
if exist "node_modules\.cache" (
    echo 删除 node_modules\.cache 目录...
    rmdir /s /q "node_modules\.cache"
) else (
    echo node_modules\.cache 目录不存在。
)

REM 步骤 2: 删除 package-lock.json (npm) 或 yarn.lock (yarn) 或 pnpm-lock.yaml (pnpm)
REM 根据你使用的包管理器选择对应的命令
if exist package-lock.json (
    echo 删除 package-lock.json...
    del package-lock.json
)
if exist yarn.lock (
    echo 删除 yarn.lock...
    del yarn.lock
)
if exist pnpm-lock.yaml (
    echo 删除 pnpm-lock.yaml...
    del pnpm-lock.yaml
)

REM 步骤 3: 删除 node_modules 目录
if exist node_modules (
    echo 删除 node_modules 目录...
    rmdir /s /q node_modules
) else (
    echo node_modules 目录不存在。
)

REM 步骤 4: 重新安装依赖
echo 正在重新安装依赖...

REM 检测使用的包管理器并执行相应命令
if exist yarn.lock (
    echo 检测到 yarn，正在安装依赖...
    yarn install
) else if exist pnpm-lock.yaml (
    echo 检测到 pnpm，正在安装依赖...
    pnpm install
) else (
    echo 检测到 npm，正在安装依赖...
    npm install
)

echo 清除缓存和重装依赖完成。
echo 请重新运行 'npm run dev' 或 'yarn dev' 来检查警告是否消失。
pause



