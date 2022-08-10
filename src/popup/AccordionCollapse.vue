<template>
  <div>
    <div @click="isOpen = !isOpen" class="title">
      <slot name="title" />
      <svg
        class="icon"
        :style="{
          transform: isOpen ? 'rotate(0.5turn)' : 'rotate(0turn)',
        }"
        fill="none"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 10"
      >
        <path
          d="M15 1.2l-7 7-7-7"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div v-show="isOpen" style="margin-bottom: 20px">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);
</script>
<style scoped>
.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2em;
  margin-bottom: 10px;
  font-weight: bold;
}
.icon {
  transition-property: all;
  transition-duration: 200ms;
  width: 0.75rem;
}
</style>
