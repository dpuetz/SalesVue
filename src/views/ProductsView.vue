<script setup lang="ts">

import { ref, onMounted, watch } from 'vue';
import { getProducts } from '@/services/productService';
import type { Product } from '@/types/product';
import type { PagedResult } from '@/types/order';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

const result = ref<PagedResult<Product> | null>(null);
const page = ref(1);
const pageSize = ref(25);
const loading = ref(false);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    result.value = await getProducts(page.value, pageSize.value);
  } catch (e) {
    error.value = 'Sorry, an error has occurred.';
  } finally {
    loading.value = false;
  }
}

const currency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

onMounted(load);
watch(page, load);
</script>

<template>
  <div class="pageStyle">
    <div class="pageHeader">
      <h1>Products</h1>
    </div>

    <div v-if="loading" class="flex flex-col items-center mt-30  min-h-screen">
      <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
      <p class="text-lg text-gray-600 font-light">Loading ...</p>
    </div>
    <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

    <template v-else-if="result">

      <!-- Wide screen: table -->
      <div class="tableWrap hidden lg:block">
        <table class="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th class="thStyle">Product</th>
              <th class="thStyle">Category</th>
              <th class="thStyle">Supplier</th>
              <th class="thStyle">Qty per unit</th>
              <th class="thStyle text-right">Unit price</th>
              <th class="thStyle text-right">In stock</th>
              <th class="thStyle text-right">On order</th>
              <th class="thStyle text-right">Reorder at</th>
              <th class="thStyle">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in result.data" :key="p.productId" class="hover:bg-gray-50"
              :class="{ 'opacity-45': p.discontinued }">
              <td class="tdStyle font-medium text-gray-900">{{ p.productName }}</td>
              <td class="tdStyle"><span class="badge">{{ p.categoryName }}</span></td>
              <td class="tdStyle text-gray-500">{{ p.supplierName }}</td>
              <td class="tdStyle text-gray-500">{{ p.quantityPerUnit }}</td>
              <td class="tdStyle text-right">{{ currency(p.unitPrice) }}</td>
              <td class="tdStyle text-right"
                :class="{ 'text-amber-700 font-medium': p.unitsInStock <= p.reorderLevel && !p.discontinued }">
                {{ p.unitsInStock }}
              </td>
              <td class="tdStyle text-right">{{ p.unitsOnOrder }}</td>
              <td class="tdStyle text-right text-gray-500">{{ p.reorderLevel }}</td>
              <td class="tdStyle">
                <span v-if="p.discontinued" class="badgeDiscontinued">Discontinued</span>
                <span v-else-if="p.unitsInStock <= p.reorderLevel" class="badgeLow">Low stock</span>
                <span v-else class="badge">Active</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Small screen: card grid -->
      <div class="cardGrid lg:hidden">
        <div class="custCard" v-for="p in result.data" :key="p.productId" :class="{ 'opacity-50': p.discontinued }">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="text-sm font-medium text-gray-900">{{ p.productName }}</div>
            <span v-if="p.discontinued" class="badgeDiscontinued">Discontinued</span>
            <span v-else-if="p.unitsInStock <= p.reorderLevel" class="badgeLow">Low stock</span>
            <span v-else class="badge">Active</span>
          </div>
          <div class="mb-2.5">
            <span class="badge">{{ p.categoryName }}</span>
          </div>
          <div class="cardDetails">
            <div class="cardDetail"><span class="detailLabel">Supplier</span>{{ p.supplierName }}</div>
            <div class="cardDetail"><span class="detailLabel">Price</span>{{ currency(p.unitPrice) }}</div>
            <div class="cardDetail">
              <span class="detailLabel">In stock</span>
              <span :class="{ 'text-amber-700 font-medium': p.unitsInStock <= p.reorderLevel && !p.discontinued }">
                {{ p.unitsInStock }}
              </span>
            </div>
            <div class="cardDetail"><span class="detailLabel">On order</span>{{ p.unitsOnOrder }}</div>
            <div class="cardDetail"><span class="detailLabel">Qty/unit</span>{{ p.quantityPerUnit }}</div>
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

.thStyle {
  @apply text-left text-[11px] text-gray-400 uppercase tracking-[0.04em] px-4 py-3 border-b border-gray-200 whitespace-nowrap;
}

.tdStyle {
  @apply px-4 py-2.5 border-b border-gray-100 last:border-b-0;
}
</style>