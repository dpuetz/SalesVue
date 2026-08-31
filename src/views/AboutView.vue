<script setup lang="ts">
import { CodeBracketIcon } from '@heroicons/vue/24/outline';
</script>

<template>
  <div class="pageStyle">
    <div class="w-auto md:w-3/4 mx-auto">
      <div class="pageHeader">
        <h1>About This App</h1>
      </div>

      <!-- Intro -->
      <div class="card mb-6 border-l-4 border-l-brand">
        <p class="text-sm text-gray-700 leading-relaxed max-w-3xl">
          This is a Portfolio application built to showcase a modern Vue 3 frontend stack.
          It connects to a live REST API serving a Northwind-style sales dataset and presents
          the data through filterable lists, sortable tables, detail views, interactive charts,
          and a geographic world map. The technologies below make up the complete stack.
        </p>
      </div>

      <!-- Source Code -->
      <div class="card mb-6 border-l-4 border-l-gray-300 bg-gray-50 flex flex-col gap-2">
        <div class="font-semibold text-gray-400 uppercase tracking-widest mb-1">Source Code</div>
        <RouterLink :to="{ name: 'portfolio' }" class="buttonMedOutline mx-auto sm:ml-3">
          <CodeBracketIcon class="w-4 h-4 text-teal-800  mr-2" />
          View Portfolio
        </RouterLink>
      </div>

      <!-- Framework & Language -->
      <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Framework &amp; Language
      </div>
      <div class="row2">
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Vue 3</span>
                <span class="badge">v3.5</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                The progressive JavaScript framework powering the entire UI. All components use
                the Composition API with
                <code class="font-mono bg-gray-100 px-1 rounded">&lt;script setup&gt;</code>,
                reactive refs, computed properties, watchers, and lifecycle hooks.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">TypeScript</span>
                <span class="badge">~6.0</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Strict static typing across all components, services, composables, and type
                definitions. Strict mode with
                <code class="font-mono bg-gray-100 px-1 rounded">noUncheckedIndexedAccess</code>
                is enabled and enforced at build time via
                <code class="font-mono bg-gray-100 px-1 rounded">vue-tsc</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Build & Styling -->
      <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-6 mb-3">
        Build &amp; Styling
      </div>
      <div class="row2">
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Vite</span>
                <span class="badge">v8</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Development server with instant HMR and optimised production bundler. Configured
                with the Vue and Tailwind CSS plugins plus an
                <code class="font-mono bg-gray-100 px-1 rounded">@</code> path alias. All routes
                except the dashboard are lazy-loaded for automatic code splitting.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Tailwind CSS</span>
                <span class="badge">v4</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Utility-first CSS loaded via the Vite plugin. Extended with a custom
                <code class="font-mono bg-gray-100 px-1 rounded">@theme</code> defining the brand
                teal colour and surface tone, and reusable
                <code class="font-mono bg-gray-100 px-1 rounded">@utility</code> classes for
                cards, tables, badges, pagination, and layout grids.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Routing & State -->
      <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-6 mb-3">
        Routing &amp; State
      </div>
      <div class="row2">
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Vue Router</span>
                <span class="badge">v5</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Client-side routing across ten named routes covering list views, detail pages,
                and the map. Active date-range filters are preserved in the URL query string
                when navigating from a dashboard or list view through to a detail page.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Pinia</span>
                <span class="badge">v3</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                The official Vue state management library, used here as the store foundation.
                Individual views manage their own state with
                <code class="font-mono bg-gray-100 px-1 rounded">ref</code> and
                <code class="font-mono bg-gray-100 px-1 rounded">computed</code>, keeping the
                global store available for future cross-view shared state.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Visualization & UI -->
      <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-6 mb-3">
        Visualization &amp; UI Components
      </div>
      <div class="row2">
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Apache ECharts</span>
                <span class="badge">v6 + vue-echarts v8</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Comprehensive charting library behind the bar charts, pie and donut charts, and
                the GeoJSON world map on the map view. Rendered via the
                <code class="font-mono bg-gray-100 px-1 rounded">vue-echarts</code> Vue wrapper
                with tree-shaken renderer and component imports. Chart options are always
                reactive computed properties.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Heroicons</span>
                <span class="badge">v2</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Hand-crafted SVG icon set from the Tailwind CSS team. Used throughout the
                navigation bar, search inputs, loading spinners, sort indicators, and filter
                controls. Icons are imported individually from the
                <code class="font-mono bg-gray-100 px-1 rounded">24/outline</code> set as Vue
                components.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Vue Datepicker</span>
                <span class="badge">v12</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Full-featured date-range picker component used in the orders view for filtering
                by order date. Styled to match the app theme using
                <code class="font-mono bg-gray-100 px-1 rounded">:deep()</code> scoped CSS
                overrides.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Testing & Tooling -->
      <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-6 mb-3">
        Testing &amp; Tooling
      </div>
      <div class="row2">
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Vitest</span>
                <span class="badge">v4</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Vite-native unit test framework sharing the same config and module resolution.
                Tests run in a jsdom environment and cover composables, API service functions
                (with
                <code class="font-mono bg-gray-100 px-1 rounded">vi.stubGlobal</code> fetch
                mocks), and component rendering via
                <code class="font-mono bg-gray-100 px-1 rounded">@vue/test-utils</code>.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Prettier</span>
                <span class="badge">v3</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Opinionated code formatter applied across the entire
                <code class="font-mono bg-gray-100 px-1 rounded">src/</code> directory with
                <code class="font-mono bg-gray-100 px-1 rounded">npm run format</code>. Keeps
                style consistent across components, services, type definitions, and test files.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Backend -->
      <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-6 mb-3">
        Backend
      </div>
      <div class="row2">
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-violet-600 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">ASP.NET Core</span>
                <span class="badge">.NET 9</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                The Web API is built on ASP.NET Core targeting
                <code class="font-mono bg-gray-100 px-1 rounded">net9.0</code> with nullable
                reference types and implicit usings enabled. Thin attribute-routed controllers
                validate query parameters and delegate to injected repositories, returning typed
                DTOs as JSON — never raw database entities.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-gray-500 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">REST API</span>
                <span class="badge">Controllers</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Serves a Northwind-style relational dataset of orders, customers, products,
                categories, and salespeople, with paged and filterable endpoints. The frontend
                consumes it using the native browser
                <code class="font-mono bg-gray-100 px-1 rounded">fetch</code> API — no HTTP
                client library. Typed service functions in
                <code class="font-mono bg-gray-100 px-1 rounded">src/services/</code> handle
                URL construction, query parameters, error checking, and response parsing.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Dapper</span>
                <span class="badge">v2.1</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                A lightweight micro-ORM handling all data access. Repositories execute hand-written
                SQL and map results straight onto DTOs. User-supplied sort columns are whitelisted
                and all inputs are passed as Dapper parameters to guard against SQL injection.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">SQLite</span>
                <span class="badge">Microsoft.Data.Sqlite</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                The Northwind dataset is stored in a single
                <code class="font-mono bg-gray-100 px-1 rounded">northwind.db</code> SQLite file
                shipped with the API. Queries use SQLite-specific syntax such as
                <code class="font-mono bg-gray-100 px-1 rounded">strftime</code> for monthly
                aggregation and the bracketed
                <code class="font-mono bg-gray-100 px-1 rounded">[Order Details]</code> table.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-green-600 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Swagger / OpenAPI</span>
                <span class="badge">Swashbuckle</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Swashbuckle generates an OpenAPI specification and serves an interactive Swagger UI
                for exploring and testing every endpoint. A named CORS policy whitelists the Vue
                dev server and deployed frontend origins.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="mt-1 w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900">Repository Pattern</span>
                <span class="badge">DI</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Data access lives in a separate
                <code class="font-mono bg-gray-100 px-1 rounded">Sales.Data</code> project behind
                <code class="font-mono bg-gray-100 px-1 rounded">I*Repository</code> interfaces,
                registered as scoped services in the dependency-injection container and injected
                into controllers via their constructors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>