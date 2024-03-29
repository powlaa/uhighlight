<template>
  <h1>Uhighlight Settings</h1>
  <div class="categories">
    <h2>Manage Categories</h2>
    <div
      class="category-item"
      :id="id"
      v-for="(value, id) in categories"
      :key="id"
    >
      {{ value }}
      <TrashIcon class="category-delete" @click="deleteCategory" />
    </div>
    <input
      v-model="newCategoryName"
      type="text"
      class="input"
      placeholder="New category"
    />
    <button class="category-btn" @click="addNewCategory">Add</button>
  </div>
  <h2>Colors</h2>
  <div class="colors-configuration">
    <div class="colors" v-for="(color, index) in colors" :key="color">
      <div class="color-container">
        <input
          type="color"
          class="color"
          :value="color.light"
          @change="(evt) => store.saveLightColor(index, evt.target.value)"
        />
      </div>
      <div class="color-container">
        <input
          type="color"
          class="color"
          :value="color.dark"
          @change="(evt) => store.saveDarkColor(index, evt.target.value)"
        />
      </div>
      <input
        type="text"
        class="input"
        placeholder="Label"
        @input="(evt) => store.saveColorLabel(index, evt.target.value)"
      />
    </div>
  </div>
  <h2>Floating Menu</h2>
  <Switch v-model="hideFloatingMenu"
    ><div class="hide-floating">Hide Floating Menu per default</div></Switch
  >
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useOptionsStore } from "./store.js";
import { TrashIcon } from "@heroicons/vue/solid";
import Switch from "./Switch.vue";

const store = useOptionsStore();
const { pages, highlights, categories, colors, hideFloatingMenu, getPage } =
  storeToRefs(useOptionsStore());

const newCategoryName = ref("");

onMounted(() => {
  setPreferredColorTheme();
  store.getAllStorageData();
});

watch(hideFloatingMenu, (newValue) => {
  store.updateHideFloatingMenu(newValue);
});
function addNewCategory() {
  store.addCategory(newCategoryName.value);
  newCategoryName.value = "";
}

function deleteCategory(evt) {
  const categoryId = evt.target.parentElement.classList.contains(
    "category-item"
  )
    ? evt.target.parentElement.id
    : evt.target.parentElement.parentElement.id;
  let categoryHighlightCount = 0;
  for (const highlight of Object.values(highlights.value)) {
    if (highlight.category === categoryId) categoryHighlightCount++;
  }

  if (
    window.confirm(
      `Do you really want to delete ${categories.value[categoryId]}? There are ${categoryHighlightCount} highlights in this category that will be deleted as well!`
    )
  ) {
    store.deleteCategory(categoryId);
  }
}

function setPreferredColorTheme() {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.className = "uhighlight-dark-mode";
}
</script>

<style>
:root {
  --uhighlight-background-color-primary: #e8e5e5;
  --uhighlight-background-color-secondary: #fafafa;
  --uhighlight-accent-color: #cacaca;
  --uhighlight-text-primary-color: #222;
  background-color: var(--uhighlight-background-color-primary);
  color: var(--uhighlight-text-primary-color);
}
:root.uhighlight-dark-mode {
  --uhighlight-background-color-primary: #343434;
  --uhighlight-background-color-secondary: #2d2d30;
  --uhighlight-accent-color: #3f3f3f;
  --uhighlight-text-primary-color: #ddd;
}
h2 {
  margin-bottom: 8px !important;
}
input:focus {
  outline: none;
}
.categories {
  padding: 5px;
  width: 230px;
}
.category-item {
  font-size: 1em;
  padding: 5px;
  color: var(--uhighlight-text-primary-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.category-delete {
  height: 21px;
  width: 21px;
}
.input {
  background-color: var(--uhighlight-background-color-primary);
  color: var(--uhighlight-text-primary-color);
  border: 1px solid var(--uhighlight-text-primary-color);
  border-radius: 3px;
  margin-top: 5px;
}
.category-btn {
  background-color: var(--uhighlight-background-color-primary);
  color: var(--uhighlight-text-primary-color);
  border: none;
  border: 1px solid var(--uhighlight-text-primary-color);
  margin-left: 5px;
  height: 19.5px;
  padding: 0 5px;
  border-radius: 3px;
}
.colors-configuration {
  display: flex;
  flex-direction: column;
}
.colors {
  display: flex;
  margin-bottom: 5px;
}
.color-container {
  display: inline-block;
  position: relative;
  overflow: hidden;
  width: 25px;
  height: 25px;
  margin-right: 5px;
  border: solid 2px #ddd;
  border-radius: 40px;
}
.color {
  position: absolute;
  right: -8px;
  top: -8px;
  width: 40px;
  height: 40px;
  border: none;
}
.hide-floating {
  display: inline-block;
  margin-left: 5px;
}
</style>