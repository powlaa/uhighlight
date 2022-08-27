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
    <button class="categories-btn" @click="$emit('addCategory')">
      <PlusIcon class="categories-add" />
    </button>
  </div>
</template>

<script setup>
import { watch, ref } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";

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

<style scoped>
#categories-container {
  display: flex;
}
#categories {
  width: 100px;
  background-color: var(--uhighlight-background-color-primary);
  color: var(--uhighlight-text-primary-color);
}
.categories-btn {
  background-color: var(--uhighlight-background-color-primary);
  border: none;
  height: 30px;
  width: 30px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.categories-add {
  color: var(--uhighlight-text-primary-color);
  height: 21px;
  width: 21px;
}
</style>