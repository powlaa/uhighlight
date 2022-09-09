<template>
  <div v-for="[category, highlights] in highlightsPerCategory" :key="category">
    <AccordionCollapse>
      <template v-slot:title>
        <span>{{ category }}</span>
      </template>
      <template v-slot:content>
        <div
          class="highlight-container"
          v-for="highlight in highlights"
          :key="highlight"
        >
          <div class="highlight">
            {{ highlight.text }}
          </div>
          <div class="notes" v-html="highlight.notes"></div>
        </div>
      </template>
    </AccordionCollapse>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import AccordionCollapse from "./AccordionCollapse.vue";

const darkMode = ref(false);
const highlightsPerCategory = ref(new Map());

onMounted(() => {
  chrome.storage.local.get(["pages", "highlights"], (res) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      var url = tabs[0].url;
      const index = res.pages.findIndex((el) => el.url === url);
      if (index >= 0) {
        darkMode.value = res.pages[index].darkMode ?? userPrefersDarkMode();
        res.pages[index].highlights.forEach((highlightId) => {
          const categoryValue = highlightsPerCategory.value.get(
            res.highlights[highlightId].category
          );
          if (categoryValue) {
            highlightsPerCategory.value.set(
              res.highlights[highlightId].category,
              [...categoryValue, res.highlights[highlightId]]
            );
          } else {
            highlightsPerCategory.value.set(
              res.highlights[highlightId].category,
              [res.highlights[highlightId]]
            );
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
.highlight-container {
  margin-top: 10px;
  font-weight: normal;
}
.highlight,
.notes {
  padding: 5px;
  border-radius: 5px;
  background-color: var(--uhighlight-background-color-secondary);
  margin-top: 5px;
  font-size: 1em;
}
.notes {
  margin-left: 20px;
}

/* tip tap styling */
.notes p,
.notes ul,
.notes ol {
  margin-bottom: 8px !important;
  margin-top: 4px !important;
}
.notes li > p {
  margin-top: 8px !important;
}
.notes p:empty:before {
  content: " ";
  white-space: pre;
}
</style>