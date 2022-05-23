import { createApp } from "vue";
import App from "./App.vue";

window.onload = async () => {
    // await new Promise((r) => setTimeout(r, 1000));
    const el = document.querySelector(".js-header-wrapper ");
    if (el) {
        el.insertAdjacentHTML("afterend", '<div id="app">hello</div>');
        const app = createApp(App);
        app.mount("#app");
    }
};
