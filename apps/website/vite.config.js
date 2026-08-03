import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = parseInt(env.PORT || env.VITE_PORT || '5174', 10)
  const apiTarget = env.VITE_API_URL ? env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:8001'

  return {
    plugins: [tailwindcss()],
    server: {
      port,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/submit-form': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/health': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
