<template>
  <h1>Uhighlight Settings</h1>
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
let lightColors = ref([]);
let darkColors = ref([]);
let hideFloatingMenu = ref(false);

onMounted(() => {
  setPreferredColorTheme();
  chrome.storage.local.get(
    ["lightColors", "darkColors", "hideFloatingMenu"],
    (res) => {
      lightColors.value = res.lightColors;
      darkColors.value = res.darkColors;
      hideFloatingMenu.value = res.hideFloatingMenu;
    }
  );
});

watch(hideFloatingMenu, (newValue) => {
  chrome.storage.local.set({
    hideFloatingMenu: newValue,
  });
});

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
.color {
  display: inline-block;
}
.hide-floating {
  display: inline-block;
  margin-left: 5px;
}
</style>