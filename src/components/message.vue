<script setup lang="ts">
const props = defineProps<{
  name: string
  timestamp: string
  text: string
}>()
</script>

<template>
  <div class="message-container">
    <img src="@/assets/avatar-svgrepo-com.svg" class="image">
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
    .image {
      height: 50px;
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
