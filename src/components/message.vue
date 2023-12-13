<script setup lang="ts">
const props = defineProps<{
  userId: string
  name: string
  timestamp: string
  text: string
  image: string | null
}>()
</script>

<template>
  <div class="message-container">
    <img
      v-if="props.image"
      :src="props.image"
      class="image"
      :data-timestamp="props.timestamp"
    >
    <img v-else src="@/assets/avatar-svgrepo-com.svg" class="image">
    <article class="content">
      <section class="header">
        <h3 class="name">
          {{ props.name }}
        </h3>
        <span class="timestamp">{{ props.timestamp }}</span>
      </section>
      <p class="text">
        {{ props.text }}
      </p>
    </article>
  </div>
</template>

<style lang="scss" scoped>
  .message-container {
    width: 100%;
    padding: 0.5em;
    display: flex;
    align-items: flex-start;
    &:hover {
      background-color: rgba(0,0,0,0.1)
    }
    &.my-message {
      .content > .header > .name {
        font-weight: bold;
      }
    }
    .image {
      width: 50px;
    }
    .content {
      margin-left: 1em;
      display: flex;
      flex-direction: column;
      display: flex;
      align-items: flex-start;
      .header {
        display: flex;
        align-items: center;
        .name {
          margin: 0
        }
        .timestamp {
          margin-left: 1em;
          color: grey;
        }
      }
      .text {
        margin-top: 0.5em;
      }
    }
  }
</style>
