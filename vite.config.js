import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'qucontext-route-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const cleanUrl = req.url.split('?')[0];
          if (cleanUrl === '/qucontext' || cleanUrl === '/qucontext/') {
            req.url = '/qucontext/index.html';
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const cleanUrl = req.url.split('?')[0];
          if (cleanUrl === '/qucontext' || cleanUrl === '/qucontext/') {
            req.url = '/qucontext/index.html';
          }
          next();
        });
      }
    }
  ]
});
