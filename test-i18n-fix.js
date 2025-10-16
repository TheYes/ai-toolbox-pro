// 测试多语言路由修复
const testCases = [
  { current: '/', targetLang: 'zh', expected: '/zh' },
  { current: '/', targetLang: 'en', expected: '/' },
  { current: '/zh', targetLang: 'zh', expected: '/zh' },
  { current: '/zh', targetLang: 'en', expected: '/' },
  { current: '/zh/tools', targetLang: 'zh', expected: '/zh/tools' },
  { current: '/zh/tools', targetLang: 'en', expected: '/tools' },
  { current: '/tools', targetLang: 'zh', expected: '/zh/tools' },
  { current: '/tools', targetLang: 'en', expected: '/tools' },
  { current: '/zh/pricing', targetLang: 'zh', expected: '/zh/pricing' },
  { current: '/pricing', targetLang: 'zh', expected: '/zh/pricing' },
]

// 模拟 localizedPath 函数
function localizedPath(path, currentLocale) {
  if (currentLocale === 'zh' && !path.startsWith('/zh')) {
    return path === '/' ? '/zh' : `/zh${path}`
  }
  if (currentLocale === 'en' && path.startsWith('/zh')) {
    return path.replace('/zh', '') || '/'
  }
  return path
}

// 模拟语言切换逻辑
function handleLanguageSwitch(currentPath, targetLang) {
  // 获取当前路径的纯净版本（移除语言前缀）
  let cleanPath = currentPath

  // 移除现有的语言前缀
  if (currentPath.startsWith('/zh/')) {
    cleanPath = currentPath.slice(3) // 移除 "/zh"
  } else if (currentPath === '/zh') {
    cleanPath = '/'
  }

  // 根据目标语言添加相应的前缀
  let newPath = cleanPath
  if (targetLang === 'zh') {
    newPath = cleanPath === '/' ? '/zh' : `/zh${cleanPath}`
  }
  // 如果是英文，不需要前缀，直接使用 cleanPath

  return newPath
}

console.log('🧪 测试多语言路由修复...\n')

// 测试语言切换
let passCount = 0
testCases.forEach(({ current, targetLang, expected }, index) => {
  const result = handleLanguageSwitch(current, targetLang)
  const passed = result === expected

  if (passed) {
    passCount++
    console.log(`✅ 测试 ${index + 1}: ${current} -> ${targetLang} = ${result}`)
  } else {
    console.log(`❌ 测试 ${index + 1}: ${current} -> ${targetLang} = ${result} (期望: ${expected})`)
  }
})

// 测试导航链接生成
console.log('\n🔗 测试导航链接生成...')
const navigationTests = [
  { path: '/', locale: 'zh', expected: '/zh' },
  { path: '/tools', locale: 'zh', expected: '/zh/tools' },
  { path: '/pricing', locale: 'zh', expected: '/zh/pricing' },
  { path: '/', locale: 'en', expected: '/' },
  { path: '/tools', locale: 'en', expected: '/tools' },
  { path: '/pricing', locale: 'en', expected: '/pricing' },
]

navigationTests.forEach(({ path, locale, expected }, index) => {
  const result = localizedPath(path, locale)
  const passed = result === expected

  if (passed) {
    passCount++
    console.log(`✅ 导航测试 ${index + 1}: ${path} (${locale}) = ${result}`)
  } else {
    console.log(`❌ 导航测试 ${index + 1}: ${path} (${locale}) = ${result} (期望: ${expected})`)
  }
})

console.log(`\n📊 测试结果: ${passCount}/${testCases.length + navigationTests.length} 通过`)

if (passCount === testCases.length + navigationTests.length) {
  console.log('🎉 所有测试通过！多语言路由修复成功！')
} else {
  console.log('⚠️  有测试失败，需要进一步检查')
}