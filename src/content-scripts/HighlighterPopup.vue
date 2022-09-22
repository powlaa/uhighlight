<template>
  <div id="highlighterPopup" ref="highlighterPopup">
    <ColorChoice
      :colors="colors"
      @colorClicked="(index) => $emit('addHighlight', index, selectedCategory)"
    >
    </ColorChoice>
    <CategoryChoice
      :categories="categories"
      v-model="selectedCategory"
      @addCategory="$emit('addCategory')"
    ></CategoryChoice>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ColorChoice from "./ColorChoice.vue";
import CategoryChoice from "./CategoryChoice.vue";

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
</script>

<style scoped>
#highlighterPopup {
  background-color: var(--uhighlight-background-color-primary);
  border-radius: 5px;
  border: none;
  cursor: pointer;
  justify-content: center;
  padding: 5px 10px;
  position: fixed;
  z-index: 2147483647 !important;
  display: none;
}
</style>