import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'lab-apps-route-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const cleanUrl = req.url.split('?')[0];
          if (cleanUrl === '/qucontext' || cleanUrl === '/qucontext/') {
            req.url = '/qucontext/index.html';
          } else if (cleanUrl === '/tauism' || cleanUrl === '/tauism/') {
            req.url = '/tauism/index.html';
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const cleanUrl = req.url.split('?')[0];
          if (cleanUrl === '/qucontext' || cleanUrl === '/qucontext/') {
            req.url = '/qucontext/index.html';
          } else if (cleanUrl === '/tauism' || cleanUrl === '/tauism/') {
            req.url = '/tauism/index.html';
          }
          next();
        });
      }
    }
  ]
});
