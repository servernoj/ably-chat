import type { QuibleTokens } from './views/Login.vue'
import { useStorage } from '@vueuse/core'

export const getToken = () => new Promise<string>(
  resolve => {
    // @ts-ignore
    window.WKWebViewJavascriptBridge.callHandler(
      'requestAuthToken',
      {
        tokenType: 'accessToken'
      },
      resolve
    )
  }
)
// function locates (returns `true`) or, if not found, registers new bridge (returns `false`)
export const registerWKWebViewJavascriptBridge = (w: Window): boolean => {
  if ('WKWebViewJavascriptBridge' in window) {
    console.log('WKWebViewJavascriptBridge has been injected externally')
    return true
  } else {
    alert('Emulating WKWebViewJavascriptBridge...')
    Object.assign(w, {
      WKWebViewJavascriptBridge: {
        callHandler: (key: string, params: Object, cb: (s?: string) => {}) => {
          if (key === 'requestAuthToken') {
            const quibleTokens = useStorage<QuibleTokens>('tokens', {})
            cb(quibleTokens.value.access_token)
          }
        }
      }
    })
    return false
  }
}
