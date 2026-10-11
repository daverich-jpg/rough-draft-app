import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// The design system is vendored into vendor/ (refresh with `npm run sync-ds`), so the app builds standalone.
const ds = (p: string) => fileURLToPath(new URL(`./vendor/rough-draft-ds/${p}`, import.meta.url));

/** Mounts Remi's streaming proxy on the dev + preview servers. Static hosting (GitHub Pages) has no server, so the app falls back to demo mode there. */
function remiApi(): Plugin {
  const mount = async (use: (path: string, fn: (req: any, res: any) => void) => void) => {
    const { handleRemi } = await import('./server/remi');
    use('/api/remi', (req, res) => void handleRemi(req, res));
  };
  return {
    name: 'remi-api',
    configureServer: (server) => mount((p, fn) => server.middlewares.use(p, fn)),
    configurePreviewServer: (server) => mount((p, fn) => server.middlewares.use(p, fn)),
  };
}

export default defineConfig(({ mode }) => {
  // Server-only secrets (ANTHROPIC_API_KEY) from .env.local → process.env. Never exposed to the client.
  const env = loadEnv(mode, process.cwd(), '');
  if (env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  return {
    base: './',
    plugins: [react(), remiApi()],
    resolve: {
      alias: { '@components': ds('components'), '@tokens': ds('design-tokens/build'), '@ds': ds('') },
      dedupe: ['react', 'react-dom'],
    },
    server: { port: 5250, strictPort: true },
  };
});
