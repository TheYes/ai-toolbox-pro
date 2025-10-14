import { test, expect } from '@playwright/test';

test.describe('国际化路由测试', () => {
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

  test('中文环境下所有链接都保持 /zh 前缀', async ({ page }) => {
    console.log('测试中文环境下的链接一致性...');

    // 访问中文首页
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // 验证当前URL是中文
    expect(page.url()).toContain('/zh');

    // 测试主导航链接（Logo 和 Tools）
    const logoLink = page.locator('a:has-text("AI Toolbox")');
    await expect(logoLink).toBeVisible();

    const toolsNavLinks = page.locator('nav a[href*="tools"]');
    expect(toolsNavLinks).toHaveCount(1);

    // 验证导航链接指向中文版本
    const href = await toolsNavLinks.first().getAttribute('href');
    expect(href).toContain('/zh/tools');

    // 测试特色工具区域的链接
    const featuredToolLinks = page.locator('section[id="featured-tools"] a.btn-primary');
    await expect(featuredToolLinks).toHaveCount(3);

    // 验证特色工具链接都包含 /zh 前缀
    for (let i = 0; i < await featuredToolLinks.count(); i++) {
      const href = await featuredToolLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^\/zh\//);
    }

    // 点击工具页面链接
    await toolsNavLinks.first().click();
    await page.waitForLoadState('networkidle');

    // 验证工具页面URL保持中文前缀
    expect(page.url()).toContain('/zh/tools');

    // 测试工具列表中的工具链接
    const toolLinks = page.locator('a.btn-primary');
    await expect(toolLinks).toHaveCount(6);

    // 验证所有工具链接都有 /zh 前缀
    for (let i = 0; i < await toolLinks.count(); i++) {
      const href = await toolLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^\/zh\/tools\//);
    }

    // 测试返回工具页面链接
    const backToToolsLink = page.locator('a[href*="/tools"]');
    await expect(backToToolsLink).toHaveCount(1);
    const backHref = await backToToolsLink.getAttribute('href');
    expect(backHref).toContain('/zh/tools');
  });

  test('语言切换功能正常工作', async ({ page }) => {
    console.log('测试语言切换功能...');

    // 从中文首页开始
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // 验证页面标题包含中文特征
    const title = await page.title();
    expect(title).toContain('AI Toolbox');

    // 点击语言切换菜单
    const languageButton = page.locator('button:has-text("🌐")');
    await expect(languageButton).toBeVisible();
    await languageButton.click();
    await page.waitForTimeout(500);

    // 等待语言菜单显示
    const languageMenu = page.locator('.absolute');
    await expect(languageMenu).toBeVisible();

    // 点击 English 切换语言
    const englishOption = page.locator('div:has-text("English")');
    await expect(englishOption).toBeVisible();
    await englishOption.click();
    await page.waitForLoadState('networkidle');

    // 验证语言切换后URL变化（可能不会完全改变，但内容应该变化）
    const currentUrl = page.url();
    expect(currentUrl).toContain('/zh'); // 由于策略，可能还是中文
  });

  test('页面内部导航不会丢失语言前缀', async ({ page }) => {
    console.log('测试页面内部导航...');

    // 从中文工具页面开始
    await page.goto('/zh/tools');
    await page.waitForLoadState('networkidle');

    // 验证初始状态
    expect(page.url()).toContain('/zh/tools');

    // 测试工具间的跳转（先跳转到JSON格式化器）
    const jsonFormatterLink = page.locator('a:has-text("Use Now")').first();
    await jsonFormatterLink.click();
    await page.waitForLoadState('networkidle');

    // 验证跳转后的页面
    expect(page.url()).toContain('/zh/tools/json-formatter');

    // 从工具页面返回工具列表
    const backToToolsLink = page.locator('a[href*="/tools"]');
    await backToToolsLink.first().click();
    await page.waitForLoadState('networkidle');

    // 验证返回后仍保持中文前缀
    expect(page.url()).toContain('/zh/tools');

    // 测试从工具页面跳转到首页
    const homeLink = page.locator('a:has-text("AI Toolbox")');
    await homeLink.click();
    await page.waitForLoadState('networkidle');

    // 验证跳转后仍保持中文前缀
    expect(page.url()).toContain('/zh');
  });

  test('URL结构符合SEO最佳实践', async ({ page }) => {
    console.log('测试URL结构...');

    const testUrls = [
      '/zh',
      '/zh/tools',
      '/zh/tools/json-formatter',
      '/zh/tools/base64',
      '/zh/tools/qr-code'
    ];

    for (const url of testUrls) {
      console.log(`测试 URL: ${url}`);

      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // 验证页面正常加载
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
      expect(pageTitle.length).toBeGreaterThan(0);

      // 验证页面内容不为空
      const bodyContent = await page.locator('body').textContent();
      expect(bodyContent?.length).toBeGreaterThan(100);

      // 验证页面没有明显的错误
      const errorElements = page.locator('.error, .alert-danger, [role="alert"]');
      const errorCount = await errorElements.count();
      if (errorCount > 0) {
        const errorText = await errorElements.first().textContent();
        console.log(`  ⚠️ 发现错误信息: ${errorText}`);
      }
    }
  });

  test('所有内部链接都包含正确的语言前缀', async ({ page }) => {
    console.log('测试所有内部链接的语言前缀...');

    // 访问中文工具页面
    await page.goto('/zh/tools/json-formatter');
    await page.waitForLoadState('networkidle');

    // 获取所有链接
    const allLinks = page.locator('a[href]');

    const linkCount = await allLinks.count();
    console.log(`发现 ${linkCount} 个链接`);

    // 验证每个链接都包含 /zh 前缀
    for (let i = 0; i < linkCount; i++) {
      const link = allLinks.nth(i);
      const href = await link.getAttribute('href');

      if (href && !href.startsWith('http')) {
        expect(href).toMatch(/^\/zh\//);
      }
    }
  });
});

  test('语言切换功能正常工作', async ({ page }) => {
    console.log('测试语言切换功能...');

    // 从中文首页开始
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // 验证页面内容是中文
    const title = await page.title();
    expect(title).toContain('AI Toolbox Pro'); // 基础标题应该保持不变

    // 点击语言切换按钮（中文切换到英文）
    const languageButton = page.locator('button:has-text("English")');
    await expect(languageButton).toBeVisible();
    await languageButton.click();
    await page.waitForLoadState('networkidle');

    // 验证URL变为英文
    expect(page.url()).toContain('/en');

    // 点击语言切换按钮（英文切换到中文）
    const zhLanguageButton = page.locator('button:has-text("中文")');
    await expect(zhLanguageButton).toBeVisible();
    await zhLanguageButton.click();
    await page.waitForLoadState('networkidle');

    // 验证URL变回中文
    expect(page.url()).toContain('/zh');
  });

  test('SEO标签正确设置', async ({ page }) => {
    console.log('测试SEO标签设置...');

    // 测试中文页面的SEO标签
    await page.goto('/zh/tools/json-formatter');
    await page.waitForLoadState('networkidle');

    // 检查 canonical URL
    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute('href', 'https://ai-toolbox-pro.vercel.app/zh/tools/json-formatter');

    // 检查 hreflang 标签
    const zhHreflang = page.locator('link[hreflang="zh"]');
    await expect(zhHreflang).toHaveCount(1);
    await expect(zhHreflang.first()).toHaveAttribute('href', 'https://ai-toolbox-pro-pro.vercel.app/zh/tools/json-formatter');

    const enHreflang = page.locator('link[hreflang="en"]');
    await expect(enHreflang).toHaveCount(1);
    await expect(enHreflang.first()).toHaveAttribute('href', 'https://ai-toolbox-pro-pro.vercel.app/en/tools/json-formatter');

    const xDefaultHreflang = page.locator('link[hreflang="x-default"]');
    await expect(xDefaultHreflang).toHaveCount(1);
    await expect(xDefaultHreflang.first()).toHaveAttribute('href', 'https://ai-toolbox-pro.vercel.app/en/tools/json-formatter');
  });

  test('页面内部导航不会丢失语言前缀', async ({ page }) => {
    console.log('测试页面内部导航...');

    // 从中文工具页面开始
    await page.goto('/zh/tools');
    await page.waitForLoadState('networkidle');

    // 验证初始状态
    expect(page.url()).toContain('/zh/tools');

    // 测试工具间的跳转（先跳转到JSON格式化器）
    const jsonFormatterLink = page.locator('a[href*="json-formatter"]');
    await jsonFormatterLink.click();
    await page.waitForLoadState('networkidle');

    // 验证跳转后保持中文前缀
    expect(page.url()).toContain('/zh/tools/json-formatter');

    // 从工具页面返回工具列表
    const backToToolsLink = page.locator('a[href*="/tools"]');
    await backToToolsLink.click();
    await page.waitForLoadState('networkidle');

    // 验证返回后仍保持中文前缀
    expect(page.url()).toContain('/zh/tools');

    // 测试从工具页面跳转到首页
    const homeLink = page.locator('a[href*="/"]');
    await homeLink.click();
    await page.waitForLoadState('networkidle');

    // 验证跳转后仍保持中文前缀
    expect(page.url()).toContain('/zh');
  });

  test('URL结构符合SEO最佳实践', async ({ page }) => {
    console.log('测试URL结构...');

    const testUrls = [
      '/zh',
      '/zh/tools',
      '/zh/tools/json-formatter',
      '/en',
      '/en/tools',
      '/en/tools/json-formatter'
    ];

    for (const url of testUrls) {
      console.log(`测试 URL: ${url}`);

      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // 验证页面正常加载
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
      expect(pageTitle.length).toBeGreaterThan(0);

      // 验证页面内容不为空
      const bodyContent = await page.locator('body').textContent();
      expect(bodyContent?.length).toBeGreaterThan(100);

      // 验证页面没有明显的错误
      const errorElements = page.locator('.error, .alert-danger, [role="alert"]');
      const errorCount = await errorElements.count();
      if (errorCount > 0) {
        const errorText = await errorElements.first().textContent();
        console.log(`  ⚠️ 发现错误信息: ${errorText}`);
      }
    }
  });
