chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.set({
        pages: [],
        categories: ["Apples", "Bananas", "Pears"],
        colors: ["#9CD4BB", "#B6B297", "#C4AED4", "#F3CD8E"],
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
