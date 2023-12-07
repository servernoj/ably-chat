<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import type { QuibleTokens } from './Login.vue'
import { useLoading } from 'vue-loading-overlay'
import * as Ably from 'ably'
import 'vue-loading-overlay/dist/css/index.css'

const router = useRouter()
const quibleTokens = useStorage<QuibleTokens>('tokens', {})
const realtime = ref<Ably.Types.RealtimePromise>()
const clientId = ref('')
const logout = () => {
  quibleTokens.value = null
  router.push({ name: 'Login' })
}

onMounted(
  async () => {
    const loader = useLoading({
      backgroundColor: '#888'
    }).show()
    realtime.value = new Ably.Realtime.Promise({
      authMethod: 'GET',
      authHeaders: {
        Authorization: `Bearer ${quibleTokens.value.access_token}`
      },
      authUrl: `${import.meta.env.VITE_QUIBLE_API}/rt/token`
    })
    await realtime.value.auth.authorize()
    loader.hide()
    clientId.value = realtime.value.auth.clientId
  }
)

</script>

<template>
  <main class="root">
    <nav class="navigation">
      <section class="left">
        <h3>{{ clientId }}</h3>
      </section>
      <section class="right">
        <a href="" class="link" @click.prevent="logout">Logout</a>
      </section>
    </nav>
    <article class="content" />
  </main>
</template>

<style scoped lang="scss">
  .root {
    display: flex;
    flex-direction: column;
  }
  .navigation {
    padding: 0.5em;
    flex-basis: 3em;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid grey;
    .right,.left {
      display: flex;
      align-items: center;
    }
    .link {
      text-decoration: none;
      color: blue;
    }
  }
  .content {
    flex: 1 0 0;
  }
</style>
