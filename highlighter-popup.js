let highlightColor = "rgb(213, 234, 255)";
const colors = {
    color0: "#9CD4BB",
    color1: "#B6B297",
    color2: "#C4AED4",
    color3: "#F3CD8E",
};

const template = `
    <template id="highlightTemplate">
        <span class="uhighlight" style="background-color: ${highlightColor}; display: inline"><button class="uhighlight-delete-btn">X</button></span>
    </template>
    <div id="highlighterPopup">
        <div id="colors">
            <button class="color-btn" id="color0"></button>
            <button class="color-btn" id="color1"></button>
            <button class="color-btn" id="color2"></button>
            <button class="color-btn" id="color3"></button>
        </div>
        <div id="categories-container">
            <select name="categories" id="categories">
            </select>
            <button id="categories-add">+</button>
        </div>
    </div>
`;

const styled = ({ display = "none", left = 0, top = 0 }) => `
    #highlighterPopup {
        background-color: #E8E5E5;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        display: ${display};
        justify-content: center;
        left: ${left}px;
        padding: 5px 10px;
        position: fixed;
        top: ${top}px;
        z-index: 9999;
    }
    #colors {
        align-items: center;
        justify-content: space-around;
        display: flex;
    }
    .color-btn {
        border-radius: 10px;
        border: none;
        width: 20px;
        height: 20px;
    }
    #color0 {
        background-color: ${colors.color0}
    }
    #color1 {
        background-color: ${colors.color1}
    }
    #color2 {
        background-color: ${colors.color2}
    }
    #color3 {
        background-color: ${colors.color3}
    }
    #categories-container {
        display: inline-block;
    }
    #categories {
        width: 100px;
    }
    #categories-add {
        border-radius: 5px;
        border: none;
        background-color: white;
        font-size: 1em;
    }
    .text-marker {
        fill: white;
    }
    .text-marker:hover {
        fill: ${highlightColor};
    }
`;

class HighlighterPopup extends HTMLElement {
    constructor() {
        super();
        this.render();
        this.categories = [];
    }

    get markerPosition() {
        return JSON.parse(this.getAttribute("markerPosition") || "{}");
    }

    get styleElement() {
        return this.shadowRoot.querySelector("style");
    }

    get highlightTemplate() {
        return this.shadowRoot.getElementById("highlightTemplate");
    }

    static get observedAttributes() {
        return ["markerPosition"];
    }

