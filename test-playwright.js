import { chromium } from 'playwright';

(async () => {
  try {
    console.log('启动浏览器...');
    const browser = await chromium.launch({
      headless: false, // 显示浏览器窗口
      slowMo: 1000     // 慢速操作以便观察
    });

    console.log('创建新页面...');
    const page = await browser.newPage();

    console.log('访问百度首页...');
    await page.goto('https://www.baidu.com');

    // 获取页面标题
    const title = await page.title();
    console.log('页面标题:', title);

    console.log('页面URL:', page.url());

    // 查找搜索框
    const searchBox = await page.$('#kw');
    if (searchBox) {
      console.log('✅ 找到搜索框');

      // 在搜索框中输入内容
      await searchBox.fill('Playwright 测试');
      console.log('✅ 在搜索框中输入了 "Playwright 测试"');
    } else {
      console.log('❌ 未找到搜索框');
    }

    // 查找搜索按钮
    const searchButton = await page.$('#su');
    if (searchButton) {
      console.log('✅ 找到搜索按钮');
      const buttonText = await searchButton.getAttribute('value');
      console.log('搜索按钮文本:', buttonText);

      // 点击搜索按钮
      await searchButton.click();
      console.log('✅ 点击了搜索按钮');

      // 等待搜索结果加载
      await page.waitForTimeout(2000);

      // 获取搜索结果
      const results = await page.$$('.result');
      console.log(`✅ 找到 ${results.length} 个搜索结果`);
    } else {
      console.log('❌ 未找到搜索按钮');
    }

    // 截图保存
    await page.screenshot({ path: 'baidu-screenshot.png' });
    console.log('✅ 已保存截图到 baidu-screenshot.png');

    // 等待几秒钟以便观察
    console.log('等待5秒钟以便观察...');
    await page.waitForTimeout(5000);

    await browser.close();
    console.log('✅ 测试完成，浏览器已关闭');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
})();