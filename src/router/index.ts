import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { getToken } from '@/bridge'

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
    const accessToken = await getToken()
    alert(accessToken)
    if (
      to.meta.requiresAuth &&
        to.name !== 'Login' &&
        !accessToken
    ) {
      return { name: 'Login' }
    }
  }
)

export default router
