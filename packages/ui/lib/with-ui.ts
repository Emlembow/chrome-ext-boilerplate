// Tailwind v4 uses CSS-first configuration; this helper is a no-op kept for
// back-compat with `tailwind.config.ts` files that still call it. Source paths
// are now declared via `@source` directives in `packages/ui/global.css`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withUI = <T extends Record<string, any>>(tailwindConfig: T): T => tailwindConfig;
