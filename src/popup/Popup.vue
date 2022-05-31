<template>
  <div
    class="category"
    v-for="[category, highlights] in highlightsPerCategory"
    :key="category"
  >
    {{ category }}
    <div class="highlight" v-for="highlight in highlights" :key="highlight">
      {{ highlight.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

let darkMode = ref(false);
let highlightsPerCategory = ref(new Map());

onMounted(() => {
  chrome.storage.local.get(["pages"], (res) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      var url = tabs[0].url;
      let index = res.pages.findIndex((el) => el.url === url);
      if (index >= 0) {
        darkMode.value = res.pages[index].darkMode ?? userPrefersDarkMode();
        res.pages[index].highlights.forEach((highlight) => {
          let categoryValue = highlightsPerCategory.value.get(
            highlight.category
          );
          if (categoryValue) {
            highlightsPerCategory.value.set(highlight.category, [
              ...categoryValue,
              highlight,
            ]);
          } else {
            highlightsPerCategory.value.set(highlight.category, [highlight]);
          }
        });
      } else {
        darkMode.value = userPrefersDarkMode();
      }
    });
  });
});

watch(darkMode, (newDarkModeValue) => {
  newDarkModeValue
    ? (document.documentElement.className = "uhighlight-dark-mode")
    : (document.documentElement.className = "uhighlight-light-mode");
});

function userPrefersDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
</script>

<style>
html {
  --uhighlight-background-color-primary: #e8e5e5;
  --uhighlight-background-color-secondary: #fafafa;
  --uhighlight-accent-color: #cacaca;
  --uhighlight-text-primary-color: #222;
  background-color: var(--uhighlight-background-color-primary);
  color: var(--uhighlight-text-primary-color);
}
html.uhighlight-dark-mode {
  --uhighlight-background-color-primary: #343434;
  --uhighlight-background-color-secondary: #2d2d30;
  --uhighlight-accent-color: #3f3f3f;
  --uhighlight-text-primary-color: #ddd;
}
.category {
  font-size: 1.2em;
  margin-bottom: 10px;
}
.highlight {
  font-size: 0.8em;
  background-color: var(--uhighlight-background-color-secondary);
  padding: 5px;
  margin-top: 5px;
  border-radius: 5px;
}
</style>