import type { QuibleTokens } from './views/Login.vue'
import { useStorage } from '@vueuse/core'

export const isWebView = () => {
  return /quible.web/i.test(navigator.userAgent)
}

export const getToken = () => {
  if (isWebView()) {
    return new Promise<string>(
      resolve => {
        setupWKWebViewJavascriptBridge(
          (bridge: any) => {
            bridge.callHandler(
              'requestAuthToken',
              { tokenType: 'accessToken' },
              resolve
            )
          }
        )
      }
    )
  } else {
    const quibleTokens = useStorage<QuibleTokens>('tokens', {})
    return Promise.resolve(quibleTokens.value.access_token)
  }
}

const setupWKWebViewJavascriptBridge = (cb: (bridge: any) => void) => {
  if (window.WKWebViewJavascriptBridge) {
    return cb(window.WKWebViewJavascriptBridge)
  }
  if (window.WKWVJBCallbacks) {
    return window.WKWVJBCallbacks.push(cb)
  }
  window.WKWVJBCallbacks = [
    cb
  ]
  window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null)
}
