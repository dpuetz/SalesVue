<script setup lang="ts">

import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getOrderDetail } from '@/services/orderService';
import type { OrderDetail } from '@/types/order';
import { useCurrency } from '@/composables/useCurrency';
import { useDate } from '@/composables/useDate';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{ id: string }>();
const router = useRouter();
const { formatUSD } = useCurrency();
const { formatDate } = useDate();

const data = ref<OrderDetail | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    data.value = await getOrderDetail(Number(props.id));
  } catch {
    error.value = 'Sorry, an error has occurred.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => props.id, load);

function goToCustomer(id: string) {
  router.push({ name: 'CustomerDetail', params: { id } });
}

function goToSalesperson(id: number) {
  router.push({ name: 'SalespersonDetail', params: { id } });
}
</script>

<template>
  <div class="pageStyle">

    <!-- Breadcrumb -->
    <div class="pageHeader">
      <nav class="flex items-center gap-2 text-sm">
        <button class="text-teal-700 hover:underline font-medium" @click="router.back()">
          ← Back
        </button>
        <span class="text-gray-400">/</span>
        <span class="text-gray-700 font-medium">Order #{{ props.id }}</span>
      </nav>
      <h1>Order Details</h1>
      <span v-if="data" class="text-xs px-2 py-0.5 rounded-full"
        :class="data.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-800'">
        {{ data.status }}
      </span>
    </div>

    <div v-if="loading" class="flex flex-col items-center mt-30  min-h-screen">
      <ArrowPathIcon class="h-12 w-12 animate-spin text-primary mb-4" />
      <p class="text-lg text-gray-600 font-light">Loading ...</p>
    </div>
    <div v-else-if="error" class="text-red-600 text-sm">{{ error }}</div>

    <template v-if="data">

      <!-- Customer + Salesperson info -->
      <div class="row row2 mb-4">
        <div class="card cursor-pointer hover:border-teal-300 transition-colors"
          @click="goToCustomer(data.customer.customerId)">
          <div class="cardTitle">Customer</div>
          <div class="text-sm font-medium text-gray-900">{{ data.customer.customerName }}</div>
          <div class="text-xs text-gray-500 mt-0.5">{{ data.customer.city }}, {{ data.customer.country }}</div>
          <div class="text-xs text-teal-700 mt-2">{{ data.customer.customerId }}</div>
        </div>
        <div class="card cursor-pointer hover:border-teal-300 transition-colors"
          @click="goToSalesperson(data.salesperson.employeeId)">
          <div class="cardTitle">Salesperson</div>
          <div class="text-sm font-medium text-gray-900">{{ data.salesperson.salesPerson }}</div>
          <div class="text-xs text-gray-500 mt-0.5">
            Ordered {{ formatDate(data.orderDate) }}
            <template v-if="data.shippedDate"> · Shipped {{ formatDate(data.shippedDate) }}</template>
          </div>
        </div>
      </div>

      <!-- KPI summary -->
      <div class="kpiGrid mb-4">
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Order total</div>
          <div class="text-xl font-medium text-gray-900">{{ formatUSD(data.summary.orderTotal) }}</div>
        </div>
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Subtotal</div>
          <div class="text-xl font-medium text-gray-900">{{ formatUSD(data.summary.subtotal) }}</div>
        </div>
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Total discount</div>
          <div class="text-xl font-medium text-gray-900">{{ formatUSD(data.summary.totalDiscount) }}</div>
        </div>
        <div class="card">
          <div class="text-xs text-gray-500 mb-1">Items</div>
          <div class="text-xl font-medium text-gray-900">{{ data.summary.itemCount.toLocaleString() }}</div>
        </div>
      </div>

      <!-- Line items table -->
      <div class="card hidden sm:block">
        <div class="cardTitle">Line items</div>
        <table class="line-items-table">
          <thead>
            <tr>
              <th class="text-left">Product</th>
              <th class="text-right">Unit price</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Discount</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.lineItems" :key="item.productId">
              <td class="text-left">{{ item.productName }}</td>
              <td class="text-right">{{ formatUSD(item.unitPrice) }}</td>
              <td class="text-right">{{ item.quantity }}</td>
              <td class="text-right">
                <span v-if="item.discount > 0" class="text-amber-600">
                  {{ (item.discount * 100).toFixed(0) }}%
                </span>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="text-right font-medium">{{ formatUSD(item.lineTotal) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-gray-200">
              <td colspan="4" class="text-right text-xs text-gray-500 pt-2">Subtotal</td>
              <td class="text-right pt-2">{{ formatUSD(data.summary.subtotal) }}</td>
            </tr>
            <tr>
              <td colspan="4" class="text-right text-xs text-gray-500">Discount</td>
              <td class="text-right text-amber-600">− {{ formatUSD(data.summary.totalDiscount) }}</td>
            </tr>
            <tr>
              <td colspan="4" class="text-right text-sm font-medium text-gray-900">Order total</td>
              <td class="text-right text-sm font-medium text-gray-900">{{ formatUSD(data.summary.orderTotal) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Line items grid -->
      <div class="cardGrid sm:hidden">
        <div class="custCard" v-for="item in data.lineItems" :key="item.productId">
          <div class="cardTop">
            <div class="avatar">{{ item.productId }}</div>
            <div>
              <div class="card-company">{{ item.productName }}</div>
            </div>
          </div>
          <div class="cardDetails">
            <div class="cardDetail"><span class="detailLabel">Unit Price</span>{{ formatUSD(item.unitPrice) }}</div>
            <div class="cardDetail"><span class="detailLabel">Qty</span>{{ item.quantity }}</div>
            <div class="cardDetail"><span class="detailLabel">Total</span>{{ formatUSD(data.summary.subtotal) }}</div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.line-items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.line-items-table th {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  padding: 0 8px 8px;
  border-bottom: 0.5px solid #e5e7eb;
}

.line-items-table td {
  padding: 7px 8px;
  border-bottom: 0.5px solid #f3f4f6;
  color: #111827;
}

.line-items-table tbody tr:last-child td {
  border-bottom: none;
}

.line-items-table tfoot td {
  padding: 4px 8px;
  color: #374151;
  font-size: 13px;
}
</style>