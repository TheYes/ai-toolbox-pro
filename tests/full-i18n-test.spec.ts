import { test, expect } from '@playwright/test';

test.describe('完整国际化路由测试', () => {
  const baseUrl = 'http://localhost:3004';

  test.beforeEach(async ({ page }) => {
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });
  });

  test('中文首页正常加载', async ({ page }) => {
    console.log('测试中文首页...');
    await page.goto(`${baseUrl}/zh`);
    await page.waitForLoadState('networkidle');

    // 验证URL正确
    expect(page.url()).toContain(`${baseUrl}/zh`);

    // 验证页面加载
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // 验证页面内容
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(100);
  });

  test('英文首页正常加载', async ({ page }) => {
    console.log('测试英文首页...');
    await page.goto(`${baseUrl}/en`);
    await page.waitForLoadState('networkidle');

    // 验证URL正确
    expect(page.url()).toContain(`${baseUrl}/en`);

    // 验证页面加载
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('中文工具页面正常加载', async ({ page }) => {
    console.log('测试中文工具页面...');
    await page.goto(`${baseUrl}/zh/tools`);
    await page.waitForLoadState('networkidle');

    // 验证URL正确
    expect(page.url()).toContain(`${baseUrl}/zh/tools`);

    // 验证工具列表存在
    const toolLinks = page.locator('a.btn-primary');
    await expect(toolLinks).toHaveCount(6);

    // 验证所有工具链接都有 zh 前缀
    for (let i = 0; i < await toolLinks.count(); i++) {
      const href = await toolLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^\/zh\/tools\//);
    }
  });

  test('英文工具页面正常加载', async ({ page }) => {
    console.log('测试英文工具页面...');
    await page.goto(`${baseUrl}/en/tools`);
    await page.waitForLoadState('networkidle');

    // 验证URL正确
    expect(page.url()).toContain(`${baseUrl}/en/tools`);

    // 验证工具列表存在
    const toolLinks = page.locator('a.btn-primary');
    await expect(toolLinks).toHaveCount(6);
  });

  test('中文工具详情页正常加载', async ({ page }) => {
    console.log('测试中文工具详情页...');
    const tools = [
      '/zh/tools/json-formatter',
      '/zh/tools/base64',
      '/zh/tools/qr-code',
      '/zh/tools/url-encoder',
      '/zh/tools/color-picker',
      '/zh/tools/password-generator'
    ];

    for (const toolUrl of tools) {
      console.log(`测试工具: ${toolUrl}`);
      await page.goto(`${baseUrl}${toolUrl}`);
      await page.waitForLoadState('networkidle');

      // 验证URL正确
      expect(page.url()).toContain(`${baseUrl}${toolUrl}`);

      // 验证页面加载
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);

      // 验证返回工具页面的链接正确
      const backLink = page.locator('a[href*="/tools"]');
      if (await backLink.count() > 0) {
        const backHref = await backLink.first().getAttribute('href');
        expect(backHref).toContain('/zh/tools');
      }
    }
  });

  test('导航链接保持语言一致性', async ({ page }) => {
    console.log('测试导航链接语言一致性...');

    // 从中文首页开始
    await page.goto(`${baseUrl}/zh`);
    await page.waitForLoadState('networkidle');

    // 点击工具链接
    const toolsLink = page.locator('a:has-text("Browse Tools")');
    await expect(toolsLink).toBeVisible();
    await toolsLink.click();
    await page.waitForLoadState('networkidle');

    // 验证跳转后仍保持中文
    expect(page.url()).toContain(`${baseUrl}/zh/tools`);

    // 点击Logo返回首页
    const logoLink = page.locator('a:has-text("AI Toolbox")');
    await expect(logoLink).toBeVisible();
    await logoLink.click();
    await page.waitForLoadState('networkidle');

    // 验证返回后仍保持中文
    expect(page.url()).toContain(`${baseUrl}/zh`);
  });

  test('页面内部导航保持语言前缀', async ({ page }) => {
    console.log('测试页面内部导航...');

    // 从中文工具页面开始
    await page.goto(`${baseUrl}/zh/tools`);
    await page.waitForLoadState('networkidle');

    // 点击一个工具
    const jsonFormatterLink = page.locator('a:has-text("Use Now")').first();
    await jsonFormatterLink.click();
    await page.waitForLoadState('networkidle');

    // 验证跳转后保持中文前缀
    expect(page.url()).toContain(`${baseUrl}/zh/tools/json-formatter`);

    // 从工具页面返回工具列表
    const backToToolsLink = page.locator('a[href*="/tools"]');
    if (await backToToolsLink.count() > 0) {
      await backToToolsLink.first().click();
      await page.waitForLoadState('networkidle');

      // 验证返回后仍保持中文前缀
      expect(page.url()).toContain(`${baseUrl}/zh/tools`);
    }
  });

  test('根路径重定向到正确语言', async ({ page }) => {
    console.log('测试根路径重定向...');

    // 访问根路径
    await page.goto(`${baseUrl}/`);
    await page.waitForLoadState('networkidle');

    // 应该重定向到带语言前缀的页面
    const url = page.url();
    expect(url).toMatch(/\/(en|zh)$/);
  });

  test('SEO标签正确设置', async ({ page }) => {
    console.log('测试SEO标签...');

    // 测试中文页面
    await page.goto(`${baseUrl}/zh/tools/json-formatter`);
    await page.waitForLoadState('networkidle');

    // 检查 canonical URL
    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveCount(1);
    await expect(canonicalLink).toHaveAttribute('href', `${baseUrl}/zh/tools/json-formatter`);

    // 检查 hreflang 标签
    const zhHreflang = page.locator('link[hreflang="zh"]');
    await expect(zhHreflang).toHaveCount(1);

    const enHreflang = page.locator('link[hreflang="en"]');
    await expect(enHreflang).toHaveCount(1);

    const xDefaultHreflang = page.locator('link[hreflang="x-default"]');
    await expect(xDefaultHreflang).toHaveCount(1);
  });

  test('语言切换功能', async ({ page }) => {
    console.log('测试语言切换功能...');

    // 从中文页面开始
    await page.goto(`${baseUrl}/zh`);
    await page.waitForLoadState('networkidle');

    // 点击语言切换按钮
    const languageButton = page.locator('button:has-text("中文"), button:has-text("🌐")');
    if (await languageButton.count() > 0) {
      await languageButton.first().click();
      await page.waitForTimeout(500);

      // 尝试点击英文选项
      const englishOption = page.locator('div:has-text("English")');
      if (await englishOption.count() > 0) {
        await englishOption.click();
        await page.waitForLoadState('networkidle');

        // 验证语言切换后URL变化
        const url = page.url();
        expect(url).toContain('/en');
      }
    }
  });
});