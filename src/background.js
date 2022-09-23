import { v4 as uuidv4 } from "uuid";

chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.set({
        pages: [],
        highlights: {},
        categories: { [uuidv4()]: "JavaScript", [uuidv4()]: "Stores", [uuidv4()]: "Vue.js" },
        colors: [
            { light: "#9CD4BB", dark: "#920799", label: "General" },
            { light: "#B6B297", dark: "#091ea7", label: "Tips" },
            { light: "#88c3cd", dark: "#1f6520", label: "" },
            { light: "#F3CD8E", dark: "#8b1f1f", label: "" },
        ],
        hideFloatingMenu: false,
    });
});

chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
        case "addCategory":
            chrome.runtime.openOptionsPage();
            break;
        default:
            break;
    }
});
