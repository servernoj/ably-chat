<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import type { QuibleTokens } from './Login.vue'
import { useLoading } from 'vue-loading-overlay'
import * as Ably from 'ably'
import axios from 'axios'
import 'vue-loading-overlay/dist/css/index.css'
import Message from '@/components/message.vue'

// types
type MessageItem = {
  userId: string
  name: string
  timestamp: number
  text: string
  image: string | null
}
type User = {
  email: string
  full_name: string
  id: string
  phone: string
  username: string
  image: string | null
}
type UserIdCache = Partial<{
  [id: string]: User | null
}>
// constants
const EventMessage = 'Message'
const ChannelName = 'chat:main'
// reactive state
const realtime = ref<Ably.Types.RealtimePromise>()
const channel = ref<Ably.Types.RealtimeChannelPromise>()
const input = ref('')
const me = ref<User|null>(null)
const messages = ref<MessageItem[]>([])
const userIdCache: UserIdCache = {}
const messageConatiner = ref<HTMLElement|null>(null)
// composables
const router = useRouter()
const quibleTokens = useStorage<QuibleTokens>('tokens', {})
// handlers
const getUser = (userId: string): Promise<User | null> => {
  if (userId in userIdCache) {
    console.log(userId, 'hit')
    return Promise.resolve(userIdCache[userId] ?? null)
  }
  console.log(userId, 'miss')
  return axios<User>({
    method: 'GET',
    url: `${import.meta.env.VITE_QUIBLE_API}/user/${userId}/profile`,
    headers: {
      Authorization: `Bearer ${quibleTokens.value.access_token}`
    }
  })
    .then(({ data }) => {
      userIdCache[userId] = data
      return data
    })
    .catch(error => {
      console.error(error)
      userIdCache[userId] = null
      return null
    })
}
const isTokenGood = async (token: string): Promise<boolean> => {
  return axios<User>({
    method: 'GET',
    url: `${import.meta.env.VITE_QUIBLE_API}/user`,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(({ data }) => Boolean(data?.id))
    .catch(() => false)
}
const onLogout = () => {
  quibleTokens.value = null
  router.push({ name: 'Login' })
}
const onSend = async () => {
  await channel.value?.publish(EventMessage, input.value)
  input.value = ''
}
const onChatMessage = async (message: Ably.Types.Message) => {
  const user = await getUser(message.clientId)
  if (user) {
    messages.value.push({
      userId: user.id,
      name: user.full_name,
      image: user.image,
      timestamp: message.timestamp,
      text: message.data
    })
    nextTick(() => {
      const el = messageConatiner.value
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    })
  }
}
// lifecycle handlers
onUnmounted(
  async () => {
    await channel.value?.unsubscribe(EventMessage, onChatMessage)
    await channel.value?.detach()
    realtime.value?.channels.release(ChannelName)
  }
)
onMounted(
  async () => {
    const loader = useLoading({
      backgroundColor: '#888'
    }).show()
    // test the stored access_token
    if (
      !quibleTokens.value?.access_token ||
      !(await isTokenGood(quibleTokens.value.access_token))
    ) {
      loader.hide()
      quibleTokens.value = null
      router.push({ name: 'Login' })
      return
    }
    // initialize the realtime engine (ably)
    realtime.value = new Ably.Realtime.Promise({
      authMethod: 'GET',
      authHeaders: {
        Authorization: `Bearer ${quibleTokens.value.access_token}`
      },
      authUrl: `${import.meta.env.VITE_QUIBLE_API}/rt/token`
    })
    await realtime.value.connection.once('connected')
    // clientId
    me.value = await getUser(realtime.value.auth.clientId)
    // channel
    channel.value = await realtime.value.channels.get(ChannelName)
    await channel.value.attach()
    const oldMessages = await channel.value.history({ untilAttach: true })
    messages.value = await oldMessages.items.reverse().reduce(
      async (acc, message) => {
        const racc = await acc
        const user = await getUser(message.clientId).catch(() => null)
        if (user) {
          racc.push({
            userId: user.id,
            name: user.full_name,
            image: user.image,
            timestamp: message.timestamp,
            text: message.data
          })
        }
        return racc
      },
      Promise.resolve([] as MessageItem[])
    )
    nextTick(() => {
      const el = messageConatiner.value
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    })
    await channel.value.subscribe(EventMessage, onChatMessage)
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
      <section id="mc" ref="messageConatiner" class="messages">
        <template v-for="msg,idx in messages" :key="idx">
          <Message
            :user-id="msg.userId"
            :image="msg.image"
            :name="msg.name"
            :timestamp="new Date(msg.timestamp).toLocaleString()"
            :text="msg.text"
            :class="{'my-message': msg.userId === me?.id}"
          />
        </template>
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
