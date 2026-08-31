import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOrderFiltersStore = defineStore('orderFilters', () => {
  const customerId = ref('');
  const employeeId = ref<number | null>(null);
  const shipCountry = ref('');
  const orderDateRange = ref<string[] | null>(null);
  const shippedDateRange = ref<string[] | null>(null);

  function save(filters: {
    customerId: string;
    employeeId: number | null;
    shipCountry: string;
    orderDateRange: string[] | null;
    shippedDateRange: string[] | null;
  }) {
    customerId.value = filters.customerId;
    employeeId.value = filters.employeeId;
    shipCountry.value = filters.shipCountry;
    orderDateRange.value = filters.orderDateRange;
    shippedDateRange.value = filters.shippedDateRange;
  }

  function clear() {
    customerId.value = '';
    employeeId.value = null;
    shipCountry.value = '';
    orderDateRange.value = null;
    shippedDateRange.value = null;
  }

  return { customerId, employeeId, shipCountry, orderDateRange, shippedDateRange, save, clear };
});
