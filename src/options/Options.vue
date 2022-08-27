<template>
  <h1>Uhighlight Settings</h1>
  <div class="categories">
    <h2>Categories</h2>
    <div class="category-item" v-for="category in categories" :key="category">
      {{ category }}
    </div>
    <input
      v-model="newCategoryName"
      type="text"
      class="category-input"
      placeholder="New category"
    />
    <button class="category-btn" @click="addNewCategory">Add</button>
  </div>
  <h2>Default colors</h2>
  <h3>Light mode colors</h3>
  <input
    type="color"
    class="color"
    :value="color"
    v-for="(color, index) in lightColors"
    :key="color"
    @change="(evt) => saveLightColors(evt, index)"
  />
  <h3>Dark mode colors</h3>
  <input
    type="color"
    class="color"
    :value="color"
    v-for="(color, index) in darkColors"
    :key="color"
    @change="(evt) => saveDarkColors(evt, index)"
  />
  <h2>Floating Menu</h2>
  <Switch v-model="hideFloatingMenu"
    ><div class="hide-floating">Hide Floating Menu per default</div></Switch
  >
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Switch from "./Switch.vue";
const lightColors = ref([]);
const darkColors = ref([]);
const categories = ref([]);
const hideFloatingMenu = ref(false);
const newCategoryName = ref("");

onMounted(() => {
  setPreferredColorTheme();
  chrome.storage.local.get(
    ["lightColors", "darkColors", "categories", "hideFloatingMenu"],
    (res) => {
      lightColors.value = res.lightColors;
      darkColors.value = res.darkColors;
      categories.value = res.categories;
      hideFloatingMenu.value = res.hideFloatingMenu;
    }
  );
});

watch(hideFloatingMenu, (newValue) => {
  chrome.storage.local.set({
    hideFloatingMenu: newValue,
  });
});
function addNewCategory() {
  if (!categories.value.includes(newCategoryName.value)) {
    categories.value.push(newCategoryName.value);
    chrome.storage.local.set({
      categories: [...categories.value],
    });
  }
}

function setPreferredColorTheme() {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.className = "uhighlight-dark-mode";
}

function saveLightColors(evt, index) {
  lightColors.value[index] = evt.target.value;
  chrome.storage.local.set({
    lightColors: lightColors.value,
  });
}

function saveDarkColors(evt, index) {
  darkColors.value[index] = evt.target.value;
  chrome.storage.local.set({
    darkColors: darkColors.value,
  });
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
}
.category-item {
  font-size: 1em;
  padding: 5px;
}
.category-input {
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
.color {
  display: inline-block;
}
.hide-floating {
  display: inline-block;
  margin-left: 5px;
}
</style>