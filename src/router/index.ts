import { createRouter, createWebHistory } from 'vue-router'
import { useStorage } from '@vueuse/core'
import Home from '../views/Home.vue'
import type { QuibleTokens } from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    }
  ]
})
router.beforeEach(
  async (to) => {
    const quibleTokens = useStorage<QuibleTokens>('tokens', {})
    if (
      to.meta.requiresAuth &&
      to.name !== 'Login' &&
      !quibleTokens.value?.access_token
    ) {
      quibleTokens.value = null
      return { name: 'Login' }
    }
  }
)

export default router
