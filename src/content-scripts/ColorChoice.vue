<template>
  <div id="uhighlight-colors">
    <button
      v-for="(color, index) in colors"
      :key="darkMode ? color.dark : color.light"
      :class="{
        'uhighlight-color-btn': true,
        'uhighlighit-selected-color': select && index === selectedIndex,
      }"
      :id="`color${index}`"
      :style="{ backgroundColor: darkMode ? color.dark : color.light }"
      :title="color.label"
      @click="colorClicked(index)"
    ></button>
  </div>
</template>


<script setup>
import { ref } from "vue";

const props = defineProps(["colors", "select", "darkMode"]);
const emit = defineEmits(["colorClicked"]);

let selectedIndex = ref(0);

function colorClicked(colorIndex) {
  if (props.select) selectedIndex.value = colorIndex;
  emit("colorClicked", colorIndex);
}
</script>

<style scoped>
#uhighlight-colors {
  align-items: center;
  justify-content: space-around;
  display: flex;
  padding-bottom: 5px;
}
.uhighlight-color-btn {
  border-radius: 10px;
  border: none;
  width: 20px;
  height: 20px;
}
.uhighlighit-selected-color {
  border: 1px solid black !important;
}
</style>