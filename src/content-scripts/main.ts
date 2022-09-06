import { createApp } from "vue";
import App from "./App.vue";

const interval = setInterval(mountAfterBodyLoaded, 100);

function mountAfterBodyLoaded() {
    const el = document.querySelector("body");
    if (el) {
        el.insertAdjacentHTML("afterbegin", '<div id="uhighlight-wrapper"></div>');
        createApp(App).mount("#uhighlight-wrapper");
        clearInterval(interval);
    }
}
