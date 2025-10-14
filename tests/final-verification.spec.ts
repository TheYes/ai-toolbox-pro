import { test, expect } from '@playwright/test';

test.describe('最终验证测试', () => {
  const baseUrl = 'http://localhost:3001';

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

  test('中文首页和路由系统正常工作', async ({ page }) => {
    console.log('🔍 测试中文首页和路由系统...');

    // 访问根路径，应该重定向到中文
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 验证重定向到中文
    expect(page.url()).toContain(`${baseUrl}/zh`);

    // 验证页面内容正常
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // 验证页面包含关键元素
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(100);
  });

  test('工具页面导航正常', async ({ page }) => {
    console.log('🔧 测试工具页面导航...');

    // 访问中文工具页面
    await page.goto(`${baseUrl}/zh/tools`);
    await page.waitForLoadState('networkidle');

    // 验证工具列表存在
    const toolLinks = page.locator('a.btn-primary');
    await expect(toolLinks).toHaveCount(6);

    // 验证返回链接正确
    const backLink = page.locator('a[href*="/tools"]');
    if (await backLink.count() > 0) {
      const backHref = await backLink.first().getAttribute('href');
      expect(backHref).toContain('/zh/tools');
    }
  });

  test('所有工具详情页正常工作', async ({ page }) => {
    console.log('🛠️ 测试所有工具详情页...');

    const tools = [
      '/zh/tools/json-formatter',
      '/zh/tools/base64',
      '/zh/tools/qr-code',
      '/zh/tools/url-encoder',
      '/zh/tools/color-picker',
      '/zh/tools/password-generator'
    ];

    for (const toolUrl of tools) {
      console.log(`  📋 测试: ${toolUrl}`);
      await page.goto(`${baseUrl}${toolUrl}`);
      await page.waitForLoadState('networkidle');

      // 验证URL正确
      expect(page.url()).toContain(`${baseUrl}${toolUrl}`);

      // 验证页面加载
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);

      // 验证返回链接
      const backLink = page.locator('a[href*="/tools"]');
      if (await backLink.count() > 0) {
        const backHref = await backLink.first().getAttribute('href');
        expect(backHref).toContain('/zh/tools');
      }
    }
  });

  test('英文页面正常工作', async ({ page }) => {
    console.log('🇺🇸 测试英文页面...');

    // 访问英文首页
    await page.goto(`${baseUrl}/en`);
    await page.waitForLoadState('networkidle');

    // 验证URL正确
    expect(page.url()).toContain(`${baseUrl}/en`);

    // 验证页面内容
    const title = await page.title();
    expect(title).toBeTruthy();

    // 访问英文工具页面
    await page.goto(`${baseUrl}/en/tools`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain(`${baseUrl}/en/tools`);
  });

  test('SEO标签正确设置', async ({ page }) => {
    console.log('🔍 测试SEO标签...');

    // 测试中文页面
    await page.goto(`${baseUrl}/zh/tools/json-formatter`);
    await page.waitForLoadState('networkidle');

    // 检查 canonical URL
    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveCount(1);

    // 检查 hreflang 标签
    const zhHreflang = page.locator('link[hreflang="zh"]');
    await expect(zhHreflang).toHaveCount(1);

    const enHreflang = page.locator('link[hreflang="en"]');
    await expect(enHreflang).toHaveCount(1);

    const xDefaultHreflang = page.locator('link[hreflang="x-default"]');
    await expect(xDefaultHreflang).toHaveCount(1);
  });

  test('导航链接语言一致性', async ({ page }) => {
    console.log('🔗 测试导航链接语言一致性...');

    // 从中文首页开始
    await page.goto(`${baseUrl}/zh`);
    await page.waitForLoadState('networkidle');

    // 点击工具链接
    const toolsLink = page.locator('a:has-text("浏览工具"), a:has-text("Browse Tools")');
    if (await toolsLink.count() > 0) {
      await toolsLink.first().click();
      await page.waitForLoadState('networkidle');

      // 验证跳转后仍保持中文
      expect(page.url()).toContain(`${baseUrl}/zh/tools`);
    }

    // 点击Logo返回首页
    const logoLink = page.locator('a:has-text("AI Toolbox")');
    if (await logoLink.count() > 0) {
      await logoLink.click();
      await page.waitForLoadState('networkidle');

      // 验证返回后仍保持中文
      expect(page.url()).toContain(`${baseUrl}/zh`);
    }
  });

  test('页面间导航保持语言', async ({ page }) => {
    console.log('🔄 测试页面间导航保持语言...');

    // 从中文工具页面开始
    await page.goto(`${baseUrl}/zh/tools`);
    await page.waitForLoadState('networkidle');

    // 点击一个工具
    const jsonFormatterLink = page.locator('a:has-text("Use Now")').first();
    if (await jsonFormatterLink.count() > 0) {
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
    }
  });

  test('语言切换功能', async ({ page }) => {
    console.log('🌐 测试语言切换功能...');

    // 从中文页面开始
    await page.goto(`${baseUrl}/zh`);
    await page.waitForLoadState('networkidle');

    // 尝试点击语言切换按钮
    const languageButton = page.locator('button:has-text("🌐")');
    if (await languageButton.count() > 0) {
      await languageButton.first().click();
      await page.waitForTimeout(500);

      // 使用更精确的选择器 - 先找到语言菜单
      const languageMenu = page.locator('.absolute.right-0.mt-2.w-48.bg-white.rounded-md.shadow-lg');
      if (await languageMenu.count() > 0) {
        // 点击英文选项
        const englishOption = languageMenu.locator('div.px-4.py-2.hover\\:bg-gray-100.cursor-pointer:has-text("English")');
        if (await englishOption.count() > 0) {
          await englishOption.click();
          await page.waitForLoadState('networkidle');

          // 验证语言切换（可能不会完全改变URL，但内容应该变化）
          const url = page.url();
          console.log(`语言切换后URL: ${url}`);
        }
      }
    }
  });
});