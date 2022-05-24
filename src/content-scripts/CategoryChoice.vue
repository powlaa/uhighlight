<template>
  <div id="categories-container">
    <select
      v-model="selectedCategory"
      @change="updateModelValue"
      name="categories"
      id="categories"
    >
      <option v-for="category in categories" :key="category">
        {{ category }}
      </option>
    </select>
    <button id="categories-add" @click="$emit('addCategory')">+</button>
  </div>
</template>

<script setup>
import { watch, ref } from "vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps(["categories"]);

const selectedCategory = ref(null);

const updateModelValue = (event) => {
  emit("update:modelValue", event.target.value);
};

watch(
  () => props.categories,
  (newCategories) => {
    if (newCategories.length > 0) {
      selectedCategory.value = newCategories[0];
      emit("update:modelValue", newCategories[0]);
    }
  }
);
</script>

<style>
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