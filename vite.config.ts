/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/availability-tool/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  test: {
    environment: 'happy-dom',
  },
})
