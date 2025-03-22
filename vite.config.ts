import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      // Add alias for the renamed file
      '/src/utils/dashboardPresets.ts': '/src/utils/dashboardPresets.tsx'
    },
  },
  server: {
    proxy: {
      '/api/crypto-news': {
        target: 'https://crypto-news51.p.rapidapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/crypto-news/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-rapidapi-key', '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a');
            proxyReq.setHeader('x-rapidapi-host', 'crypto-news51.p.rapidapi.com');
          });
          proxy.timeout = 60000;
          proxy.proxyTimeout = 60000;
          proxy.keepAlive = true;
          proxy.secure = true;
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              const errorResponse = {
                error: 'API request failed',
                message: 'Unable to fetch news data, using fallback content',
                details: err.message
              };
              res.end(JSON.stringify(errorResponse));
            }
          });
        },
      },
      '/api/coingecko': {
        target: 'https://pro-api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (process.env.VITE_COINGECKO_API_KEY) {
              proxyReq.setHeader('x-cg-pro-api-key', process.env.VITE_COINGECKO_API_KEY);
            }
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('User-Agent', 'TradesXBT/1.0');
          });
          proxy.timeout = 60000; // Increase timeout to 60 seconds
          proxy.proxyTimeout = 60000;
          proxy.keepAlive = true;
          proxy.secure = true;
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              const errorResponse = {
                error: 'API request failed',
                message: 'Unable to fetch data, using fallback content',
                details: err.message
              };
              res.end(JSON.stringify(errorResponse));
            }
          });
        },
      }
    },
  },
  worker: {
    format: 'es',
  },
});