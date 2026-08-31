import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/orders', name: 'orders', component: () => import('@/views/OrdersView.vue') },
    { path: '/customers', name: 'customers', component: () => import('@/views/CustomersView.vue') },
    { path: '/products', name: 'products', component: () => import('@/views/ProductsView.vue') },
    { path: '/map', name: 'map', component: () => import('@/views/MapView.vue') },
    { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/CategoryView.vue'),
    },
    {
      path: '/salesperson/:id',
      name: 'SalespersonDetail',
      component: () => import('@/views/SalespersonDetailView.vue'),
      props: true,
    },
    {
      path: '/customer/:id',
      name: 'CustomerDetail',
      component: () => import('@/views/CustomerDetailView.vue'),
      props: true,
    },
    {
      path: '/order/:id',
      name: 'OrderDetail',
      component: () => import('@/views/OrderDetailView.vue'),
      props: true,
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('@/views/PortfolioPage.vue'),
      props: { currentApp: 'sales' },
    },
  ],
});

export default router;
