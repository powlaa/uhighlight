<template>
  <h1>Uhighlight Settings</h1>
  <h2>Change default colors</h2>
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
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
let lightColors = ref([]);
let darkColors = ref([]);

onMounted(() => {
  chrome.storage.local.get(["lightColors", "darkColors"], (res) => {
    lightColors.value = res.lightColors;
    darkColors.value = res.darkColors;
  });
});

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
.color {
  display: inline-block;
}
</style>