<template>
  <div id="highlighterPopup" ref="highlighterPopup">
    <ColorChoice
      :colors="colors"
      @colorClicked="(index) => $emit('addHighlight', index, selectedCategory)"
    >
    </ColorChoice>
    <div id="categories-container">
      <select v-model="selectedCategory" name="categories" id="categories">
        <option v-for="category in categories" :key="category">
          {{ category }}
        </option>
      </select>
      <button id="categories-add">+</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import ColorChoice from "./ColorChoice.vue";

const props = defineProps(["colors", "categories", "position"]);

const selectedCategory = ref(null);
const highlighterPopup = ref(null);

watch(
  () => props.position,
  (newPosition) => {
    highlighterPopup.value.style.top = newPosition.top + "px" ?? "0px";
    highlighterPopup.value.style.left = newPosition.left + "px" ?? "0px";
    highlighterPopup.value.style.display = newPosition.display ?? "none";
  }
);

watch(
  () => props.categories,
  (newCategories) => {
    if (newCategories.length > 0) selectedCategory.value = newCategories[0];
  }
);
onMounted(() => {});
</script>

<style>
#highlighterPopup {
  background-color: #e8e5e5;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  justify-content: center;
  padding: 5px 10px;
  position: fixed;
  z-index: 9999;
  display: none;
}
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
#categories-container {
  display: inline-block;
}
#categories {
  width: 100px;
}
#categories-add {
  border-radius: 5px;
  border: none;
  background-color: white;
  font-size: 1em;
}
</style>