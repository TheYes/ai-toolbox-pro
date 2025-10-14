// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  // 模块配置
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@pinia/nuxt'
  ],

  // 启用服务端渲染，但优化配置
  ssr: true,

  // 禁用实验性功能
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: false,
    crossPrefetch: false,
    viewTransition: false,
    watcher: 'parcel'
  },

  // CSS配置
  css: ['~/assets/css/main.css'],

  // Vite配置 - 修复plugin-vue:export-helper问题
  vite: {
    build: {
      rollupOptions: {
        external: ['plugin-vue:export-helper'],
        output: {
          manualChunks: undefined
        }
      }
    },
    optimizeDeps: {
      exclude: ['plugin-vue:export-helper'],
      include: ['unhead']
    },
    server: {
      fs: {
        allow: ['..']
      }
    },
    ssr: {
      noExternal: ['@unhead/vue']
    }
  },

  // 修复unhead兼容性问题
  unhead: {
    renderHeadTags: () => ''
  },

  // App配置
  app: {
    head: {
      title: 'AI Toolbox Pro - Free Online Tools',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Free online tools for developers and daily use' },
        { name: 'keywords', content: 'online tools, web tools, json formatter, base64 encoder, qr code generator, free tools' },
        // 可以在这里添加自定义域名的 meta 标签
        // { property: 'og:url', content: 'https://yourdomain.com' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Nitro配置 - 禁用不需要的后台功能
  nitro: {
    experimental: {
      wasm: false
    },
    // 禁用内置的存储功能
    storage: {}
  },

  // 日志配置
  logLevel: 'silent',

  // 国际化配置
  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'zh',
        name: '中文',
        file: 'zh.json'
      }
    ],
    defaultLocale: 'en',
    langDir: 'locales',
    lazy: true,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'user_language',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'en'
    }
  },

  // 运行时配置
  runtimeConfig: {
    // 私有配置（仅服务端可用）
    creemApiKey: process.env.CREEM_API_KEY,
    creemSecretKey: process.env.CREEM_SECRET_KEY,
    creemWebhookSecret: process.env.CREEM_WEBHOOK_SECRET,
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

    // 公共配置（暴露给客户端）
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://ai-toolbox-pro.vercel.app',
      siteName: 'AI Toolbox Pro - Free Online Tools',
      siteDescription: 'Collection of useful web tools for developers and daily use. JSON formatter, Base64 encoder, QR code generator and more - all free and easy to use.',
      currency: process.env.NUXT_PUBLIC_CURRENCY || 'USD',
      creemPublishableKey: process.env.CREEM_API_KEY,
      paypalClientId: process.env.PAYPAL_CLIENT_ID,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,

      // 支付配置
      payment: {
        enabled: true,
        methods: ['creem', 'paypal'],
        currency: 'USD',
        locale: 'en'
      }
    },
    // 禁用 Node.js 实验性功能警告
    nitro: {
      experimental: {
        wasm: false
      }
    }
  },

  compatibilityDate: '2025-10-11'
})