<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
import type { QuibleTokens } from './Login.vue'
import { useLoading } from 'vue-loading-overlay'
import * as Ably from 'ably'
import axios from 'axios'
import 'vue-loading-overlay/dist/css/index.css'
import Message from '@/components/message.vue'

type MessageItem = {
  name: string,
  timestamp: string,
  text: string
}

type User = {
  email: string
  full_name: string,
  id: string,
  phone: string,
  username: string
}
// constants
const EventMessage = 'Message'
const ChannelName = 'chat:main'
// reactive state
const realtime = ref<Ably.Types.RealtimePromise>()
const channel = ref<Ably.Types.RealtimeChannelPromise>()
const input = ref('')
const me = ref<User|null>(null)
const messages = ref<MessageItem[]>([])
// composables
const router = useRouter()
const quibleTokens = useStorage<QuibleTokens>('tokens', {})
// Handlers
const getUser = (userId: string) => axios<User>({
  method: 'GET',
  url: `${import.meta.env.VITE_QUIBLE_API}/user/${userId}`,
  headers: {
    Authorization: `Bearer ${quibleTokens.value.access_token}`
  }
})
  .then(({ data }) => data)
  .catch(error => {
    console.error(error)
    return null
  })
const onLogout = () => {
  quibleTokens.value = null
  router.push({ name: 'Login' })
}
const onSend = async () => {
  if (channel.value) {
    await channel.value.publish(EventMessage, input.value)
  }
  input.value = ''
}
const onChatMessage = async (message: Ably.Types.Message) => {
  const user = await getUser(message.clientId)
  if (user) {
    messages.value.push({
      name: user.full_name,
      timestamp: new Date(message.timestamp).toLocaleString(),
      text: message.data
    })
  }
}

onUnmounted(
  async () => {
    await channel.value?.unsubscribe(EventMessage, onChatMessage)
  }
)

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
    await realtime.value.connection.once('connected')
    // channel
    channel.value = realtime.value.channels.get(ChannelName)
    await channel.value.subscribe(EventMessage, onChatMessage)
    // clientId
    me.value = await getUser(realtime.value.auth.clientId)
    // spinner
    loader.hide()
  }
)

</script>

<template>
  <main class="root">
    <nav class="navigation">
      <section class="left">
        <h3>{{ me?.full_name ?? "" }}</h3>
      </section>
      <section class="right">
        <a href="" class="link" @click.prevent="onLogout">Logout</a>
      </section>
    </nav>
    <article class="chat">
      <section class="messages">
        <Message
          v-for="msg,idx in messages"
          :key="idx"
          :name="msg.name"
          :timestamp="msg.timestamp"
          :text="msg.text"
        />
      </section>
      <form class="input">
        <input
          v-model="input"
          type="text"
          placeholder="enter your message here"
        >
        <button type="submit" :disabled="!input.length" @click.prevent="onSend">
          Send
        </button>
      </form>
    </article>
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
  .chat {
    padding: 1em;
    flex: 1 0 0;
    display: flex;
    flex-direction: column;
    .messages {
      flex: 1 0 0;
      padding: 1em;
      overflow-y: scroll;
    }
    .input {
      width: 100%;
      display: flex;
      input {
        flex: 1 0 0;
      }
      button {
        margin-left: 1em;
        flex-basis: 100px;
      }
    }
  }
</style>
