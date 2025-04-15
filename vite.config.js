import { defineConfig } from 'vite'

import { fileURLToPath, URL } from 'node:url'
import vitePluginAutoI18n from 'vite-auto-i18n-plugin';
import { YoudaoTranslator } from 'vite-auto-i18n-plugin'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          hoistStatic: false,
          cacheHandlers: false,
        }
      }
    }),
    vitePluginAutoI18n({
        targetLangList: ['en', 'ko', 'ja'],
        translator: new YoudaoTranslator({
          appId: '3c918a75229340c7',
          appKey: 'RCcVlreeP5Q2xoGNjFjvohwURe7CtMQN'
        })
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {  // 代理路径前缀
        target: 'http://192.168.20.138:8080', // 目标服务器地址
        changeOrigin: true,               // 修改请求头 Origin[3,7](@ref)
        rewrite: (path) => path.replace(/^\/api/, '') // 路径重写规则[1,5](@ref)
      }
    }
  }
})