const highlightColor = "rgb(213, 234, 255)";

const template = `
  <template id="highlightTemplate">
    <span class="highlight" style="background-color: ${highlightColor}; display: inline"></span>
  </template>

  <button id="highlighterPopup">
    <svg class="text-marker" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 544 512"><path d="M0 479.98L99.92 512l35.45-35.45-67.04-67.04L0 479.98zm124.61-240.01a36.592 36.592 0 0 0-10.79 38.1l13.05 42.83-50.93 50.94 96.23 96.23 50.86-50.86 42.74 13.08c13.73 4.2 28.65-.01 38.15-10.78l35.55-41.64-173.34-173.34-41.52 35.44zm403.31-160.7l-63.2-63.2c-20.49-20.49-53.38-21.52-75.12-2.35L190.55 183.68l169.77 169.78L530.27 154.4c19.18-21.74 18.15-54.63-2.35-75.13z"></path></svg>
  </button>
`;

const styled = ({ display = "none", left = 0, top = 0 }) => `
  #highlighterPopup {
    align-items: center;
    background-color: black;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    display: ${display};
    justify-content: center;
    left: ${left}px;
    padding: 5px 10px;
    position: fixed;
    top: ${top}px;
    width: 40px;
    z-index: 9999;
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
        this.shadowRoot.getElementById("highlighterPopup").addEventListener("click", () => this.highlightSelection());
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "markerPosition") {
            this.styleElement.textContent = styled(this.markerPosition);
        }
    }

    highlightSelection() {
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

            chrome.storage.local.set(
                {
                    rInfo,
                },
                () => {
                    this.highlightRange(range);
                }
            );
        }
    }

    highlightRange(range) {
        const clone = this.highlightTemplate.cloneNode(true).content.firstElementChild;
        clone.appendChild(range.extractContents());
        range.insertNode(clone);
    }
}

window.customElements.define("highlighter-popup", HighlighterPopup);