    render() {
        this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = styled({});
        this.shadowRoot.appendChild(style);
        this.shadowRoot.innerHTML += template;
        this.shadowRoot.getElementById("colors").childNodes.forEach((btn) =>
            btn.addEventListener("click", () => {
                const category = this.shadowRoot.getElementById("categories").value;
                this.highlightSelection(btn.id, category);
                this.dispatchEvent(new CustomEvent("addHighlight"));
            })
        );
        this.shadowRoot.getElementById("categories-add").addEventListener("click", () => {
            //TODO: open popup to add category or somehow add category
            console.log("add category");
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "markerPosition") {
            this.styleElement.textContent = styled(this.markerPosition);
            //add options to dropdown
            const categories = this.shadowRoot.getElementById("categories");
            chrome.storage.local.get(["categories"], (res) => {
                res.categories.forEach((category) => {
                    if (![...categories.childNodes].find((option) => option.value === category)) {
                        const option = document.createElement("option");
                        option.value = category;
                        option.innerHTML = category;
                        categories.appendChild(option);
                    }
                });
            });
        }
    }

    highlightSelection(color, category) {
        var userSelection = window.getSelection();
        for (let i = 0; i < userSelection.rangeCount; i++) {
            let range = userSelection.getRangeAt(i);
            console.log(range);

            let startNode = range.startContainer;
            let endNode = range.endContainer;

            if (startNode.nodeType == 3) {
                var startIsText = true;
                var startFlag = startNode.parentNode;
                startNode = startNode.nodeValue;
            } else {
                var startIsText = false;
                var startFlag = startNode;
            }
            if (endNode.nodeType == 3) {
                var endIsText = true;
                var endFlag = endNode.parentNode;
                endNode = endNode.nodeValue;
            } else {
                var endIsText = false;
                var endFlag = endNode;
            }

            let startOffset = range.startOffset;
            let endOffset = range.endOffset;

            let startTagName = startFlag.nodeName;
            let startHTML = startFlag.innerHTML;

            let endTagName = endFlag.nodeName;
            let endHTML = endFlag.innerHTML;

            let rInfo = {
                startNode: startNode,
                startOffset: startOffset,
                startIsText: startIsText,
                startTagName: startTagName,
                startHTML: startHTML,

                endNode: endNode,
                endOffset: endOffset,
                endIsText: endIsText,
                endTagName: endTagName,
                endHTML: endHTML,
            };

            var id = Date.now();
            this.saveHighlight(id, rInfo, category, colors[color]).then(() => {
                this.highlightRange(range, id, category, colors[color], true);
            });
        }
    }

    highlightRange(range, id, category, color, notify) {
        if (!color) highlightColor = color;
        else highlightColor = color;
        const clone = this.highlightTemplate.cloneNode(true).content.firstElementChild;
        clone.classList.add("uhighlight-" + category);
        clone.style.backgroundColor = color;
        clone.appendChild(range.extractContents());
        clone.id = "uhighlight-" + id;
        clone
            .getElementsByClassName("uhighlight-delete-btn")[0]
            .addEventListener("click", this.highlightClicked.bind(this));
        range.insertNode(clone);

        this.addCategory(category, notify);
    }

    addCategory(category, notify) {
        if (!this.categories.includes(category)) {
            this.categories.push(category);
            if (notify)
                this.dispatchEvent(new CustomEvent("updateCategories", { detail: { categories: this.categories } }));
        }
    }

    updateVisibleCategories(activeCategories) {
        this.categories.forEach((category) => {
            let highlights = document.getElementsByClassName("uhighlight-" + category);
            if (activeCategories.includes(category)) {
                for (let highlight of highlights) {
                    highlight.classList.remove("uhighlight-hidden");
                }
            } else {
                for (let highlight of highlights) {
                    highlight.classList.add("uhighlight-hidden");
                }
            }
        });
    }

    saveHighlight(id, rInfo, category, color) {
        return new Promise((resolve) => {
            chrome.storage.local.get(["pages"], (res) => {
                let index = res.pages.findIndex((el) => el.url === window.location.href);
                if (index >= 0) {
                    res.pages[index].highlights.push({ id, category, color, rInfo });
                } else {
                    res.pages.push({ url: window.location.href, highlights: [{ id, category, color, rInfo }] });
                }
                chrome.storage.local.set(
                    {
                        pages: res.pages,
                    },
                    () => {
                        resolve();
                    }
                );
            });
        });
    }

    highlightClicked(evt) {
        this.deleteHighlight(evt.target.parentElement);
    }

    deleteHighlight(element) {
        let id = parseInt(element.id.substring(11));
        //remove delete button
        element.removeChild(element.childNodes[0]);
        element.outerHTML = element.innerHTML;

        //delete from storage
        chrome.storage.local.get(["pages"], (res) => {
            let index = res.pages.findIndex((el) => el.url === window.location.href);
            if (index >= 0) {
                res.pages[index].highlights = res.pages[index].highlights.filter((el) => el.id !== id);

                this.categories = [...new Set(res.pages[index].highlights.map((el) => el.category))];
                this.dispatchEvent(new CustomEvent("updateCategories", { detail: { categories: this.categories } }));
                if (res.pages[index].highlights.length > 0) {
                    chrome.storage.local.set({
                        pages: res.pages,
                    });
                } else {
                    chrome.storage.local.set({
                        pages: res.pages.filter((page) => page.url !== window.location.href),
                    });
                }
            }
        });
    }
}

window.customElements.define("highlighter-popup", HighlighterPopup);
