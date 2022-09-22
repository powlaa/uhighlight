<template>
  <div id="uhighlight-categories-container">
    <select
      v-model="selectedCategory"
      @change="updateModelValue"
      name="categories"
      id="uhighlight-categories"
    >
      <option v-for="(value, id) in categories" :value="id" :key="id">
        {{ value }}
      </option>
    </select>
    <button class="uhighlight-categories-btn" @click="$emit('addCategory')">
      <PlusIcon class="uhighlight-categories-add" />
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
    if (Object.keys(newCategories).length > 0) {
      selectedCategory.value = Object.keys(newCategories)[0];
      emit("update:modelValue", Object.keys(newCategories)[0]);
    }
  }
);
</script>

<style scoped>
*:focus {
  outline: none;
}
#uhighlight-categories-container {
  display: flex !important;
}
#uhighlight-categories {
  width: 100px !important;
  background-color: var(--uhighlight-background-color-primary) !important;
  color: var(--uhighlight-text-primary-color) !important;
  border-radius: 5px !important;
  font-family: var(--uhighlight-font-family) !important;
  font-size: 16px !important;
}
.uhighlight-categories-btn {
  background-color: var(--uhighlight-background-color-primary) !important;
  border: none !important;
  height: 30px !important;
  width: 30px !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}
.uhighlight-categories-add {
  color: var(--uhighlight-text-primary-color) !important;
  height: 21px !important;
  width: 21px !important;
}
</style>