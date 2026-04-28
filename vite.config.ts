import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig(async ({ mode }) => {
  const { default: react } = await import('@vitejs/plugin-react')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: [
        'app.dev.virazul.com',
        'localhost',
        '127.0.0.1'
      ]
    },
    define: mode === 'test' ? { 'process.env.NODE_ENV': JSON.stringify('test') } : {},
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true
    }
  }
})
