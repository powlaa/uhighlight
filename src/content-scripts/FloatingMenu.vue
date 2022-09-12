<template>
  <div :class="{ hidden: hidden, 'floating-menu': true }" v-show="visible">
    <div class="toggle-icon" @click="hidden = !hidden">
      <ChevronRightIcon v-show="!hidden" />
      <ChevronLeftIcon v-show="hidden" />
    </div>
    <div v-show="!hidden">
      <div class="dark-mode-icon" @click="$emit('darkModeChanged', !darkMode)">
        <SunIcon v-show="darkMode" />
        <MoonIcon v-show="!darkMode" />
      </div>

      <h3 class="no-highlight highlights-heading">Highlights</h3>
      <div id="categories">
        <div v-for="id in usedCategories" :key="id">
          <input
            :id="id"
            type="checkbox"
            :name="categories[id]"
            checked
            @change="categoryClicked"
          />
          <label class="no-highlight" :for="id">{{ categories[id] }}</label>
        </div>
      </div>
      <div class="focus-container">
        <label class="switch no-highlight">
          <input
            type="checkbox"
            id="focus-mode"
            v-model="focus"
            @change="$emit('update:focus', focus)"
          />
          <span class="slider round"></span>
        </label>
        <div v-show="focus" class="focus-options">
          <ColorChoice
            :colors="colors"
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
.floating-menu {
  background-color: var(--uhighlight-background-color-primary) !important;
  color: var(--uhighlight-text-primary-color) !important;
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  font-size: 1em !important;
  padding: 10px !important;
  border-radius: var(--uhighlight-border-radius) !important;
  box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  transition: border-radius 0.2s, right 0.2s;
  transition-timing-function: ease-in;
}
.hidden.floating-menu {
  right: 0px !important;
  width: 20px !important;
  height: 60px !important;
  border-radius: 10px 0 0 10px !important;
}
.dark-mode-icon {
  position: absolute;
  height: 20px !important;
  width: 20px !important;
  top: 5px !important;
  right: 5px !important;
}
.toggle-icon {
  position: absolute;
  height: 20px !important;
  width: 20px !important;
  top: 0 !important;
  bottom: 0 !important;
  margin-top: auto;
  margin-bottom: auto;
  right: 0 !important;
}
.highlights-heading {
  margin: 0px 20px 3px 0 !important;
}
.focus-container {
  display: inline-block;
  margin-top: 10px;
  width: 100% !important;
}
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #2196f3;
}
input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}
input:checked + .slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}
.focus-options {
  padding-top: 5px;
}
</style>