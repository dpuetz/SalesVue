# CLAUDE.md — Sales UI

Sales dashboard SPA built with Vue 3, TypeScript, and Tailwind CSS. Displays orders, customers, products, categories, and salespeople with charts and a world map. Communicates with an external REST API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3.5 (Composition API, `<script setup>`) |
| Language | TypeScript ~6.0 (strict mode) |
| Build | Vite 8 + `@vitejs/plugin-vue` |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` |
| Routing | Vue Router 5 |
| State | Pinia 3 (minimal; most state is local) |
| Charts | ECharts 6 + vue-echarts 8 |
| Icons | @heroicons/vue 2 (24/outline) |
| Date picker | @vuepic/vue-datepicker 12 |
| Testing | Vitest 4 + @vue/test-utils 2 + jsdom |
| Formatting | Prettier 3 |

---

## Directory Structure

```
src/
├── assets/
│   ├── main.css          # Tailwind imports, @theme variables, @utility classes
│   └── world.json        # GeoJSON for MapView
├── components/           # Reusable components (PascalCase filenames)
│   ├── Navbar.vue
│   ├── OrderTable.vue
│   └── DatePicker.vue
├── composables/          # Composition utilities (camelCase, use* prefix)
│   ├── useCurrency.ts    # formatUSD()
│   ├── useDate.ts        # formatDate(), formatDateShort(), formatDateLong()
│   ├── useInitials.ts    # getInitials()
│   └── useMonth.ts       # getMonthName()
├── router/
│   └── index.ts          # All routes; views loaded with dynamic import()
├── services/             # API calls via native fetch (no axios)
│   ├── dashboardService.ts
│   ├── orderService.ts
│   ├── customerService.ts
│   ├── productService.ts
│   ├── categoryService.ts
│   └── salespersonService.ts
├── stores/
│   └── counter.ts        # Pinia example store — not used by views
├── types/                # TypeScript interfaces only (no runtime code)
│   ├── dashboard.ts
│   ├── order.ts
│   ├── customer.ts
│   ├── customerDetail.ts
│   ├── salespersonDetail.ts
│   ├── product.ts
│   └── category.ts
├── views/                # Page-level components mapped 1-to-1 with routes
│   ├── HomeView.vue
│   ├── OrdersView.vue
│   ├── CustomersView.vue
│   ├── ProductsView.vue
│   ├── CategoryView.vue
│   ├── MapView.vue
│   ├── AboutView.vue
│   ├── OrderDetailView.vue
│   ├── CustomerDetailView.vue
│   └── SalespersonDetailView.vue
├── App.vue               # Root: <Navbar> + <RouterView>
└── main.ts               # App bootstrap
tests/
├── composables/
├── services/
├── views/
└── components/
```

---

## Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Type-check + production build → dist/
npm run build-only   # Production build only (skip type-check)
npm run preview      # Serve dist/ locally
npm run type-check   # vue-tsc --build
npm run test:unit    # Vitest (watch mode)
npm run format       # Prettier over src/
```

---

## Environment Variables

Stored in `.env.development` and `.env.production`. Must be prefixed `VITE_` to be exposed to the client.

```
VITE_API_BASE=http://localhost:5276/api      # dev
VITE_API_BASE=https://takemetoyourdata.com/salesApi/api  # prod
```

Access in code: `import.meta.env.VITE_API_BASE`

The Vite base path is `/salesUI/` (set in `vite.config.ts`) — the app is served under that subpath in production.

---

## Routing

All routes are in `src/router/index.ts`. Views are lazy-loaded with `() => import(...)` for code splitting (except HomeView which is eagerly imported).

Detail routes pass the `id` param as a component prop:

```
/                           → HomeView
/orders                     → OrdersView
/customers                  → CustomersView
/products                   → ProductsView
/categories                 → CategoryView
/map                        → MapView
/about                      → AboutView
/order/:id                  → OrderDetailView    (props: true)
/customer/:id               → CustomerDetailView (props: true)
/salesperson/:id            → SalespersonDetailView (props: true)
```

---

## Coding Conventions

### Vue components
- Always use `<script setup lang="ts">` — never Options API.
- Props typed with `defineProps<{...}>()` or `withDefaults(defineProps<{...}>(), {...})`.
- Emits typed with `defineEmits<{...}>()`.

### Composition API patterns
```typescript
// Local state
const loading = ref(false)
const data = ref<SomeType | null>(null)

// Load on mount, reload when deps change
onMounted(load)
watch([dep1, dep2], load)

// Async load function
const load = async () => {
  loading.value = true
  try {
    data.value = await someService(...)
  } finally {
    loading.value = false
  }
}
```

### Debounced search (standard pattern)
```typescript
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; load() }, 350)
}
```

