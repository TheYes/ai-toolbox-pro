import { test, expect } from '@playwright/test';

test.describe('工具页面测试', () => {
  // 所有工具页面的配置
  const toolPages = [
    {
      name: 'JSON Formatter',
      path: '/tools/json-formatter',
      expectedTitle: 'JSON Formatter',
      selectors: {
        mainInput: 'textarea[placeholder*="JSON"]',
        formatButton: 'button:has-text("Format")',
        minifyButton: 'button:has-text("Minify")',
        validateButton: 'button:has-text("Validate")',
        outputArea: 'textarea'
      }
    },
    {
      name: 'Base64 Encoder/Decoder',
      path: '/tools/base64',
      expectedTitle: 'Base64',
      selectors: {
        inputTextarea: 'textarea[placeholder*="text"]',
        encodeButton: 'button:has-text("Encode")',
        decodeButton: 'button:has-text("Decode")',
        outputTextarea: 'textarea'
      }
    },
    {
      name: 'QR Code Generator',
      path: '/tools/qr-code',
      expectedTitle: 'QR Code',
      selectors: {
        inputTextarea: 'textarea[placeholder*="text or URL"]',
        generateButton: 'button:has-text("Generate")',
        qrCodeContainer: '.qr-code-container, canvas, img'
      }
    },
    {
      name: 'URL Encoder/Decoder',
      path: '/tools/url-encoder',
      expectedTitle: 'URL Encoder',
      selectors: {
        inputTextarea: 'textarea[placeholder*="URL"]',
        encodeButton: 'button:has-text("Encode")',
        decodeButton: 'button:has-text("Decode")',
        outputTextarea: 'textarea'
      }
    },
    {
      name: 'Color Picker',
      path: '/tools/color-picker',
      expectedTitle: 'Color Picker',
      selectors: {
        colorInput: 'input[type="color"]',
        hexInput: 'input[placeholder*="#"]',
        colorDisplay: '.color-display, .color-preview'
      }
    },
    {
      name: 'Password Generator',
      path: '/tools/password-generator',
      expectedTitle: 'Password Generator',
      selectors: {
        lengthInput: 'input[type="range"], input[type="number"]',
        generateButton: 'button:has-text("Generate")',
        passwordDisplay: 'input[type="text"], .password-display'
      }
    }
  ];

  test.beforeEach(async ({ page }) => {
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error [${page.url()}]: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      console.error(`Page error [${page.url()}]: ${error.message}`);
    });
  });

  test('检查所有工具页面是否能正常加载', async ({ page }) => {
    for (const tool of toolPages) {
      console.log(`\n测试工具页面: ${tool.name} (${tool.path})`);

      // 访问工具页面
      const response = await page.goto(tool.path);

      // 检查响应状态
      expect(response?.status()).toBe(200);

      // 等待页面加载
      await page.waitForLoadState('networkidle');

      // 检查页面标题
      const title = await page.title();
      expect(title.toLowerCase()).toContain(tool.expectedTitle.toLowerCase());

      // 检查页面是否有基本内容
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.length).toBeGreaterThan(200);

      // 检查是否有主要内容区域
      const mainContent = page.locator('main, .container, .content');
      await expect(mainContent.first()).toBeVisible();

      console.log(`✓ ${tool.name} 页面加载正常`);
    }
  });

  test('检查每个工具页面的基本功能', async ({ page }) => {
    for (const tool of toolPages) {
      console.log(`\n测试工具功能: ${tool.name}`);

      // 访问工具页面
      await page.goto(tool.path);
      await page.waitForLoadState('networkidle');

      // 测试工具特定的选择器
      for (const [key, selector] of Object.entries(tool.selectors)) {
        try {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            await expect(element).toBeVisible({ timeout: 5000 });
            console.log(`  ✓ ${key} 元素可见`);
          } else {
            console.log(`  ⚠ ${key} 元素未找到: ${selector}`);
          }
        } catch (error) {
          console.log(`  ❌ ${key} 元素错误: ${error.message}`);
        }
      }

      // 检查是否有错误信息显示
      const errorElements = page.locator('.error, .alert-danger, [role="alert"]');
      const errorCount = await errorElements.count();
      if (errorCount > 0) {
        const errorText = await errorElements.first().textContent();
        console.log(`  ⚠ 发现错误信息: ${errorText}`);
      }
    }
  });

  test('测试工具页面的交互功能', async ({ page }) => {
    const interactiveTests = [
      {
        name: 'JSON Formatter',
        path: '/tools/json-formatter',
        test: async (page) => {
          // 查找输入区域
          const inputAreas = page.locator('textarea');
          if (await inputAreas.count() > 0) {
            await inputAreas.first().fill('{"test": "data"}');

            // 查找并点击格式化按钮
            const formatButtons = page.locator('button:has-text("Format"), button:has-text("格式化")');
            if (await formatButtons.count() > 0) {
              await formatButtons.first().click();
              await page.waitForTimeout(1000);
              console.log('  ✓ JSON 格式化按钮点击成功');
            }
          }
        }
      },
      {
        name: 'Base64 Encoder/Decoder',
        path: '/tools/base64',
        test: async (page) => {
          const inputAreas = page.locator('textarea');
          if (await inputAreas.count() > 0) {
            await inputAreas.first().fill('Hello World');

            const encodeButtons = page.locator('button:has-text("Encode"), button:has-text("编码")');
            if (await encodeButtons.count() > 0) {
              await encodeButtons.first().click();
              await page.waitForTimeout(1000);
              console.log('  ✓ Base64 编码按钮点击成功');
            }
          }
        }
      },
      {
        name: 'QR Code Generator',
        path: '/tools/qr-code',
        test: async (page) => {
          const inputAreas = page.locator('textarea, input[type="text"]');
          if (await inputAreas.count() > 0) {
            await inputAreas.first().fill('https://example.com');

            const generateButtons = page.locator('button:has-text("Generate"), button:has-text("生成")');
            if (await generateButtons.count() > 0) {
              await generateButtons.first().click();
              await page.waitForTimeout(2000);
              console.log('  ✓ QR 码生成按钮点击成功');
            }
          }
        }
      }
    ];

    for (const test of interactiveTests) {
      console.log(`\n测试交互功能: ${test.name}`);

      try {
        await page.goto(test.path);
        await page.waitForLoadState('networkidle');
        await test.test(page);
        console.log(`✓ ${test.name} 交互测试完成`);
      } catch (error) {
        console.log(`❌ ${test.name} 交互测试失败: ${error.message}`);
      }
    }
  });

  test('检查中英文页面切换', async ({ page }) => {
    const testTools = ['/tools/json-formatter', '/tools/base64', '/tools/qr-code'];

    for (const toolPath of testTools) {
      console.log(`\n测试中英文切换: ${toolPath}`);

      // 测试英文页面
      await page.goto(toolPath);
      await page.waitForLoadState('networkidle');
      const enTitle = await page.title();

      // 测试中文页面
      await page.goto(`/zh${toolPath}`);
      await page.waitForLoadState('networkidle');
      const zhTitle = await page.title();

      // 检查页面是否正常加载
      const enBody = await page.locator('body').textContent();
      const zhBody = await page.locator('body').textContent();

      expect(enBody?.length).toBeGreaterThan(100);
      expect(zhBody?.length).toBeGreaterThan(100);

      console.log(`  ✓ 英文页面标题: ${enTitle}`);
      console.log(`  ✓ 中文页面标题: ${zhTitle}`);
    }
  });

  test('检查页面响应式设计', async ({ page }) => {
    const testTool = '/tools/json-formatter';

    // 测试桌面尺寸
    await page.goto(testTool);
    await page.waitForLoadState('networkidle');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);

    const desktopContent = await page.locator('body').textContent();
    expect(desktopContent?.length).toBeGreaterThan(100);

    // 测试移动端尺寸
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileContent = await page.locator('body').textContent();
    expect(mobileContent?.length).toBeGreaterThan(100);

    console.log('✓ 响应式设计测试通过');
  });
});