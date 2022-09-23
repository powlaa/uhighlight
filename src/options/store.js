import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";

export const useOptionsStore = defineStore({
    id: "main",
    state: () => ({
        pages: [],
        highlights: {},
        categories: {},
        colors: [],
        hideFloatingMenu: false,
        url: window.location.href,
    }),
    getters: {
        getPage() {
            return this.pages.find((page) => page.url === this.url || page.wayback?.url === this.url);
        },
    },
    actions: {
        getAllStorageData() {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(["pages", "highlights", "colors", "categories", "hideFloatingMenu"], (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    this.pages = res.pages;
                    this.highlights = res.highlights;
                    this.colors = res.colors;
                    this.categories = res.categories;
                    this.hideFloatingMenu = res.hideFloatingMenu;
                    resolve();
                });
            });
        },
        updateHideFloatingMenu(hideFloatingMenu) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set({ hideFloatingMenu }, () => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    this.hideFloatingMenu = hideFloatingMenu;
                    resolve();
                });
            });
        },
        addCategory(categoryName) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get("categories", (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    const categories = res.categories;
                    categories[uuidv4()] = categoryName;
                    chrome.storage.local.set({ categories }, () => {
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        this.categories = categories;
                        resolve();
                    });
                });
            });
        },
        deleteCategory(id) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(["pages", "highlights", "categories"], (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    const highlights = res.highlights;
                    const categories = res.categories;
                    for (const [id, highlight] of Object.entries(highlights)) {
                        if (highlight.category === id) {
                            delete highlights[id];
                        }
                    }
                    delete categories[id];

                    chrome.storage.local.set({ categories, highlights }, () => {
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        this.categories = categories;
                        this.highlights = highlights;
                        resolve();
                    });
                });
            });
        },
        saveLightColor(index, value) {
            this.colors[index].light = value;
            chrome.storage.local.set({
                colors: [...this.colors],
            });
        },
        saveDarkColor(index, value) {
            this.colors[index].dark = value;
            chrome.storage.local.set({
                colors: [...this.colors],
            });
        },
        saveColorLabel(index, value) {
            this.colors[index].label = value;
            chrome.storage.local.set({
                colors: [...this.colors],
            });
        },
    },
});
