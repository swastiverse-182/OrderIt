import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost", // FIX: Rewrites cookie domain to localhost
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              // FIX: Remove Secure flag so cookie works on http://localhost
              // FIX: Ensure SameSite=Lax for proper cookie handling
              proxyRes.headers['set-cookie'] = cookies.map(cookie =>
                cookie
                  .replace(/; Secure/gi, '')
                  .replace(/; SameSite=None/gi, '; SameSite=Lax')
              );
            }
          });
        }
      }
    }
  }
})