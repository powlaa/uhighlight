<template>
  <div id="floating-menu" v-if="visible">
    <h3>Highlights</h3>
    <div id="categories">
      <div v-for="category in categories" :key="category">
        <input
          :id="category"
          type="checkbox"
          :name="category"
          checked
          @change="categoryClicked"
        />
        <label :for="category">{{ category }}</label>
      </div>
    </div>
    <div class="focus-container">
      <label class="switch">
        <input type="checkbox" id="focus-mode" />
        <span class="slider round"></span>
      </label>
      <ColorChoice
        :colors="colors"
        @colorClicked="(index) => $emit('chooseColor', index)"
        :select="true"
      >
      </ColorChoice>
    </div>
  </div>
</template>


<script setup>
import { watch } from "vue";
import ColorChoice from "./ColorChoice.vue";

const props = defineProps(["colors", "categories"]);
const emit = defineEmits(["updateActiveCategories"]);
let activeCategories = [];
let visible = false;

watch(
  () => props.categories,
  (newCategories) => {
    if (newCategories.length > 0) {
      activeCategories = newCategories;
      visible = true;
    } else {
      visible = false;
    }
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

<style>
label,
h3 {
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  -khtml-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}
#floating-menu {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  min-width: 100px !important;
  background-color: white !important;
  color: black !important;
  font-size: 1em !important;
  padding: 10px !important;
  border-radius: 10px !important;
  box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.2);
  z-index: 9999;
}
h3 {
  margin: 3px 0 !important;
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
</style>