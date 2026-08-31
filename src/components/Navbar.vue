<script setup lang="ts">

import { RouterLink, useRoute } from 'vue-router';
import {
  HomeIcon, ShoppingCartIcon, UsersIcon, CubeIcon,
  ChartPieIcon, Bars3Icon, XMarkIcon, TagIcon, GlobeAltIcon, InformationCircleIcon
} from '@heroicons/vue/24/outline';
import { ref } from 'vue';

const route = useRoute();
const drawerOpen = ref(false);

const links = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Map', to: '/map', icon: GlobeAltIcon },
  { name: 'Orders', to: '/orders', icon: ShoppingCartIcon },
  { name: 'Customers', to: '/customers', icon: UsersIcon },
  { name: 'Products', to: '/products', icon: CubeIcon },
  { name: 'Categories', to: '/categories', icon: TagIcon },
  { name: 'About', to: '/about', icon: InformationCircleIcon },
];

const openDrawer = () => { drawerOpen.value = true; };
const closeDrawer = () => { drawerOpen.value = false; };
</script>

<template>
  <!-- Navbar -->
  <nav class="sticky top-0 z-100 flex items-center h-14 px-6 gap-0 bg-brand">

    <!-- Brand -->
    <div class="flex items-center gap-2 mr-8 text-white text-[15px] font-medium whitespace-nowrap">
      <ChartPieIcon class="w-5 h-5 text-teal-300" aria-hidden="true" />
      <span>Reports</span>
    </div>

    <!-- Desktop links -->
    <div class="hidden sm:flex gap-1 flex-1">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] text-white/70 no-underline whitespace-nowrap transition-colors duration-150 hover:bg-white/10 hover:text-white"
        :class="{ 'bg-white/15 text-white!': route.path === link.to }">
        <component :is="link.icon" class="w-4 h-4 shrink-0" aria-hidden="true" />
        {{ link.name }}
      </RouterLink>
    </div>

    <!-- Avatar + hamburger -->
    <div class="flex items-center gap-2 ml-auto">
      <div
        class="w-7.5 h-7.5 rounded-full bg-white/20 flex items-center justify-center text-[12px] text-white font-medium shrink-0">
        JD
      </div>
      <button class="sm:hidden flex items-center p-1 bg-transparent border-none text-white cursor-pointer"
        @click="openDrawer" aria-label="Open menu">
        <Bars3Icon class="w-5 h-5" />
      </button>
    </div>
  </nav>

  <!-- Backdrop -->
  <Transition name="fade">
    <div v-if="drawerOpen" class="fixed inset-0 z-200 bg-black/40 sm:hidden" @click="closeDrawer" />
  </Transition>

  <!-- Slide-in drawer -->
  <Transition name="drawer">
    <div v-if="drawerOpen"
      class="fixed top-0 left-0 z-300 h-full w-64 bg-brand flex flex-col pt-4 pb-6 sm:hidden shadow-xl">
      <!-- Drawer header -->
      <div class="flex items-center justify-between px-4 mb-4 shrink-0">
        <div class="flex items-center gap-2 
          text-white text-[15px] font-medium">
          <ChartPieIcon class="w-5 h-5 text-teal-300" aria-hidden="true" />
          <span>Reports</span>
        </div>
        <button class="flex items-center p-1 bg-transparent border-none text-white/70 hover:text-white cursor-pointer"
          @click="closeDrawer" aria-label="Close menu">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Drawer links -->
      <nav class="flex flex-col gap-1 px-3 min-h-0 overflow-y-auto">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] text-white/80 no-underline transition-colors duration-150 hover:bg-white/15 hover:text-white"
          :class="{ 'bg-white/15 text-white!': route.path === link.to }" @click="closeDrawer">
          <component :is="link.icon" class="w-4 h-4 shrink-0" aria-hidden="true" />
          {{ link.name }}
        </RouterLink>
      </nav>
    </div>
  </Transition>
</template>

<style scoped>
/* Drawer slide-in from left */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}

/* Backdrop fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>