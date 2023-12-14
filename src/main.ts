import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { isWebView } from './bridge'

// register iOS bridge

const app = createApp(App)
app.use(router)
app.provide('isWebView', isWebView())
app.mount('#app')
