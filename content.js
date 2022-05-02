const highlighterPopup = document.createElement("highlighter-popup");
document.body.appendChild(highlighterPopup);

const setMarkerPosition = (markerPosition) =>
    highlighterPopup.setAttribute("markerPosition", JSON.stringify(markerPosition));

chrome.storage.local.get(
    [
        "startOffset",
        "endOffset",
        "startNodeData",
        "startNodeHTML",
        "startNodeTagName",
        "endNodeData",
        "endNodeHTML",
        "endNodeTagName",
    ],
    (res) => {
        // if (res.saveNode && res.startOffset &&) {
        console.log(res);
        // highlighterPopup.highlightRange(res.test);
        let range = buildRange(
            res.startOffset,
            res.endOffset,
            res.startNodeData,
            res.startNodeHTML,
            res.startNodeTagName,
            res.endNodeData,
            res.endNodeHTML,
            res.endNodeTagName
        );
        console.log(range);
        highlighterPopup.highlightRange(range);
        // }
    }
);

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

function buildRange(
    startOffset,
    endOffset,
    startNodeData,
    startNodeHTML,
    startNodeTagName,
    endNodeData,
    endNodeHTML,
    endNodeTagName
) {
    var startTagList = document.getElementsByTagName(startNodeTagName);
    var endTagList = document.getElementsByTagName(endNodeTagName);
    console.log(startTagList);

    // find the parent elements with the same innerHTML
    var startFoundElement = null;
    for (var i = 0; i < startTagList.length; i++) {
        if (startTagList[i].innerHTML == startNodeHTML) {
            console.log(startTagList[i]);
            startFoundElement = startTagList[i];
        }
    }
    var endFoundElement = null;
    for (var i = 0; i < endTagList.length; i++) {
        if (endTagList[i].innerHTML == endNodeHTML) {
            endFoundElement = endTagList[i];
        }
    }
    console.log(startFoundElement);
    console.log(endFoundElement);

    // find the nodes within the elements by comparing node data
    var startNodeList = startFoundElement.childNodes;
    var startFoundNode = null;
    for (var i = 0; i < startNodeList.length; i++) {
        if (startNodeList[i].data == startNodeData) {
            startFoundNode = startNodeList[i];
            console.log(startFoundNode);
        }
    }
    var endNodeList = endFoundElement.childNodes;
    var endFoundNode = null;
    for (var i = 0; i < endNodeList.length; i++) {
        if (endNodeList[i].data == endNodeData) {
            endFoundNode = endNodeList[i];
            console.log(endFoundNode);
        }
    }

    // create the range
    var range = document.createRange();

    range.setStart(startFoundNode, startOffset);
    range.setEnd(endFoundNode, endOffset);
    return range;
}
