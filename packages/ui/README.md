# `@extension/ui`

Internal component library shared by every page. Built on Tailwind v4 (CSS-first config), exporting React components plus a `withUI` no-op kept for back-compat.

## Using a UI component

Add `@extension/ui` to the consumer page's `package.json`:

```json
{
  "dependencies": {
    "@extension/ui": "workspace:*"
  }
}
```

Then `pnpm install` from the repo root. The page's CSS entry only needs:

```css
@import '@extension/ui/global.css';
```

That import pulls in Tailwind v4 (`@import 'tailwindcss';`) plus the workspace-wide `@source` directives that scan `pages/**`, `chrome-extension/**`, and `packages/ui/lib/**` for class usage. No `tailwind.config.ts` is needed in the consumer.

## Adding a custom component

```tsx
// packages/ui/lib/components/CustomComponent.tsx
import { cn } from '../utils';
import type { ComponentPropsWithoutRef } from 'react';

type CustomComponentProps = ComponentPropsWithoutRef<'section'>;

export const CustomComponent = ({ children, className, ...props }: CustomComponentProps) => (
  <section className={cn('p-4', className)} {...props}>
    {children}
  </section>
);
```

Re-export it from `lib/components/index.ts`:

```ts
export * from './CustomComponent';
```

Then consume:

```tsx
import { CustomComponent, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { withErrorBoundary, withSuspense } from '@extension/shared';

const Page = () => <CustomComponent>Hi</CustomComponent>;

export default withErrorBoundary(withSuspense(Page, <LoadingSpinner />), ErrorDisplay);
```

`<LoadingSpinner />` accepts a `size` prop.

## Modifying global styles

Edit `packages/ui/global.css`. You can add Tailwind v4 directives inline:

```css
@import 'tailwindcss';

@source '../../packages/ui/lib/**/*.{ts,tsx}';
@source '../../pages/**/*.{ts,tsx,html}';
@source '../../chrome-extension/**/*.{ts,tsx,html}';

@theme {
  --color-brand: oklch(72% 0.15 250);
}
```

Anything in `@theme` becomes available as a utility (`bg-brand`, `text-brand`, etc.). See the [Tailwind v4 docs](https://tailwindcss.com/docs/theme) for the full surface.

## Adding shadcn/ui (Tailwind v4)

shadcn/ui supports Tailwind v4 directly. From repo root:

```bash
pnpm dlx shadcn@latest init -c ./packages/ui     # interactive setup
pnpm dlx shadcn@latest add button -c ./packages/ui
```

Re-export from `index.ts` once added:

```ts
export * from './lib/components/ui/button';
```

The `cn` utility shadcn expects already exists at `packages/ui/lib/utils.ts`. shadcn's v4 init writes its theme tokens (`@theme inline { ... }`) and animation classes into `global.css` automatically — no separate `tailwind.config.ts` is created.

For shadow-DOM content scripts (`pages/content-ui`, `pages/content-runtime`), the page's `index.css` already does `@import '@extension/ui/global.css';`, so shadcn components work there too — utilities get scoped into the inlined CSS via `?inline`.
