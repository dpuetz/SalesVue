<script setup lang="ts">

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDate } from '@/composables/useDate';
import { useCurrency } from '@/composables/useCurrency';
import type { RecentOrder } from '@/types/dashboard';

const props = withDefaults(defineProps<{
  title: string
  orders: RecentOrder[]
  showStatus?: boolean
  pageSize?: number
}>(), {
  showStatus: false,
  pageSize: undefined
});

const router = useRouter();
const { formatDate, formatDateShort } = useDate();
const { formatUSD } = useCurrency();

const goToOrder = (orderId: number) => {
  router.push({ name: 'OrderDetail', params: { id: orderId } });
};

// --- Pagination ---
const currentPage = ref(1);

const paginated = computed(() => {
  if (!props.pageSize) return props.orders;
  const start = (currentPage.value - 1) * props.pageSize;
  return props.orders.slice(start, start + props.pageSize);
});

const totalPages = computed(() => {
  return props.pageSize ? Math.ceil(props.orders.length / props.pageSize) : 1;
}
);

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++)
    pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});
</script>

<template>
  <div class="card">
    <div class="cardTitle">{{ title }}</div>
    <table data-testid="ordersTableSm" class="w-full text-sm border-collapse block sm:hidden">
      <tbody>
        <tr v-for="o in paginated" :key="o.orderId"
          class="border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
          @click="goToOrder(o.orderId)">
          <td class="py-1.5 pr-3 font-medium text-gray-900 w-14 align-top">#{{ o.orderId }}</td>
          <td class="py-1.5 pr-3 max-w-0 w-full align-top">
            <div v-if="o.customerName" class="truncate text-gray-900 ">
              {{ o.customerName }}
            </div>
            <div class="text-gray-600 text-xs">
              {{ formatDateShort(o.orderDate) }}
            </div>
          </td>
          <td v-if="showStatus" class="align-top py-1.5 pr-3 whitespace-nowrap hidden xs:table-cell">
            <span class="text-xs px-2 py-0.5 rounded-full"
              :class="o.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-800'">
              {{ o.status }}
            </span>
          </td>
          <td class="align-top py-1.5 text-right font-medium whitespace-nowrap">{{ formatUSD(o.orderTotal) }}</td>
        </tr>
      </tbody>
    </table>
    <table data-testid="ordersTableXs" class="w-full text-sm border-collapse hidden sm:block">
      <tbody>
        <tr v-for="o in paginated" :key="o.orderId"
          class="border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
          @click="goToOrder(o.orderId)">
          <td class="py-1.5 pr-3 font-medium text-gray-900 w-14">#{{ o.orderId }}</td>
          <td class="py-1.5 pr-3 text-gray-900 max-w-0 w-full truncate">{{ o.customerName }}</td>
          <td class="py-1.5 pr-3 text-xs 
          text-gray-500 
         whitespace-nowrap">{{
          formatDate(o.orderDate) }}</td>
          <td v-if="showStatus" class="py-1.5 pr-3 whitespace-nowrap hidden xs:table-cell">
            <span class="text-xs px-2 py-0.5 rounded-full"
              :class="o.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-800'">
              {{ o.status }}
            </span>
          </td>
          <td class="py-1.5 text-right font-medium whitespace-nowrap">{{ formatUSD(o.orderTotal) }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Pagination — rendered only when pageSize prop is provided -->
    <div v-if="pageSize && totalPages > 1" class="pagination">
      <button class="pageBtn hidden md:block" :disabled="currentPage === 1" @click="currentPage = 1">«</button>
      <button class="pageBtn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
      <template v-for="p in pageNumbers" :key="p">
        <span v-if="p === '...'" class="pageEllipsis">…</span>
        <button v-else class="pageBtn" :class="{ 'pageBtnActive': p === currentPage }"
          @click="currentPage = (p as number)">
          {{ p }}
        </button>
      </template>
      <button class="pageBtn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
      <button class="pageBtn hidden md:block" :disabled="currentPage === totalPages"
        @click="currentPage = totalPages">»</button>
    </div>
  </div>
</template>
