import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const interval = setInterval(mountAfterBodyLoaded, 100);

function mountAfterBodyLoaded() {
    const el = document.querySelector("body");
    if (el) {
        el.insertAdjacentHTML("afterbegin", '<div id="uhighlight-wrapper"></div>');
        const app = createApp(App);
        const pinia = createPinia();
        app.use(pinia);
        app.mount("#uhighlight-wrapper");
        clearInterval(interval);
    }
}
