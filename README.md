# Sales UI

A sales dashboard single-page app built with Vue 3, TypeScript, and Tailwind CSS. It displays orders, customers, products, categories, and salespeople with interactive charts and a world map, backed by an external REST API.

---

## ⚠️ Before You Do Anything Else: Node.js Setup

This project requires **Node.js v24.16.0 exactly**. Using a different version is the most common cause of install and build failures.

If you use [nvm](https://github.com/nvm-sh/nvm) (recommended), run these two commands first:

```sh
nvm install 24.16.0
nvm use 24.16.0
```

- `nvm install 24.16.0` downloads and installs Node v24.16.0 if you don't already have it.
- `nvm use 24.16.0` switches your active session to that version.

Verify the active version before continuing:

```sh
node --version   # must print v24.16.0
```

Once you're on the correct Node version, install dependencies:

```sh
npm install
```

> **Don't have nvm?** Install it from https://github.com/nvm-sh/nvm before proceeding.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3.5 (Composition API, `<script setup>`) |
| Language | TypeScript (strict mode) |
| Build | Vite 8 + `@vitejs/plugin-vue` |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` |
| Routing | Vue Router 5 |
| State | Pinia 3 |
| Charts | ECharts 6 + vue-echarts 8 |
| Icons | @heroicons/vue 2 |
| Date picker | @vuepic/vue-datepicker 12 |
| Testing | Vitest 4 + @vue/test-utils 2 + jsdom |
| Formatting | Prettier 3 |

## Commands

```sh
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Type-check + production build → dist/
npm run build-only   # Production build only (skip type-check)
npm run preview      # Serve dist/ locally
npm run type-check   # vue-tsc --build
npm run test:unit    # Run unit tests with Vitest
npm run format       # Prettier over src/
```

## Environment Variables

Variables live in `.env.development` and `.env.production` and must be prefixed `VITE_` to be exposed to the client.

```
VITE_API_BASE=http://localhost:5276/api                  # dev
VITE_API_BASE=https://takemetoyourdata.com/salesApi/api  # prod
```

Access them in code via `import.meta.env.VITE_API_BASE`.

The Vite base path is `/salesUI/` (set in `vite.config.ts`) — the app is served under that subpath in production.

## Project Structure

```
src/
├── assets/        # main.css (Tailwind theme + utilities), world.json (GeoJSON)
├── components/    # Reusable components (PascalCase)
├── composables/   # Composition utilities (use* prefix)
├── router/        # Routes (views lazy-loaded via dynamic import)
├── services/      # API calls via native fetch (no Axios)
├── stores/        # Pinia stores
├── types/         # TypeScript interfaces
├── views/         # Page-level components, mapped 1-to-1 with routes
├── App.vue        # Root: <Navbar> + <RouterView>
└── main.ts        # App bootstrap
tests/             # Vitest specs mirroring src/
```

## Routing

| Path | View |
|---|---|
| `/` | HomeView |
| `/orders` | OrdersView |
| `/customers` | CustomersView |
| `/products` | ProductsView |
| `/categories` | CategoryView |
| `/map` | MapView |
| `/about` | AboutView |
| `/order/:id` | OrderDetailView |
| `/customer/:id` | CustomerDetailView |
| `/salesperson/:id` | SalespersonDetailView |

## Conventions

- Components use `<script setup lang="ts">` only — no Options API.
- API calls use native `fetch` (no Axios); services stay thin and return typed data.
- Interfaces live in `src/types/`; paginated responses use the generic `PagedResult<T>`.
- Styling uses Tailwind CSS 4 with custom theme tokens and `@utility` classes defined in `src/assets/main.css`.
- Responsive first: cards/stacked layout on mobile, tables at `lg:` and above.
- Run `npm run type-check` before committing.

See [CLAUDE.md](./CLAUDE.md) for detailed coding conventions.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).