### Responsive breakpoint detection
```typescript
const isLg = ref(window.matchMedia('(min-width: 1024px)').matches)
const mq = window.matchMedia('(min-width: 1024px)')
const handler = (e: MediaQueryListEvent) => { isLg.value = e.matches }
mq.addEventListener('change', handler)
onUnmounted(() => mq.removeEventListener('change', handler))
```

### Services
- All API calls use native `fetch` (no Axios).
- Use `URLSearchParams` to build query strings.
- Check `response.ok`; throw a descriptive `Error` if not.
- Return fully typed results.

```typescript
const API_BASE = import.meta.env.VITE_API_BASE

export async function getOrders(page: number, pageSize: number, filters: OrderFilters = {}): Promise<PagedResult<Order>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...filters })
  const response = await fetch(`${API_BASE}/orders?${params}`)
  if (!response.ok) throw new Error(`Failed to fetch orders: ${response.statusText}`)
  return response.json()
}
```

### Types
- Interfaces live in `src/types/` — pure type declarations only.
- Use the generic `PagedResult<T>` for all paginated API responses.

### Composables
- Live in `src/composables/`, named `use*.ts`.
- Return an object with named functions (not a single function).
- Always unit-tested in `tests/composables/`.

### Naming
| Thing | Convention |
|---|---|
| Component files | PascalCase (`OrderTable.vue`) |
| Composable files | camelCase (`useCurrency.ts`) |
| Type/interface files | camelCase (`orderDetail.ts`) |
| Route paths | kebab-case (`/order-detail`) |
| CSS utility classes | camelCase (`pageStyle`, `cardGrid`) |

---

## Styling

Tailwind CSS 4 is used throughout. Do not add inline styles or separate CSS files for new features.

**Custom theme tokens** (defined in `src/assets/main.css`):
```css
--color-brand: #0f6e56        /* primary teal — use for interactive elements */
--color-brand-dark: #0a5c47   /* hover/active state */
--color-surface: #f5f5f3      /* page background */
```

**Reusable `@utility` classes** (defined in `main.css` — use these before inventing new ones):
- Layout: `pageStyle`, `pageHeader`
- Cards: `card`, `cardTitle`, `cardGrid`, `custCard`, `cardDetails`
- Tables: `tableWrap`, `tableTh`, `tableTd`, `tableThSortable`
- Search: `searchContainer`, `searchIcon`, `searchInput`, `searchBtn`
- Badges: `badge`, `badgeLow`, `badgeDiscontinued`
- Pagination: `pagination`, `pageBtn`, `pageBtnActive`
- Buttons: `buttonPrimary`, `buttonWarn`
- Filters: `filterPanel`, `filterLabel`, `filterSearch`, `filterSelect`
- Grids: `kpiGrid`, `row`, `row2`

Use `<style scoped>` only when a utility class truly cannot cover the need (e.g., deep `:deep()` overrides for third-party components, or complex transition keyframes).

---

## Charts

ECharts options are always computed properties so they react to data changes:

```typescript
const chartOption = computed(() => ({
  tooltip: { ... },
  series: [{ type: 'bar', data: myData.value }]
}))
```

Use the `<v-chart>` component from `vue-echarts`.

---

## Testing

Tests live in `tests/` mirroring the `src/` structure. File pattern: `**/*.spec.ts`.

- **Composables** — test every exported function with multiple cases.
- **Services** — mock `fetch` with `vi.stubGlobal('fetch', ...)`. Test happy path, HTTP errors, and network failures. Verify URL construction and query params.
- **Components/Views** — use `@vue/test-utils` mount; mock services with `vi.mock(...)`.

Run all tests: `npm run test:unit`

---

## Constraints and Rules

1. **Do not use Axios** — the project deliberately uses native `fetch`.
2. **Do not use Options API** — all components must use `<script setup>`.
3. **Do not add global state to Pinia** unless data is genuinely shared across multiple unrelated views. Prefer local `ref`/`reactive`.
4. **Keep services thin** — no business logic in services; they fetch and return typed data only.
5. **Types in `src/types/` only** — do not declare interfaces inline in service or component files.
6. **All new utility CSS classes go in `main.css`** as `@utility` blocks — not in component `<style>` tags unless scoped.
7. **TypeScript strict mode is on** (`noUncheckedIndexedAccess`) — do not use `any` or non-null assertions (`!`) without justification.
8. **Responsive first** — every new view/component must work on mobile. Use cards/stacked layout on mobile and tables on `lg:` and above.
9. **Paginated list views follow the established pattern**: `page`, `pageSize`, `totalCount` refs + `load()` + `onMounted(load)` + `watch`.
10. **Run `npm run type-check` before committing** — the build script enforces this anyway (`run-p type-check build-only`).
