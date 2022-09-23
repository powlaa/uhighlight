<template>
  <div
    :class="{
      'uhighlight-hidden': floatingMenuHidden,
      'uhighlight-floating-menu': true,
    }"
    v-show="visible"
  >
    <div
      class="uhighlight-toggle-icon"
      @click="floatingMenuHidden = !floatingMenuHidden"
    >
      <ChevronRightIcon v-show="!floatingMenuHidden" />
      <ChevronLeftIcon v-show="floatingMenuHidden" />
    </div>
    <div v-show="!floatingMenuHidden">
      <div
        class="uhighlight-dark-mode-icon"
        @click="$emit('darkModeChanged', !darkMode)"
      >
        <SunIcon v-show="darkMode" />
        <MoonIcon v-show="!darkMode" />
      </div>

      <h3 class="no-highlight uhighlight-highlights-heading">Highlights</h3>
      <div id="categories">
        <div v-for="id in usedCategories" :key="id">
          <input
            :id="id"
            class="uhighlight-checkbox"
            type="checkbox"
            :name="categories[id]"
            checked
            @change="categoryClicked"
          />
          <label class="no-highlight uhighlight-checkbox-label" :for="id">{{
            categories[id]
          }}</label>
        </div>
      </div>
      <div class="uhighlight-focus-container">
        <div class="uhighlight-focus-switch">
          <label class="uhighlight-switch no-highlight">
            <input
              type="checkbox"
              id="focus-mode"
              v-model="focus"
              @change="$emit('update:focus', focus)"
            />
            <span class="uhighlight-slider round"></span>
          </label>
          <svg
            id="instant_highlighter_icon"
            data-name="instant highlighter icon"
            xmlns="http://www.w3.org/2000/svg"
            width="18.03"
            height="16.734"
            viewBox="0 0 22.03 20.734"
            style="margin-left: 10px"
          >
            <path
              id="Icon_awesome-highlighter"
              data-name="Icon awesome-highlighter"
              d="M0,19.437l4.046,1.3L5.482,19.3,2.767,16.583ZM5.046,9.718a1.482,1.482,0,0,0-.437,1.543l.528,1.734L3.075,15.058l3.9,3.9,2.06-2.06,1.731.53a1.482,1.482,0,0,0,1.545-.437l1.44-1.686L6.728,8.282,5.046,9.718ZM21.378,3.21,18.819.651a2.223,2.223,0,0,0-3.042-.1L7.716,7.438l6.875,6.875,6.882-8.061a2.223,2.223,0,0,0-.1-3.042Z"
              transform="translate(0 0)"
              :fill="darkMode ? '#ddd' : '#222'"
            />
          </svg>
        </div>

        <div v-show="focus" class="uhighlight-focus-options">
          <ColorChoice
            :colors="colors"
            :darkMode="darkMode"
            :select="true"
            @colorClicked="(index) => $emit('chooseColor', index)"
          >
          </ColorChoice>
          <CategoryChoice
            v-model="selectedCategory"
            :categories="categories"
          ></CategoryChoice>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { watch, ref } from "vue";
import {
  SunIcon,
  MoonIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/vue/solid";
import ColorChoice from "./ColorChoice.vue";
import CategoryChoice from "./CategoryChoice.vue";

const props = defineProps([
  "colors",
  "categories",
  "usedCategories",
  "darkMode",
  "hidden",
]);
const emit = defineEmits([
  "updateActiveCategories",
  "update:focus",
  "updateSelectedCategory",
]);

const selectedCategory = ref(null);
const focus = ref(false);
const floatingMenuHidden = ref(props.hidden);
let activeCategories = [];
let visible = false;

watch(
  () => props.usedCategories,
  (newCategories) => {
    if (newCategories.length > 0) {
      activeCategories = newCategories;
      visible = true;
    } else {
      visible = false;
    }
  }
);

watch(
  () => selectedCategory.value,
  (newSelectedCategory) => {
    emit("updateSelectedCategory", newSelectedCategory);
  }
);

function categoryClicked(evt) {
  if (evt.target.checked) {
    activeCategories.push(evt.target.id);
  } else {
    activeCategories = activeCategories.filter((el) => el !== evt.target.id);
  }
  emit("updateActiveCategories", activeCategories);
}
</script>

<style scoped>
.no-highlight {
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  -khtml-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}
.uhighlight-floating-menu,
.uhighlight-highlights-heading,
.uhighlight-focus-container,
.uhighlight-focus-options,
.uhighlight-checkbox-label {
  background-color: var(--uhighlight-background-color-primary) !important;
  color: var(--uhighlight-text-primary-color) !important;
  font-family: var(--uhighlight-font-family) !important;
  text-transform: none !important;
}
.uhighlight-floating-menu {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  padding: 10px !important;
  border-radius: var(--uhighlight-border-radius) !important;
  box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.2) !important;
  z-index: 2147483647 !important;
  transition: border-radius 0.2s, right 0.2s !important;
  transition-timing-function: ease-in !important;
  font-size: 16px !important;
  font-weight: normal !important;
}
.uhighlight-hidden.uhighlight-floating-menu {
  right: 0px !important;
  width: 20px !important;
  height: 60px !important;
  padding: 0px !important;
  border-radius: 10px 0 0 10px !important;
  pointer-events: auto !important;
}
.uhighlight-dark-mode-icon {
  position: absolute !important;
  height: 20px !important;
  width: 20px !important;
  top: 5px !important;
  right: 5px !important;
}
.uhighlight-toggle-icon {
  position: absolute !important;
  height: 20px !important;
  width: 20px !important;
  top: 0 !important;
  bottom: 0 !important;
  margin-top: auto !important;
  margin-bottom: auto !important;
  right: 0 !important;
}
.uhighlight-highlights-heading {
  margin: 0px 20px 3px 0 !important;
  font-size: 24px !important;
  font-weight: bold !important;
}
.uhighlight-focus-container {
  display: inline-block !important;
  margin-top: 10px !important;
  width: 100% !important;
}
.uhighlight-focus-switch {
  display: flex !important;
}
.uhighlight-checkbox {
  accent-color: var(--uhighlight-accent-color-secondary) !important;
}
.uhighlight-checkbox-label {
  margin: 0 0 0 10px !important;
  font-weight: normal !important;
}
.uhighlight-switch {
  position: relative !important;
  display: inline-block !important;
  width: 40px !important;
  height: 20px !important;
}
.uhighlight-switch input {
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
}
.uhighlight-slider {
  position: absolute !important;
  cursor: pointer !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: #ccc !important;
  -webkit-transition: 0.4s !important;
  transition: 0.4s !important;
  border-radius: 34px !important;
}
.uhighlight-slider:before {
  position: absolute !important;
  content: "" !important;
  height: 16px !important;
  width: 16px !important;
  left: 2px !important;
  bottom: 2px !important;
  background-color: white !important;
  -webkit-transition: 0.4s !important;
  transition: 0.4s !important;
  border-radius: 50% !important;
}
input:checked + .uhighlight-slider {
  background-color: var(--uhighlight-accent-color-secondary) !important;
}
input:focus + .uhighlight-slider {
  box-shadow: 0 0 1px var(--uhighlight-accent-color-secondary) !important;
}
input:checked + .uhighlight-slider:before {
  -webkit-transform: translateX(20px) !important;
  -ms-transform: translateX(20px) !important;
  transform: translateX(20px) !important;
}
.uhighlight-focus-options {
  padding-top: 5px !important;
}
</style>