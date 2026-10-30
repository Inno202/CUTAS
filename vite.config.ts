import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Adds a strict Content-Security-Policy <meta> tag to the production build, so the app is
 * protected even on static hosts where response headers cannot be configured. connect-src
 * allows the API origin from VITE_API_BASE_URL (or only this origin when the API is
 * served from the same domain, e.g. behind the bundled nginx).
 */
function contentSecurityPolicy(apiBase: string): Plugin {
  let apiOrigin = '';
  try {
    if (/^https?:\/\//i.test(apiBase)) apiOrigin = new URL(apiBase).origin;
  } catch {
    apiOrigin = '';
  }
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self'",
    `img-src 'self' data: blob:${apiOrigin ? ` ${apiOrigin}` : ''}`,
    `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  return {
    name: 'cutas-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || '/api/v1';
  const devProxyTarget = env.DEV_API_PROXY || 'http://127.0.0.1:8000';

  return {
    // "/CUTAS/" when published on GitHub Pages (https://<user>.github.io/CUTAS/), "/" everywhere else.
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), contentSecurityPolicy(apiBase)],
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    server: {
      // During development the API is reached through this proxy, so the browser sees one
      // origin and the HttpOnly session cookie works without any CORS set-up.
      proxy: {
        '/api': { target: devProxyTarget, changeOrigin: false, secure: false },
      },
    },
    preview: {
      proxy: {
        '/api': { target: devProxyTarget, changeOrigin: false, secure: false },
      },
    },
    build: {
      target: 'es2020',
      sourcemap: false,          // do not publish source maps (keeps the original source private)
      chunkSizeWarningLimit: 600,
      assetsInlineLimit: 4096,
    },
  };
});
