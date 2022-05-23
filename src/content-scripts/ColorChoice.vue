<template>
  <div id="colors">
    <button
      v-for="(color, index) in colors"
      :key="color"
      class="color-btn"
      :id="`color${index}`"
      :style="{ backgroundColor: color }"
      @click="$emit('colorClicked', index)"
    ></button>
  </div>
</template>


<script setup>
const props = defineProps(["colors"]);
</script>

<style>
#colors {
  align-items: center;
  justify-content: space-around;
  display: flex;
  padding-bottom: 5px;
}
.color-btn {
  border-radius: 10px;
  border: none;
  width: 20px;
  height: 20px;
}
</style>