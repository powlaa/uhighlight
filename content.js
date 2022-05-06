const highlighterPopup = document.createElement("highlighter-popup");
document.body.appendChild(highlighterPopup);
const categoriesMenu = document.createElement("categories-menu");
document.body.appendChild(categoriesMenu);
categoriesMenu.addEventListener("updateActiveCategories", (evt) => {
    //TODO: get all categories
    //TODO: show only evt.detail.activeCategories
});

const setMarkerPosition = (markerPosition) =>
    highlighterPopup.setAttribute("markerPosition", JSON.stringify(markerPosition));

chrome.storage.local.get(["pages"], (res) => {
    let index = res.pages.findIndex((el) => el.url === window.location.href);
    if (index >= 0) {
        res.pages[index].highlights.forEach((highlight) => {
            let range = buildRange(highlight.rInfo);
            highlighterPopup.highlightRange(range, highlight.category, highlight.color);
        });

        let uniqueCategories = [...new Set(res.pages[index].highlights.map((el) => el.category))];
        categoriesMenu.setAttribute("categories", JSON.stringify(uniqueCategories));
    }
});

const getSelectedText = () => window.getSelection().toString();

document.addEventListener("click", () => {
    if (getSelectedText().length > 0) {
        setMarkerPosition(getMarkerPosition());
    }
});

document.addEventListener("selectionchange", () => {
    if (getSelectedText().length === 0) {
        setMarkerPosition({ display: "none" });
    }
});

function getMarkerPosition() {
    const rangeBounds = window.getSelection().getRangeAt(0).getBoundingClientRect();
    return {
        // Substract width of marker button -> 40px / 2 = 20
        left: rangeBounds.left + rangeBounds.width / 2 - 20,
        top: rangeBounds.top - 30,
        display: "flex",
    };
}

function buildRange({
    startNode,
    startIsText,
    startOffset,
    startTagName,
    startHTML,
    endNode,
    endIsText,
    endOffset,
    endTagName,
    endHTML,
}) {
    let sP = findEle(startTagName, startHTML);
    let eP = findEle(endTagName, endHTML);
    console.log(sP);
    console.log(eP);
    var s, e;
    if (startIsText) {
        let childs = sP.childNodes;
        for (let i = 0; i < childs.length; i++) {
            if (childs[i].nodeType == 3 && childs[i].nodeValue == startNode) s = childs[i];
        }
    } else {
        s = sP;
    }
    if (endIsText) {
        let childs = eP.childNodes;
        for (let i = 0; i < childs.length; i++) {
            if (childs[i].nodeType == 3 && childs[i].nodeValue == endNode) e = childs[i];
        }
    } else {
        e = eP;
    }
    let range = document.createRange();
    range.setStart(s, startOffset);
    range.setEnd(e, endOffset);
    return range;
}

function findEle(tagName, innerHTML) {
    let list = document.getElementsByTagName(tagName);
    for (let i = 0; i < list.length; i++) {
        if (list[i].innerHTML == innerHTML) {
            return list[i];
        }
    }
}
