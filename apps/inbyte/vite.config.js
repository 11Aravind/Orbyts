import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Load all .env variables (including server-side CLOUDFLARE_* and SUPABASE_SERVICE_ROLE_KEY) for /api dev middleware
const loadedEnv = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
for (const [k, v] of Object.entries(loadedEnv)) {
  if (process.env[k] === undefined) {
    process.env[k] = v;
  }
}

const apiDevMiddlewarePlugin = () => ({
  name: 'api-dev-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const cleanPath = (req.url || '').split('?')[0];
      if (cleanPath && (
        cleanPath.startsWith('/api/subscribe-waiter-push') ||
        cleanPath.startsWith('/api/send-waiter-push') ||
        cleanPath.startsWith('/api/upload-image') ||
        cleanPath.startsWith('/api/delete-image') ||
        cleanPath.startsWith('/api/translate') ||
        cleanPath.startsWith('/api/store-data') ||
        cleanPath.startsWith('/api/cache-invalidate') ||
        cleanPath.startsWith('/api/create-order') ||
        cleanPath.startsWith('/api/verify-payment')
      )) {
        try {
          let modulePath = './api/send-waiter-push.js';
          if (cleanPath.startsWith('/api/subscribe-waiter-push')) modulePath = './api/subscribe-waiter-push.js';
          else if (cleanPath.startsWith('/api/upload-image')) modulePath = './api/upload-image.js';
          else if (cleanPath.startsWith('/api/delete-image')) modulePath = './api/delete-image.js';
          else if (cleanPath.startsWith('/api/translate')) modulePath = './api/translate.js';
          else if (cleanPath.startsWith('/api/store-data')) modulePath = './api/store-data.js';
          else if (cleanPath.startsWith('/api/cache-invalidate')) modulePath = './api/cache-invalidate.js';
          else if (cleanPath.startsWith('/api/create-order')) modulePath = './api/create-order.js';
          else if (cleanPath.startsWith('/api/verify-payment')) modulePath = './api/verify-payment.js';

          const parsedUrl = new URL(req.url, 'http://localhost');
          req.query = Object.fromEntries(parsedUrl.searchParams.entries());

          const handlerModule = await import(modulePath);

          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('error', (streamErr) => {
            console.error('[API Dev Middleware Stream Error]:', streamErr);
            if (!res.writableEnded) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: streamErr?.message || 'Request stream error' }));
            }
          });

          req.on('end', async () => {
            try {
              if (body) {
                try {
                  req.body = JSON.parse(body);
                } catch {
                  req.body = body;
                }
              } else {
                req.body = {};
              }

              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              };

              await handlerModule.default(req, res);
            } catch (handlerErr) {
              console.error('[API Dev Middleware Handler Error]:', handlerErr);
              if (!res.writableEnded) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: handlerErr?.message || 'Internal Server Error' }));
              }
            }
          });
          return;
        } catch (err) {
          console.error('[API Dev Middleware Error]:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
          return;
        }
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddlewarePlugin()],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', '@tanstack/react-table'],
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    }
  }
});
