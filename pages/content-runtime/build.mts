import { resolve } from 'node:path';
import { IS_DEV } from '@extension/env';
import { makeEntryPointPlugin } from '@extension/hmr';
import { getContentScriptEntries, withPageConfig } from '@extension/vite-config';
import { build } from 'vite';

const rootDir = resolve(import.meta.dirname);
const srcDir = resolve(rootDir, 'src');
const matchesDir = resolve(srcDir, 'matches');

// Tailwind v4 + @tailwindcss/vite handles CSS at Vite build time, so the entry
// can `import inlineCss from './index.css?inline'` directly — no separate CLI step.
const builds = Object.entries(getContentScriptEntries(matchesDir)).map(async ([name, entry]) => {
  const config = withPageConfig({
    mode: IS_DEV ? 'development' : undefined,
    resolve: {
      alias: {
        '@src': srcDir,
      },
    },
    publicDir: resolve(rootDir, 'public'),
    plugins: [IS_DEV && makeEntryPointPlugin()],
    build: {
      lib: {
        name,
        formats: ['iife'],
        entry,
        fileName: name,
      },
      outDir: resolve(rootDir, '..', '..', 'dist', 'content-runtime'),
    },
  });

  // @ts-expect-error Hidden flag — tells Vite not to load a vite.config from disk.
  config.configFile = false;
  await build(config);
});

await Promise.all(builds);
