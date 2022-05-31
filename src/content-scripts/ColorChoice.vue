<template>
  <div id="colors">
    <button
      v-for="(color, index) in colors"
      :key="color"
      :class="{
        'color-btn': true,
        'selected-color': select && index === selectedIndex,
      }"
      :id="`color${index}`"
      :style="{ backgroundColor: color }"
      @click="colorClicked(index)"
    ></button>
  </div>
</template>


<script setup>
import { ref } from "vue";

const props = defineProps(["colors", "select"]);
const emit = defineEmits(["colorClicked"]);

let selectedIndex = ref(0);

function colorClicked(colorIndex) {
  if (props.select) selectedIndex.value = colorIndex;
  emit("colorClicked", colorIndex);
}
</script>

<style scoped>
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
.selected-color {
  border: 1px solid black !important;
}
</style>