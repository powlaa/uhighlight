import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const el = document.querySelector("body");
if (el) {
    el.insertAdjacentHTML("afterbegin", '<div id="uhighlight-wrapper"></div>');
    const app = createApp(App);
    const pinia = createPinia();
    app.use(pinia);
    app.mount("#uhighlight-wrapper");
}
