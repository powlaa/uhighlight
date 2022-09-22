import { v4 as uuidv4 } from "uuid";

chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.set({
        pages: [],
        highlights: {},
        categories: { [uuidv4()]: "Apples", [uuidv4()]: "Bananas", [uuidv4()]: "Pears" },
        colors: [
            { light: "#9CD4BB", dark: "#920799", label: "" },
            { light: "#B6B297", dark: "#091ea7", label: "" },
            { light: "#88c3cd", dark: "#1f6520", label: "" },
            { light: "#F3CD8E", dark: "#8b1f1f", label: "" },
        ],
        hideFloatingMenu: false,
    });
    chrome.contextMenus.create({
        title: "Highlight text",
        id: "contextMenu1",
        contexts: ["page", "selection"],
    });
    chrome.contextMenus.onClicked.addListener((evt) => {
        if (evt.menuItemId === "contextMenu1") {
            console.log(evt);
            console.log(evt.selectionText);
        }
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