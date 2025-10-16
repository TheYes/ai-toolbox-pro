# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "500" [level=1] [ref=e4]
    - paragraph [ref=e5]: "Failed to fetch dynamically imported module: http://localhost:3001/_nuxt/layouts/default.vue"
  - generic [ref=e10]:
    - generic [ref=e11]: "[plugin:vite:vue] [vue/compiler-sfc] Invalid left-hand side in assignment expression. (56:4) D:/ai-chuchai/ai-toolbox-pro/components/AppHeader.vue 148| 149| // 使用Nuxt 3的内置语言切换功能 150| await locale.value = localeCode 151| 152| // 简单的路径处理逻辑"
    - generic [ref=e12]: D:/ai-chuchai/ai-toolbox-pro/components/AppHeader.vue:56:4
    - generic [ref=e13]: "30 | class=\"flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors\"> 31 | <span>🌐</span> 32 | <span>{{ currentLanguage.name }}</span> | ^ 33 | <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"> 34 | <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 9l-7 7-7-7\" />"
    - generic [ref=e14]: at constructor (D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:367:19) at Parser.raise (D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:6630:19) at Parser.checkLVal (D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:7548:12) at Parser.parseMaybeAssign (D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:10865:12) at Parser.parseExpressionBase (D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:10788:23) at D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:10784:39 at Parser.allowInAnd (D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:12431:16) at Parser.parseExpression (D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:10784:17) at Parser.parseStatementContent (D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:12904:23) at Parser.parseStatementLike (D:\ai-chuchai\ai-toolbox-pro\node_modules\@babel\parser\lib\index.js:12776:17)
    - generic [ref=e15]:
      - text: Click outside, press Esc key, or fix the code to dismiss.
      - text: You can also disable this overlay by setting
      - code [ref=e16]: server.hmr.overlay
      - text: to
      - code [ref=e17]: "false"
      - text: in
      - code [ref=e18]: vite.config.js
      - text: .
```