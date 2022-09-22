import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";

export const useMainStore = defineStore({
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
        addHighlight(darkMode, id, text, rInfo, categoryId, colorIndex) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(["pages", "highlights"], async (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    const pages = res.pages;
                    const highlights = res.highlights;
                    let page = pages.find((page) => page.url === this.url || page.wayback.url === this.url);
                    if (!page) {
                        page = {
                            id: uuidv4(),
                            url: this.url,
                            darkMode,
                        };
                        pages.push(page);
                    }
                    page.darkMode = darkMode;
                    highlights[id] = { category: categoryId, colorIndex, text, rInfo, page: page.id };
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
                    chrome.storage.local.set({ pages, highlights }, () => {
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        this.pages = pages;
                        this.highlights = highlights;
                        resolve();
                    });
                });
            });
        },
        deleteHighlight(id) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(["pages", "highlights"], (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    let pages = res.pages;
                    const highlights = res.highlights;
                    const page = pages.find((page) => page.url === this.url || page.wayback.url === this.url);
                    if (!page) return reject(new Error("No highlights exist for this page, therefore you cannot delete a highlight."));
                    delete highlights[id];
                    chrome.storage.local.set({ pages, highlights }, () => {
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        this.pages = pages;
                        this.highlights = highlights;
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
                chrome.storage.local.get(["highlights"], async (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    const highlights = res.highlights;
                    if (!highlights[id]) return reject(new Error("The highlight does not exist, therefore you cannot add a note."));
                    highlights[id].notes = noteText;
                    chrome.storage.local.set({ highlights }, () => {
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        this.highlights = highlights;
                        resolve();
                    });
                });
            });
        },
    },
});
