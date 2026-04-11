import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig(async () => {
  const { default: react } = await import('@vitejs/plugin-react')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: {
      port: 5173
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true
    }
  }
})
