import env, { IS_DEV, IS_PROD } from '@extension/env';
import { watchRebuildPlugin } from '@extension/hmr';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import deepmerge from 'deepmerge';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import type { UserConfig } from 'vite';

// Vite 8 uses Rolldown under the hood; WatcherOptions exposes `buildDelay`
// (replacing rollup's chokidar.awaitWriteFinish). 100ms lets writes settle.
export const watchOption = IS_DEV ? { buildDelay: 100 } : undefined;

export const withPageConfig = (config: UserConfig) =>
  defineConfig(
    deepmerge(
      {
        define: {
          'process.env': env,
        },
        base: '',
        plugins: [react(), tailwindcss(), IS_DEV && watchRebuildPlugin({ refresh: true }), nodePolyfills()],
        build: {
          sourcemap: IS_DEV,
          minify: IS_PROD,
          reportCompressedSize: IS_PROD,
          emptyOutDir: IS_PROD,
          watch: watchOption,
          rollupOptions: {
            external: ['chrome'],
          },
        },
      },
      config,
    ),
  );
