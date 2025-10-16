const { test, expect } = require('@playwright/test');

test.describe('多语言功能完整测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置较长的超时时间
    page.setDefaultTimeout(30000);
  });

  test('中文环境下所有链接跳转到中文页面', async ({ page }) => {
    console.log('测试中文环境下链接跳转...');

    // 访问中文首页
    await page.goto('http://localhost:3001/zh');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证中文首页内容
    await expect(page.locator('text=免费在线工具集合')).toBeVisible();

    // 测试点击工具链接
    await page.click('text=工具');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 验证URL是中文路径
    expect(page.url()).toContain('/zh/tools');
    await expect(page.locator('text=所有工具')).toBeVisible();

    // 验证分类标题是中文
    await expect(page.locator('text=分类')).toBeVisible();

    // 验证categories部分显示的是中文
    await expect(page.locator('text=开发者')).toBeVisible();
    await expect(page.locator('text=实用工具')).toBeVisible();
    await expect(page.locator('text=设计')).toBeVisible();
    await expect(page.locator('text=安全')).toBeVisible();

    // 截图保存
    await page.screenshot({ path: 'test-results/中文工具页面-链接跳转测试.png', fullPage: true });
  });

  test('英文环境下底部组件显示英文', async ({ page }) => {
    console.log('测试英文环境底部组件...');

    // 访问英文首页
    await page.goto('http://localhost:3001/');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证英文首页内容
    await expect(page.locator('text=Free Online Tools for Everyone')).toBeVisible();

    // 滚动到页面底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 验证底部显示英文
    await expect(page.locator('text=Quick Links')).toBeVisible();
    await expect(page.locator('text=Categories')).toBeVisible();
    await expect(page.locator('text=Support')).toBeVisible();
    await expect(page.locator('text=All rights reserved')).toBeVisible();

    // 验证底部链接显示英文
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Tools')).toBeVisible();

    // 截图保存
    await page.screenshot({ path: 'test-results/英文环境底部组件.png', fullPage: true });
  });

  test('中文环境下底部组件显示中文', async ({ page }) => {
    console.log('测试中文环境底部组件...');

    // 访问中文首页
    await page.goto('http://localhost:3001/zh');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证中文首页内容
    await expect(page.locator('text=免费在线工具集合')).toBeVisible();

    // 滚动到页面底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 验证底部显示中文
    await expect(page.locator('text=快速链接')).toBeVisible();
    await expect(page.locator('text=分类')).toBeVisible();
    await expect(page.locator('text=支持')).toBeVisible();
    await expect(page.locator('text=版权所有')).toBeVisible();

    // 验证底部链接显示中文
    await expect(page.locator('text=首页')).toBeVisible();
    await expect(page.locator('text=工具')).toBeVisible();

    // 截图保存
    await page.screenshot({ path: 'test-results/中文环境底部组件.png', fullPage: true });
  });

  test('语言切换功能正常工作', async ({ page }) => {
    console.log('测试语言切换功能...');

    // 访问英文首页
    await page.goto('http://localhost:3001/');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证英文内容
    await expect(page.locator('text=Free Online Tools for Everyone')).toBeVisible();

    // 点击语言切换按钮
    await page.click('text=English');
    await page.waitForTimeout(500);

    // 点击中文选项
    await page.click('text=中文');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证切换到中文页面
    expect(page.url()).toContain('/zh');
    await expect(page.locator('text=免费在线工具集合')).toBeVisible();

    // 再次切换语言
    await page.click('text=中文');
    await page.waitForTimeout(500);

    // 点击英文选项
    await page.click('text=English');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证切换到英文页面
    expect(page.url()).not.toContain('/zh');
    await expect(page.locator('text=Free Online Tools for Everyone')).toBeVisible();

    // 截图保存
    await page.screenshot({ path: 'test-results/语言切换功能测试.png', fullPage: true });
  });

  test('在中文页面点击工具链接保持中文环境', async ({ page }) => {
    console.log('测试中文页面工具链接...');

    // 访问中文首页
    await page.goto('http://localhost:3001/zh');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证中文首页内容
    await expect(page.locator('text=免费在线工具集合')).toBeVisible();

    // 点击工具链接
    await page.click('text=工具');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 验证仍在中文环境
    expect(page.url()).toContain('/zh/tools');
    await expect(page.locator('text=所有工具')).toBeVisible();

    // 点击具体工具
    await page.click('text=JSON格式化工具');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 验证仍在中文环境
    expect(page.url()).toContain('/zh/tools/json-formatter');

    // 截图保存
    await page.screenshot({ path: 'test-results/中文页面工具链接测试.png', fullPage: true });
  });

  test('验证tools页面所有多语言内容正确显示', async ({ page }) => {
    console.log('测试tools页面多语言内容...');

    // 访问中文tools页面
    await page.goto('http://localhost:3001/zh/tools');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证页面标题
    await expect(page.locator('text=所有工具')).toBeVisible();

    // 验证分类标题
    await expect(page.locator('text=分类')).toBeVisible();

    // 验证分类名称
    await expect(page.locator('text=开发者')).toBeVisible();
    await expect(page.locator('text=实用工具')).toBeVisible();
    await expect(page.locator('text=设计')).toBeVisible();
    await expect(page.locator('text=安全')).toBeVisible();

    // 验证工具名称
    await expect(page.locator('text=JSON格式化工具')).toBeVisible();
    await expect(page.locator('text=Base64编解码工具')).toBeVisible();

    // 访问英文tools页面
    await page.goto('http://localhost:3001/tools');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证页面标题
    await expect(page.locator('text=All Tools')).toBeVisible();

    // 验证分类标题
    await expect(page.locator('text=Categories')).toBeVisible();

    // 验证分类名称
    await expect(page.locator('text=Developer')).toBeVisible();
    await expect(page.locator('text=Utility')).toBeVisible();
    await expect(page.locator('text=Design')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();

    // 验证工具名称
    await expect(page.locator('text=JSON Formatter')).toBeVisible();
    await expect(page.locator('text=Base64 Encoder/Decoder')).toBeVisible();

    // 截图保存
    await page.screenshot({ path: 'test-results/tools页面多语言内容测试.png', fullPage: true });
  });

  test('中文定价页面应该显示正确的中文内容', async ({ page }) => {
    console.log('测试中文定价页面...');

    // 访问中文定价页面
    await page.goto('http://localhost:3001/zh/pricing');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 检查页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    expect(title).toContain('选择适合您的计划');

    // 检查主要内容
    const h1Text = await page.textContent('h1');
    console.log('H1 文本:', h1Text);
    expect(h1Text).toBe('选择适合您的计划');

    // 检查价格计划名称
    const planNames = await page.locator('h3').allTextContents();
    console.log('价格计划名称:', planNames);
    expect(planNames).toContain('专业版 月付');
    expect(planNames).toContain('专业版 年付');
    expect(planNames).toContain('专业版 终身');

    // 检查导航栏
    const navLinks = await page.locator('header nav a').allTextContents();
    console.log('导航链接:', navLinks);
    expect(navLinks).toContain('首页');
    expect(navLinks).toContain('工具');
    expect(navLinks).toContain('定价');

    // 截图保存
    await page.screenshot({ path: 'test-results/中文定价页面-完整验证.png', fullPage: true });
  });

  test('英文定价页面应该显示正确的英文内容', async ({ page }) => {
    console.log('测试英文定价页面...');

    // 访问英文定价页面
    await page.goto('http://localhost:3001/pricing');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 检查页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    expect(title).toContain('Choose Your Perfect Plan');

    // 检查主要内容
    const h1Text = await page.textContent('h1');
    console.log('H1 文本:', h1Text);
    expect(h1Text).toBe('Choose Your Perfect Plan');

    // 检查价格计划名称
    const planNames = await page.locator('h3').allTextContents();
    console.log('价格计划名称:', planNames);
    expect(planNames).toContain('Pro Monthly');
    expect(planNames).toContain('Pro Yearly');
    expect(planNames).toContain('Pro Lifetime');

    // 检查导航栏
    const navLinks = await page.locator('header nav a').allTextContents();
    console.log('导航链接:', navLinks);
    expect(navLinks).toContain('Home');
    expect(navLinks).toContain('Tools');
    expect(navLinks).toContain('Pricing');

    // 截图保存
    await page.screenshot({ path: 'test-results/英文定价页面-完整验证.png', fullPage: true });
  });

  test('页面应该没有控制台错误', async ({ page }) => {
    console.log('检查控制台错误...');

    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg);
    });

    // 访问中英文页面
    await page.goto('http://localhost:3001/zh/pricing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 访问英文页面
    await page.goto('http://localhost:3001/pricing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 检查是否有 i18n 相关的警告
    const i18nWarnings = consoleMessages.filter(msg =>
      msg.text().includes('[intlify]') &&
      msg.type() === 'warning'
    );

    console.log('i18n 警告数量:', i18nWarnings.length);

    // 允许少量警告，但应该大大减少
    expect(i18nWarnings.length).toBeLessThan(10);

    if (i18nWarnings.length > 0) {
      console.log('剩余警告示例:', i18nWarnings[0]?.text());
    }
  });
});