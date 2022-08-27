chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.set({
        pages: [],
        categories: ["Apples", "Bananas", "Pears"],
        lightColors: ["#9CD4BB", "#B6B297", "#C4AED4", "#F3CD8E"],
        darkColors: ["#920799", "#091ea7", "#1f6520", "#8b1f1f"],
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
