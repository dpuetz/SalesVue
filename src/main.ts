import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import fadeIn from './directives/fadeIn';

import App from './App.vue';
import router from './router';

const app = createApp(App);
app.directive('fade-in', fadeIn);
app.use(createPinia());
app.use(router);

app.mount('#app');
