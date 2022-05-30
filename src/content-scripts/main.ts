import { createApp } from "vue";
import App from "./App.vue";

window.onload = async () => {
    const el = document.querySelector(".js-header-wrapper ");
    if (el) {
        el.insertAdjacentHTML("afterend", '<div id="app"></div>');
        createApp(App).mount("#app");
    }
};
