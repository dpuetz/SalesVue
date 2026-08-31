<script setup lang="ts">

import { ref, onMounted, watch } from 'vue';
import { getCustomers } from '@/services/customerService';
import type { Customer } from '@/types/customer';
import type { PagedResult } from '@/types/order';
import { MagnifyingGlassIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';

const result = ref<PagedResult<Customer> | null>(null);
const page = ref(1);
const pageSize = ref(25);
const loading = ref(false);
const error = ref<string | null>(null);
const search = ref('');
const sortBy = ref('companyName');
const sortDir = ref<'asc' | 'desc'>('asc');

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    result.value = await getCustomers(page.value, pageSize.value, search.value || undefined, sortBy.value, sortDir.value);
  } catch (e) {
    error.value = 'Sorry, an error has occurred.';
  } finally {
    loading.value = false;
  }
};

const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { page.value = 1; load(); }, 350);
};

const clearSearch = () => {
  search.value = '';
  page.value = 1;
  load();
};

const sort = (column: string) => {
  if (sortBy.value === column) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDir.value = 'asc';
  }
  page.value = 1;
  load();
};

const sortIcon = (column: string): 'up' | 'down' | 'none' => {
  if (sortBy.value !== column) return 'none';
  return sortDir.value === 'asc' ? 'up' : 'down';
};

const initials = (name: string): string =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

onMounted(load);
watch(page, load);
</script>

<template>
  <div class="pageStyle">
    <div class="pageHeader">
      <h1>Customers</h1>
      <!-- Search -->
      <div class="searchContainer">
        <MagnifyingGlassIcon class="searchIcon" />
        <input v-model="search" @input="onSearchInput" type="text"
          placeholder="Search by company, contact or country..." class="searchInput" />
        <button v-if="search" @click="clearSearch" class="searchBtn">
          <XMarkIcon class="searchXIcon" />
        </button>
      </div>

    </div>

    <div v-if="loading" class="flex flex-col items-center mt-30  min-h-screen">
      <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
      <p class="text-lg text-gray-600 font-light">Loading ...</p>
    </div>
    <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

    <template v-else-if="result">

      <!-- Wide screen: table -->
      <div class="tableCard hidden sm:block mb-4">
        <table class="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <!-- Sortable: Company -->
              <th @click="sort('companyName')" class="thSort thStyle">
                <span class="inline-flex items-center gap-1">
                  Company
                  <span class="inline-flex flex-col">
                    <ChevronUpIcon class="w-3 h-3 -mb-1"
                      :class="sortIcon('companyName') === 'up' ? 'text-brand' : 'text-gray-300'" />
                    <ChevronDownIcon class="w-3 h-3"
                      :class="sortIcon('companyName') === 'down' ? 'text-brand' : 'text-gray-300'" />
                  </span>
                </span>
              </th>
              <!-- Sortable: Contact -->
              <th @click="sort('contactName')" class="thSort thStyle">
                <span class="inline-flex items-center gap-1">
                  Contact
                  <span class="inline-flex flex-col">
                    <ChevronUpIcon class="w-3 h-3 -mb-1"
                      :class="sortIcon('contactName') === 'up' ? 'text-brand' : 'text-gray-300'" />
                    <ChevronDownIcon class="w-3 h-3"
                      :class="sortIcon('contactName') === 'down' ? 'text-brand' : 'text-gray-300'" />
                  </span>
                </span>
              </th>
              <!-- Non-sortable -->
              <th class="thStyle">
                Title</th>
              <th class="thStyle">
                Phone</th>
              <th class="thStyle">
                City</th>
              <!-- Sortable: Country -->
              <th @click="sort('country')" class="thSort thStyle">
                <span class="inline-flex items-center gap-1">
                  Country
                  <span class="inline-flex flex-col">
                    <ChevronUpIcon class="w-3 h-3 -mb-1"
                      :class="sortIcon('country') === 'up' ? 'text-brand' : 'text-gray-300'" />
                    <ChevronDownIcon class="w-3 h-3"
                      :class="sortIcon('country') === 'down' ? 'text-brand' : 'text-gray-300'" />
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in result.data" :key="c.customerId" class="hover:bg-gray-50">
              <td class="tdStyle last:border-b-0 font-medium text-gray-900">{{ c.companyName }}</td>
              <td class="tdStyle">{{ c.contactName }}</td>
              <td class="tdStyle text-gray-500">{{ c.contactTitle }}</td>
              <td class="tdStyle text-gray-500">{{ c.phone }}</td>
              <td class="tdStyle">{{ c.city }}</td>
              <td class="tdStyle"><span class="badge">{{ c.country }}</span></td>
            </tr>

          </tbody>
        </table>
      </div>

      <!-- Small screen: card grid -->
      <div class="cardGrid sm:hidden">
        <div class="custCard" v-for="c in result.data" :key="c.customerId">
          <div class="cardTop">
            <div class="avatar">{{ initials(c.companyName) }}</div>
            <div>
              <div class="card-company">{{ c.companyName }}</div>
              <div class="card-contact">{{ c.contactName }} · {{ c.contactTitle }}</div>
            </div>
          </div>
          <div class="cardDetails">
            <div class="cardDetail"><span class="detailLabel">Phone</span>{{ c.phone }}</div>
            <div class="cardDetail"><span class="detailLabel">City</span>{{ c.city }}</div>
            <div class="cardDetail"><span class="detailLabel">Country</span><span class="badge">{{ c.country }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button class="pageBtn" :disabled="page === 1" @click="page--">Previous</button>
        <template v-for="p in result.totalPages" :key="p">
          <button class="pageBtn" :class="{ pageBtnActive: p === page }" @click="page = p">{{ p }}</button>
        </template>
        <button class="pageBtn" :disabled="page === result.totalPages" @click="page++">Next</button>
      </div>

    </template>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.tdStyle {
  @apply px-4 py-2.5 border-b border-gray-100;
}

.thSort {
  @apply whitespace-nowrap cursor-pointer select-none hover:text-brand;
}

.thStyle {
  @apply text-left text-[11px] text-gray-400 uppercase tracking-[0.04em] px-4 py-3 border-b border-gray-200;
}
</style>