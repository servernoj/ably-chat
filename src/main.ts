import './assets/main.css'
import { registerWKWebViewJavascriptBridge } from '@/bridge'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

// register iOS bridge
const isWebView = registerWKWebViewJavascriptBridge(window)

const app = createApp(App)
app.use(router)
app.provide('isWebView', isWebView)
app.mount('#app')
