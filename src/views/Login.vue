<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useLoading } from 'vue-loading-overlay'

export type QuibleTokens = {
  access_token?: string,
  refresh_token?: string
}
type QuibleCredentials = {
  email: string
  password: string
}
// --
const router = useRouter()
const quibleTokens = useStorage<QuibleTokens>('tokens', {})
const showErrorPanel = ref(false)
const credentials = ref<QuibleCredentials>({
  email: 'abcdz@gmail.com',
  password: 'password'
})
// --
const login = (credentials: QuibleCredentials) => axios.post<QuibleTokens>(
  `${import.meta.env.VITE_QUIBLE_API}/login`,
  credentials
).then(
  ({ data }) => data
)
const submit = async () => {
  showErrorPanel.value = false
  const loader = useLoading({
    backgroundColor: '#888'
  }).show()
  const tokens = await login(credentials.value).catch(
    () => null
  )
  if (tokens) {
    showErrorPanel.value = false
    quibleTokens.value = tokens
    loader.hide()
    router.push({ name: 'Home' })
  } else {
    showErrorPanel.value = true
  }
}
</script>

<template>
  <main class="root">
    <h2>Login</h2>
    <form
      class="login-form"
      @submit.prevent="submit"
    >
      <label class="input-field">
        <span>Email:</span>
        <input v-model="credentials.email" type="text">
      </label>
      <label class="input-field">
        <span>Password:</span>
        <input v-model="credentials.password" type="password">
      </label>
      <section class="controls">
        <button type="submit">
          Submit
        </button>
      </section>
    </form>
    <section class="error-panel">
      <span v-show="showErrorPanel">
        Invalid credentials
      </span>
    </section>
  </main>
</template>

<style scoped lang="scss">
  .root {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .login-form {
    width: 50%;
    max-width: 300px;
    border: 1px solid grey;
    padding: 1em;
    margin-top: 1em;
    .input-field {
      width: 100%;
      display: flex;
      margin: 0.5em 0;
      justify-content: space-between;
      span {
        flex-basis: 100px;
      }
      input {
        flex-grow: 1;
      }
    }
    .controls {
      width: 100%;
      margin-top: 1em;
      display: flex;
      justify-content: flex-end;
    }
  }
  .error-panel {
    height: 5em;
    display: flex;
    justify-content: center;
    align-items: center;
    color: red;
    font-size: 2em;
    font-weight: bold;
  }
</style>
