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
import { ref, onMounted } from "vue";

const props = defineProps(["colors", "select", "darkMode"]);
const emit = defineEmits(["colorClicked"]);

const selectedIndex = ref(0);

onMounted(() => {
  window.addEventListener("keypress", (e) => {
    switch (true) {
      case e.key === "1" || e.key === "Numpad1":
        colorClicked(0);
        break;
      case e.key === "2" || e.key === "Numpad2":
        colorClicked(1);
        break;
      case e.key === "3" || e.key === "Numpad3":
        colorClicked(2);
        break;
      case e.key === "4" || e.key === "Numpad4":
        colorClicked(3);
        break;
      default:
        break;
    }
  });
});

function colorClicked(colorIndex) {
  if (props.select) selectedIndex.value = colorIndex;
  emit("colorClicked", colorIndex);
}
</script>

<style scoped>
#uhighlight-colors {
  align-items: center !important;
  justify-content: space-around !important;
  display: flex !important;
  padding-bottom: 5px !important;
}
.uhighlight-color-btn {
  border-radius: 10px !important;
  border: none !important;
  width: 20px !important;
  height: 20px !important;
  padding: 0 !important;
}
.uhighlighit-selected-color {
  border: 1px solid black !important;
}
</style>