chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.set({
        pages: [],
        categories: ["Apples", "Bananas", "Pears"],
    });
    chrome.contextMenus.create({
        title: "Highlight text",
        id: "contextMenu1",
        contexts: ["page", "selection"],
    });
    chrome.contextMenus.create({
        title: "Read This Text",
        id: "contextMenu2",
        contexts: ["page", "selection"],
    });
    chrome.contextMenus.onClicked.addListener((evt) => {
        if (evt.menuItemId === "contextMenu1") {
            console.log(evt);
            console.log(evt.selectionText);
        } else if (evt.menuItemId === "contextMenu2") {
            chrome.tts.speak(evt.selectionText, {
                lang: "zh-CN",
                rate: 1,
            });
        }
    });
});
