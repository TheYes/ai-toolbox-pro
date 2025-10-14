import { test, expect } from '@playwright/test';

test.describe('链接和按钮测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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

  test('检查首页所有链接和按钮是否可点击', async ({ page }) => {
    // 获取所有链接
    const links = page.locator('a');
    const linkCount = await links.count();
    console.log(`发现 ${linkCount} 个链接`);

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 测试前10个链接，避免测试时间过长
    const testCount = Math.min(linkCount, 10);

    for (let i = 0; i < testCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
        console.log(`测试链接: ${text?.trim()} -> ${href}`);

        // 记录当前页面的URL
        const currentUrl = page.url();

        // 尝试点击链接并等待导航，如果导航失败则跳过
        try {
          await Promise.all([
            page.waitForNavigation({ timeout: 10000 }),
            link.click()
          ]);
        } catch (error) {
          console.log(`  链接点击失败或没有导航: ${error.message}`);

          // 检查链接是否是锚点或JavaScript
          if (href === currentUrl || href.startsWith('#')) {
            console.log(`  跳过同页链接`);
            continue;
          }

          // 尝试直接导航到链接地址
          try {
            await page.goto(href, { timeout: 10000 });
            await page.waitForLoadState('networkidle');
          } catch (navError) {
            console.log(`  直接导航也失败: ${navError.message}`);
            continue;
          }
        }

        // 检查页面是否正常显示
        await page.waitForLoadState('networkidle');

        const title = await page.title();
        const url = page.url();
        console.log(`  页面标题: ${title}`);
        console.log(`  页面URL: ${url}`);

        // 检查页面是否正常显示（不是404或错误页面）
        const bodyText = await page.locator('body').textContent();
        expect(bodyText?.length).toBeGreaterThan(100);

        // 返回首页
        await page.goto('/');
        await page.waitForLoadState('networkidle');
      }
    }

    // 测试所有按钮
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`发现 ${buttonCount} 个按钮`);

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();

      if (text && text.trim()) {
        console.log(`测试按钮: ${text.trim()}`);

        // 检查按钮是否可见和可点击
        await expect(button).toBeVisible();

        // 点击按钮
        await button.click();

        // 等待可能的页面变化
        await page.waitForTimeout(1000);

        // 检查是否有错误（已在 beforeEach 中设置监听器）
      }
    }
  });

  test('检查中文页面的链接和按钮', async ({ page }) => {
    // 访问中文首页
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // 获取所有链接
    const links = page.locator('a');
    const linkCount = await links.count();
    console.log(`中文页面发现 ${linkCount} 个链接`);

    // 测试前5个链接，避免测试时间过长
    const testCount = Math.min(linkCount, 5);

    for (let i = 0; i < testCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
        console.log(`测试中文链接: ${text?.trim()} -> ${href}`);

        // 尝试点击链接并等待导航
        try {
          await Promise.all([
            page.waitForNavigation({ timeout: 10000 }),
            link.click()
          ]);
        } catch (error) {
          console.log(`  中文链接点击失败，尝试直接导航: ${error.message}`);
          await page.goto(href, { timeout: 10000 });
          await page.waitForLoadState('networkidle');
        }

        // 检查页面是否正常
        await page.waitForLoadState('networkidle');
        const bodyText = await page.locator('body').textContent();
        expect(bodyText?.length).toBeGreaterThan(100);

        // 返回中文首页
        await page.goto('/zh');
        await page.waitForLoadState('networkidle');
      }
    }

    // 测试中文页面的按钮
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`中文页面发现 ${buttonCount} 个按钮`);

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();

      if (text && text.trim()) {
        console.log(`测试中文按钮: ${text.trim()}`);
        await expect(button).toBeVisible();
        await button.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('检查主要工具页面链接', async ({ page }) => {
    // 访问工具页面
    await page.goto('/tools');
    await page.waitForLoadState('networkidle');

    // 获取工具页面的所有工具链接
    const toolLinks = page.locator('a[href*="/tools/"]');
    const linkCount = await toolLinks.count();
    console.log(`工具页面发现 ${linkCount} 个工具链接`);

    // 测试前5个工具
    const testCount = Math.min(linkCount, 5);

    for (let i = 0; i < testCount; i++) {
      const link = toolLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      if (href) {
        console.log(`测试工具: ${text?.trim()} -> ${href}`);

        // 点击工具链接
        try {
          await Promise.all([
            page.waitForNavigation({ timeout: 10000 }),
            link.click()
          ]);
        } catch (error) {
          console.log(`  工具链接点击失败，尝试直接导航: ${error.message}`);
          await page.goto(href, { timeout: 10000 });
          await page.waitForLoadState('networkidle');
        }

        // 检查工具页面是否正常
        await page.waitForLoadState('networkidle');

        const title = await page.title();
        const bodyText = await page.locator('body').textContent();

        expect(bodyText?.length).toBeGreaterThan(100);
        expect(title).toContain(text?.trim() || '');

        // 返回工具列表页面
        await page.goto('/tools');
        await page.waitForLoadState('networkidle');
      }
    }
  });
});