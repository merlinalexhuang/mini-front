import { createApp } from 'vue'

import 'normalize.css'
import './assets/css/index.less'
// import './style.css'

import App from './App.vue'

import router from './router'

createApp(App).use(router).mount('#app')
