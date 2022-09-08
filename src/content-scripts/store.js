import { defineStore } from "pinia";

export const useMainStore = defineStore({
    id: "main",
    state: () => ({
        pages: [],
        categories: [],
        lightColors: [],
        darkColors: [],
        hideFloatingMenu: false,
        url: window.location.href,
    }),
    getters: {
        getPage() {
            return this.pages.find((page) => page.url === this.url || page.wayback.url === this.url);
        },
        todoEmpty() {
            return this.todos.length <= 0;
        },
    },
    actions: {
        getAllStorageData() {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(["pages", "lightColors", "darkColors", "categories", "hideFloatingMenu"], (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    this.pages = res.pages;
                    this.lightColors = res.lightColors;
                    this.darkColors = res.darkColors;
                    this.categories = res.categories;
                    this.hideFloatingMenu = res.hideFloatingMenu;
                    resolve();
                });
            });
        },
        setPages(pages) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set({ pages }, () => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    this.pages = pages;
                    resolve();
                });
            });
        },
        addHighlight(darkMode, id, text, rInfo, category, color) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(["pages"], async (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    const pages = res.pages;
                    let page = pages.find((page) => page.url === this.url || page.wayback.url === this.url);
                    if (!page) {
                        page = {
                            url: this.url,
                            darkMode,
                            highlights: [],
                        };
                        pages.push(page);
                    }
                    page.darkMode = darkMode;
                    page.highlights.push({
                        id,
                        category,
                        color,
                        text,
                        rInfo,
                    });
                    try {
                        const response = await fetch(`http://archive.org/wayback/available?url=${window.location.href}`);
                        const data = await response.json();
                        page.wayback = {
                            url: data.archived_snapshots.closest.url.replace("http://", "https://"),
                            timestamp: data.archived_snapshots.closest.timestamp,
                        };
                    } catch (e) {
                        console.warn(e);
                    }
                    console.log(pages);
                    chrome.storage.local.set({ pages }, () => {
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        this.pages = pages;
                        resolve();
                    });
                });
            });
        },
        deleteHighlight(id) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(["pages"], (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    let pages = res.pages;
                    const page = pages.find((page) => page.url === this.url || page.wayback.url === this.url);
                    if (!page) return reject(new Error("No highlights exist for this page, therefore you cannot delete a highlight."));
                    page.highlights = page.highlights.filter((highlight) => highlight.id !== id);
                    if (page.highlights.length === 0) pages = pages.filter((p) => p.url !== this.url && p.wayback.url !== this.url);
                    chrome.storage.local.set({ pages }, () => {
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        this.pages = pages;
                        resolve();
                    });
                });
            });
        },
        saveDarkMode(darkMode) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(["pages"], async (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    const pages = res.pages;
                    let page = pages.find((page) => page.url === this.url || page.wayback.url === this.url);
                    if (!page) {
                        page = {
                            url: this.url,
                            darkMode,
                        };
                        pages.push(page);
                    }
                    page.darkMode = darkMode;
                    chrome.storage.local.set({ pages }, () => {
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        this.pages = pages;
                        resolve();
                    });
                });
            });
        },
        saveNote(noteText, id) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(["pages"], async (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    const pages = res.pages;
                    let page = pages.find((page) => page.url === this.url || page.wayback.url === this.url);
                    if (!page) return reject(new Error("No highlights exist for this page, therefore you cannot add a note."));
                    const highlight = page.highlights.find((highlight) => highlight.id === id);
                    highlight.notes = noteText;
                    chrome.storage.local.set({ pages }, () => {
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        this.pages = pages;
                        resolve();
                    });
                });
            });
        },
    },
});
